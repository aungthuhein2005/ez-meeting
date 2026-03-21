(function () {
  const TOKEN_KEY = "ezmeeting_token";

  let socket = null;
  let localStream = null;
  const peers = new Map();
  let meetingState = { joinUrl: "", code: "", isHost: false };
  let busy = false;

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

  function clearLobbyError() {
    $("lobby-error").textContent = "";
  }

  function clearLoginError() {
    $("login-error").textContent = "";
  }

  function onConnectError(err) {
    console.error(err);
    cleanupMeeting();
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

    socket.on("room:ended", ({ reason }) => {
      const labels = {
        host_ended: "Meeting ended by host.",
        host_left: "Host left — meeting closed.",
        empty: "Everyone left — meeting closed.",
      };
      meetingStatus(labels[reason] || "Meeting ended.");
      cleanupMeeting();
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
        const lab = document.createElement("span");
        lab.className = "label";
        lab.textContent = remoteName || "Guest";
        wrap.appendChild(vid);
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

  function cleanupMeeting() {
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
      socket.emit("room:create", (ack) => {
        if (!ack || ack.error) {
          meetingStatus("Could not create room: " + (ack && ack.error ? ack.error : "unknown"));
          cleanupMeeting();
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
      socket.emit("room:join", { code }, (ack) => {
        if (!ack || ack.error) {
          meetingStatus(
            ack && ack.error === "not_found"
              ? "Meeting not found or already ended."
              : "Could not join: " + (ack && ack.error ? ack.error : "unknown")
          );
          cleanupMeeting();
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

  function leaveMeeting() {
    if (socket && socket.connected) {
      socket.emit("room:leave");
    }
    cleanupMeeting();
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

  function logout() {
    clearToken();
    cleanupMeeting();
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
