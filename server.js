// 에코 스파이 — 12단원 We Should Save the World 영어 추리 게임 서버
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const MAP = require("./public/map.js");
const BANK = require("./questions.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 10000, pingTimeout: 20000 });
app.use(express.static(path.join(__dirname, "public")));
app.get("/teacher", (req, res) => res.sendFile(path.join(__dirname, "public", "teacher.html")));
app.get("/health", (req, res) => res.send("ok"));

// ---------------- 기본 설정 ----------------
const DEFAULTS = {
  perGuardian: 4,        // 수호자 1명당 목표 문제 수
  timeLimit: 12,         // 분
  sabTime: 60,           // 고장 수리 제한 시간(초)
  sabCd: 45,             // 방해 쿨타임(초, 파괴범 팀 공통)
  freezeCd: 40,          // 오염시키기 쿨타임(초)
  meetingTime: 90,       // 회의 시간(초)
  revealRole: true,      // 추방 시 역할 공개
  parityWin: true,       // 파괴범 수 ≥ 남은 인원이면 파괴범 승리
  neutralJobs: ["reporter", "trash", "investor"],
};
// 캐릭터 색 (public/assets/manifest.json 의 chars.colors 와 같은 순서)
const COLORS = ["#fd202b", "#0174fa", "#11be5a", "#fed423", "#a557d6", "#fd7518", "#36dbdb", "#fc87ba", "#8f563e", "#edf2f7", "#94e52d", "#4c5059"];
const SPEED = 230;            // 초당 이동 거리
const USE_RANGE = 95;
const FREEZE_RANGE = 85;
const REPORT_RANGE = 120;
const STATION_REST = 20000;   // 같은 장치를 다시 풀 수 있기까지(ms)
const WRONG_LOCK = 4000;
const ENERGY_MAX = 5;
const POLLUTION_HIT = 25;     // 수리 실패 시 오염도 증가
const FIX_NEED = 2;           // 고장 수리에 필요한 서로 다른 학생 수

const classes = {};           // code -> class
const hooks = {};             // 시험용 연결 지점
const now = () => Date.now();
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clean = (s, n) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);

function newCode() {
  let c;
  do { c = String(1000 + rnd(9000)); } while (classes[c]);
  return c;
}

// ---------------- 반(교사) ----------------
function makeClass() {
  const code = newCode();
  classes[code] = {
    code,
    key: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    students: {},     // cid -> {cid, name, socketId, roomId, score, wins, games}
    rooms: {},        // roomId -> room
    settings: JSON.parse(JSON.stringify(DEFAULTS)),
    roomSeq: 1,
    teacherSockets: new Set(),
    createdAt: now(),
  };
  return classes[code];
}

// 7~9명씩 나누기 (어려우면 6~10명)
function splitSizes(n) {
  if (n <= 0) return [];
  let k = 0;
  for (let t = Math.ceil(n / 9); t <= Math.floor(n / 7); t++) { k = t; break; }
  if (!k) k = Math.max(1, Math.round(n / 8));
  const sizes = Array(k).fill(Math.floor(n / k));
  for (let i = 0; i < n % k; i++) sizes[i]++;
  return sizes;
}

function autoAssign(cls) {
  // 진행 중인 방은 건드리지 않음
  const busy = new Set(Object.values(cls.rooms).filter(r => r.phase === "play" || r.phase === "meeting" || r.phase === "result").map(r => r.id));
  const free = Object.values(cls.students).filter(s => !s.roomId || !busy.has(s.roomId));
  for (const r of Object.values(cls.rooms)) if (!busy.has(r.id)) delete cls.rooms[r.id];
  const sizes = splitSizes(free.length);
  const list = shuffle(free);
  let i = 0;
  for (const size of sizes) {
    const room = makeRoom(cls);
    for (let j = 0; j < size; j++) {
      const s = list[i++];
      s.roomId = room.id;
      room.order.push(s.cid);
    }
  }
}

function makeRoom(cls) {
  const id = "R" + cls.roomSeq++;
  const room = { id, name: (Object.keys(cls.rooms).length + 1) + "모둠", order: [], phase: "lobby", game: null };
  cls.rooms[id] = room;
  return room;
}

// ---------------- 게임 ----------------
function roleCounts(n) {
  const d = n >= 7 ? 2 : 1;
  const neu = n >= 5 ? 1 : 0;
  return { d, neu, g: n - d - neu };
}

