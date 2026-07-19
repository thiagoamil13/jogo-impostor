// Regras do Jogo do Impostor — funções puras, sem rede e sem I/O.
// Roda igual no Node (testes) e dentro do Durable Object.
import { PAIRS, CATS } from "./words.js";

export { CATS };
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 16;

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const clean = (s, max) => String(s || "").replace(/[<>]/g, "").trim().slice(0, max);

export function newRoom(code) {
  return {
    code, hostId: null, players: [], phase: "lobby", round: 0,
    cfg: { mode: "pares", nImp: 1, secs: 180, cats: CATS.slice(), clueMode: "voz" },
    impIds: [], wordA: "", wordB: "", catName: "", words: {},
    clueOrder: [], clueTurn: 0, endsAt: 0,
    accusedId: null, tally: {}, caught: false, guessed: false, guessText: "",
    createdAt: Date.now()
  };
}

export const P = (room, id) => room.players.find(p => p.id === id) || null;
const alive = room => room.players.filter(p => p.connected);
export const maxImp = room => Math.max(1, Math.floor((room.players.length - 1) / 2));

/* ---------- entrada e saída de jogadores ---------- */
export function addPlayer(room, name, pid) {
  const prev = pid ? P(room, pid) : null;
  if (prev) { prev.connected = true; if (name) prev.name = clean(name, 14); return { player: prev, rejoined: true }; }
  if (room.phase !== "lobby") return { error: "A partida já começou. Espere a próxima rodada." };
  if (room.players.length >= MAX_PLAYERS) return { error: "Sala cheia (máx. " + MAX_PLAYERS + ")." };
  const p = { id: uid(), name: clean(name, 14) || "Jogador", score: 0, connected: true, ready: false, clue: "", vote: null };
  room.players.push(p);
  if (!room.hostId) room.hostId = p.id;
  return { player: p, rejoined: false };
}

export function dropPlayer(room, pid) {
  const p = P(room, pid);
  if (!p) return;
  p.connected = false;
  if (room.phase === "lobby") {
    const i = room.players.indexOf(p);
    if (i >= 0) room.players.splice(i, 1);
  }
  if (room.hostId === pid) {
    const nxt = alive(room)[0] || room.players[0];
    room.hostId = nxt ? nxt.id : null;
  }
  if (room.phase === "reveal") maybeLeaveReveal(room);
  if (room.phase === "clues") maybeLeaveClues(room);
  if (room.phase === "discuss") maybeLeaveDiscuss(room);
  if (room.phase === "vote") maybeTally(room);
}

/* ---------- fluxo ---------- */
export function startRound(room) {
  const use = room.cfg.cats.filter(c => CATS.includes(c));
  room.catName = (use.length ? use : CATS)[Math.floor(Math.random() * (use.length || CATS.length))];
  const pool = PAIRS[room.catName];
  let [a, b] = pool[Math.floor(Math.random() * pool.length)];
  if (Math.random() < 0.5) [a, b] = [b, a];
  room.wordA = a; room.wordB = b;
  const ids = shuffle(room.players.map(p => p.id));
  room.impIds = ids.slice(0, Math.min(room.cfg.nImp, maxImp(room)));
  room.words = {};
  for (const p of room.players) {
    room.words[p.id] = room.impIds.includes(p.id) ? (room.cfg.mode === "pares" ? b : null) : a;
  }
  room.players.forEach(p => { p.ready = false; p.clue = ""; p.vote = null; });
  room.clueOrder = shuffle(alive(room).map(p => p.id));
  room.clueTurn = 0; room.endsAt = 0;
  room.accusedId = null; room.tally = {}; room.caught = false; room.guessed = false; room.guessText = "";
  room.round++; room.phase = "reveal";
}

function toDiscuss(room) {
  room.players.forEach(p => p.ready = false);   // recomeça: agora "pronto" = pronto para votar
  room.phase = "discuss";
  room.endsAt = room.cfg.secs ? Date.now() + room.cfg.secs * 1000 : 0;
}

