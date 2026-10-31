// 화면 시험용 서버: 상태를 직접 바꾸는 /dbg 주소가 추가됨 (배포에는 쓰지 않음)
const { app, server, classes } = require("../server.js");
const MAP = require("../public/map.js");
app.get("/dbg", (req, res) => {
  const u = new URL(req.url, "http://x");
  const cls = Object.values(classes).sort((a, b) => a.createdAt - b.createdAt).pop();
  const room = cls && Object.values(cls.rooms)[0];
  const g = room && room.game;
  const act = u.searchParams.get("a");
  const out = {};
  if (act === "roles" && g) out.players = Object.values(g.players).map(p => ({ name: p.name, role: p.role, job: p.job, cid: p.cid }));
  if (act === "sab" && g) { g.sab = { fac: g.__sabFac || "water", until: Date.now() + 60000, fixers: [], by: "" }; g.progress = 14; g.pollution = 25; g.energy = 3; }
  if (act === "body" && g) { const v = Object.values(g.players).find(p => p.role === "guardian" && p.name !== u.searchParams.get("keep")); v.alive = false; v.out = "frozen"; g.bodies.push({ cid: v.cid, name: v.name, color: v.color, skin: v.skin, x: 1010, y: 712 }); }
  if (act === "place" && g) { const p = Object.values(g.players).find(p => p.name === u.searchParams.get("n")); p.x = +u.searchParams.get("x"); p.y = +u.searchParams.get("y"); }
  if (act === "fixing" && g && g.sab) { g.sab.fixers = ["x"]; }
  if (act === "restored" && g) { g.sab = null; g.restored.water = Date.now(); g.restored.solar = Date.now(); }
  if (act === "end" && g) { g.progress = g.goal; }
  res.setHeader("content-type", "application/json"); res.end(JSON.stringify(out));
});
server.listen(3456, () => console.log("dev 3456"));
