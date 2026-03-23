const MT5_MODEL = "csebuetnlp/mT5_multilingual_XLSum";
const BART_MODEL = "facebook/bart-large-cnn";
/** Instruction-following model for bullet lists & study questions (override if needed). */
const FLAN_MODEL = process.env.HF_FLAN_MODEL || "google/flan-t5-base";

/** Legacy api-inference.huggingface.co is retired; use Inference Providers router. */
const HF_MODELS_URL =
  process.env.HF_INFERENCE_URL ||
  "https://router.huggingface.co/hf-inference/models";

function extractHfText(data) {
  if (Array.isArray(data) && data.length) {
    const row = data[0];
    if (row && typeof row.summary_text === "string")
      return row.summary_text.trim();
    if (row && typeof row.generated_text === "string")
      return row.generated_text.trim();
  }
  if (data && typeof data.summary_text === "string")
    return data.summary_text.trim();
  if (typeof data === "string") return data.trim();
  if (data && data.error) throw new Error(String(data.error));
  throw new Error("Unexpected response from Hugging Face inference.");
}

/**
 * @param {string} model
 * @param {object} body
 * @param {string} token
 */
async function hfPost(model, body, token) {
  const base = HF_MODELS_URL.replace(/\/$/, "");
  const url = `${base}/${model}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 503 && data.estimated_time) {
      await new Promise((r) =>
        setTimeout(r, Math.min(15000, (data.estimated_time || 10) * 1000))
      );
      return hfPost(model, body, token);
    }
    if (!res.ok) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data).slice(0, 400)
      );
    }
    return extractHfText(data);
  } finally {
    clearTimeout(timer);
  }
}

function sumParams(maxLen, minLen) {
  const min = Math.max(8, Math.min(minLen, maxLen - 1));
  return { max_length: maxLen, min_length: min, do_sample: false };
}

function textChunks(text, useLong) {
  const maxA = useLong ? 8000 : 4000;
  const maxB = useLong ? 6000 : 3500;
  const t = (text || "").trim();
  if (!t) return { chunkA: "", chunkB: "", chunkFlan: "" };
  const chunkA = t.slice(0, maxA);
  let chunkB = "";
  if (t.length > maxA * 1.2) {
    const mid = Math.floor(t.length / 2);
    chunkB = t.slice(mid, mid + maxB);
  }
  const chunkFlan = chunkA.slice(0, 2600);
  return { chunkA, chunkB, chunkFlan };
}

function emptyInsight() {
  return {
    overview: "",
    keyPoints: "",
    deepDive: "",
    studyQuestions: "",
    objectives: "",
  };
}

const FALLBACK_STUDY_QS = `What is the core message of this material?
What evidence or examples stand out?
How could you apply this in practice?
What would you ask for clarification about?`;

/**
 * NotebookLM-style multi-pass analysis: overview, key points, deep dive from another
 * span, study questions, and action-oriented objectives.
 *
 * @param {string} text
 * @param {string} hfToken
 * @param {string} francCode ISO 639-3 from franc
 */
async function analyzeDocument(text, hfToken, francCode) {
  if (!hfToken || !String(hfToken).trim()) {
    return emptyInsight();
  }
  const useMt5 = francCode !== "eng" && francCode !== "und";
  const { chunkA, chunkB, chunkFlan } = textChunks(text, useMt5);
  if (!chunkA.trim()) {
    return emptyInsight();
  }

  const sumModel = useMt5 ? MT5_MODEL : BART_MODEL;
  const longMax = useMt5 ? 340 : 300;
  const midMax = useMt5 ? 260 : 220;
  const objMax = useMt5 ? 240 : 180;

  const objPrefix = useMt5
    ? "extract bullet objectives: "
    : "Key objectives and action items: ";

  const overviewMin = useMt5 ? 48 : 64;
  const overviewP = hfPost(
    sumModel,
    { inputs: chunkA, parameters: sumParams(longMax, overviewMin) },
    hfToken
  );
  const objectivesP = hfPost(
    sumModel,
    {
      inputs: (objPrefix + chunkA).slice(0, useMt5 ? 8000 : 4000),
      parameters: sumParams(objMax, 22),
    },
    hfToken
  ).catch(() => "");

  const deepDiveP = chunkB
    ? hfPost(
        sumModel,
        { inputs: chunkB, parameters: sumParams(midMax, 40) },
        hfToken
      ).catch(() => "")
    : Promise.resolve("");

  const [overview, objectivesRaw, deepDiveRaw] = await Promise.all([
    overviewP,
    objectivesP,
    deepDiveP,
  ]);

  let objectives = (objectivesRaw && String(objectivesRaw).trim()) || "";
  if (!objectives) objectives = overview;

  let deepDive = (deepDiveRaw && String(deepDiveRaw).trim()) || "";
  if (!deepDive) deepDive = overview;

  let keyPoints = "";
  let studyQuestions = "";
  if (chunkFlan.trim()) {
    try {
      [keyPoints, studyQuestions] = await Promise.all([
        hfPost(
          FLAN_MODEL,
          {
            inputs: `List the main ideas as short bullet lines (start each line with -):\n\n${chunkFlan}`,
            parameters: sumParams(380, 32),
          },
          hfToken
        ),
        hfPost(
          FLAN_MODEL,
          {
            inputs: `Write exactly four short study or discussion questions about this text:\n\n${chunkFlan}`,
            parameters: sumParams(320, 36),
          },
          hfToken
        ),
      ]);
    } catch {
      keyPoints = "";
      studyQuestions = "";
    }
  }

  if (!keyPoints || !keyPoints.trim()) {
    try {
      keyPoints = await hfPost(
        sumModel,
        {
          inputs: chunkA,
          parameters: sumParams(Math.max(120, Math.floor(midMax * 0.9)), 28),
        },
        hfToken
      );
    } catch {
      keyPoints = overview;
    }
  }

  if (!studyQuestions || !studyQuestions.trim()) {
    studyQuestions = FALLBACK_STUDY_QS;
  }

  return {
    overview: (overview || "").trim(),
    keyPoints: (keyPoints || "").trim(),
    deepDive: (deepDive || "").trim(),
    studyQuestions: (studyQuestions || "").trim(),
    objectives: (objectives || "").trim(),
  };
}

export {
  analyzeDocument,
  hfPost,
  MT5_MODEL,
  BART_MODEL,
  FLAN_MODEL,
  HF_MODELS_URL,
};