function openVote(room) {
  room.players.forEach(p => { p.vote = null; p.ready = false; });
  room.phase = "vote";
  room.endsAt = 0;
}

// Na discussão, quando todo mundo confirma, a votação abre sozinha.
function maybeLeaveDiscuss(room) {
  const a = alive(room);
  if (a.length && a.every(p => p.ready)) openVote(room);
}

function maybeLeaveReveal(room) {
  const a = alive(room);
  if (a.length && a.every(p => p.ready)) {
    if (room.cfg.clueMode === "digitadas") { room.phase = "clues"; room.clueTurn = 0; }
    else toDiscuss(room);
  }
}

// Todos escrevem ao mesmo tempo. Quando o último envia, as dicas aparecem para todos.
function maybeLeaveClues(room) {
  const a = alive(room);
  if (a.length && a.every(p => p.clue)) toDiscuss(room);
}

function maybeTally(room, force = false) {
  const a = alive(room);
  if (!force && (!a.length || !a.every(p => p.vote !== null && p.vote !== undefined))) return;
  if (force && !a.some(p => p.vote)) return;
  const count = {};
  for (const p of a) if (p.vote && p.vote !== "skip") count[p.vote] = (count[p.vote] || 0) + 1;
  const vals = Object.values(count);
  const max = vals.length ? Math.max(...vals) : 0;
  const top = Object.keys(count).filter(k => count[k] === max);
  room.tally = count;
  room.accusedId = (max > 0 && top.length === 1) ? top[0] : null;
  room.caught = !!room.accusedId && room.impIds.includes(room.accusedId);
  room.phase = "result"; room.endsAt = 0;
}

function scoreAndFinish(room) {
  if (room.caught) {
    for (const p of room.players) if (!room.impIds.includes(p.id)) p.score += 1;
    if (room.guessed) for (const id of room.impIds) { const p = P(room, id); if (p) p.score += 1; }
  } else {
    for (const id of room.impIds) { const p = P(room, id); if (p) p.score += 2; }
  }
  room.phase = "final";
}

