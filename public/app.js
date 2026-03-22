(function () {
  const TOKEN_KEY = "ezmeeting_token";

  let socket = null;
  let localStream = null;
  const peers = new Map();
  let meetingState = { joinUrl: "", code: "", isHost: false };
  let busy = false;

  let lastLocalSignLine = "";
  let localSpellDraft = "";
  const ttsPending = [];

  const MAX_TTS_QUEUED = 3;

  const SimplePeerCtor = window.SimplePeer;
  if (typeof SimplePeerCtor !== "function") {
    console.error("SimplePeer not loaded");
  }

  const $ = (id) => document.getElementById(id);

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(t) {
    localStorage.setItem(TOKEN_KEY, t);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function showView(name) {
    ["view-login", "view-lobby", "view-meeting"].forEach((id) => {
      $(id).classList.add("hidden");
    });
    if (name === "login") $("view-login").classList.remove("hidden");
    if (name === "lobby") $("view-lobby").classList.remove("hidden");
    if (name === "meeting") $("view-meeting").classList.remove("hidden");
  }

  function meetingStatus(msg) {
    const el = $("meeting-status");
    if (el) el.textContent = msg || "";
  }

  function renderLocalSignSubtitle() {
    const el = $("local-sign-subtitle");
    if (!el) return;
    if (!lastLocalSignLine && !localSpellDraft) {
      el.textContent = "";
      return;
    }
    el.textContent = "";
    if (lastLocalSignLine) {
      el.appendChild(document.createTextNode(lastLocalSignLine));
    }
    if (localSpellDraft) {
      const span = document.createElement("span");
      span.className = "sign-draft";
      span.textContent = "Spelling: " + localSpellDraft;
      el.appendChild(span);
    }
  }

  function setRemoteSignSubtitle(peerId, data) {
    const wrap = document.getElementById("remote-" + peerId);
    if (!wrap) return;
    const sub = wrap.querySelector(".remote-sign-subtitle");
    if (!sub) return;
    let line = data.text || "";
    if (data.translatedText) line += " · " + data.translatedText;
    const kind = data.kind && data.kind !== "gesture" ? " [" + data.kind + "]" : "";
    sub.textContent = line ? line + kind : "";
  }

  function flushTtsQueue() {
    if (!window.speechSynthesis) return;
    const chk = $("sign-tts-enable");
    if (!chk || !chk.checked) {
      try {
        speechSynthesis.cancel();
      } catch (_) {}
      ttsPending.length = 0;
      return;
    }
    if (document.hidden) return;
    if (speechSynthesis.speaking || speechSynthesis.pending) return;
    const next = ttsPending.shift();
    if (!next) return;
    const u = new SpeechSynthesisUtterance(next.text);
    u.lang = next.lang || "en-US";
    u.onend = () => flushTtsQueue();
    u.onerror = () => flushTtsQueue();
    speechSynthesis.speak(u);
  }

  function enqueueSignTts(text, lang) {
    const chk = $("sign-tts-enable");
    if (!chk || !chk.checked || !text) return;
    if (ttsPending.length >= MAX_TTS_QUEUED) ttsPending.shift();
    ttsPending.push({ text, lang: lang || "en-US" });
    flushTtsQueue();
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) flushTtsQueue();
  });

  function clearLobbyError() {
    $("lobby-error").textContent = "";
  }

  function clearLoginError() {
    $("login-error").textContent = "";
  }

  async function onConnectError(err) {
    console.error(err);
    await cleanupMeeting();
    const msg = String(err && err.message ? err.message : err);
    if (/invalid|auth|token/i.test(msg)) {
      clearToken();
      showView("login");
      $("login-error").textContent = "Session expired or invalid. Sign in again.";
    } else {
      meetingStatus("Connection error: " + msg);
    }
  }

  function registerSocketHandlers() {
    if (!socket) return;

    socket.on("signal", ({ fromId, signal }) => {
      const peer = peers.get(fromId);
      if (peer && signal !== undefined) {
        try {
          peer.signal(signal);
        } catch (e) {
          console.warn("signal", e);
        }
      }
    });

    socket.on("peer:joined", ({ peerId, name }) => {
      addPeer(peerId, name || "Guest");
    });

    socket.on("peer:left", ({ peerId }) => {
      removePeer(peerId);
    });

    socket.on("chat:message", (data) => {
      const log = $("chat-log");
      const line = document.createElement("div");
      const t = new Date(data.at).toLocaleTimeString();
      line.textContent = `[${t}] ${data.from}: ${data.text}`;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    });

    socket.on("sign:caption", (data) => {
      const isSelf = socket && data.socketId === socket.id;
      if (isSelf) {
        lastLocalSignLine = data.text || "";
        renderLocalSignSubtitle();
      } else if (data.socketId) {
        setRemoteSignSubtitle(data.socketId, data);
      }

      const signLog = $("sign-log");
      if (signLog) {
        const line = document.createElement("div");
        line.className = "sign-line";
        const t = new Date(data.at).toLocaleTimeString();
        let body = `${data.from}: ${data.text}`;
        if (data.translatedText) body += ` → ${data.translatedText}`;
        if (data.kind && data.kind !== "gesture") body += ` (${data.kind})`;
        line.textContent = `[${t}] ${body}`;
        signLog.appendChild(line);
        signLog.scrollTop = signLog.scrollHeight;
      }
      const chat = $("chat-log");
      if (chat) {
        const c = document.createElement("div");
        c.className = "sign-chat-echo";
        const t = new Date(data.at).toLocaleTimeString();
        c.textContent = `[Sign] [${t}] ${data.from}: ${data.text}`;
        chat.appendChild(c);
        chat.scrollTop = chat.scrollHeight;
      }

      if (!isSelf) {
        enqueueSignTts(data.text, data.lang);
      }
      flushTtsQueue();
    });

    socket.on("room:ended", async ({ reason }) => {
      const labels = {
        host_ended: "Meeting ended by host.",
        host_left: "Host left — meeting closed.",
        empty: "Everyone left — meeting closed.",
      };
      meetingStatus(labels[reason] || "Meeting ended.");
      await cleanupMeeting();
      showView("lobby");
      refreshLobbyUser();
    });
  }

  function setupLocalVideo() {
    const v = $("local-video");
    v.srcObject = localStream;
  }

  function updateMeetingMeta(ack) {
    meetingState = {
      code: ack.code,
      joinUrl: ack.joinUrl || "",
      isHost: !!ack.isHost,
    };
    $("meeting-code-label").textContent = "Code: " + ack.code;
    $("qr-img").src = "/api/qr/" + encodeURIComponent(ack.code);
    $("btn-end").classList.toggle("hidden", !ack.isHost);
    meetingStatus("");
    $("chat-log").innerHTML = "";
    const sl = $("sign-log");
    if (sl) sl.innerHTML = "";
    const hs = $("hand-sign-enable");
    if (hs) hs.checked = false;
    const sp = $("hand-sign-spell");
    if (sp) sp.checked = false;
    lastLocalSignLine = "";
    localSpellDraft = "";
    renderLocalSignSubtitle();
    document.querySelectorAll(".remote-sign-subtitle").forEach((n) => {
      n.textContent = "";
    });
  }

  function addPeer(peerId, remoteName) {
    if (!socket || !localStream || peers.has(peerId)) return;
    if (typeof SimplePeerCtor !== "function") return;

    const initiator = socket.id < peerId;
    const peer = new SimplePeerCtor({
      initiator,
      stream: localStream,
      trickle: true,
      config: SimplePeerCtor.config,
    });

    peer.on("signal", (signal) => {
      if (socket && socket.connected) {
        socket.emit("signal", { targetId: peerId, signal });
      }
    });

    peer.on("stream", (remoteStream) => {
      let wrap = document.getElementById("remote-" + peerId);
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "remote-wrap";
        wrap.id = "remote-" + peerId;
        const vid = document.createElement("video");
        vid.playsInline = true;
        vid.autoplay = true;
        vid.srcObject = remoteStream;
        const sub = document.createElement("div");
        sub.className = "video-subtitle remote-sign-subtitle";
        sub.setAttribute("aria-live", "polite");
        const lab = document.createElement("span");
        lab.className = "label";
        lab.textContent = remoteName || "Guest";
        wrap.appendChild(vid);
        wrap.appendChild(sub);
        wrap.appendChild(lab);
        $("remote-videos").appendChild(wrap);
      }
    });

    peer.on("close", () => removePeer(peerId));
    peer.on("error", (e) => console.warn("peer error", peerId, e));

    peers.set(peerId, peer);
  }

  function removePeer(peerId) {
    const peer = peers.get(peerId);
    if (peer) {
      try {
        peer.destroy();
      } catch (_) {}
      peers.delete(peerId);
    }
    const wrap = document.getElementById("remote-" + peerId);
    if (wrap) wrap.remove();
  }

  async function stopHandSignCaptions() {
    if (window.HandSignCaptions && window.HandSignCaptions.isRunning()) {
      try {
        await window.HandSignCaptions.stop();
      } catch (_) {}
    }
    const hs = $("hand-sign-enable");
    if (hs) hs.checked = false;
    localSpellDraft = "";
    renderLocalSignSubtitle();
  }

  async function cleanupMeeting() {
    await stopHandSignCaptions();
    ttsPending.length = 0;
    if (window.speechSynthesis) {
      try {
        speechSynthesis.cancel();
      } catch (_) {}
    }
    lastLocalSignLine = "";
    localSpellDraft = "";
    const locSub = $("local-sign-subtitle");
    if (locSub) locSub.textContent = "";
    peers.forEach((p) => {
      try {
        p.destroy();
      } catch (_) {}
    });
    peers.clear();
    $("remote-videos").innerHTML = "";
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream = null;
    }
    const lv = $("local-video");
    lv.srcObject = null;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    busy = false;
    meetingStatus("");
    $("qr-img").removeAttribute("src");
  }

  async function startHost() {
    if (busy) return;
    clearLobbyError();
    busy = true;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (e) {
      busy = false;
      $("lobby-error").textContent = "Camera/microphone access is required.";
      return;
    }

    const token = getToken();
    if (!token) {
      busy = false;
      showView("login");
      return;
    }

    showView("meeting");
    setupLocalVideo();

    socket = window.io({ auth: { token } });
    socket.on("connect_error", onConnectError);
    registerSocketHandlers();

    const runCreate = () => {
      socket.emit("room:create", async (ack) => {
        if (!ack || ack.error) {
          meetingStatus("Could not create room: " + (ack && ack.error ? ack.error : "unknown"));
          await cleanupMeeting();
          showView("lobby");
          return;
        }
        updateMeetingMeta(ack);
        (ack.peers || []).forEach((p) => addPeer(p.id, p.name));
        busy = false;
      });
    };
    if (socket.connected) runCreate();
    else socket.once("connect", runCreate);
  }

  async function startJoin(rawCode) {
    if (busy) return;
    const code = String(rawCode || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (code.length < 4) {
      $("lobby-error").textContent = "Enter a valid meeting code.";
      return;
    }
    clearLobbyError();
    busy = true;

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (e) {
      busy = false;
      $("lobby-error").textContent = "Camera/microphone access is required.";
      return;
    }

    const token = getToken();
    if (!token) {
      busy = false;
      showView("login");
      return;
    }

    showView("meeting");
    setupLocalVideo();

    socket = window.io({ auth: { token } });
    socket.on("connect_error", onConnectError);
    registerSocketHandlers();

    const runJoin = () => {
      socket.emit("room:join", { code }, async (ack) => {
        if (!ack || ack.error) {
          meetingStatus(
            ack && ack.error === "not_found"
              ? "Meeting not found or already ended."
              : "Could not join: " + (ack && ack.error ? ack.error : "unknown")
          );
          await cleanupMeeting();
          showView("lobby");
          return;
        }
        updateMeetingMeta(ack);
        (ack.peers || []).forEach((p) => addPeer(p.id, p.name));
        busy = false;
        try {
          const u = new URL(window.location.href);
          u.searchParams.delete("join");
          window.history.replaceState({}, "", u.toString());
        } catch (_) {}
      });
    };
    if (socket.connected) runJoin();
    else socket.once("connect", runJoin);
  }

  async function leaveMeeting() {
    if (socket && socket.connected) {
      socket.emit("room:leave");
    }
    await cleanupMeeting();
    showView("lobby");
    refreshLobbyUser();
  }

  function endMeetingForAll() {
    if (socket && socket.connected) {
      socket.emit("room:end");
    }
  }

  function decodeJwtPayload(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      return JSON.parse(atob(b64));
    } catch {
      return null;
    }
  }

  function refreshLobbyUser() {
    const t = getToken();
    if (!t) {
      $("lobby-user").textContent = "";
      return;
    }
    const payload = decodeJwtPayload(t);
    if (payload) {
      $("lobby-user").textContent =
        (payload.name || payload.email || "Signed in") + " · " + (payload.email || "");
    } else {
      $("lobby-user").textContent = "Signed in";
    }
  }

  async function submitLogin(ev) {
    ev.preventDefault();
    clearLoginError();
    const email = $("login-email").value.trim();
    const name = $("login-name").value.trim();
    let res;
    try {
      res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch (err) {
      $("login-error").textContent =
        "Network error — is the app opened from this server (npm start), not as a saved file? " +
        String(err && err.message ? err.message : err);
      return;
    }
    const raw = await res.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        $("login-error").textContent =
          `Server returned ${res.status} (not JSON). Use the URL printed when you run: npm start`;
        return;
      }
    }
    if (!res.ok) {
      $("login-error").textContent =
        data.error ||
        (res.status === 404 || res.status === 405
          ? "API not found — run the backend: npm start, then open http://localhost:PORT (same host/port as the server)."
          : `Request failed (${res.status}).`);
      return;
    }
    if (!data.token || typeof data.token !== "string") {
      $("login-error").textContent = "Invalid response: missing token.";
      return;
    }
    setToken(data.token);
    refreshLobbyUser();
    showView("lobby");
    applyJoinFromQuery();
  }

  function applyJoinFromQuery() {
    try {
      const code = new URLSearchParams(window.location.search).get("join");
      if (code) {
        $("join-code").value = code.trim().toUpperCase();
      }
    } catch (_) {}
  }

  async function logout() {
    clearToken();
    await cleanupMeeting();
    showView("login");
  }

  document.getElementById("form-login").addEventListener("submit", submitLogin);

  document.getElementById("btn-host").addEventListener("click", () => {
    startHost();
  });

  document.getElementById("form-join").addEventListener("submit", (ev) => {
    ev.preventDefault();
    startJoin($("join-code").value);
  });

  document.getElementById("btn-logout").addEventListener("click", logout);

  document.getElementById("btn-leave").addEventListener("click", leaveMeeting);

  document.getElementById("btn-end").addEventListener("click", endMeetingForAll);

  document.getElementById("btn-copy-link").addEventListener("click", async () => {
    const url = meetingState.joinUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      meetingStatus("Join link copied.");
      setTimeout(() => meetingStatus(""), 2500);
    } catch {
      meetingStatus("Could not copy — copy manually: " + url);
    }
  });

  document.getElementById("form-chat").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const input = $("chat-input");
    const text = input.value.trim();
    if (!text || !socket) return;
    socket.emit("chat:message", { text });
    input.value = "";
  });

  async function syncHandSignFromCheckbox() {
    const el = $("hand-sign-enable");
    const video = $("local-video");
    if (!el || !video) return;
    const want = el.checked;
    if (want) {
      if (!window.HandSignCaptions) {
        meetingStatus("Hand-sign script not loaded.");
        el.checked = false;
        return;
      }
      if (!window.HandSignAlphabetKit) {
        meetingStatus("Missing vendor/handsigns-alphabet.js — run: npm run build:handsigns");
        el.checked = false;
        return;
      }
      try {
        meetingStatus("Loading hand models…");
        await window.HandSignCaptions.start(
          video,
          (payload) => {
            if (socket && socket.connected) {
              socket.emit("sign:caption", {
                text: payload.text,
                gestureKey: payload.gestureKey,
                kind: payload.kind || "gesture",
                lang: payload.lang,
                translatedText: payload.translatedText,
              });
            }
            if (payload.kind !== "spell" || payload.text) {
              lastLocalSignLine = payload.text || "";
              renderLocalSignSubtitle();
            }
          },
          {
            getSpellMode: () => {
              const el = $("hand-sign-spell");
              return !!(el && el.checked);
            },
            onSpellPreview: (state) => {
              localSpellDraft = state && state.buffer ? state.buffer : "";
              renderLocalSignSubtitle();
            },
          }
        );
        meetingStatus("");
      } catch (e) {
        console.error(e);
        meetingStatus("Hand recognition failed: " + (e && e.message ? e.message : e));
        el.checked = false;
      }
    } else if (window.HandSignCaptions) {
      try {
        await window.HandSignCaptions.stop();
      } catch (_) {}
    }
  }

  const handSignCb = $("hand-sign-enable");
  if (handSignCb) {
    handSignCb.addEventListener("change", () => {
      void syncHandSignFromCheckbox();
    });
  }

  const spellCb = $("hand-sign-spell");
  if (spellCb) {
    spellCb.addEventListener("change", () => {
      if (window.HandSignCaptions && window.HandSignCaptions.isRunning()) {
        if (!spellCb.checked) window.HandSignCaptions.clearSpellBuffer();
      }
    });
  }

  function spellButtonsNeedHandSign() {
    meetingStatus(
      "Turn on “Hand-sign captions” first — then enable Finger-spelling to type letters."
    );
    setTimeout(() => meetingStatus(""), 5000);
  }

  const btnSpellCommit = $("btn-spell-commit");
  if (btnSpellCommit) {
    btnSpellCommit.addEventListener("click", () => {
      if (!window.HandSignCaptions || !window.HandSignCaptions.isRunning()) {
        spellButtonsNeedHandSign();
        return;
      }
      const spellOn = $("hand-sign-spell") && $("hand-sign-spell").checked;
      const before = window.HandSignCaptions.getSpellBuffer
        ? String(window.HandSignCaptions.getSpellBuffer() || "").trim()
        : "";
      window.HandSignCaptions.commitSpell();
      if (!before) {
        meetingStatus(
          spellOn
            ? "Nothing to send yet — hold each letter steady until it appears under “Spelling: …”, then tap Send."
            : "Turn on Finger-spelling mode, then sign letters (A–Z) so they fill the spelling line."
        );
        setTimeout(() => meetingStatus(""), 5500);
      } else {
        meetingStatus("");
      }
    });
  }

  const btnSpellClear = $("btn-spell-clear");
  if (btnSpellClear) {
    btnSpellClear.addEventListener("click", () => {
      if (!window.HandSignCaptions || !window.HandSignCaptions.isRunning()) {
        spellButtonsNeedHandSign();
        return;
      }
      window.HandSignCaptions.clearSpellBuffer();
      localSpellDraft = "";
      renderLocalSignSubtitle();
      meetingStatus("Spelling buffer cleared.");
      setTimeout(() => meetingStatus(""), 2000);
    });
  }

  function boot() {
    const token = getToken();
    if (token) {
      refreshLobbyUser();
      showView("lobby");
      applyJoinFromQuery();
    } else {
      showView("login");
    }
  }

  boot();
})();
