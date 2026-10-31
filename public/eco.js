// ECO SPY 학생 화면 — 그래픽은 assets/manifest.json (tools/build_assets.py 가 만듦)
"use strict";

// ================== 역할 설명 ==================
const ROLE = {
  guardian: {
    name: "환경 수호자", en: "Eco Guardian", color: "#1fae63", team: "수호자 팀", tab: "green",
    goal: "영어 문제를 풀어 복구율 100% 만들기 · 또는 환경 파괴범 모두 추방하기",
    how: [
      "시설의 장치(<b>!</b> 표시) 가까이 가서 <b>[문제 풀기]</b>를 눌러요. 맞히면 복구율이 올라가요.",
      "같은 장치는 20초 뒤에 다시 풀 수 있어요. 여러 시설을 돌아다녀요!",
      "⚠️ 고장 난 시설은 <b>서로 다른 친구 2명</b>이 문제를 맞혀야 고쳐져요. 시간이 지나면 오염도가 올라가요.",
      "얼어붙은 친구를 발견하면 <b>[신고]</b>, 수상하면 본부 가운데 <b>[긴급회의]</b> 버튼!",
      "회의에서 영어 문장으로 이야기하고 파괴범에게 투표해요."
    ]
  },
  destroyer: {
    name: "환경 파괴범", en: "Eco Destroyer", color: "#e5484d", team: "파괴범 팀", tab: "red",
    goal: "오염도 100% 만들기 · 또는 남은 친구 수를 파괴범 수까지 줄이기",
    how: [
      "문제를 맞히면 <b>파괴 에너지</b>가 1 생겨요. (최대 5) 수호자처럼 문제 푸는 척하기에도 좋아요!",
      "<b>[방해]</b>: 에너지 1개로 시설 하나를 고장 내요. 제한 시간 안에 못 고치면 오염도 +25%.",
      "<b>[오염시키기]</b>: 가까이 있는 친구를 얼려요. 쿨타임이 있어요.",
      "이름표가 <b style='color:#e5484d'>빨간색</b>인 친구가 같은 편 파괴범이에요.",
      "회의에서 들키지 않게 영어로 변명해요!"
    ]
  },
  reporter: {
    name: "환경 기자", en: "Eco Reporter", color: "#2e8c9a", team: "중립", tab: "",
    goal: "취재 시설 3곳에서 문제를 1개씩 맞히고 → 끝까지 살아남거나 특종 성공하기",
    how: [
      "보라색 <b>취재</b> 표시와 미니맵의 ★가 내 취재 시설이에요. 그곳 장치에서 문제를 맞히면 취재 완료!",
      "취재 3곳을 다 끝내면 <b>[특종 지목]</b>을 한 번 쓸 수 있어요. 파괴범이라고 생각하는 친구를 고르면 결과를 바로 알려줘요.",
      "특종이 맞으면 오염되어도 승리해요. 틀리면 끝까지 살아남아야 승리해요.",
      "어느 팀이 이기든 내 조건만 이루면 <b>함께 승리</b>해요.",
      "회의에서 본 것을 증언해 친구들을 도와요."
    ]
  },
  trash: {
    name: "쓰레기 괴물", en: "Trash Monster", color: "#8a6a45", team: "중립", tab: "",
    goal: "회의 투표로 추방당하기! (추방되면 나 혼자 승리)",
    how: [
      "친구들이 나를 파괴범이라고 생각하게 만들어요. 일부러 수상하게 행동해 봐요!",
      "너무 티 나면 친구들이 눈치채고 안 뽑아 줄 수도 있어요. 연기력이 중요해요.",
      "문제를 풀어도 복구율에는 들어가지 않아요. 그래도 풀어야 덜 수상해 보여요.",
      "파괴범에게 얼어붙으면 실패예요. 조심해요!",
      "추방되어도 게임은 계속돼요. 유령이 되어 끝까지 구경해요."
    ]
  },
  investor: {
    name: "환경 투자자", en: "Eco Investor", color: "#c49a12", team: "중립", tab: "gold",
    goal: "이길 팀을 맞혀서 투자하기 → 내가 고른 팀이 이기면 함께 승리",
    how: [
      "문제를 맞혀 <b>투자 코인 3개</b>를 모아요.",
      "게임 시작 3분 뒤(또는 오염도 40%)부터 <b>[투자하기]</b>로 수호자 팀과 파괴범 팀 중 하나를 골라요. 딱 한 번!",
      "수호자 팀을 고르면 내 정답이 복구율에, 파괴범 팀을 고르면 파괴 에너지에 들어가요.",
      "누가 이길지 잘 살펴보고 골라요. 끝까지 아무도 안 고르면 실패!",
      "파괴범에게 얼어붙어도 고른 팀이 이기면 승리해요."
    ]
  }
};
const FAC_EN = { solar: "Solar Plant", ocean: "Ocean Base", recycle: "Recycling Center", water: "Water Plant", forest: "Forest", base: "Eco Base", lab: "Research Center" };
const SENTS = [
  { en: "I think {name} is a destroyer.", ko: "나는 ~가 파괴범이라고 생각해." },
  { en: "{name} is not a destroyer.", ko: "~는 파괴범이 아니야." },
  { en: "I was at the {place}.", ko: "나는 ~에 있었어." },
  { en: "I saw {name} at the {place}.", ko: "나는 ~를 ~에서 봤어." },
  { en: "Where were you, {name}?", ko: "~야, 너 어디 있었어?" },
  { en: "I fixed the {place}.", ko: "내가 ~를 고쳤어." },
  { en: "We should vote for {name}.", ko: "우리는 ~에게 투표해야 해." },
  { en: "We should skip.", ko: "우리는 건너뛰어야 해." },
  { en: "Don't forget to vote!", ko: "투표하는 것을 잊지 마!" },
  { en: "We should save the world!", ko: "우리는 세상을 구해야 해!" },
  { en: "Trust me!", ko: "나를 믿어!" },
  { en: "I don't know.", ko: "잘 모르겠어." },
  { en: "Sounds great!", ko: "좋아!" },
  { en: "Sorry. It's not me.", ko: "미안, 나 아니야." },
];
const LETTERS = [["A", "#f6a22a"], ["B", "#4a9ff0"], ["C", "#46c461"], ["D", "#df72c6"]];

// ================== 공통 ==================
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function setHTML(el, html) { if (el._h !== html) { el._h = html; el.innerHTML = html; return true; } return false; }
function show(id) { for (const s of document.querySelectorAll(".screen")) s.classList.toggle("on", s.id === id); }
function ov(id, on) { $(id).classList.toggle("on", !!on); }
function isOn(id) { return $(id).classList.contains("on"); }
let toastT = 0;
function toast(msg, ms) {
  const t = $("toast"); t.textContent = msg; t.style.display = "block";
  clearTimeout(toastT); toastT = setTimeout(() => t.style.display = "none", ms || 1800);
}
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
let actx = null;
let muted = false; try { muted = localStorage.getItem("eco_mute") === "1"; } catch (e) {}
function beep(freqs, dur, type, vol) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    let t = actx.currentTime;
    for (const f of freqs) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
      t += dur * 0.8;
    }
  } catch (e) {}
}
const SFX = {
  ok: () => beep([660, 880], 0.12, "triangle"),
  no: () => beep([220, 160], 0.18, "square", 0.04),
  alarm: () => beep([880, 660, 880, 660], 0.18, "sawtooth", 0.04),
  freeze: () => beep([1200, 900, 600], 0.1, "triangle"),
  click: () => beep([520], 0.05, "sine", 0.04),
};

// ================== 그래픽 불러오기 ==================
let A = null;                 // manifest
const IMG = {};               // 경로 → Image
function img(src) {
  if (!src) return null;
  let i = IMG[src];
  if (!i) { i = IMG[src] = new Image(); i.decoding = "async"; i.src = src; }
  return i;
}
const ready = (i) => i && i.complete && i.naturalWidth > 0;
let CH = null;                // 캐릭터 정보
function skinOf(n) { return CH.colors[((n | 0) % CH.colors.length + CH.colors.length) % CH.colors.length]; }
function avatar(skin, frame, h) {
  if (!CH) return "";
  const c = skinOf(skin), s = h / CH.cell[1], w = CH.cell[0] * s;
  return `<span class="av" style="width:${w.toFixed(1)}px;height:${h}px;background-image:url(${c.sheet});background-size:${(CH.cell[0] * CH.frames.length * s).toFixed(1)}px ${h}px;background-position:${(-CH.cell[0] * frame * s).toFixed(1)}px 0"></span>`;
}
let FR = { idle: 0, walk: 1, walkN: 10, frozen: 11, ghost: 12, report: 13 };

