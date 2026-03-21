const http = require("http");
const path = require("path");
const express = require("express");
const QRCode = require("qrcode");
const { Server } = require("socket.io");
const { signToken, verifyToken } = require("./lib/auth");
const rooms = require("./lib/rooms");

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true },
});

app.use(express.json({ limit: "32kb" }));

/** Allow API calls when the page origin differs (e.g. localhost vs 127.0.0.1) — no cookies used. */
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) return next();
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/vendor", express.static(path.join(__dirname, "node_modules/simple-peer")));

function joinUrlFromSocket(socket, code) {
  const host = socket.handshake.headers?.host || `localhost:${PORT}`;
  const proto = socket.handshake.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}/?join=${encodeURIComponent(code)}`;
}

/** GET /api/health — quick check that the Node server (not static-only) is running */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/** POST /api/login { email, name } -> { token } */
app.post("/api/login", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().slice(0, 320) : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 80) : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }
  try {
    const token = signToken({ email, name });
    return res.json({ token });
  } catch {
    return res.status(500).json({ error: "Could not issue token" });
  }
});

/** PNG QR for join URL */
app.get("/api/qr/:code", async (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(code)) {
    return res.status(400).send("Invalid code");
  }
  try {
    const host = req.get("host") || `localhost:${PORT}`;
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const url = `${proto}://${host}/?join=${encodeURIComponent(code)}`;
    const png = await QRCode.toBuffer(url, { type: "png", width: 256, margin: 2 });
    res.type("png");
    res.send(png);
  } catch {
    res.status(500).send("QR failed");
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.use((socket, next) => {
  const raw = socket.handshake.auth?.token || socket.handshake.query?.token;
  const token = typeof raw === "string" ? raw : "";
  if (!token) {
    return next(new Error("auth_required"));
  }
  try {
    socket.user = verifyToken(token);
    return next();
  } catch {
    return next(new Error("invalid_token"));
  }
});

async function clearRoomSockets(code) {
  const socks = await io.in(code).fetchSockets();
  for (const s of socks) {
    s.data.roomCode = null;
    s.leave(code);
  }
}

io.on("connection", (socket) => {
  socket.data.roomCode = null;

  socket.on("room:create", (ack) => {
    if (socket.data.roomCode) {
      if (typeof ack === "function") ack({ error: "already_in_room" });
      return;
    }
    const code = rooms.createRoom(socket.id);
    socket.join(code);
    socket.data.roomCode = code;
    rooms.setParticipantMeta(code, socket.id, socket.user);
    const peers = rooms.listPeers(code, socket.id);
    if (typeof ack === "function") {
      ack({
        code,
        joinUrl: joinUrlFromSocket(socket, code),
        peers,
        isHost: true,
      });
    }
  });

  socket.on("room:join", (payload, ack) => {
    const codeRaw = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{4,12}$/.test(codeRaw)) {
      if (typeof ack === "function") ack({ error: "invalid_code" });
      return;
    }
    if (socket.data.roomCode) {
      if (typeof ack === "function") ack({ error: "already_in_room" });
      return;
    }
    const r = rooms.joinRoom(codeRaw, socket.id);
    if (!r.ok) {
      if (typeof ack === "function") ack({ error: "not_found" });
      return;
    }
    socket.join(codeRaw);
    socket.data.roomCode = codeRaw;
    rooms.setParticipantMeta(codeRaw, socket.id, socket.user);
    const peerList = rooms.listPeers(codeRaw, socket.id);
    const host = rooms.isHost(codeRaw, socket.id);
    if (typeof ack === "function") {
      ack({
        code: codeRaw,
        joinUrl: joinUrlFromSocket(socket, codeRaw),
        peers: peerList,
        isHost: host,
      });
    }
    socket.to(codeRaw).emit("peer:joined", {
      peerId: socket.id,
      name: socket.user.name,
    });
  });

  socket.on("signal", (payload) => {
    const targetId = typeof payload?.targetId === "string" ? payload.targetId : "";
    const signal = payload?.signal;
    if (!targetId || signal === undefined) return;
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.getRoom(code);
    if (!room || !room.participants.has(targetId) || !room.participants.has(socket.id)) return;
    io.to(targetId).emit("signal", { fromId: socket.id, signal });
  });

  socket.on("chat:message", (payload) => {
    const code = socket.data.roomCode;
    if (!code) return;
    const text = typeof payload?.text === "string" ? payload.text.slice(0, 2000) : "";
    if (!text.trim()) return;
    io.to(code).emit("chat:message", {
      text,
      at: Date.now(),
      from: socket.user.name,
      socketId: socket.id,
    });
  });

  socket.on("room:end", async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    if (!rooms.endRoomByHost(code, socket.id)) return;
    io.to(code).emit("room:ended", { reason: "host_ended" });
    await clearRoomSockets(code);
  });

  socket.on("room:leave", async () => {
    await leaveSocketRoom(socket);
  });

  socket.on("disconnecting", async () => {
    await leaveSocketRoom(socket);
  });
});

async function leaveSocketRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const result = rooms.removeParticipant(socket.id);
  socket.data.roomCode = null;
  if (!result) {
    await socket.leave(code);
    return;
  }
  if (result.ended) {
    io.to(result.code).emit("room:ended", {
      reason: result.reason === "host_left" ? "host_left" : "empty",
    });
    await clearRoomSockets(result.code);
  } else {
    socket.to(result.code).emit("peer:left", { peerId: socket.id });
    await socket.leave(code);
  }
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use (another process is listening).\n` +
        `Stop it, e.g. find the PID:  lsof -i :${PORT}\n` +
        `Then:  kill <PID>\n` +
        `Or use another port:  PORT=3001 npm start`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Ez meeting: http://localhost:${PORT}`);
});
