import crypto from "crypto";

const DEFAULT_LT = "https://libretranslate.com";

function cacheKey(parts) {
  return crypto.createHash("sha256").update(parts.join("\n")).digest("hex");
}

/** LibreTranslate public instances often reject very large bodies; stay under this. */
const LT_SOFT_MAX = 4200;

/**
 * @param {string} text
 * @param {string} source LibreTranslate source code or 'auto'
 * @param {string} target
 * @param {string} baseUrl
 * @param {string} [apiKey]
 */
async function translateText(text, source, target, baseUrl, apiKey) {
  if (!text || !text.trim()) return "";
  if (source === target) return text;

  const url = `${baseUrl.replace(/\/$/, "")}/translate`;
  const body = {
    q: text,
    source: source || "auto",
    target,
    format: "text",
  };
  if (apiKey) body.api_key = apiKey;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`LibreTranslate ${res.status}: ${errTxt.slice(0, 200)}`);
    }
    const data = await res.json();
    if (typeof data.translatedText === "string") return data.translatedText;
    throw new Error("LibreTranslate: missing translatedText");
  } finally {
    clearTimeout(t);
  }
}

/**
 * One segment: retry with source "auto" if explicit source fails (detector mismatch).
 */
async function translateTextWithRetry(text, source, target, baseUrl, apiKey) {
  try {
    return await translateText(text, source, target, baseUrl, apiKey);
  } catch {
    if (source && source !== "auto") {
      return await translateText(text, "auto", target, baseUrl, apiKey);
    }
    throw new Error("LibreTranslate failed");
  }
}

/**
 * Split long fields so public LibreTranslate does not 413/400; run sequentially to reduce rate limits.
 */
async function translateLongField(text, source, target, baseUrl, apiKey) {
  if (!text || !text.trim()) return "";
  if (text.length <= LT_SOFT_MAX) {
    return translateTextWithRetry(text, source, target, baseUrl, apiKey);
  }
  const segments = [];
  let rest = text.trim();
  while (rest.length) {
    if (rest.length <= LT_SOFT_MAX) {
      segments.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n\n", LT_SOFT_MAX);
    if (cut < 800) cut = rest.lastIndexOf("\n", LT_SOFT_MAX);
    if (cut < 400) cut = rest.lastIndexOf(". ", LT_SOFT_MAX);
    if (cut < 200) cut = LT_SOFT_MAX;
    segments.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  const parts = [];
  for (const seg of segments) {
    parts.push(await translateTextWithRetry(seg, source, target, baseUrl, apiKey));
  }
  return parts.join("\n\n");
}

/**
 * @param {Map<string, string>} roomCache
 * @param {string} summarySrc
 * @param {string} objectivesSrc
 * @param {string} ltSource
 * @param {string} targetLang
 * @param {string} ltUrl
 * @param {string} [ltKey]
 */
async function translateSummaryBundle(
  roomCache,
  summarySrc,
  objectivesSrc,
  ltSource,
  targetLang,
  ltUrl,
  ltKey
) {
  const key = cacheKey([summarySrc, objectivesSrc, ltSource, targetLang]);
  if (roomCache.has(key)) {
    return JSON.parse(roomCache.get(key));
  }

  const [summary, objectives] = await Promise.all([
    translateText(summarySrc, ltSource, targetLang, ltUrl, ltKey),
    translateText(objectivesSrc, ltSource, targetLang, ltUrl, ltKey),
  ]);

  const bundle = { summary, objectives };
  roomCache.set(key, JSON.stringify(bundle));
  return bundle;
}

/**
 * @param {Map<string, string>} roomCache
 * @param {{ overview: string, keyPoints: string, deepDive: string, studyQuestions: string, objectives: string }} insightSrc
 * @param {string} ltSource
 * @param {string} targetLang
 * @param {string} ltUrl
 * @param {string} [ltKey]
 */
async function translateInsightBundle(
  roomCache,
  insightSrc,
  ltSource,
  targetLang,
  ltUrl,
  ltKey
) {
  const {
    overview,
    keyPoints,
    deepDive,
    studyQuestions,
    objectives,
  } = insightSrc;
  const key = cacheKey([
    overview,
    keyPoints,
    deepDive,
    studyQuestions,
    objectives,
    ltSource,
    targetLang,
  ]);
  if (roomCache.has(key)) {
    return JSON.parse(roomCache.get(key));
  }

  const src = ltSource || "auto";
  const o = await translateLongField(overview, src, targetLang, ltUrl, ltKey);
  const k = await translateLongField(keyPoints, src, targetLang, ltUrl, ltKey);
  const d = await translateLongField(deepDive, src, targetLang, ltUrl, ltKey);
  const q = await translateLongField(studyQuestions, src, targetLang, ltUrl, ltKey);
  const ob = await translateLongField(objectives, src, targetLang, ltUrl, ltKey);

  const bundle = {
    overview: o,
    keyPoints: k,
    deepDive: d,
    studyQuestions: q,
    objectives: ob,
  };
  roomCache.set(key, JSON.stringify(bundle));
  return bundle;
}

export {
  translateText,
  translateTextWithRetry,
  translateLongField,
  translateSummaryBundle,
  translateInsightBundle,
  cacheKey,
  DEFAULT_LT,
};