fetch("assets/manifest.json").then(r => r.json()).then(m => {
  A = m; CH = m.chars; if (CH.idx) FR = CH.idx;
  // 행동 버튼 그림을 CSS로 연결 (보통 / 눌림 / 못 누름)
  let css = "";
  V2 = m.v2;
  const B = V2.btn;
  const BTN = { aUse: "use", aRep: "report", aEmg: "emg", aFrz: "frz", aSab: "sab", aScp: "scp", aInv: "inv", qSubmit: "confirm", mVote: "vote" };
  for (const [id, k] of Object.entries(BTN)) {
    css += `#${id}{background-image:url(${B[k + "_normal"]})}#${id}:active:not(:disabled){background-image:url(${B[k + "_pressed"]})}#${id}:disabled{background-image:url(${B[k + "_disabled"]})}`;
  }
  css += `#bg{background-image:url(${m.map.image})}`;
  css += `.gauge .ge{border-image-source:url(${V2.gauge.empty})}`;
  for (const c of ["yellow", "green", "red", "blue", "purple"]) css += `.gauge .gf.${c}{border-image-source:url(${V2.gauge["pill_" + c]})}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  // 미리 불러오기
  let pre = [m.map.image, m.map.mini, ...CH.colors.map(c => c.sheet), m.ui.joy_base_normal, m.ui.joy_base_pressed, m.ui.joy_knob_normal, m.ui.joy_knob_pressed,
    m.ui.new_marker_mission, m.ui.new_marker_danger, m.ui.new_marker_meeting, m.ui.marker_complete, m.ui.marker_player, m.ui.status_ghost, m.ui.status_frozen];
  for (const p of Object.values(V2.props)) pre.push(p.src);
  pre.push(V2.icon.emg_button, ...Object.values(V2.vote_card), ...Object.values(V2.role_card), ...Object.values(V2.btn));
  for (const f of Object.values(m.fx)) pre.push(f.src);
  pre = [...new Set(pre.filter(Boolean))];  // 같은 그림이 두 번 있으면 onload가 덮어써져 99/100에서 멈춤
  let left = pre.length;
  const done = () => { if (--left <= 0) $("loadMsg").textContent = ""; else $("loadMsg").textContent = `그림 불러오는 중… ${pre.length - left}/${pre.length}`; };
  for (const p of pre) { const i = img(p); if (i.complete) done(); else { i.onload = done; i.onerror = done; } }
  // 고정 그림
  $("joyBase").src = m.ui.joy_base_normal; $("knob").src = m.ui.joy_knob_normal;
  $("icRec").src = V2.role_badge.guardian; $("icPol").src = V2.props.smoke.src; $("icTim").src = V2.icon.timer;
  $("gRec").innerHTML = gaugeInner("green"); $("gPol").innerHTML = gaugeInner("red");
  $("alertIc").src = V2.icon.warn; $("ghostIc").src = m.ui.status_ghost;
  $("wIcon").src = m.ui.status_waiting;
  $("wScene").src = V2.scene.loading;
  $("logoAv").innerHTML = avatar(2, 0, 86);
  setGauge("gRec", 0); setGauge("gPol", 0);
  if (S) { if (S.startedAt) { renderHUD(); } else renderWait(S); }
}).catch(() => { $("loadMsg").textContent = "그림을 불러오지 못했어요. 새로고침해 주세요."; });

// 게이지: 빈 막대(양 끝 고정, 가운데 늘림) 위에 채움 알약(양 끝 고정)을 너비만 바꿔 얹음
let V2 = null;
function gaugeInner(color, p) {
  return `<span class="ge"></span><span class="gf ${color}" style="width:calc((100% - var(--gi) * 2) * ${Math.max(0.0001, Math.min(1, p || 0)).toFixed(4)})"></span>`;
}
function gaugeHTML(color, p) { return `<span class="gauge">${gaugeInner(color, p)}</span>`; }
function setGauge(id, p) {
  const f = $(id).querySelector(".gf"); if (!f) return;
  f.style.width = `calc((100% - var(--gi) * 2) * ${Math.max(0.0001, Math.min(1, p)).toFixed(4)})`;
  f.style.visibility = p > 0.005 ? "" : "hidden";
}

// ================== 접속 ==================
const socket = io();
let S = null;
let me = { cid: store.get("eco_cid"), name: store.get("eco_name"), code: store.get("eco_code") };
const params = new URLSearchParams(location.search);
if (params.get("code")) $("jCode").value = params.get("code");
else if (me.code) $("jCode").value = me.code;
if (me.name) $("jName").value = me.name;

function doJoin(auto) {
  const code = $("jCode").value.trim(), name = $("jName").value.trim();
  if (!code || !name) { if (!auto) $("jErr").textContent = "반 번호와 이름을 모두 써 주세요."; return; }
  const cid = (code === me.code && name === me.name) ? me.cid : null;
  socket.emit("join", { code, name, cid }, (r) => {
    if (!r || !r.ok) { show("join"); openT("join"); $("jErr").textContent = (r && r.msg) || "들어갈 수 없어요."; return; }
    ov("tOv", false);
    me.cid = r.cid; me.name = r.name; me.code = r.code;
    store.set("eco_cid", r.cid); store.set("eco_name", r.name); store.set("eco_code", r.code);
    $("jErr").textContent = "";
  });
}
$("jBtn").onclick = () => { SFX.click(); doJoin(false); };
for (const el of [$("jCode"), $("jName")]) el.addEventListener("keydown", (e) => { if (e.key === "Enter") doJoin(false); });

// ================== 타이틀 화면 버튼 ==================
const BOOK = [
  ["recycle", "재활용하다"], ["reuse", "다시 사용하다"], ["save", "아끼다, 구하다"], ["turn off", "끄다"],
  ["throw away", "버리다"], ["forget", "잊다"], ["energy", "에너지"], ["plastic bag", "비닐봉지"],
  ["paper cup", "종이컵"], ["cans and bottles", "캔과 병"], ["the stairs", "계단"], ["quickly", "빨리, 빠르게"],
];
const SENT = [
  ["We should save water.", "우리는 물을 아껴야 해."], ["We should save energy.", "우리는 에너지를 아껴야 해."],
  ["Don't forget to turn off the light.", "불 끄는 것을 잊지 마."], ["Don't forget to turn off the water.", "물 잠그는 것을 잊지 마."],
  ["Don't forget to use a cup.", "컵 쓰는 것을 잊지 마."], ["Don't forget to use the stairs.", "계단 이용하는 것을 잊지 마."],
  ["Don't forget to recycle cans and bottles.", "캔과 병 재활용하는 것을 잊지 마."],
  ["The Earth is sick.", "지구가 아파요."], ["The Earth is our home.", "지구는 우리의 집이에요."],
  ["What can we do for the Earth?", "지구를 위해 우리는 무엇을 할 수 있을까?"],
];
function openT(kind) {
  const T = {
    join: ["방 참여하기 | Join"],
    make: ["방 만들기", `<div class="tBig">방은 <b>선생님</b>이 만들어요!</div>
      <ol class="tSteps"><li>선생님이 선생님 화면에서 <b>[새 반 만들기]</b>를 눌러요.</li><li>화면에 나온 <b>반 번호</b>를 확인해요.</li><li>학생은 <b>[방 참여하기]</b>에서 반 번호와 이름을 써요.</li><li>선생님이 <b>[자동 모둠 배정]</b>으로 7~9명씩 방을 나눠요.</li></ol>
      <div class="center"><a class="gbtn small" href="/teacher">선생님 화면 열기</a></div><div class="hint center">학생은 이 버튼을 누르지 않아요.</div>`],
    how: ["게임 방법 | How to Play", `<ol class="tSteps">
      <li>반 번호와 이름을 쓰고 들어가면, 선생님이 7~9명씩 방을 나눠요.</li>
      <li>시작하면 <b>몰래</b> 역할을 받아요: 환경 수호자 · 환경 파괴범 2명 · 중립 1명</li>
      <li><b>조이스틱</b>으로 길을 따라 걸어요. 화살표와 아래 글이 길을 알려 줘요.</li>
      <li>시설의 <b>!</b> 장치에서 <b>[문제 풀기]</b> → 12단원 영어 문제를 맞히면 복구율이 올라가요.</li>
      <li>파괴범은 시설을 고장 내고 친구를 얼려요. 고장 난 시설은 친구 2명이 문제를 맞혀 고쳐요.</li>
      <li>얼어붙은 친구를 보면 <b>[신고]</b>! 회의에서 영어 문장으로 이야기하고 투표해요.</li>
      <li>복구율 100% 또는 파괴범을 모두 찾으면 수호자 승리! 오염도 100%면 파괴범 승리!</li></ol>`],
    book: ["환경 도감 | Eco Book", `<div class="tSub">단어 Words</div><div class="bookGrid">${BOOK.map(([e, k]) => `<div class="bw"><b>${e}</b><span>${k}</span></div>`).join("")}</div>
      <div class="tSub">문장 Sentences</div><div class="bookSent">${SENT.map(([e, k]) => `<div><b>${esc(e)}</b><span>${k}</span></div>`).join("")}</div>`],
    mission: ["미션 보기 | Missions", Object.entries(ROLE).map(([k, r]) => `<div class="mRole" style="border-color:${r.color}"><b style="color:${r.color}">${r.name}</b> <small>${r.en} · ${r.team}</small><div>${r.goal}</div></div>`).join("") + `<div class="hint">중립 1명은 기자·쓰레기 괴물·투자자 중 하나가 무작위로 정해져요.</div>`],
    rank: ["랭킹 | Ranking", `<div class="tBig">🏆 점수와 순위는<br><b>선생님 화면</b>에 나와요.</div><div class="hint center">한 판이 끝날 때마다 이긴 학생에게 점수가 쌓여요.<br>여러 판을 하면서 순위를 올려 보세요!</div>`],
    set: ["설정 | Settings", `<div class="setRow"><span>소리</span><button class="gbtn small" id="setSnd"></button></div>
      <div class="setRow"><span>저장된 이름</span><b>${esc(me.name || "없음")}</b></div>
      <div class="center"><button class="gbtn small gray" id="setReset">이름·반 번호 지우기</button></div>`],
  }[kind];
  $("tTab").textContent = T[0];
  $("tJoin").style.display = kind === "join" ? "" : "none";
  $("tBody").style.display = kind === "join" ? "none" : "";
  $("tFrame").className = "frame " + (kind === "book" || kind === "how" || kind === "mission" ? "mid" : "narrow");
  if (T[1]) $("tBody").innerHTML = T[1];
  if (kind === "join") $("jErr").textContent = "";
  if (kind === "set") {
    const upd = () => { $("setSnd").textContent = muted ? "🔇 꺼짐" : "🔊 켜짐"; };
    upd(); $("setSnd").onclick = () => { toggleMute(); upd(); };
    $("setReset").onclick = () => { store.del("eco_cid"); store.del("eco_name"); store.del("eco_code"); me = { cid: null, name: null, code: null }; $("jName").value = ""; $("jCode").value = ""; openT("set"); };
  }
  ov("tOv", true);
  if (kind === "join") setTimeout(() => ($("jCode").value ? $("jName") : $("jCode")).focus(), 50);
}
function toggleMute() { muted = !muted; try { localStorage.setItem("eco_mute", muted ? "1" : "0"); } catch (e) {} $("muteMark").className = muted ? "on" : ""; SFX.click(); }
$("muteMark").className = muted ? "on" : "";
$("tClose").onclick = () => { SFX.click(); ov("tOv", false); };
$("tOv").addEventListener("click", (e) => { if (e.target === $("tOv")) ov("tOv", false); });
for (const b of document.querySelectorAll("#join .hs")) b.onclick = () => {
  const a = b.dataset.act;
  if (a === "sound") return toggleMute();
  SFX.click(); openT(a);
};
if (me.name) { $("tpName").textContent = me.name; }
$("jName").addEventListener("keydown", e => { if (e.key === "Enter") doJoin(false); });
socket.on("connect", () => { if (me.cid && me.code && me.name && $("jCode").value) doJoin(true); });
socket.on("kicked", (m) => { store.del("eco_cid"); S = null; show("join"); $("jErr").textContent = m || "선생님이 내보냈어요. 다시 들어와 주세요."; });
socket.on("toast", (m) => toast(m));
socket.on("snap", (p) => { L.x = p.x; L.y = p.y; });
socket.on("frozen", () => {
  SFX.freeze();
  addFx("pollution", L.x, L.y - 20);
  splash(avatar(S && S.me ? S.me.skin : 0, FR.frozen, 180), "앗! 오염되어 얼어붙었어요.<br><small>유령이 되어도 문제를 풀어 팀을 도울 수 있어요.</small>", 3000);
});

// ================== 상태 받기 ==================
let lastPhase = null, lastGameStart = 0, lastSab = null, lastRestored = {};
socket.on("state", (st) => {
  S = st;
  if (st.phase === "wait" || st.phase === "lobby" || !st.startedAt) { renderWait(st); lastPhase = st.phase; return; }
  if (st.startedAt !== lastGameStart) {
    lastGameStart = st.startedAt;
    L.x = st.me ? st.me.x : MAP.spawn.x; L.y = st.me ? st.me.y : MAP.spawn.y;
    others = {}; fxList = []; lastSab = null; lastRestored = Object.assign({}, st.restored || {});
    sel = null; ov("endOv", false);
    if (st.me && st.phase === "play") showRoleIntro();
  }
  if (st.phase !== lastPhase) {
    if (st.me && (st.phase === "meeting" || (st.phase === "play" && (lastPhase === "result" || lastPhase === "meeting")))) { L.x = st.me.x; L.y = st.me.y; }
    if (st.phase === "meeting") {
      SFX.alarm(); picked = null; pickState = null; ov("qOv", false); ov("menuOv", false);
      if (V2 && st.meeting) sceneSplash(V2.scene.meeting, st.meeting.reason === "report" ? `${esc(st.meeting.by)}님이 얼어붙은 친구를 신고했어요!` : `${esc(st.meeting.by)}님이 긴급회의를 열었어요!`, 2200);
    }
  }
  lastPhase = st.phase;
  show("game");
  renderHUD();
  renderQuestion();
  ov("meeting", st.phase === "meeting");
  if (st.phase === "meeting") renderMeeting();
  ov("resultOv", st.phase === "result");
  if (st.phase === "result") renderResult();
  ov("endOv", st.phase === "ended");
  if (st.phase === "ended") { ov("qOv", false); ov("menuOv", false); renderEnd(); }
  if (st.sab && (!lastSab || lastSab !== st.sab.fac)) { SFX.alarm(); const a = MAP.anchors[st.sab.fac]; addFx("sabotage", a.x, a.y, 1.4); }
  lastSab = st.sab ? st.sab.fac : null;
  for (const [f, t] of Object.entries(st.restored || {})) {
    if (lastRestored[f] !== t) { lastRestored[f] = t; const a = MAP.anchors[f]; addFx("restore", a.x, a.y, 1.6); }
  }
});

function renderWait(st) {
  for (const o of ["meeting", "resultOv", "endOv", "qOv", "menuOv", "roleOv"]) ov(o, false);
  show("wait");
  const ui = A ? A.ui : {};
  if (st.phase === "lobby") {
    $("wTitle").textContent = `${st.roomName}에 들어왔어요!`;
    $("wSub").textContent = "선생님이 시작하면 역할이 정해져요.";
    if (A) $("wIcon").src = ui.status_ready;
    setHTML($("wMembers"), st.members.map(m => `<span class="mchip ${m.online ? "" : "off"}"><img src="${m.online ? ui.status_ready : ui.status_offline}" alt="">${esc(m.name)}</span>`).join(""));
  } else {
    $("wTitle").textContent = "선생님이 모둠을 나누고 있어요";
    $("wSub").textContent = "잠시만 기다려 주세요.";
    if (A) $("wIcon").src = ui.status_waiting;
    setHTML($("wMembers"), "");
  }
  $("wMe").textContent = me.name ? `내 이름: ${me.name}` : "";
}

// ================== 역할 카드 ==================
function roleKey() { const m = S && S.me; if (!m) return null; return m.role === "neutral" ? m.job : m.role; }
function roleHTML(intro) {
  const k = roleKey(); const R = ROLE[k]; if (!R || !A) return "";
  const m = S.me;
  let extra = "";
  if (m.role === "destroyer" && m.team) {
    const mates = S.players.filter(p => m.team.includes(p.cid) && p.cid !== m.cid);
    extra += `<div class="goal red">같은 편 파괴범: ${mates.length ? mates.map(p => avatar(p.skin, 0, 30) + " <b>" + esc(p.name) + "</b>").join(" ") : "<b>없음 (혼자예요)</b>"}</div>`;
  }
  if (k === "reporter" && m.missions) extra += `<div class="goal teal">내 취재 시설: <b>${m.missions.map(f => MAP.roomById(f).name + (m.missionDone.includes(f) ? " ✅" : "")).join(" · ")}</b></div>`;
  const c = S.counts;
  return `<div class="tab ${R.tab}">나의 역할 | My Role</div>
    ${intro ? "" : '<button class="xbtn" onclick="ov(\'roleOv\',false)" aria-label="닫기">✕</button>'}
    <div class="inner"><div class="roleWrap">
      <div class="center"><img class="roleCard" src="${V2.role_card[k]}" alt="${R.name}"><div class="roleEn">${R.team} · ${R.en}</div></div>
      <div>
        <div class="goal">🎯 <b>승리 조건</b><br>${R.goal}</div>
        ${extra}
        <ol class="how">${R.how.map(h => `<li>${h}</li>`).join("")}</ol>
        <div class="counts">이번 판: 파괴범 ${c.d}명 · 중립 ${c.neu}명 · 수호자 ${c.g}명 · 목표 ${S.goalCount}문제</div>
      </div>
    </div>
    ${intro ? `<div class="btnRow"><button class="imgbtn startBtn" style="width:200px;height:180px;background-image:url(${V2.btn.start_normal})" onclick="ov('roleOv',false)" aria-label="게임 시작하기"></button></div>` : ""}
    </div>`;
}
function showRoleIntro() {
  const k = roleKey(), R = ROLE[k];
  if (!R || !A) return;
  splash(`<img class="splashCard" src="${V2.role_card[k]}" alt="">`, `당신은 <span style="color:${R.color === "#1fae63" ? "#5be39a" : R.color}">${R.name}</span>!`, 2200);
  setTimeout(() => { if (S && S.me && S.phase === "play") { $("rolePanel").innerHTML = roleHTML(true); ov("roleOv", true); } }, 2200);
}
$("pCard").onclick = () => { if (!S || !S.me) return; SFX.click(); $("rolePanel").innerHTML = roleHTML(false); ov("roleOv", true); };
let splashT = 0;
function splash(icon, html, ms) {
  const s = $("splash"); s.innerHTML = `<div class="big">${icon}</div><div>${html}</div>`; s.classList.add("on");
  clearTimeout(splashT); splashT = setTimeout(() => s.classList.remove("on"), ms || 2000);
}
$("splash").onclick = () => $("splash").classList.remove("on");
// 큰 장면 그림 + 한 줄 글 (회의 시작 등)
function sceneSplash(src, text, ms) {
  const s = $("splash");
  s.innerHTML = `<div class="sceneBox"><img src="${src}" alt=""><div class="sceneTxt">${text}</div></div>`;
  s.classList.add("on");
  clearTimeout(splashT); splashT = setTimeout(() => s.classList.remove("on"), ms || 2000);
}

// ================== HUD ==================
function fmt(ms) { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
let clockSkew = 0;
function renderHUD() {
  if (!S || !S.me) return;
  clockSkew = S.t - Date.now();
  const m = S.me, k = roleKey(), R = ROLE[k];
  setHTML($("pAv"), avatar(m.skin, m.alive ? 0 : FR.ghost, 48));
  $("pName").textContent = "ECO SPY | " + (me.name || "");
  setHTML($("pRole"), R && V2 ? `<img src="${V2.role_badge[k]}" alt="">${R.name}` : "내 역할");
  $("pRole").style.color = R ? (k === "destroyer" ? "#d22a33" : k === "guardian" ? "#11883f" : "#a86b00") : "";
  const pr = Math.min(1, S.progress / S.goal);
  setGauge("gRec", pr); setGauge("gPol", S.pollution / 100);
  $("progTxt").textContent = Math.round(pr * 100) + "%";
  $("polTxt").textContent = S.pollution + "%";
  const solved = Math.min(Math.floor(S.progress / 2), S.goalCount);
  $("mText").textContent = S.sab ? `${MAP.roomById(S.sab.fac).name} 수리!` : `시설 복구 ${solved} / ${S.goalCount}문제`;
  const feed = S.phase === "result" ? [] : S.feed.filter(f => Date.now() + clockSkew - f.t < 9000).slice(-4);  // 결과 발표 전 스포일러 방지
  setHTML($("feed"), feed.map(f => `<div class="${/실패|고장|오염|파괴범 승리/.test(f.text) ? "bad" : /완료|승리|복구/.test(f.text) ? "good" : ""}">${esc(f.text)}</div>`).join(""));
  $("ghostTag").style.display = m.alive ? "none" : "flex";
  $("aFrz").classList.toggle("hide", !(m.role === "destroyer" && m.alive));
  $("aSab").classList.toggle("hide", m.role !== "destroyer");
  $("aScp").classList.toggle("hide", !(m.job === "reporter" && m.alive && !m.scoop));
  $("aInv").classList.toggle("hide", !(m.job === "investor" && !m.side));
  let mis = "";
  if (m.role === "destroyer") mis = `<b>파괴 에너지</b> ${m.energy} / ${m.energyMax}` + (A ? `<div style="width:200px;margin-top:4px">${gaugeHTML("purple", m.energy / m.energyMax)}</div>` : "");
  if (m.job === "reporter") mis = `<b>취재 기록</b> ${m.missionDone.length} / 3<div class="row">` + m.missions.map(f => `<span class="tag ${m.missionDone.includes(f) ? "done" : ""}">${m.missionDone.includes(f) ? "✔" : "★"} ${MAP.roomById(f).name}</span>`).join("") + `</div>` + (m.scoop ? `<div>특종: ${esc(m.scoop.name)} → ${m.scoop.ok ? "<b>파괴범 맞음! 특종 성공</b>" : "<b style='color:#ff8a8e'>파괴범 아님</b>"}</div>` : "");
  if (m.job === "investor") mis = `<b>투자 코인</b> ${m.coins}개` + (A && !m.side ? `<div style="width:200px;margin-top:4px">${gaugeHTML("yellow", Math.min(1, m.coins / 3))}</div>` : "") + (m.side ? `<div>투자한 팀: <b>${m.side === "guardian" ? "수호자 팀" : "파괴범 팀"}</b></div>` : m.coins < 3 ? " (3개 필요)" : m.ready ? "<div><b>지금 투자할 수 있어요!</b></div>" : "<div>3분 뒤 투자 가능</div>");
  if (m.job === "trash") mis = `<b>목표</b> 회의에서 추방당하기!`;
  setHTML($("mission"), mis); $("mission").style.display = mis ? "block" : "none";
}
function hudTick() {
  if (!S || !S.me || !S.startedAt) return;
  const t = Date.now() + clockSkew;
  $("timer").textContent = t < S.startedAt ? "준비" : fmt(S.endsAt - t);
  const a = $("alert");
  if (S.sab && S.phase === "play") {
    const left = S.sab.until ? S.sab.until - t : S.sab.left;
    $("alertTxt").textContent = `${MAP.roomById(S.sab.fac).name} 고장! ${Math.max(0, Math.ceil(left / 1000))}초 · 수리 ${S.sab.fixers}/${S.sab.need}`;
    a.classList.add("on");
  } else a.classList.remove("on");
  const m = S.me;
  setCd($("aFrz"), m.freezeAt ? m.freezeAt - t : 0);
  setCd($("aSab"), m.sabAt ? m.sabAt - t : 0);
  setCd($("aUse"), m.lockUntil - t);
  if (m.job === "investor") $("aInv").disabled = !m.ready;
}
function setCd(btn, ms) {
  let cd = btn.querySelector(".cd");
  if (ms > 0) {
    if (!cd) { cd = document.createElement("span"); cd.className = "cd"; btn.appendChild(cd); }
    cd.textContent = Math.ceil(ms / 1000);
  } else if (cd) cd.remove();
}

// ================== 이동 ==================
const L = { x: 900, y: 600, dir: 1, moving: false, walkT: 0, reportUntil: 0 };
let others = {};
const keys = {};
addEventListener("keydown", e => { if (e.target.tagName === "INPUT") return; keys[e.key.toLowerCase()] = true; if (e.key === " " || e.key === "e") tryUse(); });
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
const joy = { on: false, id: null, dx: 0, dy: 0 };
const jEl = $("joy"), kEl = $("knob");
function joyMove(cx, cy) {
  const r = jEl.getBoundingClientRect();
  let dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
  const max = r.width * 0.3, d = Math.hypot(dx, dy);
  if (d > max) { dx = dx / d * max; dy = dy / d * max; }
  kEl.style.transform = `translate(${dx}px,${dy}px)`;
  joy.dx = dx / max; joy.dy = dy / max;
}
function joyPress(on) { if (!A) return; $("joyBase").src = on ? A.ui.joy_base_pressed : A.ui.joy_base_normal; kEl.src = on ? A.ui.joy_knob_pressed : A.ui.joy_knob_normal; }
function joyEnd() { joy.on = false; joy.id = null; joy.dx = joy.dy = 0; kEl.style.transform = ""; joyPress(false); }
jEl.addEventListener("pointerdown", e => { joy.on = true; joy.id = e.pointerId; jEl.setPointerCapture(e.pointerId); joyPress(true); joyMove(e.clientX, e.clientY); });
jEl.addEventListener("pointermove", e => { if (joy.on && e.pointerId === joy.id) joyMove(e.clientX, e.clientY); });
jEl.addEventListener("pointerup", joyEnd); jEl.addEventListener("pointercancel", joyEnd);

socket.on("pos", (arr) => {
  if (!S || !S.me) return;
  for (const [cid, x, y, alive] of arr) {
    if (cid === S.me.cid) continue;
    const o = others[cid] || (others[cid] = { x, y, tx: x, ty: y, dir: 1, walkT: 0 });
    if (Math.abs(x - o.tx) > 0.5) o.dir = x > o.tx ? 1 : -1;
    o.tx = x; o.ty = y; o.alive = alive;
  }
});

let lastSend = 0, lastSent = { x: 0, y: 0 };
function canMove() {
  if (!S || S.phase !== "play" || !S.me) return false;
  if (Date.now() + clockSkew < S.startedAt) return false;
  if (isOn("qOv") || isOn("roleOv") || isOn("menuOv")) return false;
  return true;
}
function step(dt) {
  let vx = joy.dx, vy = joy.dy;
  if (keys["arrowleft"] || keys["a"]) vx = -1;
  if (keys["arrowright"] || keys["d"]) vx = 1;
  if (keys["arrowup"] || keys["w"]) vy = -1;
  if (keys["arrowdown"] || keys["s"]) vy = 1;
  const len = Math.hypot(vx, vy);
  L.moving = false;
  if (len > 0.15 && canMove()) {
    if (len > 1) { vx /= len; vy /= len; }
    const sp = 230 * dt;
    // 길 따라가기: 그대로 갈 수 없으면 조금씩 방향을 틀어 길 안쪽으로 미끄러지듯 이동
    let moved = false;
    for (const da of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05]) {
      const c = Math.cos(da), sn = Math.sin(da);
      const ux = vx * c - vy * sn, uy = vx * sn + vy * c;
      const nx = L.x + ux * sp, ny = L.y + uy * sp;
      if (MAP.isWalkable(nx, ny)) { L.x = nx; L.y = ny; moved = true; break; }
    }
    if (!moved) {
      const nx = L.x + vx * sp, ny = L.y + vy * sp;
      if (MAP.isWalkable(nx, L.y)) L.x = nx;
      else if (MAP.isWalkable(L.x, ny)) L.y = ny;
    }
    if (Math.abs(vx) > 0.1) L.dir = vx > 0 ? 1 : -1;
    L.moving = true; L.walkT += dt;
  }
  const t = performance.now();
  if (S && S.phase === "play" && t - lastSend > 80 && (L.x !== lastSent.x || L.y !== lastSent.y)) {
    socket.emit("move", { x: Math.round(L.x * 10) / 10, y: Math.round(L.y * 10) / 10 });
    lastSend = t; lastSent = { x: L.x, y: L.y };
  }
  for (const o of Object.values(others)) {
    const d = Math.hypot(o.tx - o.x, o.ty - o.y);
    o.moving = d > 1.5;
    if (o.moving) o.walkT += dt;
    o.x += (o.tx - o.x) * Math.min(1, dt * 12);
    o.y += (o.ty - o.y) * Math.min(1, dt * 12);
  }
}

// ================== 주변 확인 / 행동 ==================
const USE_R = 90, FRZ_R = 80, REP_R = 115;
function near() {
  const res = { station: null, body: null, target: null, button: false };
  if (!S || !S.me) return res;
  let best = 1e9;
  for (const st of MAP.stations) { const d = Math.hypot(st.x - L.x, st.y - L.y); if (d < USE_R && d < best) { best = d; res.station = st; } }
  if (S.me.alive) {
    for (const b of S.bodies) if (Math.hypot(b.x - L.x, b.y - L.y) < REP_R) res.body = b;
    res.button = Math.hypot(MAP.button.x - L.x, MAP.button.y - L.y) < USE_R + 5;
  }
  if (S.me.role === "destroyer" && S.me.alive) {
    let bt = 1e9;
    for (const p of S.players) {
      if (!p.alive || S.me.team.includes(p.cid)) continue;
      const o = others[p.cid]; if (!o) continue;
      const d = Math.hypot(o.x - L.x, o.y - L.y);
      if (d < FRZ_R && d < bt) { bt = d; res.target = p; }
    }
  }
  return res;
}
let N = {};
function updateButtons() {
  if (!S || !S.me) return;
  N = near();
  const t = Date.now() + clockSkew;
  $("aUse").disabled = !N.station;
  $("aRep").classList.toggle("hide", !N.body);
  $("aEmg").classList.toggle("hide", !N.button);
  $("aEmg").disabled = S.me.emergency <= 0;
  if (S.me.role === "destroyer") {
    $("aFrz").disabled = !N.target || t < S.me.freezeAt;
    $("aSab").disabled = t < S.me.sabAt || S.me.energy < 1 || !!S.sab;
  }
}
function tryUse() {
  if (!N.station || !canMove()) return;
  SFX.click();
  socket.emit("use", { station: N.station.id });
}
$("aUse").onclick = tryUse;
$("aRep").onclick = () => { if (N.body) { L.reportUntil = performance.now() + 1200; socket.emit("report", { body: N.body.cid }); } };
$("aEmg").onclick = () => { L.reportUntil = performance.now() + 1200; socket.emit("emergency"); };
$("aFrz").onclick = () => { if (N.target) { SFX.freeze(); const o = others[N.target.cid]; if (o) addFx("pollution", o.x, o.y - 20); socket.emit("freeze", { target: N.target.cid }); } };

// 메뉴 패널 공통 틀
function menu(tabClass, title, body) {
  $("menuPanel").innerHTML = `<div class="tab ${tabClass}">${title}</div><button class="xbtn" onclick="ov('menuOv',false)" aria-label="닫기">✕</button><div class="inner">${body}</div>`;
  ov("menuOv", true);
}
function roomThumb(f) {
  return `<img class="thumb" src="${V2.facility[f]}" alt="">`;
}
// 투표 카드 그림(캐릭터 색별) 위에 이름을 얹은 카드
function voteCard(p, cls, inner) {
  const c = skinOf(p.skin).name, card = V2.vote_card[c] || V2.vote_card.red;
  return `<button class="vcard ${cls || ""}" data-c="${p.cid}" style="background-image:url(${card})" ${p.alive ? "" : "disabled"}>
    <span class="nm">${esc(p.name)}</span><span class="radio"></span>${inner || ""}</button>`;
}
$("aSab").onclick = () => {
  if (!S || !A) return;
  menu("red", "방해할 시설 선택 | Sabotage", `<div class="hint">파괴 에너지 1개를 써요. (지금 ${S.me.energy}개) 고장 난 시설은 친구 2명이 문제를 풀어야 고쳐져요.</div>
    <div class="facList">${MAP.facilities.map(f => `<button class="fac" data-f="${f}">${roomThumb(f)}${MAP.roomById(f).name}</button>`).join("")}</div>`);
  for (const b of $("menuPanel").querySelectorAll(".fac")) b.onclick = () => {
    socket.emit("sabotage", { fac: b.dataset.f }); ov("menuOv", false);
  };
};
$("aScp").onclick = () => {
  const m = S.me;
  if (m.missionDone.length < 3) { toast("취재 3곳을 먼저 끝내야 해요! (" + m.missionDone.length + "/3)"); return; }
  menu("", "특종! 파괴범은 누구? | Scoop", `<div class="hint center">딱 한 번만 고를 수 있어요. 결과는 나만 알 수 있어요.</div>
    <div class="vcards" style="margin-top:10px">${S.players.filter(p => p.cid !== m.cid).map(p => voteCard(Object.assign({}, p, { alive: true }), p.alive ? "" : "dead")).join("")}</div>`);
  for (const b of $("menuPanel").querySelectorAll(".vcard")) b.onclick = () => { socket.emit("scoop", { target: b.dataset.c }); addFx("scoop", L.x, L.y - 30); ov("menuOv", false); };
};
$("aInv").onclick = () => {
  if (!S.me.ready) { toast(S.me.coins < 3 ? `코인 3개가 필요해요. (지금 ${S.me.coins}개)` : "게임 시작 3분 뒤(또는 오염도 40%)부터 투자할 수 있어요."); return; }
  let choice = null;
  const draw = () => {
    const card = (k, side, label, icon) => `<button class="tcard ${choice === side ? "sel" : ""}" data-s="${side}" style="background-image:url(${V2.role_card[k === "pollute" ? "destroyer" : "guardian"]})"><span class="lb2">${label}</span></button>`;
    menu("gold", "어느 팀에 투자할까요? | Invest", `<div class="hint center">한 번 고르면 바꿀 수 없어요. 고른 팀이 이기면 나도 승리!</div>
      <div class="cardPick">${card("guardian", "guardian", "수호자 팀", V2.role_badge.guardian)}${card("pollute", "destroyer", "파괴범 팀", V2.role_badge.destroyer)}</div>
      <div class="btnRow"><button class="imgbtn" id="invOk" style="width:150px;height:135px;background-image:url(${V2.btn[choice ? "confirm_normal" : "confirm_disabled"]})" ${choice ? "" : "disabled"} aria-label="확인"></button>
      <button class="pill gray" onclick="ov('menuOv',false)">취소</button></div>`);
    for (const b of $("menuPanel").querySelectorAll(".tcard")) b.onclick = () => { choice = b.dataset.s; SFX.click(); draw(); };
    $("invOk").onclick = () => { if (!choice) return; socket.emit("invest", { side: choice }); addFx("investment", L.x, L.y - 30); ov("menuOv", false); };
  };
  draw();
};

// ================== 문제 ==================
let fbUntil = 0, fbShown = null, sel = null, answering = false;
function renderQuestion() {
  const q = S && S.me && S.me.q;
  if (Date.now() < fbUntil) return;
  if (!q || S.phase !== "play") { ov("qOv", false); fbShown = null; return; }
  const key = q.q + q.c.join("|");
  if (fbShown === key && isOn("qOv")) return;
  fbShown = key; sel = null;
  const st = MAP.stations.find(s => s.id === q.station);
  const fac = MAP.roomById(st.room);
  $("qWhere").textContent = `${fac.name} · ${st.label}`;
  if (V2) $("qPic").src = V2.facility[st.room] || V2.facility.base;
  $("qBadge").className = "";
  $("qFix").style.display = q.purpose === "fix" ? "" : "none";
  $("qText").textContent = q.q;
  $("qFeedback").textContent = ""; $("qFeedback").className = "";
  $("qSub").textContent = /뜻은/.test(q.q) ? "알맞은 뜻을 고르세요." : /___/.test(q.q) ? "빈칸에 들어갈 알맞은 말을 고르세요." : "알맞은 답을 고르세요.";
  $("qChoices").innerHTML = q.c.map((c, i) => `<button class="choice" data-i="${i}"><span class="lt" style="background:${LETTERS[i][1]}">${LETTERS[i][0]}</span><span class="tx">${esc(c)}</span></button>`).join("");
  for (const b of $("qChoices").querySelectorAll(".choice")) b.onclick = () => {
    if (answering || Date.now() < fbUntil) return;
    sel = +b.dataset.i; SFX.click();
    for (const x of $("qChoices").querySelectorAll(".choice")) x.classList.toggle("sel", x === b);
    $("qSubmit").disabled = false;
  };
  $("qSubmit").disabled = true;
  ov("qOv", true);
}
$("qSubmit").onclick = () => {
  if (sel == null || answering) return;
  const btn = $("qChoices").querySelector(`.choice[data-i="${sel}"]`);
  const stId = S.me.q && S.me.q.station;
  answering = true;
  socket.emit("answer", { choice: sel }, (r) => {
    answering = false;
    if (!r) return;
    const btns = $("qChoices").querySelectorAll(".choice");
    btns.forEach(b => { b.disabled = true; b.classList.remove("sel"); if (b.querySelector(".tx").textContent === r.answer) b.classList.add("ok"); });
    if (!r.right) btn.classList.add("no");
    $("qFeedback").textContent = (r.right ? "⭕ " : "❌ ") + r.msg;
    $("qFeedback").className = r.right ? "ok" : "no";
    if (V2) { $("qBadge").src = V2.result[r.right ? "correct" : "wrong"]; $("qBadge").className = "pop"; }
    $("qSubmit").disabled = true;
    (r.right ? SFX.ok : SFX.no)();
    if (r.right && stId) { const st = MAP.stations.find(s => s.id === stId); addFx("repair", st.x, st.y - 10); addFx("purify", st.x, st.y + 10, 0.9); }
    const ms = r.right ? 1400 : 2600;
    fbUntil = Date.now() + ms;
    setTimeout(() => { fbUntil = 0; ov("qOv", false); fbShown = null; renderQuestion(); }, ms);
  });
};
$("qClose").onclick = () => { socket.emit("closeQ"); ov("qOv", false); fbShown = null; };

// ================== 회의 ==================
let picked = null, pickState = null;
function renderMeeting() {
  const m = S.meeting; if (!m || !A) return;
  const amAlive = S.me.alive;
  const t = Date.now() + clockSkew;
  $("mTab").textContent = m.reason === "report" ? "신고 회의 | Report" : "긴급회의 | Emergency Meeting";
  $("mTitle").textContent = m.reason === "report" ? `${m.by}님이 얼어붙은 ${m.body}님을 발견했어요!` : `${m.by}님이 긴급회의를 열었어요!`;
  $("mInfo").textContent = !amAlive ? "유령은 회의를 볼 수만 있어요." :
    t < m.voteFrom ? "먼저 아래 영어 문장으로 이야기해요. 잠시 뒤 투표할 수 있어요." : "파괴범이라고 생각하는 친구를 골라 [투표하기]! 모르면 [건너뛰기]";
  const myTeam = S.me.role === "destroyer" ? S.me.team : [];
  const box = $("mPlayers");
  const sig = S.players.map(p => p.cid + (p.alive ? 1 : 0)).join(",") + "|" + S.me.cid;
  if (box._sig !== sig) {
    box._sig = sig;
    box.innerHTML = S.players.map(p => {
      const mate = myTeam.includes(p.cid);
      const stIc = p.alive ? "" : `<img class="st" src="${p.out === "frozen" ? A.ui.status_frozen : A.ui.status_ghost}" alt="">`;
      return voteCard(Object.assign({}, p, { name: p.name + (p.cid === S.me.cid ? " (나)" : "") }), `${p.alive ? "" : "dead"} ${p.cid === S.me.cid ? "me" : ""} ${mate ? "mate" : ""}`,
        `${stIc}<span class="badge" style="display:none">투표함</span>`);
    }).join("");
    for (const b of box.querySelectorAll(".vcard")) b.onclick = () => {
      if (!S || !S.meeting || !S.me.alive || S.meeting.myVote) return;
      picked = b.dataset.c; SFX.click(); renderMeeting();
    };
  }
  for (const b of box.querySelectorAll(".vcard")) {
    const on = picked === b.dataset.c || m.myVote === b.dataset.c;
    b.classList.toggle("sel", on);
    b.querySelector(".radio").textContent = on ? "✓" : "";
    b.querySelector(".badge").style.display = m.voted.includes(b.dataset.c) ? "" : "none";
  }
  const canVote = amAlive && !m.myVote && t >= m.voteFrom;
  $("mVote").disabled = !canVote || !picked; $("mSkip").disabled = !canVote;
  const mv = m.myVote ? (m.myVote === "skip" ? "건너뛰기" : (S.players.find(p => p.cid === m.myVote) || {}).name) : null;
  $("mVoteInfo").textContent = mv ? `내 투표: ${mv}` : `투표 ${m.voted.length}/${S.players.filter(p => p.alive).length}명`;
  const chat = $("mChat");
  const atBottom = chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 30;
  setHTML(chat, m.chat.length ? m.chat.map(c => `<div class="msg">${avatar(c.skin, 0, 32)}<b style="color:${c.color === "#edf2f7" ? "#6b7a88" : c.color}">${esc(c.name)}</b><span class="en">${esc(c.text)}</span></div>`).join("") : '<div class="hint">아직 아무도 말하지 않았어요. 아래 문장을 눌러 말해 보세요!</div>');
  if (atBottom) chat.scrollTop = chat.scrollHeight;
  if (!$("mSents").dataset.made) {
    $("mSents").innerHTML = SENTS.map((s, i) => `<button class="sent" data-i="${i}"><span class="en">${s.en.replace("{name}", "___").replace("{place}", "___")}</span><span class="ko">${s.ko}</span></button>`).join("");
    for (const b of $("mSents").querySelectorAll(".sent")) b.onclick = () => startSentence(+b.dataset.i);
    $("mSents").dataset.made = 1;
  }
  $("mSents").style.display = amAlive ? "" : "none";
  renderPicker();
}
function meetingTick() {
  if (!S || S.phase !== "meeting" || !S.meeting) return;
  const t = Date.now() + clockSkew;
  $("mTimer").textContent = Math.max(0, Math.ceil((S.meeting.endsAt - t) / 1000));
  const canVoteNow = t >= S.meeting.voteFrom;
  if (canVoteNow !== meetingTick.last) { meetingTick.last = canVoteNow; renderMeeting(); }
}
function startSentence(i) { SFX.click(); pickState = { i, text: SENTS[i].en }; nextPick(); }
function nextPick() {
  if (!pickState) return;
  if (!pickState.text.includes("{")) { socket.emit("say", { text: pickState.text }); pickState = null; renderPicker(); return; }
  renderPicker();
}
function renderPicker() {
  const p = $("mPicker");
  if (!pickState) { p.classList.remove("on"); return; }
  const isName = pickState.text.indexOf("{name}") !== -1 && (pickState.text.indexOf("{place}") === -1 || pickState.text.indexOf("{name}") < pickState.text.indexOf("{place}"));
  setHTML($("mPickTitle"), `<button class="cx" onclick="pickState=null;renderPicker()">취소</button><b>${esc(pickState.text.replace(/\{name\}|\{place\}/g, "___"))}</b> — ${isName ? "누구?" : "어디?"}`);
  const opts = isName
    ? S.players.filter(q => q.cid !== S.me.cid).map(q => ({ v: q.name, label: q.name }))
    : MAP.rooms.map(r => ({ v: FAC_EN[r.id], label: `${FAC_EN[r.id]} (${r.name})` }));
  const rowChanged = setHTML($("mPickRow"), opts.map((o, k) => `<button data-k="${k}">${esc(o.label)}</button>`).join(""));
  if (rowChanged || $("mPickRow")._ps !== pickState) for (const b of $("mPickRow").querySelectorAll("button")) b.onclick = () => {
    const o = opts[+b.dataset.k];
    pickState.text = pickState.text.replace(isName ? "{name}" : "{place}", o.v);
    nextPick();
  };
  $("mPickRow")._ps = pickState;
  p.classList.add("on");
}
$("mVote").onclick = () => { if (picked) { socket.emit("vote", { target: picked }); SFX.click(); } };
$("mSkip").onclick = () => { socket.emit("vote", { target: "skip" }); SFX.click(); };

function renderResult() {
  const r = S.result; if (!r || !A) return;
  const vals = Object.entries(r.tally || {}).sort((a, b) => b[1] - a[1]);
  const tie = !r.ejected && vals.length > 1 && vals[0][1] === vals[1][1] && vals[0][0] !== "skip";
  const caught = r.ejected && r.role && /파괴범/.test(r.role);
  const scene = r.ejected ? (caught ? V2.scene.vote_destroyer : V2.scene.vote_ejected) : tie ? V2.scene.vote_tie : V2.scene.vote_skip;
  // 1단계: 표 공개 — 받은 표 수만큼 같은 색 표를 카드 아래에 (누가 찍었는지는 보이지 않음)
  const ids = r.voters || S.players.filter(p => p.alive || p.cid === r.ejectedCid).map(p => p.cid);
  const dots = (n) => n ? Array.from({ length: n }, (_, i) => `<i class="vdot" style="animation-delay:${0.5 + i * 0.25}s"></i>`).join("") : `<span class="vzero">0표</span>`;
  const cards = ids.map(cid => {
    const p = S.players.find(q => q.cid === cid); if (!p) return "";
    const c = skinOf(p.skin).name;
    return `<div class="vrc ${cid === r.ejectedCid ? "out" : ""}"><div class="vrcard" style="background-image:url(${V2.vote_card[c] || V2.vote_card.red})"><span class="nm">${esc(p.name)}</span></div><div class="vdots">${dots(r.tally[cid] || 0)}</div></div>`;
  }).join("") + `<div class="vrc skip"><div class="vrcard skipcard"><img src="${V2.icon.skip}" alt=""><span class="nm">건너뛰기</span></div><div class="vdots">${dots(r.tally.skip || 0)}</div></div>`;
  // 2단계: 추방인지 아무도 안 나갔는지 발표
  let h;
  if (r.ejected) {
    h = `<div class="bigmsg"><span style="color:${r.color === "#edf2f7" ? "#6b7a88" : r.color}">${esc(r.ejected)}</span>님이 추방되었어요.</div>`;
    if (r.role) h += `<div class="rrole">${esc(r.ejected)}님은 <b>${esc(r.role)}</b>이었어요.</div>`;
    if (r.trash) h += `<div class="rrole" style="color:#7a5a2f">쓰레기 괴물의 작전 성공! (혼자 승리)</div>`;
  } else h = `<div class="bigmsg">${tie ? "표가 같아서" : "건너뛰기가 많아서"} 아무도 추방되지 않았어요.</div><div class="rrole">모두 살아남았어요. 다시 시설을 지켜요!</div>`;
  $("resultTab").textContent = "투표 결과 | Vote Result";
  $("resultTab").className = "tab";
  const changed = setHTML($("resultMsg"), `<div class="vreveal">${cards}</div>
    <div class="vstage2"><img class="sceneTop2" src="${scene}" alt=""><div>${h}</div></div>`);
  if (changed) {
    $("resultScene").style.display = "none";
    setTimeout(() => { const t = $("resultTab"); if (S && S.result === r) { t.textContent = r.ejected ? (caught ? "파괴범을 찾았어요!" : "추방!") : tie ? "동점 · 추방 없음" : "건너뛰기 · 추방 없음"; t.className = "tab " + (caught ? "green" : r.ejected ? "purple" : ""); } }, 3600);
  }
}
function renderEnd() {
  const e = S.end; if (!e || !A) return;
  const win = e.team === "guardian";
  $("endTab").textContent = win ? "환경 수호자 팀 승리!" : "환경 파괴범 팀 승리!";
  $("endTab").className = "tab " + (win ? "green" : "red");
  const mine = S.reveal.find(r => r.cid === S.me.cid);
  $("endScene").src = win ? V2.scene.guardian_win : V2.scene.destroyer_win;
  setHTML($("endHead"), `<div class="ttl" style="color:${win ? "#0f7a43" : "#b9282e"}">${win ? "지구를 지켜냈어요!" : "지구가 오염되었어요…"}</div><div class="rs">${esc(e.reason)}</div>` +
    (mine ? `<div class="meWin" style="background:${mine.win ? "#fff1b8" : "#e3eaf0"};color:${mine.win ? "#7a5200" : "#4d6884"}">${mine.win ? "🏆 나는 승리했어요!" : "이번 판은 졌어요. 다음엔 꼭!"}</div>` : ""));
  setHTML($("endList"), S.reveal.map(r => {
    const k = r.job || r.role;
    return `<div class="rv ${r.win ? "win" : ""}">${`<span style="opacity:${r.alive ? 1 : .55}">` + avatar(r.skin, 0, 64) + `</span>`}<div><div class="nm">${esc(r.name)}</div><div class="rl" style="color:${ROLE[k].color}"><img class="rb" src="${V2.role_badge[k]}" alt="">${esc(r.label)}</div><div class="rl">정답 ${r.correct}개${r.alive ? "" : " · 아웃"}</div></div>${r.win ? '<span class="tr">🏆</span>' : ""}</div>`;
  }).join(""));
}

// ================== 효과 ==================
let fxList = [];
function addFx(kind, x, y, scale) { if (A && A.fx[kind]) fxList.push({ kind, x, y, t0: performance.now(), s: scale || 1 }); }

// ================== 그리기 ==================
const cv = $("cv"), ctx = cv.getContext("2d");
const fog = document.createElement("canvas"), fctx = fog.getContext("2d");
const mini = $("miniCv"), mctx = mini.getContext("2d");
let W = 0, H = 0, DPR = 1, SCALE = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  fog.width = cv.width; fog.height = cv.height;
  SCALE = Math.max(0.55, Math.min(W / 1050, H / 720));
  const mw = W < 640 ? 110 : W < 900 ? 130 : 210;
  mini.width = mw * DPR; mini.height = mw * (MAP.H / MAP.W) * DPR;
  mini.style.width = mw + "px"; mini.style.height = mw * (MAP.H / MAP.W) + "px";
}
addEventListener("resize", resize); resize();

