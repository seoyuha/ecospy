// 가상 교사 1명 + 학생 8명으로 한 판을 끝까지 진행해 보는 시험
const assert = require("assert");
process.env.PORT = 0;
const { server, classes } = require("../server.js");
const { io: ioc } = require("socket.io-client");
const MAP = require("../public/map.js");
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let pass = 0;
const ok = (c, m) => { assert(c, m); pass++; console.log("  ✓", m); };

(async () => {
  await new Promise(r => server.listen(0, r));
  const url = "http://localhost:" + server.address().port;
  const teacher = ioc(url);
  const tr = await new Promise(r => teacher.emit("t:create", null, r));
  ok(tr.ok && tr.code, "교사가 반을 만듦 " + tr.code);
  const cls = classes[tr.code];

  const names = ["민준", "서연", "도윤", "하은", "지호", "수아", "예준", "지유"];
  const studs = [];
  for (const n of names) {
    const s = ioc(url);
    s.last = null; s.on("state", st => s.last = st);
    const r = await new Promise(res => s.emit("join", { code: tr.code, name: n }, res));
    s.cid = r.cid; studs.push(s);
  }
  ok(Object.keys(cls.students).length === 8, "학생 8명 입장");
  const dup = ioc(url);
  const dr = await new Promise(res => dup.emit("join", { code: tr.code, name: "민준" }, res));
  ok(!dr.ok, "같은 이름 중복 입장 막기");
  dup.close();

  await new Promise(r => teacher.emit("t:assign", {}, r));
  ok(Object.keys(cls.rooms).length === 1, "8명 → 1모둠 배정");
  await new Promise(r => teacher.emit("t:start", {}, r));
  const room = Object.values(cls.rooms)[0];
  const g = room.game;
  const ps = Object.values(g.players);
  const D = ps.filter(p => p.role === "destroyer"), N = ps.filter(p => p.role === "neutral"), G = ps.filter(p => p.role === "guardian");
  ok(D.length === 2 && N.length === 1 && G.length === 5, `역할 배정 파괴범2·중립1·수호자5 (중립: ${N[0].job})`);
  ok(g.goalCount === 20, "목표 20문제 (수호자 5명 × 4)");
  await wait(300);
  const sock = (p) => studs.find(s => s.cid === p.cid);
  ok(sock(G[0]).last.me.role === "guardian" && !sock(G[0]).last.me.team, "수호자는 파괴범 동료 정보를 못 받음");
  ok(sock(D[0]).last.me.team.length === 2, "파괴범은 동료를 알 수 있음");
  await wait(4100);

  // 문제 풀기 (가까이 데려가서)
  async function solve(p, stationId, right = true) {
    const st = MAP.stations.find(s => s.id === stationId);
    p.x = st.x + 20; p.y = st.y + 10; p.lockUntil = 0;
    const s = sock(p);
    s.emit("use", { station: stationId });
    await wait(60);
    assert(p.q, "문제가 나와야 함: " + p.name + " " + stationId);
    const choice = right ? p.q.ans : (p.q.ans + 1) % 4;
    return new Promise(res => s.emit("answer", { choice }, res));
  }
  let r = await solve(G[0], "solar1");
  ok(r.right && g.progress === 2, "수호자 정답 → 복구 +2점");
  r = await solve(G[1], "solar1", false);
  ok(!r.right && G[1].lockUntil > Date.now(), "오답 → 4초 잠금, 정답 알려줌: " + r.answer);
  G[0].lockUntil = 0;
  sock(G[0]).emit("use", { station: "solar1" }); await wait(60);
  ok(!G[0].q, "같은 장치는 바로 다시 못 풂");
  // 정답 위치 연속 같지 않음
  let same = 0, prev = -1;
  for (let i = 0; i < 30; i++) { const q = require("../server.js"); } // noop
  const p0 = G[2];
  for (let i = 0; i < 30; i++) { p0.stationRest = {}; const st = MAP.stations[i % 10]; p0.x = st.x; p0.y = st.y; sock(p0).emit("use", { station: st.id }); await wait(25); if (p0.q) { if (p0.q.ans === prev) same++; prev = p0.q.ans; } sock(p0).emit("closeQ"); await wait(10); }
  ok(same === 0, "정답 자리가 연속으로 같지 않음");

  // 파괴범 에너지·방해
  const e0 = g.energy;
  r = await solve(D[0], "ocean1");
  ok(r.right && g.energy === e0 + 1 && g.progress === 2, "파괴범 정답 → 에너지 +1, 복구율은 그대로");
  g.sabAt = 0;
  sock(D[0]).emit("sabotage", { fac: "water" }); await wait(60);
  ok(g.sab && g.sab.fac === "water", "방해 → 정수장 고장");
  r = await solve(D[1], "water1");
  ok(g.sab && g.sab.fixers.length === 0, "파괴범의 수리 답은 안 들어감");
  r = await solve(G[3], "water1");
  ok(g.sab && g.sab.fixers.length === 1, "수리 1/2");
  r = await solve(G[3], "water2");
  ok(g.sab && g.sab.fixers.length === 1, "같은 친구는 한 번만 수리에 들어감");
  r = await solve(G[4], "water2");
  ok(!g.sab, "다른 친구까지 풀어서 수리 완료");
  // 수리 실패 → 오염
  g.sabAt = 0; g.energy = 2;
  sock(D[0]).emit("sabotage", { fac: "forest" }); await wait(60);
  g.sab.until = Date.now() - 1; await wait(250);
  ok(g.pollution === 25 && !g.sab, "수리 시간 초과 → 오염도 25%");

  // 오염시키기 → 신고 → 회의
  D[0].freezeAt = 0; D[0].x = 900; D[0].y = 600; G[4].x = 930; G[4].y = 610;
  sock(D[0]).emit("freeze", { target: G[4].cid }); await wait(60);
  ok(!G[4].alive && g.bodies.length === 1, "파괴범이 수호자를 얼림");
  r = await solve(G[4], "forest1");
  ok(r.right, "유령도 문제를 풀 수 있음");
  G[0].x = 950; G[0].y = 620;
  sock(G[0]).emit("report", { body: G[4].cid }); await wait(150);
  ok(room.phase === "meeting" && g.bodies.length === 0, "신고 → 회의 시작");
  sock(G[1]).emit("say", { text: "I think " + D[0].name + " is a destroyer." }); await wait(60);
  ok(g.meeting.chat.length === 1, "회의 문장 말하기");
  sock(G[4]).emit("say", { text: "hello" }); await wait(60);
  ok(g.meeting.chat.length === 1, "유령은 말할 수 없음");
  g.meeting.voteFrom = 0;
  for (const p of ps) if (p.alive) sock(p).emit("vote", { target: p.role === "destroyer" ? "skip" : D[0].cid });
  await wait(1900);
  ok(room.phase === "result" && !D[0].alive && D[0].out === "ejected", "투표로 파괴범 1명 추방");
  ok(sock(G[0]).last.result && /파괴범/.test(sock(G[0]).last.result.role), "추방 역할 공개");
  g.result.until = 0; await wait(200);
  ok(room.phase === "play", "회의 끝나고 게임 다시 진행");

  // 중립 직업 확인
  const n = N[0];
  if (n.job === "reporter") {
    for (const f of n.missions) await solve(n, f + "1");
    ok(n.missionDone.length === 3, "기자 취재 3곳 완료");
    sock(n).emit("scoop", { target: D[1].cid }); await wait(60);
    ok(n.scoop && n.scoop.ok, "기자 특종 성공");
  } else if (n.job === "investor") {
    for (const s of ["solar2", "ocean2", "recycle1"]) await solve(n, s);
    g.startedAt -= 181000;
    sock(n).emit("invest", { side: "guardian" }); await wait(60);
    ok(n.side === "guardian", "투자자가 수호자 팀 선택");
  } else ok(n.job === "trash", "쓰레기 괴물");

  // 수호자 승리까지 문제 풀기
  let k = 0;
  while (!g.winner && k < 200) {
    const p = G.filter(x => x.alive)[k % 4];
    p.stationRest = {};
    await solve(p, MAP.stations[k % 10].id === "water1" ? "ocean2" : MAP.stations[k % 10].id);
    k++;
  }
  await wait(200);
  ok(g.winner === "guardian" && room.phase === "ended", "복구율 100% → 수호자 승리");
  const st = sock(G[0]).last;
  ok(st.reveal && st.reveal.length === 8, "끝나면 모든 역할 공개");
  ok(cls.students[G[0].cid].score === 1 && cls.students[D[1].cid].score === 0, "점수 기록 (수호자 승리 +1)");
  if (n.job === "reporter" || n.job === "investor") ok(n.win, "중립(" + n.job + ") 함께 승리");

  // 다시 하기 + 파괴범 승리(인원)
  await new Promise(r => teacher.emit("t:start", { roomId: room.id }, r));
  const g2 = room.game; await wait(4100);
  const P2 = Object.values(g2.players); const d2 = P2.filter(p => p.role === "destroyer");
  for (const v of P2) if (v.role !== "destroyer" && P2.filter(x => x.alive && x.role !== "destroyer").length > 2) { v.alive = false; v.out = "frozen"; }
  await wait(250);
  ok(g2.winner === "destroyer", "남은 인원이 파괴범 수 이하 → 파괴범 승리");

  // 시간 종료
  await new Promise(r => teacher.emit("t:start", { roomId: room.id }, r));
  const g3 = room.game; await wait(4100);
  g3.pollution = 50; g3.endsAt = Date.now() - 1; await wait(250);
  ok(g3.winner === "destroyer", "시간 종료 시 오염도가 높으면 파괴범 승리");

  // 재접속
  const re = ioc(url);
  const rr = await new Promise(res => re.emit("join", { code: tr.code, name: "서연", cid: studs[1].cid }, res));
  ok(rr.ok && rr.cid === studs[1].cid, "새로고침 후 같은 학생으로 다시 들어옴");

  // 25명 배정
  for (let i = 0; i < 17; i++) { const s = ioc(url); await new Promise(res => s.emit("join", { code: tr.code, name: "학생" + i }, res)); }
  await new Promise(r => teacher.emit("t:stop", {}, r));
  await new Promise(r => teacher.emit("t:assign", {}, r));
  const sizes = Object.values(cls.rooms).map(r => r.order.length).sort();
  ok(sizes.join(",") === "8,8,9", "25명 → 9·8·8명 모둠: " + sizes.join(","));

  console.log(`\n모두 통과: ${pass}개`);
  process.exit(0);
})().catch(e => { console.error("✗ 실패:", e.message); process.exit(1); });
