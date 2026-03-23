import fs from "fs";
import path from "path";
import { extractText } from "./documentExtract.js";
import { detectLanguage, normalizeTargetLang } from "./detectLanguage.js";
import { analyzeDocument } from "./summarize.js";
import { translateInsightBundle } from "./translate.js";
import {
  setActiveDoc,
  getActiveDoc,
  getTranslationCache,
} from "./roomDocuments.js";

const HF_TOKEN = process.env.HF_API_KEY || "";
const LT_URL = process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";
const LT_KEY = process.env.LIBRETRANSLATE_API_KEY || "";

/**
 * @param {object} doc
 * @param {Map} cache
 * @param {import("socket.io").Socket} socket
 * @param {string} target
 */
/**
 * @returns {Promise<{ insight: object, translationFailed: boolean }>}
 */
async function localizeForSocket(doc, cache, socket, target) {
  const ltSrc = doc.ltSource || "auto";
  const insightSrc = {
    overview: doc.overviewSrc,
    keyPoints: doc.keyPointsSrc,
    deepDive: doc.deepDiveSrc,
    studyQuestions: doc.studyQsSrc,
    objectives: doc.objectivesSrc,
  };

  const skipTranslate = ltSrc !== "auto" && ltSrc === target;

  if (skipTranslate) {
    return { insight: insightSrc, translationFailed: false };
  }

  try {
    const insight = await translateInsightBundle(
      cache,
      insightSrc,
      ltSrc,
      target,
      LT_URL,
      LT_KEY
    );
    return { insight, translationFailed: false };
  } catch {
    if (!socket.data._docTranslateWarned) {
      socket.data._docTranslateWarned = true;
      socket.emit("doc:warn", {
        message:
          "Could not translate insights (LibreTranslate busy or blocked). Showing English analysis — set LIBRETRANSLATE_URL to your own instance for reliable Thai and other languages.",
      });
    }
    return { insight: insightSrc, translationFailed: true };
  }
}

/**
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 * @param {string} code
 */
async function emitPayloadForOneSocket(io, socket, code) {
  const doc = getActiveDoc(code);
  if (!doc || !doc.ready) return;
  const cache = getTranslationCache(code);
  const target = normalizeTargetLang(socket.data.preferredLanguage || "en");
  const { insight, translationFailed } = await localizeForSocket(
    doc,
    cache,
    socket,
    target
  );
  socket.emit("doc:payload", {
    docId: doc.docId,
    fileName: doc.fileName,
    mime: doc.mime,
    insight,
    translationFailed,
    language: target,
    sourceLanguage: doc.francCode,
    at: doc.at,
  });
}

/**
 * @param {object} io
 * @param {string} code
 * @param {object} params
 */
async function processUploadedDocument(io, code, params) {
  const { docId, filePath, fileName, mime, maxExtractChars } = params;

  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (err) {
    const message = `Could not read uploaded file: ${err && err.message ? err.message : err}`;
    io.to(code).emit("doc:error", { docId, fileName, message });
    return;
  }

  io.to(code).emit("doc:processing", { docId, fileName });

  try {
    const { text, extractor, warnings, truncated } = await extractText(
      buffer,
      fileName,
      maxExtractChars
    );

    if (!text.trim()) {
      throw new Error(
        "No extractable text (try a text-based PDF or Office file, not a scan)."
      );
    }

    const { francCode, ltSource } = await detectLanguage(text);
    const insight = await analyzeDocument(text, HF_TOKEN, francCode);

    const storageExt = path.extname(filePath).toLowerCase() || ".bin";

    const doc = {
      docId,
      fileName,
      mime,
      filePath,
      storageExt,
      /** Full extracted text (for Gemini Q&A); already length-capped by extractText. */
      extractedText: text,
      francCode,
      ltSource,
      overviewSrc: insight.overview,
      keyPointsSrc: insight.keyPoints,
      deepDiveSrc: insight.deepDive,
      studyQsSrc: insight.studyQuestions,
      objectivesSrc: insight.objectives,
      extractor,
      warnings,
      truncated,
      ready: true,
      at: Date.now(),
    };

    setActiveDoc(code, doc);
    io.to(code).emit("doc:ready", {
      docId,
      fileName,
      sourceLanguage: francCode,
      extractor,
      warnings,
      truncated,
    });

    await emitLocalizedPayloads(io, code);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    io.to(code).emit("doc:error", { docId, fileName, message });
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
}

/**
 * @param {import("socket.io").Server} io
 * @param {string} code
 */
async function emitLocalizedPayloads(io, code) {
  const doc = getActiveDoc(code);
  if (!doc || !doc.ready) return;

  const socks = await io.in(code).fetchSockets();
  const cache = getTranslationCache(code);

  for (const s of socks) {
    const target = normalizeTargetLang(s.data.preferredLanguage || "en");
    const { insight, translationFailed } = await localizeForSocket(
      doc,
      cache,
      s,
      target
    );
    s.emit("doc:payload", {
      docId: doc.docId,
      fileName: doc.fileName,
      mime: doc.mime,
      insight,
      translationFailed,
      language: target,
      sourceLanguage: doc.francCode,
      at: doc.at,
    });
  }
}

export {
  processUploadedDocument,
  emitLocalizedPayloads,
  emitPayloadForOneSocket,
};
