import path from "path";
import fs from "fs";
import os from "os";
import { execFileSync } from "child_process";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parseOffice } from "officeparser";
import WordExtractor from "word-extractor";

/** Advertised + structured extractors; unknown extensions still accepted if UTF-8 text. */
const SUPPORTED = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xlsx",
  ".odt",
  ".odp",
  ".ods",
  ".rtf",
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".html",
  ".htm",
  ".xml",
  ".svg",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".log",
  ".tsv",
  ".sql",
  ".sh",
  ".bash",
  ".zsh",
  ".py",
  ".rb",
  ".php",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".kts",
  ".scala",
  ".pl",
  ".pm",
  ".r",
  ".m",
  ".tex",
  ".bib",
  ".css",
  ".scss",
  ".less",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".vue",
  ".svelte",
  ".env",
  ".properties",
];

const PLAIN_UTF8_EXT = new Set([
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".log",
  ".tsv",
  ".sql",
  ".sh",
  ".bash",
  ".zsh",
  ".py",
  ".rb",
  ".php",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".kts",
  ".scala",
  ".pl",
  ".pm",
  ".r",
  ".m",
  ".tex",
  ".bib",
  ".css",
  ".scss",
  ".less",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".vue",
  ".svelte",
  ".env",
  ".properties",
  ".svg",
]);

const MIN_GENERIC_CHARS = 48;

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tryDecodeAsUtf8Text(buffer) {
  const s = buffer.toString("utf8");
  if (!s.trim()) return "";
  const bad = (s.match(/\uFFFD/g) || []).length;
  if (bad > Math.max(16, s.length * 0.025)) return "";
  const sample = Math.min(s.length, 120000);
  let ctrl = 0;
  for (let i = 0; i < sample; i++) {
    const code = s.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) ctrl++;
  }
  if (sample && ctrl / sample > 0.035) return "";
  return s;
}

function sanitizeOriginalName(name) {
  if (typeof name !== "string") return "document";
  const base = path.basename(name).replace(/[\x00-\x1f]/g, "");
  return base.slice(0, 200) || "document";
}

function extFromName(name) {
  const ext = path.extname(name || "").toLowerCase();
  return ext;
}

function findSoffice() {
  const envPath = process.env.LIBREOFFICE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const candidates = [];
  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/LibreOffice.app/Contents/MacOS/soffice"
    );
  }
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  for (const cmd of ["soffice", "libreoffice"]) {
    try {
      execFileSync(cmd, ["--version"], {
        stdio: "ignore",
        timeout: 8000,
        windowsHide: true,
      });
      return cmd;
    } catch (_) {
      /* try next */
    }
  }
  return null;
}

function extractPptViaLibreOffice(buffer) {
  const soffice = findSoffice();
  if (!soffice) return "";
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ezmeet-ppt-"));
  try {
    const inPath = path.join(tmp, "deck.ppt");
    fs.writeFileSync(inPath, buffer);
    execFileSync(
      soffice,
      [
        "--headless",
        "--nologo",
        "--nodefault",
        "--nofirststartwizard",
        "--convert-to",
        "txt:Text",
        "--outdir",
        tmp,
        inPath,
      ],
      { stdio: "ignore", timeout: 120000, windowsHide: true }
    );
    const txtPath = path.join(tmp, "deck.txt");
    if (fs.existsSync(txtPath)) {
      return fs.readFileSync(txtPath, "utf8");
    }
  } catch (_) {
    return "";
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (_) {
      /* ignore */
    }
  }
  return "";
}