const DRAW_H = 100;           // 캐릭터 그리는 높이(지도 단위)
function drawSprite(c, skin, frame, x, y, dir, alpha) {
  if (!CH) return;
  const sh = img(skinOf(skin).sheet); if (!ready(sh)) return;
  const [cw, chh] = CH.cell, s = DRAW_H / chh;
  c.save();
  if (alpha != null) c.globalAlpha = alpha;
  c.translate(x, y + 30);                     // 발 위치
  if (dir < 0) c.scale(-1, 1);
  c.drawImage(sh, frame * cw, 0, cw, chh, -cw / 2 * s, -(CH.foot || chh) * s, cw * s, chh * s);
  c.restore();
}
function nameTag(x, y, name, color, bg) {
  ctx.font = "700 16px 'Noto Sans KR', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const w = ctx.measureText(name).width + 16;
  ctx.fillStyle = bg || "rgba(6,24,48,.78)";
  rr(ctx, x - w / 2, y - 62, w, 22, 11); ctx.fill();
  ctx.fillStyle = color; ctx.fillText(name, x, y - 51);
  ctx.textBaseline = "alphabetic";
}
function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
function drawMarker(src, x, y, size, bob) {
  const i = img(src); if (!ready(i)) return;
  ctx.drawImage(i, x - size / 2, y - size + (bob || 0), size, size);
}
// 상태별 소품 배치: [소품, x, y, 크기, 진하기, 흔들림]
const FAC_FX = {
  broken: [["smoke", -95, -70, 0.9, 0.9, 3], ["smoke_fire", 10, -40, 0.95, 1, 2], ["fire_l", 85, 15, 0.8, 1, 3], ["fire_s", -55, 35, 0.9, 1, 4],
    ["barrier", -10, 85, 0.75, 1, 0], ["warn", 0, -135, 0.7, 1, 6]],
  repairing: [["smoke", -60, -90, 0.6, 0.55, 2], ["crane", -95, -10, 0.72, 1, 0], ["scaffold", 55, 0, 0.62, 1, 0], ["cone", -150, 70, 0.75, 1, 0],
    ["cone", 145, 70, 0.75, 1, 0], ["toolbox", -20, 85, 0.75, 1, 0], ["crew_fix", 85, 80, 0.6, 1, 4], ["plus", 0, -120, 0.7, 1, 6]],
  restored: [["ring", 0, 0, 1.5, 1, 0], ["beam_green", 0, -40, 1.4, 0.9, 0], ["burst", 0, -10, 1.2, 1, 3], ["dome_leaf", 0, -130, 0.45, 1, 6]],
};
function drawProp(name, x, y, sc, alpha) {
  const p = V2 && V2.props[name]; if (!p) return;
  const i = img(p.src); if (!ready(i) || alpha <= 0.01) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(i, x - p.w * sc / 2, y - p.h * sc / 2, p.w * sc, p.h * sc);
  ctx.globalAlpha = 1;
}
function facState(fac, t) {
  if (S.sab && S.sab.fac === fac) return S.sab.fixers > 0 ? "repairing" : "broken";
  const r = S.restored && S.restored[fac];
  if (r && t - r < 4000) return "restored";
  return null;
}

