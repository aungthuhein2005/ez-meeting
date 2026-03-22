/**
 * Hand-sign → text: MediaPipe GestureRecognizer + fingerpose (bundled in handsigns-alphabet.js).
 * Emits { text, gestureKey, kind, meta? }; spell mode uses A–Z fingerpose + Open_Palm / Closed_Fist.
 */
(function () {
  const STABLE_FRAMES = 14;
  const COOLDOWN_FRAMES = 8;
  const SPELL_LETTER_COOLDOWN = 10;
  const COMMIT_FIST_FRAMES = 22;
  const MP_MIN_SCORE = 0.55;
  const FP_FALLBACK_MIN = 7.2;
  const SPELL_LETTER_MIN = 7.8;

  let recognizer = null;
  let rafId = null;
  let videoEl = null;
  let emitFn = null;
  let getSpellMode = null;
  let onSpellPreview = null;
  let running = false;

  let lastMpCategory = null;
  let stableCount = 0;
  let cooldown = 0;
  /** Monotonic ms for recognizeForVideo — do not gate on video.currentTime (MediaStream often keeps currentTime fixed). */
  let lastRecognizeAt = 0;
  const MIN_RECOGNIZE_MS = 28;

  let spellBuffer = "";
  let lastLetter = null;
  let letterStable = 0;
  let letterCooldown = 0;
  let lastControlCat = null;
  let controlStable = 0;
  let fistStable = 0;

  let fpFallbackEstimator = null;
  let alphabetEstimator = null;

  function labels() {
    return window.SignLabels || {};
  }

  function getFp() {
    const kit = window.HandSignAlphabetKit;
    if (!kit || !kit.fpExports) return null;
    return kit.fpExports;
  }

  function getAlphabetList() {
    const kit = window.HandSignAlphabetKit;
    if (!kit || !kit.alphabetGestureList) return null;
    return kit.alphabetGestureList;
  }

  function ensureFpFallbackEstimator() {
    if (fpFallbackEstimator) return fpFallbackEstimator;
    const FP = getFp();
    if (!FP || !FP.GestureEstimator || !FP.Gestures) return null;
    const g = FP.Gestures;
    const list = [];
    if (g.VictoryGesture) list.push(g.VictoryGesture);
    if (g.ThumbsUpGesture) list.push(g.ThumbsUpGesture);
    if (!list.length) return null;
    fpFallbackEstimator = new FP.GestureEstimator(list, {});
    return fpFallbackEstimator;
  }

  function ensureAlphabetEstimator() {
    if (alphabetEstimator) return alphabetEstimator;
    const FP = getFp();
    const list = getAlphabetList();
    if (!FP || !FP.GestureEstimator || !list || !list.length) return null;
    alphabetEstimator = new FP.GestureEstimator(list, {});
    return alphabetEstimator;
  }

  function landmarksToFingerpose(lm) {
    if (!lm || !lm.length) return null;
    return lm.map((p) => [p.x, p.y, p.z ?? 0]);
  }

  function pickFingerposeFallback(landmarks) {
    const est = ensureFpFallbackEstimator();
    if (!est) return null;
    const arr = landmarksToFingerpose(landmarks);
    if (!arr) return null;
    const { gestures } = est.estimate(arr, FP_FALLBACK_MIN);
    if (!gestures || !gestures.length) return null;
    gestures.sort((a, b) => b.score - a.score);
    const top = gestures[0];
    const L = labels();
    const text = L.fingerposePhrase ? L.fingerposePhrase(top.name) : null;
    return text ? { category: "fp:" + top.name, gestureKey: "fp:" + top.name, text, raw: top.name } : null;
  }

  function pickSpellLetter(landmarks) {
    const est = ensureAlphabetEstimator();
    if (!est) return null;
    const arr = landmarksToFingerpose(landmarks);
    if (!arr) return null;
    const { gestures } = est.estimate(arr, SPELL_LETTER_MIN);
    if (!gestures || !gestures.length) return null;
    gestures.sort((a, b) => b.score - a.score);
    const top = gestures[0];
    const L = labels();
    const phrase = L.phraseForSpellLetter ? L.phraseForSpellLetter(top.name) : null;
    if (!phrase) return null;
    return { letter: phrase, score: top.score, gestureKey: "spell:" + phrase };
  }

  function preview() {
    if (typeof onSpellPreview === "function") {
      onSpellPreview({ buffer: spellBuffer, listening: running && getSpellMode && getSpellMode() });
    }
  }

  function commitSpellLine(source) {
    const line = spellBuffer.trim();
    spellBuffer = "";
    lastLetter = null;
    letterStable = 0;
    fistStable = 0;
    controlStable = 0;
    lastControlCat = null;
    cooldown = COOLDOWN_FRAMES;
    preview();
    if (!line || !emitFn) return;
    emitFn({
      text: line,
      gestureKey: source === "fist" ? "spell:commit:fist" : "spell:commit:ui",
      kind: "spell",
      meta: { source },
    });
  }

  function appendSpaceOnce() {
    if (spellBuffer.length === 0 || spellBuffer.endsWith(" ")) return;
    spellBuffer += " ";
    preview();
  }

  function appendLetterOnce(ch) {
    spellBuffer += ch;
    letterCooldown = SPELL_LETTER_COOLDOWN;
    lastLetter = ch;
    preview();
  }

  async function loadRecognizer() {
    const mod = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/+esm"
    );
    const { GestureRecognizer, FilesetResolver } = mod;
    const wasm = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm";
    const vision = await FilesetResolver.forVisionTasks(wasm);
    const model =
      "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

    const base = {
      modelAssetPath: model,
    };

    try {
      return await GestureRecognizer.createFromOptions(vision, {
        baseOptions: { ...base, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (e) {
      console.warn("HandSign: GPU delegate failed, using CPU", e);
      return GestureRecognizer.createFromOptions(vision, {
        baseOptions: { ...base, delegate: "CPU" },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    }
  }

  function normalizeMpCategory(name) {
    if (!name || typeof name !== "string") return name;
    const L = labels();
    if (L.MEDIAPIPE_ALIASES && L.MEDIAPIPE_ALIASES[name]) return L.MEDIAPIPE_ALIASES[name];
    return name;
  }

  function bestMediaPipeCategory(result) {
    if (!result.gestures || !result.gestures.length) return null;
    let best = null;
    for (const handG of result.gestures) {
      if (!handG || !handG.length) continue;
      for (const c of handG) {
        if (!c || c.score < MP_MIN_SCORE) continue;
        const name = normalizeMpCategory(c.categoryName);
        if (name === "None") continue;
        if (!best || c.score > best.score) best = { category: name, score: c.score };
      }
    }
    return best;
  }

  function emitGesture(payload) {
    if (!emitFn) return;
    emitFn({
      text: payload.text,
      gestureKey: payload.gestureKey,
      kind: payload.kind || "gesture",
      meta: payload.meta,
    });
  }

  function tickGestureMode(result, mp) {
    let category = null;
    let displayText = null;
    let gestureKey = null;
    let raw = null;

    if (mp) {
      category = mp.category;
      const L = labels();
      displayText = L.mediapipePhrase ? L.mediapipePhrase(category) : category;
      gestureKey = category;
      raw = category;
    } else if (result.landmarks && result.landmarks[0]) {
      const fp = pickFingerposeFallback(result.landmarks[0]);
      if (fp) {
        category = fp.category;
        displayText = fp.text;
        gestureKey = fp.gestureKey;
        raw = fp.raw;
      }
    }

    if (category === lastMpCategory) {
      stableCount++;
    } else {
      lastMpCategory = category;
      stableCount = category ? 1 : 0;
    }

    if (category && displayText && stableCount >= STABLE_FRAMES && cooldown === 0) {
      emitGesture({
        text: displayText,
        gestureKey: gestureKey || String(category),
        kind: "gesture",
        meta: raw ? { raw } : undefined,
      });
      cooldown = COOLDOWN_FRAMES;
      stableCount = 0;
      lastMpCategory = null;
    }
  }

  /** In spell mode, still surface stable “phrase” gestures (not open palm / fist) so e.g. thumbs up shows a caption. */
  const SPELL_MODE_GESTURE_EMIT = new Set([
    "Thumb_Up",
    "Thumb_Down",
    "Pointing_Up",
    "Victory",
    "ILoveYou",
  ]);

  function tickSpellMode(result, mp) {
    if (letterCooldown > 0) letterCooldown--;

    const lm0 = result.landmarks && result.landmarks[0];
    const mpCat = mp && mp.category;

    if (mpCat && SPELL_MODE_GESTURE_EMIT.has(mpCat)) {
      const L = labels();
      const displayText = L.mediapipePhrase ? L.mediapipePhrase(mpCat) : mpCat;
      if (displayText && mpCat === lastMpCategory) {
        stableCount++;
      } else {
        lastMpCategory = mpCat;
        stableCount = displayText ? 1 : 0;
      }
      if (displayText && stableCount >= STABLE_FRAMES && cooldown === 0) {
        emitGesture({
          text: displayText,
          gestureKey: mpCat,
          kind: "gesture",
          meta: { raw: mpCat },
        });
        cooldown = COOLDOWN_FRAMES;
        stableCount = 0;
        lastMpCategory = null;
        lastLetter = null;
        letterStable = 0;
      }
      fistStable = 0;
      lastControlCat = null;
      controlStable = 0;
      return;
    }

    if (mpCat === "Open_Palm") {
      if (lastControlCat === "Open_Palm") controlStable++;
      else {
        lastControlCat = "Open_Palm";
        controlStable = 1;
      }
      fistStable = 0;
      if (controlStable >= STABLE_FRAMES && cooldown === 0 && letterCooldown === 0) {
        appendSpaceOnce();
        cooldown = COOLDOWN_FRAMES;
        controlStable = 0;
        lastControlCat = null;
      }
      lastLetter = null;
      letterStable = 0;
      return;
    }

    if (mpCat === "Closed_Fist") {
      if (lastControlCat === "Closed_Fist") {
        controlStable++;
        fistStable++;
      } else {
        lastControlCat = "Closed_Fist";
        controlStable = 1;
        fistStable = 1;
      }
      if (fistStable >= COMMIT_FIST_FRAMES && cooldown === 0) {
        commitSpellLine("fist");
      }
      lastLetter = null;
      letterStable = 0;
      return;
    }

    fistStable = 0;
    if (mpCat !== lastControlCat) {
      lastControlCat = mpCat;
      controlStable = mpCat ? 1 : 0;
    }

    if (!lm0 || letterCooldown > 0) return;

    const picked = pickSpellLetter(lm0);
    if (!picked) {
      lastLetter = null;
      letterStable = 0;
      return;
    }

    if (picked.letter === lastLetter) {
      letterStable++;
    } else {
      lastLetter = picked.letter;
      letterStable = 1;
    }

    if (letterStable >= STABLE_FRAMES && cooldown === 0) {
      appendLetterOnce(picked.letter);
      stableCount = 0;
      lastMpCategory = null;
    }
  }

  function tick() {
    if (!running || !videoEl || !recognizer || !emitFn) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (cooldown > 0) cooldown--;

    const spellOn = typeof getSpellMode === "function" && getSpellMode();

    if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
      const now = performance.now();
      if (now - lastRecognizeAt >= MIN_RECOGNIZE_MS) {
        lastRecognizeAt = now;
        try {
          const result = recognizer.recognizeForVideo(videoEl, now);
          const mp = bestMediaPipeCategory(result);

          if (spellOn) {
            tickSpellMode(result, mp);
          } else {
            tickGestureMode(result, mp);
          }
        } catch (e) {
          console.warn("HandSign frame error", e);
        }
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function resetSpellState() {
    spellBuffer = "";
    lastLetter = null;
    letterStable = 0;
    letterCooldown = 0;
    lastControlCat = null;
    controlStable = 0;
    fistStable = 0;
    preview();
  }

  window.HandSignCaptions = {
    async start(video, onEmit, options) {
      if (running) await this.stop();
      videoEl = video;
      emitFn = onEmit;
      getSpellMode = options && typeof options.getSpellMode === "function" ? options.getSpellMode : () => false;
      onSpellPreview = options && typeof options.onSpellPreview === "function" ? options.onSpellPreview : null;
      running = true;
      lastRecognizeAt = 0;
      lastMpCategory = null;
      stableCount = 0;
      cooldown = 0;
      fpFallbackEstimator = null;
      alphabetEstimator = null;
      resetSpellState();
      try {
        recognizer = await loadRecognizer();
      } catch (e) {
        console.error("HandSign: could not load GestureRecognizer", e);
        running = false;
        throw e;
      }
      preview();
      rafId = requestAnimationFrame(tick);
    },

    async stop() {
      running = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (recognizer && recognizer.close) {
        try {
          recognizer.close();
        } catch (_) {}
      }
      recognizer = null;
      videoEl = null;
      emitFn = null;
      getSpellMode = null;
      onSpellPreview = null;
      lastMpCategory = null;
      stableCount = 0;
      fpFallbackEstimator = null;
      alphabetEstimator = null;
      resetSpellState();
    },

    isRunning() {
      return running;
    },

    getSpellBuffer() {
      return spellBuffer;
    },

    commitSpell() {
      commitSpellLine("ui");
    },

    clearSpellBuffer() {
      spellBuffer = "";
      preview();
    },
  };
})();