function scrapeLegacyPptText(buffer) {
  const seen = new Set();
  const parts = [];
  const pushIfGood = (s) => {
    const t = s.replace(/\u0000/g, "").trim();
    if (t.length < 6) return;
    if (!/[\p{L}]/u.test(t)) return;
    if (/^[\d\s./:\\_-]+$/u.test(t)) return;
    const key = t.slice(0, 200);
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(t);
  };

  let start = 0;
  for (let i = 0; i <= buffer.length; i++) {
    const atEnd = i >= buffer.length;
    const doubleNull =
      !atEnd && buffer[i] === 0 && buffer[i + 1] === 0;
    if (atEnd || doubleNull) {
      const len = i - start;
      if (len >= 8 && len % 2 === 0) {
        const slice = buffer.subarray(start, i);
        try {
          pushIfGood(slice.toString("utf16le"));
        } catch (_) {
          /* ignore */
        }
      }
      start = atEnd ? i : i + 2;
      if (!atEnd) i++;
    }
  }

  for (let i = 0; i < buffer.length - 24; i += 2) {
    let s = "";
    let j = i;
    while (j < buffer.length - 1 && buffer[j + 1] === 0) {
      const c = buffer[j];
      if (c >= 0x20 && c <= 0x7e) {
        s += String.fromCharCode(c);
        j += 2;
      } else break;
    }
    if (s.length >= 14) pushIfGood(s);
  }

  return parts.join("\n\n");
}

async function extractLegacyDoc(buffer) {
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  const chunks = [doc.getBody() || ""];
  try {
    const h = doc.getHeaders();
    if (h && String(h).trim()) chunks.push(String(h));
  } catch (_) {
    /* optional */
  }
  try {
    const f = doc.getFootnotes();
    if (f && String(f).trim()) chunks.push(String(f));
  } catch (_) {
    /* optional */
  }
  try {
    const e = doc.getEndnotes();
    if (e && String(e).trim()) chunks.push(String(e));
  } catch (_) {
    /* optional */
  }
  return chunks.filter(Boolean).join("\n\n");
}

/**
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {number} maxChars
 * @returns {Promise<{ text: string, extractor: string, warnings: string[], truncated: boolean }>}
 */
async function extractText(buffer, originalName, maxChars) {
  const ext = extFromName(originalName);

  const warnings = [];
  let text = "";
  let extractor = "";

  if (ext === ".pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const tr = await parser.getText();
      text = (tr && tr.text) || "";
    } finally {
      try {
        await parser.destroy();
      } catch (_) {
        /* ignore */
      }
    }
    extractor = "pdf-parse";
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
    extractor = "mammoth";
  } else if (ext === ".doc") {
    text = await extractLegacyDoc(buffer);
    extractor = "word-extractor";
  } else if (ext === ".ppt") {
    text = extractPptViaLibreOffice(buffer).trim();
    if (text) {
      extractor = "libreoffice";
    } else {
      text = scrapeLegacyPptText(buffer);
      extractor = "ppt-heuristic";
      if (text) {
        warnings.push(
          "Legacy .ppt: text was recovered heuristically (install LibreOffice for cleaner extraction)."
        );
      }
    }
  } else if (
    [".pptx", ".xlsx", ".odt", ".odp", ".ods", ".rtf"].includes(ext)
  ) {
    const ast = await parseOffice(buffer);
    text = typeof ast.toText === "function" ? ast.toText() : "";
    extractor = "officeparser";
  } else if ([".html", ".htm"].includes(ext)) {
    text = stripHtml(buffer.toString("utf8"));
    extractor = "html";
  } else if (PLAIN_UTF8_EXT.has(ext)) {
    text = buffer.toString("utf8");
    extractor = "utf8";
  } else {
    const generic = tryDecodeAsUtf8Text(buffer);
    if (generic.length >= MIN_GENERIC_CHARS) {
      text = generic;
      extractor = "utf8-inferred";
      warnings.push(
        ext
          ? `Decoded as UTF-8 text (${ext} — no dedicated parser).`
          : "Decoded as UTF-8 text (no file extension)."
      );
    } else {
      const err = new Error(
        "Could not read extractable text (binary or unknown format — try PDF, Office, or .txt)."
      );
      err.code = "UNSUPPORTED_TYPE";
      err.supported = SUPPORTED;
      throw err;
    }
  }

  text = text.replace(/\u0000/g, "").trim();
  if (!text) {
    warnings.push("No text could be extracted (empty or scanned document).");
  }

  let truncated = false;
  if (text.length > maxChars) {
    text = text.slice(0, maxChars);
    truncated = true;
    warnings.push(`Text truncated to ${maxChars} characters.`);
  }

  return { text, extractor, warnings, truncated };
}

export {
  extractText,
  sanitizeOriginalName,
  extFromName,
  SUPPORTED,
};
