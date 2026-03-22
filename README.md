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

## How to use

1. Sign in with **email** and **display name** (no password).
2. **Host a meeting** — allow camera/mic; share the **code**, **QR**, or **Copy join link**.
3. On another device/tab, open the link or **Join with code** (or scan the QR — it opens the same URL).
4. **Leave** exits the room; **End for everyone** (host only) tears down the meeting and invalidates the code.
5. Optional **Finger-spelling mode**: open palm (stable) inserts a **space**; hold **closed fist** ~⅓s or click **Send spelling line** to commit the buffer. **Clear spelling** empties the buffer without sending.

Mesh WebRTC works best for **small groups** (see Scope.md). Use HTTPS and/or TURN in production for strict NATs.

## Project layout

- `server.js` — Express, REST login + QR PNG, Socket.io rooms and signaling
- `lib/auth.js` — JWT sign/verify
- `lib/rooms.js` — in-memory room `Map`
- `public/` — static UI (`app.js`, `hand-sign.js`, `sign-labels.js`, `vendor/handsigns-alphabet.js`)
- `scripts/handsigns-entry.js` — esbuild entry for fingerpose + A–Z gesture descriptions