function startGame(cls, room) {
  const ids = room.order.filter(cid => cls.students[cid]);
  if (ids.length < 3) return false;
  const st = JSON.parse(JSON.stringify(cls.settings));
  const { d, neu } = roleCounts(ids.length);
  const order = shuffle(ids);
  const jobs = st.neutralJobs.length ? st.neutralJobs : ["reporter"];
  const players = {};
  const spots = ids.length;
  order.forEach((cid, i) => {
    const ang = (i / spots) * Math.PI * 2;
    let role = "guardian", job = null;
    if (i < d) role = "destroyer";
    else if (i < d + neu) { role = "neutral"; job = jobs[rnd(jobs.length)]; }
    players[cid] = {
      cid, name: cls.students[cid].name,
      skin: ids.indexOf(cid) % COLORS.length,
      color: COLORS[ids.indexOf(cid) % COLORS.length],
      role, job,
      x: MAP.spawnPoints[i % MAP.spawnPoints.length][0], y: MAP.spawnPoints[i % MAP.spawnPoints.length][1],
      alive: true, out: null,             // out: 'frozen' | 'ejected'
      emergency: 1,
      freezeAt: 0,
      stationRest: {},                    // stationId -> time
      lockUntil: 0, q: null, lastPos: -1,
      correct: 0, wrong: 0,
      missions: job === "reporter" ? shuffle(MAP.facilities).slice(0, 3) : null,
      missionDone: [], scoop: null,
      coins: 0, side: null,
      lastMove: now(),
    };
  });
  const guardians = Object.values(players).filter(p => p.role === "guardian").length;
  const g = {
    settings: st,
    players,
    startedAt: now() + 4000,           // 역할 확인 4초
    endsAt: now() + 4000 + st.timeLimit * 60000,
    goal: Math.max(4, guardians * st.perGuardian) * 2,   // 점수(살아 있는 정답 2점, 유령 1점)
    goalCount: Math.max(4, guardians * st.perGuardian),
    progress: 0,
    pollution: 0,
    energy: 1,
    sabAt: now() + 4000 + 20000,       // 시작 후 20초 뒤부터 방해 가능
    sab: null,                         // {fac, until, fixers:[], pausedLeft}
    restored: {},                      // fac -> 수리 완료 시각 (복구 효과 표시)
    bodies: [],
    meeting: null,
    result: null,                      // 추방 결과 표시
    feed: [],
    winner: null,
    end: null,
  };
  Object.values(players).forEach(p => { if (p.role === "destroyer") p.freezeAt = g.startedAt + 15000; });
  if (hooks.afterRoles) hooks.afterRoles(g);   // 시험·영상 촬영용 (평소에는 비어 있음)
  room.game = g;
  room.phase = "play";
  pushFeed(g, "🌍 게임 시작! 시설을 복구하고 환경 파괴범을 찾아요.");
  return true;
}

function pushFeed(g, text) {
  g.feed.push({ t: now(), text });
  if (g.feed.length > 6) g.feed.shift();
}

function alivePlayers(g) { return Object.values(g.players).filter(p => p.alive); }

function makeQuestion(p) {
  const idx = rnd(BANK.length);
  const item = BANK[idx];
  let order;
  // 정답 자리가 바로 전과 같지 않게
  for (let t = 0; t < 10; t++) {
    order = shuffle([0, 1, 2, 3]);
    if (order.indexOf(item.a) !== p.lastPos) break;
  }
  const pos = order.indexOf(item.a);
  p.lastPos = pos;
  return { idx, q: item.q, c: order.map(i => item.c[i]), ans: pos };
}

function checkWin(cls, room) {
  const g = room.game;
  if (!g || g.winner) return;
  const ps = Object.values(g.players);
  const alive = ps.filter(p => p.alive);
  const aliveD = alive.filter(p => p.role === "destroyer").length;
  const aliveOthers = alive.length - aliveD;
  if (g.progress >= g.goal) return finish(cls, room, "guardian", "모든 시설을 복구했어요!");
  if (g.pollution >= 100) return finish(cls, room, "destroyer", "오염도가 100%가 되었어요!");
  if (ps.some(p => p.role === "destroyer") && aliveD === 0) return finish(cls, room, "guardian", "환경 파괴범을 모두 찾아냈어요!");
  if (g.settings.parityWin && aliveD > 0 && aliveD >= aliveOthers) return finish(cls, room, "destroyer", "남은 수호자가 파괴범보다 많지 않아요!");
  if (now() >= g.endsAt && !g.meeting) {
    const pr = Math.round(g.progress / g.goal * 100);
    if (pr > g.pollution) return finish(cls, room, "guardian", `시간 종료! 복구율 ${pr}% > 오염도 ${g.pollution}%`);
    return finish(cls, room, "destroyer", `시간 종료! 오염도 ${g.pollution}% ≥ 복구율 ${pr}%`);
  }
}

