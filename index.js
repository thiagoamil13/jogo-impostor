// Jogo do Impostor — Worker + Durable Object.
// Cada sala é um Durable Object. Entre uma jogada e outra ele hiberna:
// os jogadores continuam conectados, o estado fica salvo e nada é cobrado.
import * as G from "./game.js";
import { HTML } from "./html.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rid = n => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status,
  headers: {
    "content-type": "application/json",
    // sorteio de código nunca pode vir de cache — nem da borda, nem do navegador
    "cache-control": "no-store, no-cache, must-revalidate",
    "pragma": "no-cache"
  }
});

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/health") return new Response("ok");

    // Sorteia um código livre para uma sala nova.
    if (url.pathname === "/api/new") {
      if (req.method !== "POST") return json({ error: "use POST" }, 405);
      for (let i = 0; i < 6; i++) {
        const code = rid(4);
        const stub = env.ROOM.get(env.ROOM.idFromName(code));
        const r = await stub.fetch("https://room/reserve?code=" + code, { method: "POST" });
        if (r.status === 200) return json({ code });
      }
      return json({ error: "Não consegui criar a sala agora. Tente de novo." }, 503);
    }

    if (url.pathname === "/ws") {
      const code = (url.searchParams.get("code") || "").toUpperCase();
      if (!/^[A-Z0-9]{4,6}$/.test(code)) return new Response("código inválido", { status: 400 });
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(req);
    }

    return new Response(HTML, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" }
    });
  }
};

export class GameRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null;
    // Ao acordar da hibernação, o estado volta do disco antes de qualquer mensagem.
    ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get("room")) || null;
    });
    // Responde o keepalive do cliente sem acordar o objeto.
    ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair(JSON.stringify({ t: "ping" }), JSON.stringify({ t: "pong" }))
    );
  }

  async save() {
    await this.ctx.storage.put("room", this.room);
    await this.ctx.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1000); // sala ociosa some em 3h
  }

  async alarm() {
    for (const ws of this.ctx.getWebSockets()) { try { ws.close(1000, "sala expirada"); } catch { } }
    await this.ctx.storage.deleteAll();
    this.room = null;
  }

  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/reserve") {
      if (this.room && this.room.players.length) return new Response("ocupada", { status: 409 });
      this.room = G.newRoom(url.searchParams.get("code") || "");
      await this.save();
      return new Response("ok");
    }

    if (req.headers.get("Upgrade") !== "websocket") return new Response("esperava websocket", { status: 426 });

    const code = (url.searchParams.get("code") || "").toUpperCase();
    if (!this.room) this.room = G.newRoom(code);
    if (!this.room.code) this.room.code = code;

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);      // hibernação: o socket sobrevive ao objeto dormir
    server.serializeAttachment({ pid: null });
    return new Response(null, { status: 101, webSocket: client });
  }

  sockFor(pid) {
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment();
      if (a && a.pid === pid) return ws;
    }
    return null;
  }

  push() {
    if (!this.room) return;
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment();
      if (!a || !a.pid) continue;
      const v = G.viewFor(this.room, a.pid);
      if (v) { try { ws.send(JSON.stringify(v)); } catch { } }
    }
  }

  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "ping") return;

    const att = ws.deserializeAttachment() || { pid: null };

    if (m.t === "create" || m.t === "join") {
      if (!this.room) this.room = G.newRoom("");
      if (m.t === "join" && !this.room.players.length && !this.room.round) {
        const known = await this.ctx.storage.get("room");
        if (!known) { ws.send(JSON.stringify({ t: "err", msg: "Sala não encontrada. Confira o código." })); return; }
      }
      const r = G.addPlayer(this.room, m.name, m.pid);
      if (r.error) { ws.send(JSON.stringify({ t: "err", msg: r.error })); return; }
      if (r.rejoined) {
        const old = this.sockFor(r.player.id);
        if (old && old !== ws) { try { old.close(1000, "reconectado"); } catch { } }
      }
      ws.serializeAttachment({ pid: r.player.id });
      if (m.t === "create") this.room.hostId = this.room.hostId || r.player.id;
      ws.send(JSON.stringify({ t: "joined", pid: r.player.id, code: this.room.code }));
      await this.save();
      this.push();
      return;
    }

    if (!att.pid || !this.room) return;

    const res = G.handle(this.room, att.pid, m);
    if (res.error) { ws.send(JSON.stringify({ t: "err", msg: res.error })); return; }
    if (!res.changed) return;

    if (res.kicked) {
      const k = this.sockFor(res.kicked);
      if (k) { try { k.send(JSON.stringify({ t: "kicked" })); k.close(1000, "removido"); } catch { } }
    }
    await this.save();
    this.push();
  }

  async webSocketClose(ws) { await this.bye(ws); }
  async webSocketError(ws) { await this.bye(ws); }

  async bye(ws) {
    const a = ws.deserializeAttachment();
    if (!a || !a.pid || !this.room) return;
    G.dropPlayer(this.room, a.pid);
    if (!this.room.players.length) { await this.ctx.storage.deleteAll(); this.room = null; return; }
    await this.save();
    this.push();
  }
}
