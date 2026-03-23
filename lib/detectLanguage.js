/** ISO 639-3 → LibreTranslate-style ISO 639-1 (common set). */
const FRANC_TO_LT = {
  eng: "en",
  tha: "th",
  jpn: "ja",
  cmn: "zh",
  zho: "zh",
  fra: "fr",
  deu: "de",
  spa: "es",
  por: "pt",
  rus: "ru",
  ita: "it",
  kor: "ko",
  vie: "vi",
  arb: "ar",
  hin: "hi",
  ind: "id",
  msa: "ms",
  tur: "tr",
  pol: "pl",
  nld: "nl",
  swe: "sv",
  ukr: "uk",
  ces: "cs",
  ron: "ro",
  hun: "hu",
  ell: "el",
  heb: "he",
};

/**
 * @param {string} text
 * @returns {Promise<{ francCode: string, ltSource: string }>}
 */
async function detectLanguage(text) {
  const sample = (text || "").slice(0, 5000);
  if (!sample.trim()) {
    return { francCode: "und", ltSource: "auto" };
  }
  const { franc } = await import("franc");
  const francCode = franc(sample) || "und";
  if (francCode === "und") {
    return { francCode: "und", ltSource: "auto" };
  }
  const ltSource = FRANC_TO_LT[francCode] || "auto";
  return { francCode, ltSource };
}

function normalizeTargetLang(code) {
  if (typeof code !== "string") return "en";
  const c = code.trim().toLowerCase().slice(0, 8);
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(c) ? c.split("-")[0] : "en";
}

export { detectLanguage, normalizeTargetLang, FRANC_TO_LT };