function finish(cls, room, team, reason) {
  const g = room.game;
  g.winner = team;
  const winners = [];
  for (const p of Object.values(g.players)) {
    let win = false;
    if (p.role === team) win = true;
    if (p.job === "reporter") win = p.missionDone.length >= 3 && (p.alive || (p.scoop && p.scoop.ok));
    if (p.job === "trash") win = p.out === "ejected";
    if (p.job === "investor") win = !!p.side && p.side === team;
    p.win = win;
    const s = cls.students[p.cid];
    if (s) {
      s.games = (s.games || 0) + 1;
      if (win) {
        s.wins = (s.wins || 0) + 1;
        s.score = (s.score || 0) + (p.role === "guardian" ? 1 : 2);
      }
      s.correct = (s.correct || 0) + p.correct;
    }
    if (win) winners.push(p.name);
  }
  g.end = { team, reason, at: now() };
  g.meeting = null;
  room.phase = "ended";
  pushFeed(g, (team === "guardian" ? "🌱 환경 수호자 승리! " : "🏭 환경 파괴범 승리! ") + reason);
  dirtyRoom(cls, room);
}

function startMeeting(cls, room, by, reason, body) {
  const g = room.game;
  if (g.meeting || g.winner) return;
  if (g.sab) { g.sab.pausedLeft = Math.max(5000, g.sab.until - now()); }
  const alive = alivePlayers(g);
  alive.forEach((p, i) => {
    const ang = (i / alive.length) * Math.PI * 2;
    p.x = MAP.spawnPoints[i % MAP.spawnPoints.length][0];
    p.y = MAP.spawnPoints[i % MAP.spawnPoints.length][1];
    p.q = null;
  });
  Object.values(g.players).forEach(p => { p.q = null; });
  g.meeting = {
    by: by.name, byCid: by.cid, reason, body: body ? body.name : null,
    endsAt: now() + g.settings.meetingTime * 1000,
    voteFrom: now() + 15000,
    votes: {}, chat: [],
  };
  g.bodies = [];
  room.phase = "meeting";
  pushFeed(g, reason === "report" ? `📢 ${by.name}님이 오염된 친구(${body.name})를 발견했어요!` : `🚨 ${by.name}님이 긴급회의를 열었어요!`);
  dirtyRoom(cls, room);
}

function endMeeting(cls, room) {
  const g = room.game;
  const m = g.meeting;
  if (!m) return;
  const tally = {};
  for (const [voter, target] of Object.entries(m.votes)) {
    if (!g.players[voter] || !g.players[voter].alive) continue;
    tally[target] = (tally[target] || 0) + 1;
  }
  let best = null, bestN = 0, tie = false;
  for (const [t, n] of Object.entries(tally)) {
    if (n > bestN) { best = t; bestN = n; tie = false; }
    else if (n === bestN) tie = true;
  }
  let ejected = null;
  if (best && best !== "skip" && !tie) {
    const p = g.players[best];
    if (p && p.alive) { p.alive = false; p.out = "ejected"; ejected = p; }
  }
  g.meeting = null;
  const roleName = ejected ? roleLabel(ejected) : null;
  g.result = {
    ejected: ejected ? ejected.name : null,
    ejectedCid: ejected ? ejected.cid : null,
    voters: Object.values(g.players).filter(p => p.alive || p === ejected).map(p => p.cid),
    color: ejected ? ejected.color : null,
    skin: ejected ? ejected.skin : null,
    role: ejected && g.settings.revealRole ? roleName : null,
    trash: ejected && ejected.job === "trash",
    tally, until: now() + 10000,      // 표 공개(약 3.5초) → 추방/생존 발표
  };
  room.phase = "result";
  if (ejected) {
    pushFeed(g, `🚀 ${ejected.name}님이 추방되었어요.` + (g.settings.revealRole ? ` (${roleName})` : ""));
    if (ejected.job === "trash") pushFeed(g, `🗑️ 쓰레기 괴물 ${ejected.name}님이 추방되어 승리 조건을 이뤘어요!`);
  } else pushFeed(g, "🤷 아무도 추방되지 않았어요.");
  dirtyRoom(cls, room);
}

function resumePlay(cls, room) {
  const g = room.game;
  g.result = null;
  room.phase = "play";
  const t = now();
  if (g.sab) g.sab.until = t + (g.sab.pausedLeft || 20000);
  g.sabAt = Math.max(g.sabAt, t + 15000);
  Object.values(g.players).forEach(p => { if (p.role === "destroyer") p.freezeAt = Math.max(p.freezeAt, t + 15000); });
  // 회의하는 동안 흐른 시간만큼 제한 시간 연장 없음(수업 시간 고려)
  checkWin(cls, room);
  dirtyRoom(cls, room);
}

function roleLabel(p) {
  if (p.role === "destroyer") return "환경 파괴범";
  if (p.role === "guardian") return "환경 수호자";
  return { reporter: "중립 · 환경 기자", trash: "중립 · 쓰레기 괴물", investor: "중립 · 환경 투자자" }[p.job] || "중립";
}

