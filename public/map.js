// 맵 정보 — 서버와 학생 화면이 함께 씁니다. (tools/build_map.py 가 만든 파일)
(function (root) {
  const MAP = {
    W: 1800,
    H: 1200,
    CELL: 10,
    COLS: 180,
    ROWS: 120,
    // 걸을 수 있는 곳: 10px 칸마다 1비트 (그림의 돌길 + 손으로 고친 부분)
    WALK: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsAAAAAAAAAAAAAAAAAAAAAAAHAAAef+A4AAAAAAAAAAAAAAAAAAAAAPvAA////8AAAAAAAAAAAAAAAAAAAAAf/gB////+AAAAAAAAAAAAAAAAAAAAAf/4B////+AAAAAAAAAAAAAAAAAAAAAf//x/////eAAAAAAAAAAAAAAAAAAAAf//7//////AMAAAAAAAAAAAAAAAAAAP/////////gfAADwAAAAAAAAAAAAAAHf//wAAB//4/vAH4AAAAAAAAAAAAAAAP//gAAA//9//gP8AAAAAAAAAAAAAAAAf/AAAB/////0/8AAAAAAAAAAAAAAAAP/gAAB///////8AAAAAAAAAAAAAAAAD/wAAB/f/////8AAAAAAAAAAAAAAAAAPwAAD+A/////4AAAAAAAAAAAAAAAAAHwAAB8Af////wAAAAAAAAAAAAAAAAAH5gBj8AH///wAAAAAAAAAAAAAAAAAAH/gB/8AD//zgAAAAAAAAAAAAAAAAAAP/gB/8AAAABAAAAAAAAAAAAAAAAAAAP/gB/+AAAAAAAAAAAAAAAAAAAAAAAAP/gB/+AAAAAAAAAAAAAAAAAAAAAAAAP/wD/8AAAAAAAAAAAAAAAAAAAAAAAAP/AA/8AAAAAAAAAAAAAAAAAAAAGAAAP8AAP8AAAMgAAAAAAAAAAAAAAAPAAAf4AAH+AAD/wAAAAAAAAAAAAAAAfgAA/wAAD/AAH/4AAAAAAAAAAAAAAAPwAA/gAAB/AAP/wAAAAAAAAAAAAAAAH4AA/AAAA/AAP8gAAAAAAAAAAAAAAAD8AB/AAAA/gAP4AAAAAAAAAAAAAAAAB8AB+AAAAfwAPwAAAAAAAAAAAAAAAAB+AD+AAAAf4APwAAAAAAAAAAAAAAAAB+AD+AAAAf8AfwAAAAAAAAAAAAAAAAB/AD8AAAAP4D/wAAAAAAAAAAAAAAAAD+EH8AAAAP9n/wAAAAAAAAAAAAAAAAH/P/8AAAAP///4AAAAAAAAAAAAAAAAH///8AAAAP///8AAAAAAAAAAAAAAAAH///8AAAAP///8AAAAAAAAAAAAAAAAP///8AAAAP///8AAAAAAAAAAAAAAAAP///8AAAAP///4AAAAAAAAAAAAAAAAH///+AAAAf///wAAAAAAAAAAAAAAAAD/gf+AAAAf+B/wAAAAAAAAAAAAAAAAB/AP+AAAAf8AvwAAAAAAAAAAAADxgAD/AH/AAAA/4AH4AAA4AAAAAAAAH7wAH/AD/AAAA/wAH8AAB8AAAAAAAAP/4AH+AB/gAAB/gAH48AD+AAAAAAAAP///j8AA/wAAD/gAH9+B/+AAAAAAAAP///3+AAf4AAH/AAH////+AAAAAAAAP////8AAf8AAP+AAH////+AAAAAAAAH////4AAf/AA//AAD////8AAAAAAAAD////wAA//wD//gAB////4AAAAAAAAAAv//gAAf/////AAA///AAAAAAAAAAAAH//AAAf////+AAAf/+AAAAAAAAAAAAD/8AAAf////+AAAH/sAAAAAAAAAAAAA74AAAf///3+AAADfAAAAAAAAAAAAAABwAAAf4P8D+AAAAMAAAAAAAAAAAAAAAgAAAfwAAD8AAAAAAAAAAAAAAAAAAAAAAAAfgAAB8AAAAAAAAAAAAAAAAAAAAAAAAfgAAB+AAAAAAAAAAAAAAAAAAAAAAAAfgAAB+AAAAAAAAAAAAAAAAAAAAAAAAfAAAB+AAAAAAAAAAAAAAAAAAAAAAAAfgAAB8AAAAAAAAAAAAAAAAAAAAAAAAfgAAB+AAAAAAAAAAAAAAAAAAAAAAAAfwAAB/AAAAAAAAAAAAAAAAAAAAAAAAfgAAB/AAAAAAAAAAAAAAAAAAAAAAAAPgAAB+AAAAAAAAAAAAAAAAAAAAAAAAfgAAB/AAAAAAAAAAAAAAAAAAAAAAAA/wAAB/AAAAAAAAAAAAAAAAAAAAAAAB/gAAB/oAAAAAAAAAAAAAAAAAAAAAA//gAAA/+YAAAAAAAAAAAAAAAAAAAAB//AAAA//8AAAAADAAAAAAAAAAAAAAD//AAAA//+AAAAAHwAAAAAAAAAAAAAD//gAAAf//AAAAAf4AAAAAAAAAAAAAB//4P4EP//gAAAB/8AAAAAAAAAAAAAA/7+f+Of//gAAAH/4AAAAAAAAAAAAAA/x///////wAAAP/wAAAAAAAAAAAAAB/h/////4/wAAAf+AAAAAAAAAAAAAAD/B/////wf4AAA/4AAAAAAAAAAAAAAH+B/////gP8AAAfwAAAAAAAAAAAAAAP8A/////AH/jwA/gAAAAAAAAAAAAAAf4Af///+AH//4D/AAAAAAAAAAAAAAA/wAAAAAAAH////+AAAAAAAAAAAAAAH/6AAAAAAAD////+AAAAAAAAAAAAAB///AAAAAAAB/////AAAAAAAAAAAAQD///gAAAAAAAA////3AAAAAAAAAAA4H///AAAAAAAAAH////gAAAAAAAAAB8////gAAAAAAAADwD//wAAAAAAAAAB/////wAAAAAAAAAAAf/wAAAAAAAAAA///z/4AAAAAAAAAAAP/wAAAAAAAAAAb//h/4AAAAAAAAAAAH/wAAAAAAAAAAB/gA/wAAAAAAAAAAAD/gAAAAAAAAAAA/AAfgAAAAAAAAAAABnAAAAAAAAAAAA+AA/AAAAAAAAAAAAAAAAAAAAAAAAAAcAAeAAAAAAAAAAAAAAAAAAAAAAAAAAIAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    rooms: [{"id": "base", "name": "지구 본부", "en": "Eco Base", "x": 700, "y": 330, "w": 400, "h": 420}, {"id": "solar", "name": "태양광 발전소", "en": "Solar Plant", "x": 990, "y": 40, "w": 700, "h": 360}, {"id": "ocean", "name": "바다 청소 기지", "en": "Ocean Base", "x": 1010, "y": 730, "w": 680, "h": 390}, {"id": "recycle", "name": "재활용 센터", "en": "Recycling Center", "x": 0, "y": 380, "w": 560, "h": 370}, {"id": "water", "name": "정수장", "en": "Water Plant", "x": 1190, "y": 390, "w": 610, "h": 330}, {"id": "forest", "name": "숲", "en": "Forest", "x": 120, "y": 0, "w": 740, "h": 330}, {"id": "lab", "name": "연구 센터", "en": "Research Center", "x": 140, "y": 700, "w": 730, "h": 420}],
    stations: [{"id": "solar1", "room": "solar", "x": 1320, "y": 315, "icon": "☀️", "label": "태양광 발전기"}, {"id": "solar2", "room": "solar", "x": 1200, "y": 318, "icon": "🔋", "label": "배터리 창고"}, {"id": "ocean1", "room": "ocean", "x": 1225, "y": 985, "icon": "🌊", "label": "바다 쓰레기 수거"}, {"id": "ocean2", "room": "ocean", "x": 1450, "y": 1008, "icon": "🐢", "label": "거북이 구조"}, {"id": "recycle1", "room": "recycle", "x": 425, "y": 656, "icon": "♻️", "label": "분리배출함"}, {"id": "recycle2", "room": "recycle", "x": 310, "y": 641, "icon": "🥫", "label": "캔·병 압축기"}, {"id": "water1", "room": "water", "x": 1500, "y": 642, "icon": "🚰", "label": "정수 필터"}, {"id": "water2", "room": "water", "x": 1274, "y": 540, "icon": "💧", "label": "수도 밸브"}, {"id": "forest1", "room": "forest", "x": 650, "y": 252, "icon": "🌳", "label": "나무 심기"}, {"id": "forest2", "room": "forest", "x": 590, "y": 240, "icon": "🌱", "label": "온실 새싹"}],
    // 시설 고장·수리·복구 효과를 그릴 기준점
    anchors: {"solar": {"x": 1330, "y": 170}, "water": {"x": 1560, "y": 520}, "ocean": {"x": 1330, "y": 900}, "recycle": {"x": 370, "y": 520}, "forest": {"x": 600, "y": 120}},
    button: {"x": 900, "y": 705, "r": 38},
    spawn: { x: 900, y: 705 },
    spawnPoints: [[900, 704], [814, 681], [751, 618], [728, 532], [751, 446], [814, 383], [831, 375], [986, 383], [1049, 446], [1072, 532], [1049, 618], [986, 681]],
    facilities: ["solar", "ocean", "recycle", "water", "forest"],
  };
  // 비트맵 풀기
  const raw = typeof atob === "function" ? atob(MAP.WALK) : Buffer.from(MAP.WALK, "base64").toString("binary");
  const cells = new Uint8Array(MAP.COLS * MAP.ROWS);
  for (let i = 0; i < cells.length; i++) cells[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  MAP.cells = cells;
  const cellOk = (x, y) => {
    const c = Math.floor(x / MAP.CELL), r = Math.floor(y / MAP.CELL);
    return c >= 0 && r >= 0 && c < MAP.COLS && r < MAP.ROWS && cells[r * MAP.COLS + c] === 1;
  };
  MAP.isWalkable = function (x, y, pad) {
    pad = pad || 14;
    const d = pad * 0.7;
    return cellOk(x, y) && cellOk(x + pad, y) && cellOk(x - pad, y) && cellOk(x, y + pad) && cellOk(x, y - pad) &&
      cellOk(x + d, y + d) && cellOk(x - d, y + d) && cellOk(x + d, y - d) && cellOk(x - d, y - d);
  };
  MAP.roomAt = function (x, y) {
    for (const r of MAP.rooms) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    return null;
  };
  MAP.roomById = function (id) { return MAP.rooms.find(r => r.id === id); };
  if (typeof module !== "undefined" && module.exports) module.exports = MAP;
  else root.MAP = MAP;
})(this);
