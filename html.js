// Página do jogo embutida como texto — evita a pasta public/ e o binding de assets.
export const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0e0b1a">
<title>Jogo do Impostor</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:#0e0b1a;color:#f2eefe;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;min-height:100dvh}
#app{max-width:540px;margin:0 auto;padding:16px 16px 48px}
h1{font-size:29px;margin:6px 0 2px;letter-spacing:-.5px}
h2{font-size:20px;margin:0 0 12px}
.sub{color:#9d93bd;font-size:14px;margin:0 0 18px}
.card{background:#1a1530;border:1px solid #2e2650;border-radius:18px;padding:16px;margin-bottom:12px}
label{display:block;font-size:12px;color:#9d93bd;margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}
button{font-family:inherit;font-size:16px;font-weight:700;border:none;border-radius:14px;padding:15px;width:100%;background:#7c4dff;color:#fff;cursor:pointer;transition:.12s}
button:active{transform:scale(.98)}
button.ghost{background:#241d40;color:#cfc6ee;border:1px solid #3a3162}
button.ok{background:#00c07f}
button:disabled{opacity:.42;cursor:default}
input{width:100%;background:#241d40;border:1px solid #3a3162;color:#fff;border-radius:12px;padding:14px;font-size:16px;font-family:inherit;outline:none}
input:focus{border-color:#7c4dff}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{background:#241d40;border:1px solid #3a3162;color:#cfc6ee;border-radius:999px;padding:9px 14px;font-size:14px;font-weight:600;width:auto}
.chip.on{background:#7c4dff;border-color:#7c4dff;color:#fff}
.stepper{display:flex;align-items:center;gap:12px}
.stepper b{font-size:25px;min-width:34px;text-align:center}
.stepper button{width:50px;height:50px;padding:0;font-size:23px;background:#241d40;border:1px solid #3a3162;flex:none}
.big{text-align:center;padding:30px 18px}
.word{font-size:36px;font-weight:900;letter-spacing:-1px;margin:8px 0;line-height:1.12;word-break:break-word}
.word.imp{color:#ff4d6d}
.tag{display:inline-block;background:#241d40;border-radius:999px;padding:6px 13px;font-size:13px;color:#b3a9d6;margin-bottom:8px}
.code{font-size:44px;font-weight:900;letter-spacing:9px;text-align:center;margin:6px 0 4px;color:#ffd76e}
.timer{font-size:52px;font-weight:900;text-align:center;margin:10px 0;font-variant-numeric:tabular-nums}
.timer.low{color:#ff4d6d}
.rowitem{display:flex;align-items:center;gap:10px;padding:11px 4px;border-bottom:1px solid #2e2650;font-size:15px}
.rowitem:last-child{border:0}
.rowitem .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dot{width:9px;height:9px;border-radius:50%;background:#00c07f;flex:none}
.dot.off{background:#5a5280}
.pill{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:#241d40;color:#b3a9d6;flex:none}
.pill.y{background:#00c07f;color:#04241a}
.pill.r{background:#ff4d6d;color:#2a0410}
.pill.g{background:#ffd76e;color:#3a2a00}
.xbtn{width:34px;height:34px;padding:0;font-size:17px;background:#241d40;color:#8d84ad;border:1px solid #3a3162;flex:none;border-radius:10px}
.list{display:flex;flex-direction:column;gap:9px}
.list button{background:#241d40;border:1px solid #3a3162;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:8px}
.list button.sel{background:#7c4dff;border-color:#7c4dff}
.hint{font-size:13px;color:#8d84ad;line-height:1.55;margin:10px 0 0}
.clue{display:flex;justify-content:space-between;gap:10px;padding:10px 4px;border-bottom:1px solid #2e2650}
.clue:last-child{border:0}
.clue b{color:#ffd76e;font-weight:800}
.err{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;background:#e0405e;color:#fff;padding:13px 18px;border-radius:12px;font-size:14px;font-weight:600;max-width:90%;z-index:9;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.bar{position:sticky;top:0;background:#0e0b1a;padding:8px 0 10px;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9d93bd;z-index:5}
.bar b{color:#ffd76e;letter-spacing:3px}
.bar .exit{width:auto;flex:none;padding:6px 12px;font-size:12px;font-weight:700;background:#241d40;color:#8d84ad;border:1px solid #3a3162;border-radius:999px;margin-left:10px}
.off{opacity:.45}
.rules{font-size:14px;color:#b3a9d6;line-height:1.6;padding-left:18px;margin:0}
.rules li{margin-bottom:6px}
</style>
</head>
<body>
<div id="app"></div>
<script>
const $ = document.getElementById("app");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const LS = { get: k => { try { return localStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch { } } };

let ws = null, S = null, myPid = LS.get("imp_pid") || null, myName = LS.get("imp_name") || "", pending = null, errT = null;
let selVote = null, connected = false;

function toast(msg) {
  document.querySelectorAll(".err").forEach(e => e.remove());
  const d = document.createElement("div"); d.className = "err"; d.textContent = msg;
  document.body.appendChild(d); clearTimeout(errT); errT = setTimeout(() => d.remove(), 3800);
}
function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }

function connect(code, onOpen) {
  if (ws && ws.readyState === 1) { onOpen && onOpen(); return; }
  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(proto + "://" + location.host + "/ws?code=" + encodeURIComponent(code));
  ws.onopen = () => { connected = true; onOpen && onOpen(); };
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.t === "joined") { myPid = m.pid; LS.set("imp_pid", m.pid); LS.set("imp_room", m.code); history.replaceState(null, "", "#" + m.code); return; }
    if (m.t === "err") { toast(m.msg); if (!S) render(); return; }
    if (m.t === "kicked") { S = null; LS.set("imp_room", ""); toast("Você foi removido da sala."); render(); return; }
    if (m.t === "state") { S = m; render(); }
  };
  ws.onclose = () => {
    connected = false;
    const code = LS.get("imp_room");
    if (S && code) { toast("Conexão caiu. Reconectando..."); setTimeout(() => connect(code, () => rejoin()), 1200); }
  };
  ws.onerror = () => { };
}
function rejoin() {
  const code = LS.get("imp_room");
  if (code) send({ t: "join", code, name: myName, pid: myPid });
}
setInterval(() => send({ t: "ping" }), 25000);

function sairDaSala(semPerguntar) {
  if (!semPerguntar && !confirm("Sair da sala? Você pode voltar depois pelo mesmo código.")) return;
  LS.set("imp_room", "");
  S = null;
  try { ws.close(); } catch { }
  ws = null;
  location.hash = "";
  render();
}

/* ================= TELAS ================= */
function render() {
  desenhaTela();
  const lt = $.querySelector("#leaveTop");
  if (lt) lt.onclick = () => sairDaSala(false);
}

function desenhaTela() {
  if (!S) return home();
  const ph = S.phase;
  if (ph === "lobby") return lobby();
  if (ph === "reveal") return reveal();
  if (ph === "clues") return clues();
  if (ph === "discuss") return discuss();
  if (ph === "vote") return vote();
  if (ph === "result") return result();
  if (ph === "guess") return guess();
  if (ph === "final") return final();
}

function bar() {
  return \`<div class="bar">
    <span>Sala <b>\${esc(S.code)}</b></span>
    <span style="display:flex;align-items:center">
      \${S.round ? "Rodada " + S.round + " · " : ""}\${S.players.filter(p => p.connected).length}/\${S.players.length} online
      <button class="exit" id="leaveTop">sair</button>
    </span>
  </div>\`;
}

/* ---- HOME ---- */
function home() {
  const urlCode = (location.hash || "").replace("#", "").toUpperCase().slice(0, 6);
  $.innerHTML = \`
  <h1>🕵️ Jogo do Impostor</h1>
  <p class="sub">Cada um no seu celular. Um link, uma sala.</p>
  <div class="card">
    <label>Seu nome</label>
    <input id="nm" maxlength="14" placeholder="Como te chamam?" value="\${esc(myName)}">
  </div>
  <div class="card">
    <label>Entrar numa sala</label>
    <input id="cd" maxlength="6" placeholder="CÓDIGO" style="text-transform:uppercase;letter-spacing:5px;text-align:center;font-weight:800" value="\${esc(urlCode)}">
    <div style="height:10px"></div>
    <button id="join">Entrar</button>
  </div>
  <div class="card">
    <label>Ou crie a sua</label>
    <button class="ghost" id="create">＋ Criar sala nova</button>
    <p class="hint">Quem cria vira o host: escolhe categorias, modo e comanda as rodadas.</p>
  </div>
  <div class="card"><label>Como funciona</label><ul class="rules">
    <li>Todo mundo recebe uma palavra secreta — menos o impostor.</li>
    <li>Cada um dá <b>uma dica</b> ligada ao tema, sutil o bastante pra não entregar.</li>
    <li>Discutem, votam, e o impostor ainda pode se salvar acertando a palavra.</li>
  </ul></div>\`;
  const nm = $.querySelector("#nm");
  nm.oninput = () => { myName = nm.value; LS.set("imp_name", myName) };
  $.querySelector("#create").onclick = async (e) => {
    if (!nm.value.trim()) return toast("Digite seu nome primeiro.");
    myName = nm.value.trim(); LS.set("imp_name", myName); myPid = null;
    const btn = e.currentTarget; btn.disabled = true; btn.textContent = "Criando...";
    try {
      const r = await fetch("/api/new", { method: "POST" });
      const d = await r.json();
      if (!d.code) throw new Error(d.error || "falhou");
      LS.set("imp_room", d.code);
      connect(d.code, () => send({ t: "create", name: myName }));
    } catch (err) {
      btn.disabled = false; btn.textContent = "＋ Criar sala nova";
      toast("Não consegui criar a sala. Tente de novo.");
    }
  };
  $.querySelector("#join").onclick = () => {
    const code = $.querySelector("#cd").value.trim().toUpperCase();
    if (!nm.value.trim()) return toast("Digite seu nome primeiro.");
    if (code.length < 4) return toast("Código incompleto.");
    myName = nm.value.trim(); LS.set("imp_name", myName); LS.set("imp_room", code);
    connect(code, () => send({ t: "join", code, name: myName, pid: myPid }));
  };
}

/* ---- LOBBY ---- */
function lobby() {
  const h = S.you.isHost;
  const ready = S.players.length >= S.minPlayers;
  $.innerHTML = bar() + \`
  <div class="card big" style="padding:20px">
    <label style="margin:0">Código da sala</label>
    <div class="code">\${esc(S.code)}</div>
    <button class="ghost" id="share">🔗 Copiar link do convite</button>
  </div>
  <div class="card">
    <label>Jogadores (\${S.players.length})</label>
    \${S.players.map(p => \`<div class="rowitem \${p.connected ? "" : "off"}">
      <span class="dot \${p.connected ? "" : "off"}"></span>
      <span class="nm">\${esc(p.name)}\${p.id === S.you.id ? " (você)" : ""}</span>
      \${p.id === hostId() ? '<span class="pill g">host</span>' : ""}
      \${h && p.id !== S.you.id ? \`<button class="xbtn" data-kick="\${p.id}">×</button>\` : ""}
    </div>\`).join("")}
    \${ready ? "" : \`<p class="hint">Faltam \${S.minPlayers - S.players.length} jogador(es) pra começar.</p>\`}
  </div>
  \${h ? cfgCard() : \`<div class="card"><label>Configuração</label>
    <div class="rowitem"><span class="nm">Modo</span><span class="pill">\${S.cfg.mode === "pares" ? "Pares" : "Clássico"}</span></div>
    <div class="rowitem"><span class="nm">Dicas</span><span class="pill">\${S.cfg.clueMode === "digitadas" ? "Digitadas" : "Na voz"}</span></div>
    <div class="rowitem"><span class="nm">Impostores</span><span class="pill">\${S.cfg.nImp}</span></div>
    <div class="rowitem"><span class="nm">Tempo</span><span class="pill">\${S.cfg.secs ? S.cfg.secs / 60 + " min" : "sem timer"}</span></div>
    <div class="rowitem"><span class="nm">Categorias</span><span class="pill">\${S.cfg.cats.length}</span></div>
    <p class="hint">Só o host configura. Aguardando ele começar...</p></div>\`}
  \${h ? \`<button id="start" \${ready ? "" : "disabled"}>▶ Começar rodada \${S.round + 1}</button>\` : ""}
  \${S.players.some(p => p.score) ? \`<div style="height:12px"></div><div class="card"><label>Placar</label>\${scores()}</div>\` : ""}
  <div style="height:10px"></div>
  <button class="ghost" id="leave">Sair da sala</button>\`;

  $.querySelector("#share").onclick = () => {
    const url = location.origin + "/#" + S.code;
    const txt = "Bora jogar Impostor! Sala " + S.code + ": " + url;
    if (navigator.share) navigator.share({ title: "Jogo do Impostor", text: txt, url }).catch(() => { });
    else navigator.clipboard.writeText(url).then(() => toast("Link copiado!"), () => toast(url));
  };
  $.querySelectorAll("[data-kick]").forEach(b => b.onclick = () => send({ t: "kick", id: b.dataset.kick }));
  const st = $.querySelector("#start"); if (st) st.onclick = () => send({ t: "start" });
  $.querySelector("#leave").onclick = () => sairDaSala(true);
  if (h) wireCfg();
}
function hostId() { return S.hostId; }

function cfgCard() {
  const c = S.cfg;
  return \`<div class="card">
    <label>Modo de jogo</label>
    <div class="chips">
      <button class="chip \${c.mode === "pares" ? "on" : ""}" data-cfg="mode" data-v="pares">Pares</button>
      <button class="chip \${c.mode === "classico" ? "on" : ""}" data-cfg="mode" data-v="classico">Clássico</button>
    </div>
    <p class="hint">\${c.mode === "pares" ? "O impostor recebe uma palavra <b>parecida</b> e nem sabe que é o impostor." : "O impostor não recebe palavra nenhuma e sabe que precisa blefar."}</p>
  </div>
  <div class="card">
    <label>Dicas</label>
    <div class="chips">
      <button class="chip \${c.clueMode === "voz" ? "on" : ""}" data-cfg="clueMode" data-v="voz">Na voz</button>
      <button class="chip \${c.clueMode === "digitadas" ? "on" : ""}" data-cfg="clueMode" data-v="digitadas">Digitadas no app</button>
    </div>
    <p class="hint">\${c.clueMode === "voz" ? "O app só distribui, cronometra e apura. Vocês falam por chamada ou pessoalmente." : "Cada um digita sua dica na vez; todos veem na tela. Dá pra jogar sem chamada."}</p>
  </div>
  <div class="card">
    <label>Impostores</label>
    <div class="stepper">
      <button data-imp="-1">−</button><b>\${c.nImp}</b><button data-imp="1">+</button>
      <span style="flex:1;text-align:right;color:#8d84ad;font-size:13px">máx. \${S.maxImp}</span>
    </div>
  </div>
  <div class="card">
    <label>Tempo de discussão</label>
    <div class="chips">\${[60, 120, 180, 300, 0].map(t => \`<button class="chip \${c.secs === t ? "on" : ""}" data-cfg="secs" data-v="\${t}">\${t ? t / 60 + " min" : "sem timer"}</button>\`).join("")}</div>
  </div>
  <div class="card">
    <label>Categorias (\${c.cats.length}/\${S.cats.length})</label>
    <div class="chips">\${S.cats.map(x => \`<button class="chip \${c.cats.includes(x) ? "on" : ""}" data-cat="\${esc(x)}">\${esc(x)}</button>\`).join("")}</div>
  </div>\`;
}
function wireCfg() {
  $.querySelectorAll("[data-cfg]").forEach(b => b.onclick = () => {
    const k = b.dataset.cfg, v = k === "secs" ? +b.dataset.v : b.dataset.v;
    send({ t: "cfg", [k]: v });
  });
  $.querySelectorAll("[data-imp]").forEach(b => b.onclick = () => send({ t: "cfg", nImp: S.cfg.nImp + (+b.dataset.imp) }));
  $.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => {
    const c = b.dataset.cat, cur = S.cfg.cats.slice();
    const i = cur.indexOf(c);
    i >= 0 ? cur.splice(i, 1) : cur.push(c);
    if (!cur.length) return toast("Escolha pelo menos uma categoria.");
    send({ t: "cfg", cats: cur });
  });
}
function scores() {
  return [...S.players].sort((a, b) => b.score - a.score)
    .map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}</span><span class="pill g">\${p.score} pt\${p.score === 1 ? "" : "s"}</span></div>\`).join("");
}

/* ---- REVELAÇÃO ---- */
let peeked = false;
function reveal() {
  const n = S.players.filter(p => p.connected).length;
  const r = S.players.filter(p => p.connected && p.ready).length;
  if (S.you.ready) {
    $.innerHTML = bar() + \`<div class="card big">
      <div style="font-size:42px">⏳</div><h2>Aguardando os outros</h2>
      <p class="hint">\${r}/\${n} já viram a palavra.</p></div>
      <div class="card">\${S.players.filter(p => p.connected).map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}</span><span class="pill \${p.ready ? "y" : ""}">\${p.ready ? "pronto" : "vendo..."}</span></div>\`).join("")}</div>\`;
    return;
  }
  if (!peeked) {
    $.innerHTML = bar() + \`<div class="card big">
      <div class="tag">Rodada \${S.round}</div>
      <h2>Sua palavra está pronta</h2>
      <p class="hint" style="margin-bottom:18px">Ninguém mais vê o que aparece no seu celular.</p>
      <button id="see">👁 Ver minha palavra</button></div>\`;
    $.querySelector("#see").onclick = () => { peeked = true; reveal(); };
    return;
  }
  const w = S.myWord;
  $.innerHTML = bar() + \`<div class="card big">
    <div class="tag">Categoria: \${esc(S.catName)}</div>
    \${w === null
      ? \`<div class="word imp">IMPOSTOR</div><p class="hint">Você não sabe a palavra. Escute as dicas, blefe e tente descobrir o tema.</p>\`
      : \`<div class="word">\${esc(w)}</div><p class="hint">Guarde bem. Dê dicas sutis — entregar demais ajuda o impostor.</p>\`}
    <div style="height:18px"></div>
    <button class="ok" id="rd">Entendi, vamos lá →</button></div>\`;
  $.querySelector("#rd").onclick = () => { peeked = false; send({ t: "ready" }); };
}

/* ---- DICAS DIGITADAS ---- */
function clues() {
  const vivos = S.players.filter(p => p.connected);
  const enviaram = vivos.filter(p => p.hasClue).length;
  const jaEnviei = !!S.you.clue;
  $.innerHTML = bar() + \`
  <div class="card big" style="padding:22px 18px">
    <div class="tag">Categoria: \${esc(S.catName)}</div>
    <h2>\${jaEnviei ? "Dica enviada" : "Escreva sua dica"}</h2>
    \${jaEnviei
      ? \`<div class="word" style="font-size:30px">\${esc(S.you.clue)}</div>
         <p class="hint">\${enviaram}/\${vivos.length} já enviaram. As dicas aparecem quando o último mandar.</p>\`
      : \`<p class="hint" style="margin-bottom:14px">Uma palavra só, ligada ao tema. Ninguém vê a sua antes de mandar a dele.</p>
         <input id="cl" maxlength="20" placeholder="Sua dica" autocomplete="off">
         <div style="height:12px"></div>
         <button class="ok" id="sc">Enviar dica</button>\`}
  </div>
  \${jaEnviei ? \`<button class="ghost" id="tc">Trocar minha dica</button><div style="height:12px"></div>\` : ""}
  <div class="card"><label>Quem já mandou (\${enviaram}/\${vivos.length})</label>
    \${vivos.map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}\${p.id === S.you.id ? " (você)" : ""}</span><span class="pill \${p.hasClue ? "y" : ""}">\${p.hasClue ? "enviou" : "escrevendo"}</span></div>\`).join("")}
  </div>
  <div class="card"><label>Sua palavra</label><div class="rowitem"><span class="nm">\${S.myWord === null ? '<b style="color:#ff4d6d">IMPOSTOR</b>' : esc(S.myWord)}</span><span class="pill">\${esc(S.catName)}</span></div></div>
  \${S.you.isHost && enviaram ? \`<button class="ghost" id="skip">Seguir sem quem falta (host)</button>\` : ""}\`;

  const campo = $.querySelector("#cl");
  if (campo) {
    const enviar = () => {
      const v = campo.value.trim();
      if (!v) return toast("Escreva uma dica.");
      send({ t: "clue", text: v });
    };
    $.querySelector("#sc").onclick = enviar;
    campo.onkeydown = e => { if (e.key === "Enter") enviar(); };
    setTimeout(() => campo.focus(), 60);
  }
  const tc = $.querySelector("#tc");
  if (tc) tc.onclick = () => { S.you.clue = ""; clues(); };
  const sk = $.querySelector("#skip");
  if (sk) sk.onclick = () => send({ t: "skipClue" });
}

/* ---- DISCUSSÃO ---- */
let tk = null;
function discuss() {
  clearInterval(tk);
  const given = S.players.filter(p => p.clue);
  const vivos = S.players.filter(p => p.connected);
  const pr = vivos.filter(p => p.ready).length, tot = vivos.length;
  $.innerHTML = bar() + \`<div class="card big">
    <div class="tag">\${esc(S.catName)}</div>
    <h2>Hora de discutir</h2>
    \${S.endsAt ? \`<div class="timer" id="tm">--:--</div>\` : \`<div style="font-size:42px">💬</div>\`}
    <p class="hint">\${S.cfg.clueMode === "digitadas" ? "Todas as dicas estão na tela. Quem soou estranho?" : "Cada um diz uma palavra ligada ao tema, na ordem. Depois, discussão livre."}</p>
  </div>
  \${given.length ? \`<div class="card"><label>Dicas</label>\${given.map(p => \`<div class="clue"><span>\${esc(p.name)}</span><b>\${esc(p.clue)}</b></div>\`).join("")}</div>\` : ""}
  <div class="card"><label>Sua palavra</label><div class="rowitem"><span class="nm">\${S.myWord === null ? '<b style="color:#ff4d6d">IMPOSTOR</b>' : esc(S.myWord)}</span><span class="pill">\${esc(S.catName)}</span></div></div>
  <div class="card"><label>Prontos para votar (\${pr}/\${tot})</label>
    \${vivos.map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}\${p.id === S.you.id ? " (você)" : ""}</span><span class="pill \${p.ready ? "y" : ""}">\${p.ready ? "pronto" : "discutindo"}</span></div>\`).join("")}
    <p class="hint">A votação abre sozinha quando todos confirmarem.</p>
  </div>
  \${S.you.ready
      ? \`<button class="ghost" id="un">Espera, ainda quero discutir</button>\`
      : \`<button class="ok" id="rd">✋ Estou pronto para votar</button>\`}
  \${S.you.isHost ? \`<div style="height:8px"></div><button class="ghost" id="tv">Abrir votação agora (host)</button>\` : ""}\`;
  if (S.endsAt) {
    const draw = () => {
      const el = $.querySelector("#tm"); if (!el) return clearInterval(tk);
      let left = Math.max(0, Math.round((S.endsAt - Date.now()) / 1000));
      el.textContent = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
      el.className = "timer" + (left <= 10 ? " low" : "");
      if (left <= 0) clearInterval(tk);
    };
    draw(); tk = setInterval(draw, 500);
  }
  const tv = $.querySelector("#tv"); if (tv) tv.onclick = () => send({ t: "toVote" });
  const rd = $.querySelector("#rd"); if (rd) rd.onclick = () => send({ t: "ready" });
  const un = $.querySelector("#un"); if (un) un.onclick = () => send({ t: "unready" });
}

/* ---- VOTAÇÃO ---- */
function vote() {
  clearInterval(tk);
  const others = S.players.filter(p => p.id !== S.you.id);
  const done = S.players.filter(p => p.connected && p.hasVoted).length;
  const tot = S.players.filter(p => p.connected).length;
  if (S.you.voted) {
    $.innerHTML = bar() + \`<div class="card big"><div style="font-size:42px">🗳</div>
      <h2>Voto registrado</h2><p class="hint">\${done}/\${tot} já votaram.</p>
      <div style="height:14px"></div><button class="ghost" id="un">Mudar meu voto</button>
      \${S.you.isHost && done < tot ? \`<div style="height:8px"></div><button class="ghost" id="ft">Apurar agora</button>\` : ""}</div>
      <div class="card">\${S.players.filter(p => p.connected).map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}</span><span class="pill \${p.hasVoted ? "y" : ""}">\${p.hasVoted ? "votou" : "pensando"}</span></div>\`).join("")}</div>\`;
    $.querySelector("#un").onclick = () => send({ t: "unvote" });
    const ft = $.querySelector("#ft"); if (ft) ft.onclick = () => send({ t: "forceTally" });
    return;
  }
  $.innerHTML = bar() + \`<div class="card">
    <h2>Quem é o impostor?</h2>
    <p class="hint" style="margin:0 0 14px">Seu voto é secreto até a apuração.</p>
    <div class="list">
      \${others.map(p => \`<button data-v="\${p.id}" \${p.connected ? "" : "disabled"}><span>\${esc(p.name)}</span>\${p.connected ? "" : '<span class="pill">off</span>'}</button>\`).join("")}
    </div>
    <div style="height:10px"></div>
    <button class="ghost" data-v="skip">Abster-se</button>
  </div>\`;
  $.querySelectorAll("[data-v]").forEach(b => b.onclick = () => send({ t: "vote", id: b.dataset.v }));
}

/* ---- RESULTADO DA VOTAÇÃO ---- */
function result() {
  const r = S.result, acc = S.players.find(p => p.id === r.accusedId);
  $.innerHTML = bar() + \`<div class="card"><label>Apuração</label>
    \${S.players.map(p => \`<div class="rowitem"><span class="nm">\${esc(p.name)}</span><span class="pill \${r.tally[p.id] ? "r" : ""}">\${r.tally[p.id] || 0} voto\${(r.tally[p.id] || 0) === 1 ? "" : "s"}</span></div>\`).join("")}</div>
  <div class="card big">
    \${acc ? \`<div class="tag">Mais votado</div><div class="word" style="font-size:30px">\${esc(acc.name)}</div>\`
      : \`<div class="word" style="font-size:25px">Empate — ninguém eliminado</div>\`}
  </div>
  \${S.you.isHost ? \`<button id="rv">Revelar 🎭</button>\` : \`<p class="hint" style="text-align:center">Aguardando o host revelar...</p>\`}\`;
  const rv = $.querySelector("#rv"); if (rv) rv.onclick = () => send({ t: "reveal" });
}

/* ---- CHANCE DO IMPOSTOR ---- */
function guess() {
  const acc = S.players.find(p => p.id === S.result.accusedId);
  if (S.amAccused) {
    $.innerHTML = bar() + \`<div class="card big">
      <div class="tag">Descobriram você 😬</div>
      <h2>Última chance</h2>
      <p class="hint" style="margin-bottom:14px">Qual era a palavra dos outros? Acertar vale ponto.</p>
      <input id="g" maxlength="30" placeholder="Digite a palavra" autocomplete="off">
      <div style="height:12px"></div>
      <button class="ok" id="ok">Confirmar palpite</button>
      <div style="height:8px"></div>
      <button class="ghost" id="sk">Não faço ideia</button></div>\`;
    const i = $.querySelector("#g");
    $.querySelector("#ok").onclick = () => send({ t: "guess", text: i.value });
    $.querySelector("#sk").onclick = () => send({ t: "guess", text: "" });
    i.onkeydown = e => { if (e.key === "Enter") send({ t: "guess", text: i.value }); };
    setTimeout(() => i.focus(), 60);
    return;
  }
  $.innerHTML = bar() + \`<div class="card big">
    <div class="tag">\${esc(acc ? acc.name : "?")} era impostor!</div>
    <div style="font-size:42px">🤔</div>
    <h2>Tentando adivinhar a palavra</h2>
    <p class="hint">Se acertar, ganha um ponto de consolação.</p></div>\`;
}

/* ---- FIM DA RODADA ---- */
function final() {
  const r = S.result;
  const imps = S.players.filter(p => r.impIds.includes(p.id)).map(p => p.name).join(", ");
  const iAmImp = r.impIds.includes(S.you.id);
  let title, sub;
  if (r.caught && r.guessed) { title = "🎯 Pego — mas acertou a palavra!"; sub = "+1 ponto pra todo mundo"; }
  else if (r.caught) { title = "✅ Cidadãos venceram!"; sub = "+1 pra cada cidadão"; }
  else { title = "😈 O impostor escapou!"; sub = "+2 pro impostor"; }
  $.innerHTML = bar() + \`<div class="card big">
    <div class="word" style="font-size:25px">\${title}</div>
    <p class="hint">\${sub} · você era <b>\${iAmImp ? "impostor" : "cidadão"}</b></p></div>
  <div class="card">
    <div class="rowitem"><span class="nm">Impostor\${r.impIds.length > 1 ? "es" : ""}</span><span class="pill r">\${esc(imps)}</span></div>
    <div class="rowitem"><span class="nm">Palavra dos cidadãos</span><span class="pill g">\${esc(r.wordA)}</span></div>
    \${S.cfg.mode === "pares" ? \`<div class="rowitem"><span class="nm">Palavra do impostor</span><span class="pill">\${esc(r.wordB)}</span></div>\` : ""}
    \${r.caught ? \`<div class="rowitem"><span class="nm">Palpite do impostor</span><span class="pill \${r.guessed ? "y" : ""}">\${esc(r.guessText || "—")}</span></div>\` : ""}
    <div class="rowitem"><span class="nm">Categoria</span><span class="pill">\${esc(S.catName)}</span></div>
  </div>
  \${S.players.some(p => p.clue) ? \`<div class="card"><label>As dicas</label>\${S.players.filter(p => p.clue).map(p => \`<div class="clue"><span>\${esc(p.name)}\${r.impIds.includes(p.id) ? " 🎭" : ""}</span><b>\${esc(p.clue)}</b></div>\`).join("")}</div>\` : ""}
  <div class="card"><label>Placar</label>\${scores()}</div>
  \${S.you.isHost ? \`<button id="next">▶ Próxima rodada</button>
    <div style="height:8px"></div><button class="ghost" id="lb">⚙ Voltar ao lobby</button>
    <div style="height:8px"></div><button class="ghost" id="rs">Zerar placar</button>\`
      : \`<p class="hint" style="text-align:center">Aguardando o host começar a próxima...</p>\`}\`;
  const n = $.querySelector("#next"); if (n) n.onclick = () => send({ t: "next" });
  const l = $.querySelector("#lb"); if (l) l.onclick = () => send({ t: "lobby" });
  const rs = $.querySelector("#rs"); if (rs) rs.onclick = () => send({ t: "resetScore" });
}

/* ================= BOOT ================= */
const savedRoom = LS.get("imp_room");
if (savedRoom && myPid) { connect(savedRoom, () => send({ t: "join", code: savedRoom, name: myName, pid: myPid })); render(); }
else render();
</script>
</body>
</html>
`;
