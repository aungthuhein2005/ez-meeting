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

## How to use

1. Sign in with **email** and **display name** (no password).
2. **Host a meeting** — allow camera/mic; share the **code**, **QR**, or **Copy join link**.
3. On another device/tab, open the link or **Join with code** (or scan the QR — it opens the same URL).
4. **Leave** exits the room; **End for everyone** (host only) tears down the meeting and invalidates the code.

Mesh WebRTC works best for **small groups** (see Scope.md). Use HTTPS and/or TURN in production for strict NATs.

## Project layout

- `server.js` — Express, REST login + QR PNG, Socket.io rooms and signaling
- `lib/auth.js` — JWT sign/verify
- `lib/rooms.js` — in-memory room `Map`
- `public/` — static UI (`app.js` client)