// 투자자가 편을 고를 수 있는지
function investorReady(g, p) {
  return p.job === "investor" && !p.side && p.coins >= 3 && (now() - g.startedAt >= 180000 || g.pollution >= 40);
}

// ---------------- 상태 보내기 ----------------
function publicPlayer(p) {
  return { cid: p.cid, name: p.name, color: p.color, skin: p.skin, alive: p.alive, out: p.out };
}

function viewFor(cls, room, cid) {
  const g = room.game;
  const base = {
    phase: room.phase, roomName: room.name, roomId: room.id,
    members: room.order.filter(c => cls.students[c]).map(c => ({ cid: c, name: cls.students[c].name, online: !!cls.students[c].socketId })),
  };
  if (!g) return base;
  const me = g.players[cid];
  const v = Object.assign(base, {
    t: now(),
    startedAt: g.startedAt, endsAt: g.endsAt,
    goal: g.goal, goalCount: g.goalCount, progress: g.progress, pollution: g.pollution,
    sab: g.sab ? { fac: g.sab.fac, until: g.meeting || g.result ? null : g.sab.until, left: g.sab.pausedLeft, fixers: g.sab.fixers.length, need: FIX_NEED } : null,
    bodies: g.bodies,
    restored: g.restored,
    players: Object.values(g.players).map(publicPlayer),
    feed: g.feed,
    settings: { revealRole: g.settings.revealRole, meetingTime: g.settings.meetingTime },
    counts: roleCounts(Object.keys(g.players).length),
  });
  if (g.meeting) {
    const m = g.meeting;
    v.meeting = {
      by: m.by, reason: m.reason, body: m.body, endsAt: m.endsAt, voteFrom: m.voteFrom,
      voted: Object.keys(m.votes), chat: m.chat, myVote: m.votes[cid] || null,
    };
  }
  if (g.result) v.result = g.result;
  if (g.end) {
    v.end = g.end;
    v.reveal = Object.values(g.players).map(p => ({ cid: p.cid, name: p.name, color: p.color, skin: p.skin, role: p.role, job: p.job, label: roleLabel(p), win: p.win, alive: p.alive, correct: p.correct }));
  }
  if (me) {
    v.me = {
      cid, role: me.role, job: me.job, label: roleLabel(me), color: me.color, skin: me.skin, alive: me.alive, out: me.out,
      x: Math.round(me.x), y: Math.round(me.y),
      emergency: me.emergency, lockUntil: me.lockUntil, correct: me.correct,
      stationRest: me.stationRest,
      q: me.q ? { q: me.q.q, c: me.q.c, station: me.q.station, purpose: me.q.purpose } : null,
    };
    if (me.role === "destroyer") {
      v.me.team = Object.values(g.players).filter(p => p.role === "destroyer").map(p => p.cid);
      v.me.energy = g.energy; v.me.energyMax = ENERGY_MAX;
      v.me.sabAt = g.sabAt; v.me.freezeAt = me.freezeAt;
    }
    if (me.job === "reporter") { v.me.missions = me.missions; v.me.missionDone = me.missionDone; v.me.scoop = me.scoop; }
    if (me.job === "investor") { v.me.coins = me.coins; v.me.side = me.side; v.me.ready = investorReady(g, me); v.me.readyAt = g.startedAt + 180000; }
  }
  return v;
}

function teacherView(cls) {
  const rooms = Object.values(cls.rooms).map(r => {
    const g = r.game;
    const o = { id: r.id, name: r.name, phase: r.phase, members: r.order.filter(c => cls.students[c]).map(c => ({ cid: c, name: cls.students[c].name, online: !!cls.students[c].socketId })) };
    if (g) {
      o.progress = Math.round(g.progress / g.goal * 100);
      o.pollution = g.pollution;
      o.endsAt = g.endsAt; o.startedAt = g.startedAt;
      o.sab = g.sab ? g.sab.fac : null;
      o.end = g.end;
      o.feed = g.feed.slice(-3);
      o.players = Object.values(g.players).map(p => ({ name: p.name, color: p.color, skin: p.skin, label: roleLabel(p), role: p.role, alive: p.alive, out: p.out, correct: p.correct, win: p.win }));
    }
    return o;
  });
  const students = Object.values(cls.students).map(s => ({ cid: s.cid, name: s.name, online: !!s.socketId, roomId: s.roomId, score: s.score || 0, wins: s.wins || 0, games: s.games || 0, correct: s.correct || 0 }));
  return { code: cls.code, settings: cls.settings, rooms, students, t: now() };
}

const dirty = new Set();
function dirtyRoom(cls, room) { dirty.add(cls.code + "|" + room.id); }
function dirtyClass(cls) { dirty.add(cls.code + "|*"); }