function draw() {
  if (!S || !S.me || !S.startedAt || !A) return;
  const t = Date.now() + clockSkew, pt = performance.now();
  const ghost = !S.me.alive;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = "#0e4a6c"; ctx.fillRect(0, 0, W, H);
  const vw = W / SCALE, vh = H / SCALE;
  const camX = L.x - vw / 2, camY = L.y - vh / 2;
  ctx.save();
  ctx.scale(SCALE, SCALE); ctx.translate(-camX, -camY);
  // 지도 (보이는 부분만)
  const mapI = img(A.map.image);
  if (ready(mapI)) {
    const sx = Math.max(0, camX), sy = Math.max(0, camY);
    const sw = Math.min(MAP.W, camX + vw) - sx, sh = Math.min(MAP.H, camY + vh) - sy;
    if (sw > 0 && sh > 0) ctx.drawImage(mapI, sx, sy, sw, sh, sx, sy, sw, sh);
  }
  // 시설 상태 효과 (고장 / 수리 중 / 복구) — 효과 시트의 소품을 시설 위에 배치
  for (const fac of MAP.facilities) {
    const st = facState(fac, t); if (!st) continue;
    const a = MAP.anchors[fac];
    for (const [name, dx, dy, sc, al, wob] of FAC_FX[st]) {
      const w = wob ? Math.sin(pt / 260 + dx) * wob : 0;
      let alpha = al;
      if (st === "restored") { const age = (t - S.restored[fac]) / 4000; alpha *= Math.max(0, 1 - age * age); }
      drawProp(name, a.x + dx, a.y + dy + w, sc * (st === "restored" ? 1 + Math.sin(pt / 200) * 0.06 : 1), alpha);
    }
  }
  // 장치
  for (const st of MAP.stations) {
    const broken = S.sab && S.sab.fac === st.room;
    const restUntil = S.me.stationRest[st.id];
    const rest = restUntil && restUntil > t && !broken;
    const mine = S.me.missions && S.me.missions.includes(st.room) && !S.me.missionDone.includes(st.room);
    const nearMe = N.station && N.station.id === st.id;
    // 바닥 빛
    ctx.save(); ctx.translate(st.x, st.y + 18);
    ctx.globalAlpha = rest ? .25 : .55 + Math.sin(pt / 300) * .15;
    ctx.fillStyle = broken ? "#ff4d55" : mine ? "#a675ff" : "#ffd23f";
    ctx.beginPath(); ctx.ellipse(0, 0, 38, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (nearMe) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.ellipse(0, 0, 46, 19, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
    const bob = Math.sin(pt / 280 + st.x) * 4;
    if (broken) {
      const w = A.fx.warning, wi = img(w.src);
      if (ready(wi)) { const f = Math.floor(pt / 90) % w.n; ctx.drawImage(wi, f * w.size, 0, w.size, w.size, st.x - 42, st.y - 50, 84, 84); }
      drawMarker(A.ui.new_marker_danger, st.x, st.y - 22, 52, bob);
    } else if (rest) {
      ctx.globalAlpha = .75; drawMarker(A.ui.marker_complete, st.x, st.y - 18, 40, 0); ctx.globalAlpha = 1;
      ctx.font = "900 15px 'Noto Sans KR'"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "rgba(6,24,48,.85)";
      const txt = Math.ceil((restUntil - t) / 1000) + "초"; ctx.strokeText(txt, st.x, st.y + 44); ctx.fillStyle = "#fff"; ctx.fillText(txt, st.x, st.y + 44);
    } else {
      drawMarker(mine ? A.ui.new_marker_meeting : A.ui.new_marker_mission, st.x, st.y - 22, 48, bob);
      if (mine) { ctx.font = "900 14px 'Noto Sans KR'"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "#3b1d78"; ctx.strokeText("취재", st.x, st.y + 44); ctx.fillStyle = "#e9dcff"; ctx.fillText("취재", st.x, st.y + 44); }
    }
  }
  // 긴급회의 버튼 (반짝이 아이콘 세트의 빨간 버튼)
  const eb = img(V2.icon.emg_button);
  if (ready(eb)) { const w = 104, h = w * eb.naturalHeight / eb.naturalWidth; ctx.drawImage(eb, MAP.button.x - w / 2, MAP.button.y - h / 2, w, h); }
  ctx.font = "900 15px 'Jua','Noto Sans KR'"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(120,10,20,.95)"; ctx.lineWidth = 5;
  ctx.strokeText("긴급회의", MAP.button.x, MAP.button.y + 52); ctx.fillText("긴급회의", MAP.button.x, MAP.button.y + 52);
  if (N.button && S.me.emergency > 0) drawMarker(A.ui.new_marker_meeting, MAP.button.x, MAP.button.y - 24, 46, Math.sin(pt / 250) * 4);

  // 시야 안의 것들
  const VR = ghost ? 99999 : (S.me.role === "destroyer" ? 300 : 260);
  const items = [];
  for (const b of S.bodies) if (Math.hypot(b.x - L.x, b.y - L.y) < VR + 20) items.push({ y: b.y, f: () => {
    drawSprite(ctx, b.skin, FR.frozen, b.x, b.y, 1);
    nameTag(b.x, b.y, b.name, "#bfe8ff");
    if (N.body && N.body.cid === b.cid) drawMarker(A.ui.new_marker_danger, b.x, b.y - 66, 44, Math.sin(pt / 250) * 4);
  } });
  const teams = S.me.role === "destroyer" ? S.me.team : [];
  for (const p of S.players) {
    if (p.cid === S.me.cid) continue;
    const o = others[p.cid]; if (!o) continue;
    const isGhost = !p.alive;
    if (isGhost && (!ghost || p.out === "left")) continue;
    if (Math.hypot(o.x - L.x, o.y - L.y) > VR) continue;
    items.push({ y: o.y, f: () => {
      const fr = isGhost ? FR.ghost : o.moving ? FR.walk + Math.floor(o.walkT * 16) % FR.walkN : FR.idle;
      drawSprite(ctx, p.skin, fr, o.x, o.y + (isGhost ? Math.sin(pt / 300 + o.x) * 4 : 0), o.dir, isGhost ? .6 : 1);
      nameTag(o.x, o.y, p.name, teams.includes(p.cid) ? "#ff7a7f" : "#fff");
      if (N.target && N.target.cid === p.cid) { ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(o.x, o.y + 30, 34, 12, 0, 0, Math.PI * 2); ctx.stroke(); }
    } });
  }
  items.push({ y: L.y, f: () => {
    const fr = ghost ? FR.ghost : pt < L.reportUntil ? FR.report : L.moving ? FR.walk + Math.floor(L.walkT * 16) % FR.walkN : FR.idle;
    drawSprite(ctx, S.me.skin, fr, L.x, L.y + (ghost ? Math.sin(pt / 300) * 4 : 0), L.dir, ghost ? .65 : 1);
    nameTag(L.x, L.y, me.name || "나", S.me.role === "destroyer" ? "#ff7a7f" : "#ffe680", "rgba(7,82,142,.92)");
  } });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();
  // 효과 애니메이션
  fxList = fxList.filter(f => {
    const d = A.fx[f.kind], i = img(d.src);
    const k = Math.floor((pt - f.t0) / 75);
    if (k >= d.n) return false;
    if (ready(i)) { const sz = 120 * f.s; ctx.drawImage(i, k * d.size, 0, d.size, d.size, f.x - sz / 2, f.y - sz / 2, sz, sz); }
    return true;
  });
  ctx.restore();

  // 시야(안개)
  if (!ghost) {
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, fog.width, fog.height);
    fctx.fillStyle = "rgba(3,14,30,.86)"; fctx.fillRect(0, 0, fog.width, fog.height);
    const cx = W / 2 * DPR, cy = H / 2 * DPR, R = VR * SCALE * DPR;
    const g = fctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
    fctx.globalCompositeOperation = "destination-out";
    fctx.fillStyle = g; fctx.beginPath(); fctx.arc(cx, cy, R, 0, Math.PI * 2); fctx.fill();
    fctx.globalCompositeOperation = "source-over";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(fog, 0, 0);
  }
  // 고장 난 시설 방향 표시
  if (S.sab && S.phase === "play") {
    const a = MAP.anchors[S.sab.fac];
    const dx = a.x - L.x, dy = a.y - L.y, d = Math.hypot(dx, dy);
    if (d > 260) {
      const ang = Math.atan2(dy, dx);
      const rad = Math.min(W, H) / 2 - 80;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const px = W / 2 + Math.cos(ang) * rad, py = H / 2 + Math.sin(ang) * rad;
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
      ctx.fillStyle = "#e5484d"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(8, -14); ctx.lineTo(8, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      const wi = img(A.ui.marker_warning); if (ready(wi)) ctx.drawImage(wi, px - 22, py - 22, 44, 44);
    }
  }
  drawGuide(pt);
  drawMini(t, pt);
}

function drawMini(t, pt) {
  const s = mini.width / MAP.W;
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.clearRect(0, 0, mini.width, mini.height);
  const mi = img(A.map.mini);
  if (ready(mi)) mctx.drawImage(mi, 0, 0, mini.width, mini.height);
  mctx.scale(s, s);
  if (S.sab) {
    const r = MAP.roomById(S.sab.fac);
    mctx.fillStyle = Math.floor(pt / 400) % 2 ? "rgba(255,60,70,.55)" : "rgba(255,60,70,.2)";
    mctx.fillRect(r.x, r.y, r.w, r.h);
    mctx.strokeStyle = "#ff4d55"; mctx.lineWidth = 18; mctx.strokeRect(r.x, r.y, r.w, r.h);
  }
  if (S.me.missions) for (const f of S.me.missions) {
    const r = MAP.roomById(f);
    mctx.font = "160px sans-serif"; mctx.textAlign = "center"; mctx.textBaseline = "middle";
    mctx.fillStyle = S.me.missionDone.includes(f) ? "#5be39a" : "#c9a6ff";
    mctx.fillText(S.me.missionDone.includes(f) ? "✔" : "★", r.x + r.w / 2, r.y + r.h / 2);
  }
  const mk = img(A.ui.marker_player);
  if (ready(mk)) mctx.drawImage(mk, L.x - 70, L.y - 70, 140, 140);
}

// ================== 길 안내 ==================
// 걸을 수 있는 칸(10px)으로 길찾기 → 목적지까지 화살표 + 글로 안내
const GC = 10, GW = MAP.W / GC, GH = MAP.H / GC;
const OK = new Uint8Array(GW * GH);
for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) OK[r * GW + c] = MAP.isWalkable(c * GC + 5, r * GC + 5) ? 1 : 0;
const distCache = {};
function distField(st) {
  if (distCache[st.id]) return distCache[st.id];
  const D = new Int32Array(GW * GH).fill(-1), q = [];
  let best = -1, bd = 1e9;
  for (let i = 0; i < OK.length; i++) if (OK[i]) { const d = Math.hypot((i % GW) * GC + 5 - st.x, Math.floor(i / GW) * GC + 5 - st.y); if (d < bd) { bd = d; best = i; } }
  D[best] = 0; q.push(best);
  for (let h = 0; h < q.length; h++) {
    const i = q[h], c = i % GW, r = (i - c) / GW;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= GW || nr >= GH) continue;
      const j = nr * GW + nc; if (!OK[j] || D[j] >= 0) continue;
      if (dc && dr && (!OK[r * GW + nc] || !OK[nr * GW + c])) continue;
      D[j] = D[i] + 1; q.push(j);
    }
  }
  return (distCache[st.id] = D);
}
function cellOf(x, y) {
  let c = Math.floor(x / GC), r = Math.floor(y / GC);
  if (OK[r * GW + c]) return r * GW + c;
  let best = -1, bd = 1e9;
  for (let dr = -4; dr <= 4; dr++) for (let dc = -4; dc <= 4; dc++) { const j = (r + dr) * GW + c + dc; if (OK[j] && dr * dr + dc * dc < bd) { bd = dr * dr + dc * dc; best = j; } }
  return best;
}
function guideTarget() {
  if (!S || !S.me || S.phase !== "play") return null;
  const m = S.me, t = Date.now() + clockSkew;
  let cands, why;
  if (S.sab && m.role !== "destroyer" && m.alive) { cands = MAP.stations.filter(s => s.room === S.sab.fac); why = "고장 수리"; }
  else if (m.job === "reporter" && m.missions && m.missionDone.length < 3) { cands = MAP.stations.filter(s => m.missions.includes(s.room) && !m.missionDone.includes(s.room)); why = "취재"; }
  else { cands = MAP.stations.filter(s => !(m.stationRest[s.id] > t)); why = "문제 풀기"; }
  if (!cands.length) return null;
  const me0 = cellOf(L.x, L.y); if (me0 < 0) return null;
  let best = null, bd = 1e9;
  for (const s of cands) { const d = distField(s)[me0]; if (d >= 0 && d < bd) { bd = d; best = s; } }
  return best && { st: best, why, d: bd };
}
const DIRS = ["오른쪽", "오른쪽 아래", "아래", "왼쪽 아래", "왼쪽", "왼쪽 위", "위", "오른쪽 위"];
let guide = null, guideAt = 0;
function updateGuide(pt) {
  if (pt - guideAt < 250) return; guideAt = pt;
  const g = guideTarget();
  if (!g) { guide = null; $("guide").style.display = "none"; return; }
  const D = distField(g.st);
  const path = []; let i = cellOf(L.x, L.y);
  for (let k = 0; k < 400 && i >= 0 && D[i] > 0; k++) {
    const c = i % GW, r = (i - c) / GW; let nb = -1, nd = D[i];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const j = (r + dr) * GW + c + dc; if (j >= 0 && j < D.length && D[j] >= 0 && D[j] < nd) { nd = D[j]; nb = j; }
    }
    if (nb < 0) break; i = nb; path.push([(i % GW) * GC + 5, Math.floor(i / GW) * GC + 5]);
  }
  guide = { ...g, path };
  const fac = MAP.roomById(g.st.room).name;
  let txt;
  if (g.d * GC < 70) txt = `<b>${fac}</b> 도착! [문제 풀기]를 눌러요`;
  else {
    const p = path[Math.min(path.length - 1, 8)] || [g.st.x, g.st.y];
    const a = Math.atan2(p[1] - L.y, p[0] - L.x);
    const dir = DIRS[(Math.round(a / (Math.PI / 4)) + 8) % 8];
    txt = `<b>${fac}</b> · ${g.why} · <span class="gd">${dir}</span>으로 길을 따라 ${Math.max(1, Math.round(g.d * GC / 100))}칸`;
  }
  setHTML($("guide"), "🧭 " + txt); $("guide").style.display = "flex";
}
function drawGuide(pt) {
  updateGuide(pt);
  if (!guide || !guide.path.length) return;
  ctx.save(); ctx.setTransform(DPR * SCALE, 0, 0, DPR * SCALE, (W / 2 - L.x * SCALE) * DPR, (H / 2 - L.y * SCALE) * DPR);
  const col = guide.why === "고장 수리" ? "#ff4d55" : guide.why === "취재" ? "#b07cff" : "#3db8ff";
  const P = guide.path, step = 4, off = Math.floor(pt / 120) % step;
  for (let k = 2 + off; k < Math.min(P.length - 1, 70); k += step) {
    const [x, y] = P[k], [x2, y2] = P[Math.min(P.length - 1, k + 1)];
    const a = Math.atan2(y2 - y, x2 - x), fade = 1 - k / 75;
    ctx.globalAlpha = 0.85 * fade;
    ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = col; ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-7, -10); ctx.lineTo(-2, 0); ctx.lineTo(-7, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.rotate(-a); ctx.translate(-x, -y);
  }
  ctx.restore();
}

let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (S && S.startedAt && S.me) { step(dt); updateButtons(); draw(); hudTick(); meetingTick(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("touchmove", e => { if (!e.target.closest(".inner,.vcards,.chat,.sents")) e.preventDefault(); }, { passive: false });
