# Ez meeting

Zoom-style meetings in the browser: **email + name** (JWT, no database), **6-character room codes**, **QR join links**, **Socket.io** chat/signaling, **full-mesh WebRTC** (video + voice) via [simple-peer](https://github.com/feross/simple-peer). See [Scope.md](./Scope.md) for product scope.

## Requirements

- Node.js 18+

## Run

```bash
npm install
npm start
```

Open **http://localhost:3000** (or set `PORT`).

Optional environment (see [.env.example](./.env.example)):

- `JWT_SECRET` — signing key for JWTs (defaults to a dev string; **set in production**).
- `PORT` — HTTP port.

## Hand-sign captions (gesture + optional spelling)

In a meeting, enable **Hand-sign captions**. Your **local camera** is analyzed only in the browser with **pretrained** models (no custom training). Detected phrases are sent over Socket.io (`sign:caption`) to everyone, shown in the **Hand-sign feed**, echoed in chat, as **subtitles on video tiles**, and optionally read aloud (**Read others’ sign captions aloud**) via the browser `speechSynthesis` API (receive-side only).

### Models and assets

| Piece | Source | Notes |
| ----- | ------ | ----- |
| Gesture recognition | [MediaPipe Gesture Recognizer](https://developers.google.com/mediapipe/solutions/vision/gesture_recognizer) | WASM/weights from Google CDN on first use; seven named gestures + `None`. |
| Landmarks / same pipeline | Bundled with the recognizer task | Used for fingerpose-style matching. |
| fingerpose + A–Z gestures | [fingerpose](https://github.com/andypotato/fingerpose) (MIT) + [syauqy/handsign-tensorflow](https://github.com/syauqy/handsign-tensorflow) `components/handsigns` (BSD-2-Clause) | Vendored build: `public/vendor/handsigns-alphabet.js` (see `npm run build:handsigns`). |

**Limitations:** MediaPipe does **not** output arbitrary ASL words (“hello”, “thanks”) as distinct classes. Phrases are **mapped** from the seven gestures in `public/sign-labels.js`. Finger-spelling is **geometry-based** and sensitive to lighting, crop, and similar hand shapes—expect errors; the UI uses stability windows and cooldowns to reduce jitter.

### Socket payload (phase 1 + hook for translation)

Clients may send:

- `text` (required), `gestureKey`, `kind` (`gesture` | `spell` | `model`), optional `lang`, optional `translatedText` (reserved for a future translation phase).

The server validates `kind`, clamps string lengths, and applies a **per-socket rate limit** (~12 captions/second) to limit flooding.

### Privacy / network

- Gesture and spelling inference run **in the browser**; only the chosen **text strings** are sent to the room via your server.
- MediaPipe loads model assets from **Google’s CDN** when hand-sign is first enabled (requires network).

### Optional next steps (not implemented here)

- **TF.js word classifier:** add `@tensorflow/tfjs`, host a browser-runnable `model.json` + shards under `public/models/…`, run inference on a hand ROI or landmark tensor, then emit with `kind: "model"`.
- **Translation:** e.g. LibreTranslate-compatible HTTP, a small Python sidecar, or a browser API; set `translatedText` on the broadcast for subtitles + TTS.

### Rebuild ASL alphabet bundle

After changing `scripts/handsigns-entry.js` or `scripts/handsigns-src/*`:

```bash
npm run build:handsigns
```

## Shared meeting documents (Notebook-style insights + translation)

In a meeting, the **host** can upload a file; the server **extracts text**, **detects language** ([franc](https://github.com/wooorm/franc)), and runs a **multi-pass Hugging Face** pipeline: **overview**, **key ideas** (FLAN-T5–style prompts), **deep dive** (summary of a middle slice of long docs), **study questions**, and **action items**. Every section is **translated** for each participant via a [LibreTranslate](https://libretranslate.com)-compatible API according to **Preferred language** in the UI. Socket.io sends a private `doc:payload` with an `insight` object per socket.

**Gemini Q&A:** With **`GEMINI_API_KEY`** set, anyone in the room can use **Ask about this file (Gemini)** in the document sidebar: questions are answered from the **same extracted text** via the [Google Gemini API](https://ai.google.dev/) (`POST /api/rooms/:code/documents/chat`). This is separate from the HF insight tabs.

### Supported file types

**Structured:** PDF ([pdf-parse](https://www.npmjs.com/package/pdf-parse) v1.x, Node-safe), Word `.doc` ([word-extractor](https://www.npmjs.com/package/word-extractor)), `.docx` (mammoth), legacy `.ppt` (LibreOffice headless or heuristic), `.pptx` / `.xlsx` / OpenDocument / `.rtf` (officeparser). **Markup/code:** `.html` / `.htm` (tag-stripped), `.xml`, `.svg`, many source extensions (`.js`, `.ts`, `.py`, …), `.sql`, `.yaml`, `.toml`, etc. **Anything else:** if the file decodes as **clean UTF-8 text** (enough printable content), it is analyzed the same way; pure binaries fail with a clear error. Scanned PDFs without a text layer may yield “no extractable text”. Optional **`LIBREOFFICE_PATH`**: path to `soffice` if not on `PATH` (see [.env.example](./.env.example)).

### Configuration

Set **`HF_API_KEY`** (required for analysis). Use a token with **Make calls to Inference Providers** enabled. Calls use **`https://router.huggingface.co/hf-inference/models/...`**. Optional: **`HF_INFERENCE_URL`**, **`HF_FLAN_MODEL`** (default `google/flan-t5-base` for key ideas + study questions). Set **`LIBRETRANSLATE_URL`** for translating insights (e.g. English → Thai). The public **libretranslate.com** demo is often rate-limited; for reliable Thai and other languages, **self-host** LibreTranslate or use an instance with an API key — set **`LIBRETRANSLATE_API_KEY`** if required.

For **Gemini chat**, set **`GEMINI_API_KEY`** (and optionally **`GEMINI_MODEL`**, e.g. `gemini-1.5-flash`). Optional: **`MAX_GEMINI_CONTEXT_CHARS`**, **`DOC_CHAT_COOLDOWN_MS`**.

Other optional: **`LIBREOFFICE_PATH`**, **`MAX_DOCUMENT_BYTES`**, **`MAX_EXTRACT_CHARS`**, **`UPLOAD_DIR`**, **`DOC_UPLOAD_COOLDOWN_MS`** — see [.env.example](./.env.example).

### Privacy

Uploaded files and extracted text are processed on **your Node server** and sent to **Hugging Face**, **LibreTranslate**, and (if enabled) **Google Gemini** as configured. Do not upload confidential data without reviewing those services’ terms.

## How to use

1. Sign in with **email** and **display name** (no password).
2. **Host a meeting** — allow camera/mic; share the **code**, **QR**, or **Copy join link**.
3. On another device/tab, open the link or **Join with code** (or scan the QR — it opens the same URL).
4. **Leave** exits the room; **End for everyone** (host only) tears down the meeting and invalidates the code.
5. Optional **Finger-spelling mode**: open palm (stable) inserts a **space**; hold **closed fist** ~⅓s or click **Send spelling line** to commit the buffer. **Clear spelling** empties the buffer without sending.
6. **Shared document** (host): upload any readable file; everyone picks **Preferred language** for the full insight bundle. PDFs show a **first-page preview** (PDF.js). With Gemini configured, use **Ask about this file** to chat over the document text.

Mesh WebRTC works best for **small groups** (see Scope.md). Use HTTPS and/or TURN in production for strict NATs.

## Project layout

- `server.js` — Express, REST login + QR PNG, Socket.io rooms and signaling
- `routes/documents.js` — `POST/GET` meeting document upload + file download + `POST .../documents/chat` (Gemini)
- `lib/documentExtract.js`, `lib/detectLanguage.js`, `lib/summarize.js`, `lib/translate.js`, `lib/geminiDocChat.js`, `lib/roomDocuments.js`, `lib/meetingDocumentPipeline.js` — extraction → HF → LibreTranslate → Socket emit; Gemini uses stored `extractedText`
- `lib/auth.js` — JWT sign/verify
- `lib/rooms.js` — in-memory room `Map`
- `public/` — static UI (`app.js`, `hand-sign.js`, `sign-labels.js`, `vendor/handsigns-alphabet.js`)
- `scripts/handsigns-entry.js` — esbuild entry for fingerpose + A–Z gesture descriptions