function sendRoom(cls, room) {
  for (const cid of room.order) {
    const s = cls.students[cid];
    if (s && s.socketId) io.to(s.socketId).emit("state", viewFor(cls, room, cid));
  }
}
function sendTeacher(cls) {
  const v = teacherView(cls);
  for (const sid of cls.teacherSockets) io.to(sid).emit("tstate", v);
}
function sendLobbyStudent(cls, s) {
  if (!s.socketId) return;
  if (s.roomId && cls.rooms[s.roomId]) io.to(s.socketId).emit("state", viewFor(cls, cls.rooms[s.roomId], s.cid));
  else io.to(s.socketId).emit("state", { phase: "wait" });
}
function sendAllClass(cls) {
  for (const s of Object.values(cls.students)) sendLobbyStudent(cls, s);
  sendTeacher(cls);
}

// ---------------- 반복(틱) ----------------
let tickN = 0;
setInterval(() => {
  tickN++;
  const t = now();
  for (const cls of Object.values(classes)) {
    for (const room of Object.values(cls.rooms)) {
      const g = room.game;
      if (!g) continue;
      if (room.phase === "play") {
        // 고장 시간 초과
        if (g.sab && t >= g.sab.until) {
          const fac = MAP.roomById(g.sab.fac);
          g.pollution = Math.min(100, g.pollution + POLLUTION_HIT);
          pushFeed(g, `☠️ ${fac.name} 수리 실패! 오염도 +${POLLUTION_HIT}%`);
          g.sab = null;
          dirtyRoom(cls, room);
        }
        checkWin(cls, room);
        // 위치 방송 (10회/초)
        const pos = Object.values(g.players).map(p => [p.cid, Math.round(p.x), Math.round(p.y), p.alive ? 1 : 0]);
        for (const cid of room.order) {
          const s = cls.students[cid];
          if (s && s.socketId) io.to(s.socketId).volatile.emit("pos", pos);
        }
      } else if (room.phase === "meeting") {
        const m = g.meeting;
        if (m && t >= m.endsAt) endMeeting(cls, room);
      } else if (room.phase === "result") {
        if (g.result && t >= g.result.until) resumePlay(cls, room);
      }
      if (tickN % 10 === 0 && (room.phase === "play" || room.phase === "meeting")) dirtyRoom(cls, room);
    }
    if (tickN % 10 === 0 && cls.teacherSockets.size) sendTeacher(cls);
  }
  for (const key of dirty) {
    const [code, rid] = key.split("|");
    const cls = classes[code];
    if (!cls) continue;
    if (rid === "*") sendAllClass(cls);
    else if (cls.rooms[rid]) sendRoom(cls, cls.rooms[rid]);
  }
  if (dirty.size) {
    const codes = new Set([...dirty].map(k => k.split("|")[0]));
    dirty.clear();
    for (const c of codes) if (classes[c]) sendTeacher(classes[c]);
  }
}, 100);

// 오래된 반 정리 (12시간)
setInterval(() => {
  for (const [code, cls] of Object.entries(classes)) if (now() - cls.createdAt > 12 * 3600000 && !cls.teacherSockets.size) delete classes[code];
}, 600000);