/* ---------- mensagens dos jogadores ---------- */
// Devolve { changed, error } — quem chama decide o que fazer com isso.
export function handle(room, pid, m) {
  const me = P(room, pid);
  if (!me) return { changed: false };
  const isHost = room.hostId === pid;
  const no = { changed: false };

  switch (m.t) {
    case "cfg": {
      if (!isHost || room.phase !== "lobby") return no;
      const c = room.cfg;
      if (m.mode === "pares" || m.mode === "classico") c.mode = m.mode;
      if (m.clueMode === "voz" || m.clueMode === "digitadas") c.clueMode = m.clueMode;
      if (typeof m.secs === "number" && [0, 60, 120, 180, 300].includes(m.secs)) c.secs = m.secs;
      if (typeof m.nImp === "number") c.nImp = Math.max(1, Math.min(maxImp(room), Math.floor(m.nImp)));
      if (Array.isArray(m.cats)) { const v = m.cats.filter(x => CATS.includes(x)); if (v.length) c.cats = v; }
      c.nImp = Math.min(c.nImp, maxImp(room));
      break;
    }
    case "rename": me.name = clean(m.name, 14) || me.name; break;
    case "kick": {
      if (!isHost || room.phase !== "lobby") return no;
      const i = room.players.findIndex(p => p.id === m.id);
      if (i >= 0 && room.players[i].id !== room.hostId) { const gone = room.players.splice(i, 1)[0]; return { changed: true, kicked: gone.id }; }
      return no;
    }
    case "start": {
      if (!isHost) return no;
      if (room.players.length < MIN_PLAYERS) return { changed: false, error: "Precisa de pelo menos " + MIN_PLAYERS + " jogadores." };
      if (room.phase !== "lobby" && room.phase !== "final") return no;
      startRound(room); break;
    }
    case "ready": {
      if (room.phase === "reveal") { me.ready = true; maybeLeaveReveal(room); break; }
      if (room.phase === "discuss") { me.ready = true; maybeLeaveDiscuss(room); break; }
      return no;
    }
    case "unready": {
      if (room.phase !== "discuss") return no;
      me.ready = false; break;
    }
    case "clue": {
      if (room.phase !== "clues") return no;
      const txt = clean(m.text, 20);
      if (!txt) return no;
      me.clue = txt;                 // dá pra trocar enquanto os outros ainda escrevem
      maybeLeaveClues(room); break;
    }
    case "skipClue": {               // host segue sem quem não escreveu
      if (!isHost || room.phase !== "clues") return no;
      if (!alive(room).some(p => p.clue)) return no;
      toDiscuss(room); break;
    }
    case "toVote": {
      if (!isHost || (room.phase !== "discuss" && room.phase !== "clues")) return no;
      openVote(room); break;
    }
    case "vote": {
      if (room.phase !== "vote") return no;
      if (m.id !== "skip" && !P(room, m.id)) return no;
      if (m.id === pid) return no;
      me.vote = m.id; maybeTally(room); break;
    }
    case "forceTally": { if (!isHost || room.phase !== "vote") return no; maybeTally(room, true); break; }
    case "unvote": { if (room.phase !== "vote") return no; me.vote = null; break; }
    case "reveal": {
      if (!isHost || room.phase !== "result") return no;
      if (room.caught) room.phase = "guess"; else scoreAndFinish(room);
      break;
    }
    case "guess": {
      if (room.phase !== "guess" || pid !== room.accusedId) return no;
      room.guessText = clean(m.text, 30);
      room.guessed = norm(room.guessText) === norm(room.wordA);
      scoreAndFinish(room); break;
    }
    case "next": { if (!isHost || room.phase !== "final") return no; startRound(room); break; }
    case "lobby": {
      if (!isHost) return no;
      room.phase = "lobby"; room.endsAt = 0;
      room.players.forEach(p => { p.ready = false; p.clue = ""; p.vote = null; });
      room.words = {}; room.impIds = []; break;
    }
    case "resetScore": {
      if (!isHost) return no;
      room.players.forEach(p => p.score = 0); room.round = 0; break;
    }
    default: return no;
  }
  return { changed: true };
}

/* ---------- o que cada jogador enxerga ---------- */
export function viewFor(room, pid) {
  const me = P(room, pid);
  if (!me) return null;
  const showAll = room.phase === "final";
  const isImp = room.impIds.includes(pid);
  return {
    t: "state",
    you: { id: me.id, name: me.name, isHost: room.hostId === pid, ready: me.ready, voted: me.vote !== null && me.vote !== undefined, clue: me.clue || "" },
    code: room.code, hostId: room.hostId, phase: room.phase, round: room.round,
    cfg: room.cfg, cats: CATS, maxImp: maxImp(room), minPlayers: MIN_PLAYERS,
    players: room.players.map(p => ({
      id: p.id, name: p.name, score: p.score, connected: p.connected,
      ready: p.ready,
      // durante a escrita, cada um só enxerga a própria dica
      clue: (room.phase === "clues" && p.id !== pid) ? "" : (p.clue || ""),
      hasClue: !!p.clue,
      hasVoted: p.vote !== null && p.vote !== undefined,
      isImp: showAll ? room.impIds.includes(p.id) : undefined
    })),
    myWord: room.phase === "lobby" ? null : (room.words[pid] ?? null),
    myRole: room.phase === "lobby" ? null : (isImp ? "impostor" : "cidadao"),
    catName: room.phase === "lobby" ? "" : room.catName,
    endsAt: room.endsAt || 0,
    result: ["result", "guess", "final"].includes(room.phase) ? {
      tally: room.tally, accusedId: room.accusedId, caught: room.caught,
      guessed: room.guessed, guessText: room.guessText,
      impIds: room.phase === "final" ? room.impIds : (room.phase === "guess" ? [room.accusedId] : []),
      wordA: room.phase === "final" ? room.wordA : "",
      wordB: room.phase === "final" ? room.wordB : ""
    } : null,
    amAccused: room.accusedId === pid
  };
}