// ---------------- 소켓 ----------------
io.on("connection", (socket) => {
  let ctx = null; // {cls, cid} or {cls, teacher:true}

  const getPlay = () => {
    if (!ctx || !ctx.cid) return null;
    const cls = classes[ctx.cls.code];
    if (!cls) return null;
    const s = cls.students[ctx.cid];
    if (!s || !s.roomId) return null;
    const room = cls.rooms[s.roomId];
    if (!room || !room.game) return null;
    const p = room.game.players[ctx.cid];
    if (!p) return null;
    return { cls, room, g: room.game, p };
  };
  const toast = (msg) => socket.emit("toast", msg);

  // ----- 교사 -----
  socket.on("t:create", (_, cb) => {
    const cls = makeClass();
    ctx = { cls, teacher: true };
    cls.teacherSockets.add(socket.id);
    cb && cb({ ok: true, code: cls.code, key: cls.key });
    sendTeacher(cls);
  });
  socket.on("t:resume", ({ code, key }, cb) => {
    const cls = classes[code];
    if (!cls || cls.key !== key) return cb && cb({ ok: false });
    ctx = { cls, teacher: true };
    cls.teacherSockets.add(socket.id);
    cb && cb({ ok: true, code });
    sendTeacher(cls);
  });
  const T = (fn) => (data, cb) => {
    if (!ctx || !ctx.teacher) return cb && cb({ ok: false });
    const cls = classes[ctx.cls.code];
    if (!cls) return cb && cb({ ok: false });
    const r = fn(cls, data || {});
    cb && cb(r || { ok: true });
    dirtyClass(cls);
  };
  socket.on("t:assign", T((cls) => { autoAssign(cls); }));
  socket.on("t:settings", T((cls, d) => {
    const s = cls.settings;
    const num = (v, lo, hi, def) => { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : def; };
    s.perGuardian = num(d.perGuardian, 2, 10, s.perGuardian);
    s.timeLimit = num(d.timeLimit, 3, 30, s.timeLimit);
    s.sabTime = num(d.sabTime, 20, 120, s.sabTime);
    s.sabCd = num(d.sabCd, 15, 120, s.sabCd);
    s.freezeCd = num(d.freezeCd, 15, 120, s.freezeCd);
    s.meetingTime = num(d.meetingTime, 40, 180, s.meetingTime);
    s.revealRole = !!d.revealRole;
    s.parityWin = !!d.parityWin;
    if (Array.isArray(d.neutralJobs)) {
      const ok = d.neutralJobs.filter(j => ["reporter", "trash", "investor"].includes(j));
      if (ok.length) s.neutralJobs = ok;
    }
  }));
  socket.on("t:start", T((cls, d) => {
    let n = 0;
    for (const room of Object.values(cls.rooms)) {
      if (d.roomId && room.id !== d.roomId) continue;
      if (room.phase === "lobby" || room.phase === "ended") if (startGame(cls, room)) n++;
    }
    return { ok: true, started: n };
  }));
  socket.on("t:stop", T((cls, d) => {
    for (const room of Object.values(cls.rooms)) {
      if (d.roomId && room.id !== d.roomId) continue;
      room.game = null; room.phase = "lobby";
    }
  }));
  socket.on("t:move", T((cls, d) => {
    const s = cls.students[d.cid];
    if (!s) return;
    const from = s.roomId && cls.rooms[s.roomId];
    if (from && from.game && from.phase !== "ended" && from.phase !== "lobby") return { ok: false, msg: "게임 중인 모둠에서는 옮길 수 없어요." };
    if (from) from.order = from.order.filter(c => c !== s.cid);
    let to = d.roomId === "new" ? makeRoom(cls) : cls.rooms[d.roomId];
    if (to && to.game && to.phase !== "ended" && to.phase !== "lobby") return { ok: false, msg: "게임 중인 모둠으로는 옮길 수 없어요." };
    s.roomId = to ? to.id : null;
    if (to) to.order.push(s.cid);
  }));
  socket.on("t:kick", T((cls, d) => {
    const s = cls.students[d.cid];
    if (!s) return;
    const room = s.roomId && cls.rooms[s.roomId];
    if (room) {
      room.order = room.order.filter(c => c !== s.cid);
      if (room.game && room.game.players[s.cid] && !room.game.winner) {
        const p = room.game.players[s.cid];
        p.alive = false; p.out = "left";
      }
    }
    if (s.socketId) io.to(s.socketId).emit("kicked");
    delete cls.students[d.cid];
  }));
  socket.on("t:clearRooms", T((cls) => {
    for (const s of Object.values(cls.students)) s.roomId = null;
    cls.rooms = {}; cls.roomSeq = 1;
  }));
  socket.on("t:resetScores", T((cls) => {
    for (const s of Object.values(cls.students)) { s.score = 0; s.wins = 0; s.games = 0; s.correct = 0; }
  }));

  // ----- 학생 -----
  socket.on("join", ({ code, name, cid }, cb) => {
    code = clean(code, 6);
    name = clean(name, 10);
    const cls = classes[code];
    if (!cls) return cb && cb({ ok: false, msg: "반 번호를 다시 확인해 주세요." });
    if (!name) return cb && cb({ ok: false, msg: "이름을 입력해 주세요." });
    let s = cid && cls.students[cid];
    if (!s) {
      const same = Object.values(cls.students).find(x => x.name === name);
      if (same && same.socketId && io.sockets.sockets.get(same.socketId)) return cb && cb({ ok: false, msg: "같은 이름이 이미 들어와 있어요. 번호를 붙여 주세요. (예: 민준2)" });
      if (same) s = same; // 새로고침 등으로 다시 들어온 경우
    }
    if (!s) {
      cid = "S" + Math.random().toString(36).slice(2, 10);
      s = cls.students[cid] = { cid, name, socketId: null, roomId: null, score: 0, wins: 0, games: 0, correct: 0 };
    }
    if (s.socketId && s.socketId !== socket.id) { const old = io.sockets.sockets.get(s.socketId); if (old) old.emit("kicked", "다른 기기에서 접속했어요."); }
    s.socketId = socket.id;
    ctx = { cls, cid: s.cid };
    cb && cb({ ok: true, cid: s.cid, name: s.name, code });
    sendLobbyStudent(cls, s);
    dirtyClass(cls);
  });

  socket.on("move", (d) => {
    const P = getPlay(); if (!P) return;
    const { room, p } = P;
    if (room.phase !== "play") return;
    const x = Number(d && d.x), y = Number(d && d.y);
    if (!isFinite(x) || !isFinite(y)) return;
    const t = now();
    const maxD = SPEED * Math.max(0.05, Math.min(0.5, (t - p.lastMove) / 1000)) * 1.6 + 20;
    p.lastMove = t;
    if (Math.hypot(x - p.x, y - p.y) > maxD) return socket.emit("snap", { x: p.x, y: p.y });
    if (!MAP.isWalkable(x, y)) return;
    p.x = x; p.y = y;
  });

  socket.on("use", ({ station }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "play" || t0(g)) return;
    const st = MAP.stations.find(s => s.id === station);
    if (!st) return;
    if (dist(p, st) > USE_RANGE) return toast("장치에 더 가까이 가세요.");
    if (now() < p.lockUntil) return toast("잠깐! 조금 뒤에 다시 풀 수 있어요.");
    const broken = g.sab && g.sab.fac === st.room;
    if (!broken && p.stationRest[st.id] && now() < p.stationRest[st.id]) return toast("이 장치는 방금 고쳤어요. 다른 시설로 가 보세요!");
    if (broken && !p.alive) return toast("유령은 고장 수리를 할 수 없어요.");
    const q = makeQuestion(p);
    p.q = Object.assign(q, { station: st.id, purpose: broken ? "fix" : "task" });
    dirtyRoom(cls, room);
  });

  socket.on("closeQ", () => {
    const P = getPlay(); if (!P) return;
    P.p.q = null; dirtyRoom(P.cls, P.room);
  });

  socket.on("answer", ({ choice }, cb) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    const q = p.q;
    if (!q || room.phase !== "play") return;
    p.q = null;
    const st = MAP.stations.find(s => s.id === q.station);
    const right = Number(choice) === q.ans;
    const res = { right, answer: q.c[q.ans], msg: "" };
    if (!right) {
      p.wrong++;
      p.lockUntil = now() + WRONG_LOCK;
      res.msg = "아쉬워요! 정답을 확인하고 4초 뒤에 다시 도전해요.";
    } else {
      p.correct++;
      p.stationRest[st.id] = now() + STATION_REST;
      const fac = MAP.roomById(st.room);
      const countsForGuard = p.role === "guardian" || (p.job === "investor" && p.side === "guardian");
      const countsForDestroy = p.role === "destroyer" || (p.job === "investor" && p.side === "destroyer");
      if (q.purpose === "fix" && g.sab && g.sab.fac === st.room) {
        if (p.alive && !countsForDestroy && !g.sab.fixers.includes(p.cid)) {
          g.sab.fixers.push(p.cid);
          if (g.sab.fixers.length >= FIX_NEED) {
            pushFeed(g, `🔧 ${fac.name} 수리 완료!`);
            g.restored[st.room] = now();
            g.sab = null;
          }
        }
        res.msg = g.sab ? `수리 중이에요! 친구 한 명이 더 문제를 풀어야 해요. (${g.sab.fixers.length}/${FIX_NEED})` : "수리 완료! 시설이 다시 움직여요.";
        if (countsForDestroy) res.msg = "수리하는 척 성공! (파괴범의 답은 수리에 들어가지 않아요)";
      } else {
        if (countsForGuard) {
          g.progress += p.alive ? 2 : 1;
          res.msg = p.alive ? `${fac.name} 복구! 복구율이 올랐어요.` : "유령의 힘으로 복구! (절반 점수)";
        } else if (countsForDestroy) {
          if (g.energy < ENERGY_MAX) g.energy++;
          res.msg = `정답! 파괴 에너지 +1 (지금 ${g.energy}/${ENERGY_MAX})`;
        } else if (p.job === "reporter") {
          if (p.missions.includes(st.room) && !p.missionDone.includes(st.room)) {
            p.missionDone.push(st.room);
            res.msg = `취재 성공! ${fac.name} 기사 완성 (${p.missionDone.length}/3)`;
          } else res.msg = "정답! (이 시설은 취재 대상이 아니에요)";
        } else if (p.job === "investor") {
          p.coins++;
          res.msg = `정답! 투자 코인 +1 (지금 ${p.coins}개)`;
        } else res.msg = "정답! 아무도 모르게 친구들 사이에 섞여 있어요.";
      }
    }
    cb && cb(res);
    checkWin(cls, room);
    dirtyRoom(cls, room);
  });

  socket.on("sabotage", ({ fac }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "play" || p.role !== "destroyer") return;
    if (!MAP.facilities.includes(fac)) return;
    if (g.sab) return toast("이미 고장 난 시설이 있어요.");
    if (now() < g.sabAt) return toast("아직 방해를 할 수 없어요.");
    if (g.energy < 1) return toast("파괴 에너지가 없어요. 문제를 맞혀 에너지를 모으세요.");
    g.energy--;
    g.sab = { fac, until: now() + g.settings.sabTime * 1000, fixers: [], by: p.cid };
    g.sabAt = now() + g.settings.sabCd * 1000;
    pushFeed(g, `⚠️ ${MAP.roomById(fac).name}이(가) 고장 났어요! ${g.settings.sabTime}초 안에 2명이 문제를 풀어 고쳐요.`);
    dirtyRoom(cls, room);
  });

  socket.on("freeze", ({ target }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "play" || p.role !== "destroyer" || !p.alive) return;
    const v = g.players[target];
    if (!v || !v.alive || v.role === "destroyer") return;
    if (now() < p.freezeAt) return toast("아직 오염시킬 수 없어요.");
    if (dist(p, v) > FREEZE_RANGE) return toast("더 가까이 가야 해요.");
    v.alive = false; v.out = "frozen"; v.q = null;
    g.bodies.push({ cid: v.cid, name: v.name, color: v.color, skin: v.skin, x: Math.round(v.x), y: Math.round(v.y) });
    p.freezeAt = now() + g.settings.freezeCd * 1000;
    io.to(cls.students[v.cid] && cls.students[v.cid].socketId || "_").emit("frozen", { by: null });
    checkWin(cls, room);
    dirtyRoom(cls, room);
  });

  socket.on("report", ({ body }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "play" || !p.alive) return;
    const b = g.bodies.find(x => x.cid === body);
    if (!b || dist(p, b) > REPORT_RANGE) return;
    startMeeting(cls, room, p, "report", b);
  });

  socket.on("emergency", () => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "play" || !p.alive) return;
    if (p.emergency <= 0) return toast("긴급회의는 한 판에 한 번만 열 수 있어요.");
    if (dist(p, MAP.button) > USE_RANGE + 10) return toast("본부의 긴급회의 버튼 앞으로 가세요.");
    if (now() - g.startedAt < 15000) return toast("게임 시작 15초 뒤부터 열 수 있어요.");
    p.emergency--;
    startMeeting(cls, room, p, "emergency");
  });

  socket.on("say", ({ text }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (room.phase !== "meeting" || !g.meeting || !p.alive) return;
    text = clean(text, 80);
    if (!text) return;
    const m = g.meeting;
    const mine = m.chat.filter(c => c.cid === p.cid && now() - c.t < 3000);
    if (mine.length) return toast("조금 천천히 말해요!");
    m.chat.push({ cid: p.cid, name: p.name, color: p.color, skin: p.skin, text, t: now() });
    if (m.chat.length > 60) m.chat.shift();
    dirtyRoom(cls, room);
  });

  socket.on("vote", ({ target }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    const m = g.meeting;
    if (room.phase !== "meeting" || !m || !p.alive) return;
    if (now() < m.voteFrom) return toast("토론 시간이 끝나면 투표할 수 있어요.");
    if (m.votes[p.cid]) return;
    if (target !== "skip" && !(g.players[target] && g.players[target].alive)) return;
    m.votes[p.cid] = target;
    const alive = alivePlayers(g);
    if (alive.every(a => m.votes[a.cid])) m.endsAt = Math.min(m.endsAt, now() + 1500);
    dirtyRoom(cls, room);
  });

  socket.on("scoop", ({ target }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (p.job !== "reporter" || p.scoop || !p.alive || room.phase !== "play") return;
    if (p.missionDone.length < 3) return toast("취재 3곳을 먼저 끝내야 특종을 낼 수 있어요.");
    const v = g.players[target];
    if (!v || v.cid === p.cid) return;
    p.scoop = { target: v.cid, name: v.name, ok: v.role === "destroyer" };
    dirtyRoom(cls, room);
  });

  socket.on("invest", ({ side }) => {
    const P = getPlay(); if (!P) return;
    const { cls, room, g, p } = P;
    if (!investorReady(g, p) || !["guardian", "destroyer"].includes(side)) return;
    p.side = side;
    dirtyRoom(cls, room);
  });

  socket.on("disconnect", () => {
    if (!ctx) return;
    const cls = classes[ctx.cls.code];
    if (!cls) return;
    if (ctx.teacher) { cls.teacherSockets.delete(socket.id); return; }
    const s = cls.students[ctx.cid];
    if (s && s.socketId === socket.id) { s.socketId = null; dirtyClass(cls); }
  });
});

function t0(g) { return now() < g.startedAt; }

const PORT = process.env.PORT || 3000;
if (require.main === module) server.listen(PORT, () => console.log("에코 스파이 서버: http://localhost:" + PORT));
module.exports = { app, server, classes, hooks, splitSizes, roleCounts };
