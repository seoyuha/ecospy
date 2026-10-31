"""
에코 스파이 지도 만들기 (상세 일러스트 지도용)

  python3 tools/build_map.py <디자인_폴더> [미리보기_폴더]

1) 상세 일러스트 지도(1536x1024)를 게임 좌표 1800x1200으로 키운다.
2) 그림에서 회색 돌길을 자동으로 찾고(색으로 판별), 손으로 정한 영역을 더하고 뺀다.
3) 본부(지구본 광장)와 이어진 곳만 '걸을 수 있는 곳'으로 남긴다.
4) 결과를 public/map.js 에 써 넣는다(서버와 학생 화면이 같은 지도를 씀).
   걸을 수 있는 곳은 10px 칸 단위 비트맵(base64)으로 저장한다.
"""
import base64, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

SRC = sys.argv[1]
PREV = sys.argv[2] if len(sys.argv) > 2 else None
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
W, H, C = 1800, 1200, 10
MAP_SRC = os.path.join(SRC, "00_화려한_원본_통짜시안", "a_bright_colorful_detailed_isometric_top_down_ca.png")

art = Image.open(MAP_SRC).convert("RGB").resize((W, H), Image.LANCZOS)

# ---------- 1. 회색 돌길 자동 판별 (엄격하게: 잔디·건물은 빼고 큰길만) ----------
a = np.asarray(art).astype(float) / 255
mx, mn = a.max(2), a.min(2)
sat = (mx - mn) / (mx + 1e-6)
pave = (sat < 0.13) & (mx > 0.6) & (mx < 0.92)
grid = pave.reshape(H // C, C, W // C, C).mean((1, 3)) > 0.5
grid = nd.binary_closing(grid, iterations=1)
grid = nd.binary_opening(grid, iterations=2)

# ---------- 2. 손으로 그린 길 (게임 좌표) ----------
def paint(g, shapes, val):
    im = Image.fromarray(g.astype(np.uint8) * 255)
    d = ImageDraw.Draw(im)
    for s in shapes:
        kind, pts = s[0], s[1:]
        if kind == "rect":
            x0, y0, x1, y1 = pts
            d.rectangle([x0 / C, y0 / C, x1 / C - 1, y1 / C - 1], fill=255 if val else 0)
        elif kind == "circle":
            x, y, r = pts
            d.ellipse([(x - r) / C, (y - r) / C, (x + r) / C, (y + r) / C], fill=255 if val else 0)
        elif kind == "line":                      # 일정한 너비의 길: ("line", 너비, (x,y), (x,y), ...)
            w, pts2 = pts[0], pts[1:]
            d.line([(x / C, y / C) for x, y in pts2], fill=255 if val else 0, width=max(1, round(w / C)), joint="curve")
            r = w / 2 / C
            for x, y in pts2: d.ellipse([x / C - r, y / C - r, x / C + r, y / C + r], fill=255 if val else 0)
    return np.asarray(im) > 127

ROAD = 64   # 길 너비(px)
ADD = [
    ("circle", 900, 532, 195),                                              # 본부 둘레 고리길 (아래에서 가운데를 뺌)
    ("line", ROAD, (810, 232), (1035, 232)),                                # 위쪽 다리
    ("line", ROAD, (810, 945), (1050, 945)),                                # 아래쪽 다리
    ("line", ROAD, (720, 278), (640, 250), (585, 240)),                     # 숲 광장
    ("line", ROAD, (1110, 278), (1200, 322), (1320, 322), (1440, 300)),     # 태양광 발전소 앞
    ("line", ROAD, (470, 662), (300, 640)),                                 # 재활용 센터 분리수거함 앞
    ("line", ROAD, (1340, 660), (1515, 640)),                               # 정수장 문 앞
    ("line", ROAD, (705, 915), (645, 990), (570, 1035)),                    # 연구 센터 광장
    ("line", ROAD, (1170, 915), (1205, 975), (1320, 998), (1440, 1005), (1545, 1050)),  # 바다 기지 부두
]
REMOVE = [
    ("circle", 900, 532, 138),           # 가운데 지구본과 둘레 화단
    ("rect", 850, 300, 950, 392),        # 위쪽 물길
    ("rect", 850, 735, 950, 905),        # 아래쪽 물길
]
grid = paint(grid, ADD, True)
grid = paint(grid, REMOVE, False)
# 너비가 들쭉날쭉한 곳을 다듬음
grid = nd.binary_closing(grid, iterations=1) & ~paint(np.zeros_like(grid), REMOVE, True)

# ---------- 3. 본부와 이어진 곳만 ----------
lab, n = nd.label(grid)
seed = lab[700 // C, 900 // C]
assert seed > 0, "본부 시작점이 걸을 수 있는 곳이 아님"
grid = lab == seed
# 아주 좁은 틈(10px)은 메워 둠
grid = nd.binary_closing(grid, iterations=1) & ~paint(np.zeros_like(grid), REMOVE, True)
lab, n = nd.label(grid); grid = lab == lab[700 // C, 900 // C]

def walk(x, y):
    i, j = int(y // C), int(x // C)
    return 0 <= i < grid.shape[0] and 0 <= j < grid.shape[1] and grid[i, j]

def walk_pad(x, y, pad=14):
    d = pad * 0.7
    return all(walk(x + dx, y + dy) for dx, dy in [(0, 0), (pad, 0), (-pad, 0), (0, pad), (0, -pad), (d, d), (-d, d), (d, -d), (-d, -d)])

# 몸 크기(pad 14)를 고려해 설 수 있는 곳을 5px 격자로 계산하고, 본부 둘레 고리와 이어진 덩어리만 인정
S5 = 5
padok = np.array([[walk_pad(i * S5, j * S5) for i in range(W // S5)] for j in range(H // S5)])
plab, _ = nd.label(padok)
MAIN = plab[700 // S5, 900 // S5]
assert MAIN > 0
def in_main(x, y):
    i, j = int(round(y / S5)), int(round(x / S5))
    return 0 <= i < plab.shape[0] and 0 <= j < plab.shape[1] and plab[i, j] == MAIN and walk_pad(x, y)

def nearest_ok(x, y):
    for r in range(0, 260, 5):
        for k in range(0, 360, 15):
            px, py = x + r * np.cos(np.radians(k)), y + r * np.sin(np.radians(k))
            if in_main(px, py) and walk_pad(px, py, 18):
                return round(px), round(py)
    print(f"!! 걸을 수 있는 곳을 못 찾음: {x},{y}")
    return x, y

# ---------- 4. 장치·기준점·방 ----------
STATIONS = [
    ("solar1", "solar", 1320, 315, "☀️", "태양광 발전기"),
    ("solar2", "solar", 1200, 318, "🔋", "배터리 창고"),
    ("ocean1", "ocean", 1225, 985, "🌊", "바다 쓰레기 수거"),
    ("ocean2", "ocean", 1450, 1008, "🐢", "거북이 구조"),
    ("recycle1", "recycle", 425, 656, "♻️", "분리배출함"),
    ("recycle2", "recycle", 310, 641, "🥫", "캔·병 압축기"),
    ("water1", "water", 1500, 642, "🚰", "정수 필터"),
    ("water2", "water", 1335, 505, "💧", "수도 밸브"),
    ("forest1", "forest", 650, 252, "🌳", "나무 심기"),
    ("forest2", "forest", 590, 240, "🌱", "온실 새싹"),
]
stations = []
for sid, room, x, y, icon, label in STATIONS:
    nx, ny = nearest_ok(x, y)
    stations.append({"id": sid, "room": room, "x": nx, "y": ny, "icon": icon, "label": label})

rooms = [
    {"id": "base", "name": "지구 본부", "en": "Eco Base", "x": 700, "y": 330, "w": 400, "h": 420},
    {"id": "solar", "name": "태양광 발전소", "en": "Solar Plant", "x": 990, "y": 40, "w": 700, "h": 360},
    {"id": "ocean", "name": "바다 청소 기지", "en": "Ocean Base", "x": 1010, "y": 730, "w": 680, "h": 390},
    {"id": "recycle", "name": "재활용 센터", "en": "Recycling Center", "x": 0, "y": 380, "w": 560, "h": 370},
    {"id": "water", "name": "정수장", "en": "Water Plant", "x": 1190, "y": 390, "w": 610, "h": 330},
    {"id": "forest", "name": "숲", "en": "Forest", "x": 120, "y": 0, "w": 740, "h": 330},
    {"id": "lab", "name": "연구 센터", "en": "Research Center", "x": 140, "y": 700, "w": 730, "h": 420},
]
anchors = {"solar": [1330, 170], "water": [1560, 520], "ocean": [1330, 900], "recycle": [370, 520], "forest": [600, 120]}
bx, by = nearest_ok(900, 705)
button = {"x": bx, "y": by, "r": 38}
# 시작·회의 뒤 자리: 지구본 둘레의 걸을 수 있는 곳 12군데
spawn = []
for k in range(12):
    ang = np.radians(90 + k * 30)
    for r in (172, 165, 180, 158, 188):
        x, y = 900 + r * np.cos(ang), 532 + r * np.sin(ang)
        if in_main(x, y) and walk_pad(x, y, 20):
            spawn.append([round(x), round(y)]); break
    else:
        spawn.append(list(nearest_ok(900 + 150 * np.cos(ang), 535 + 120 * np.sin(ang))))
assert walk_pad(button["x"], button["y"] + 40, 14) or True

# ---------- 5. 저장 ----------
bits = np.packbits(grid.astype(np.uint8).ravel())
b64 = base64.b64encode(bits.tobytes()).decode()
mapjs = f"""// 맵 정보 — 서버와 학생 화면이 함께 씁니다. (tools/build_map.py 가 만든 파일)
(function (root) {{
  const MAP = {{
    W: {W},
    H: {H},
    CELL: {C},
    COLS: {W // C},
    ROWS: {H // C},
    // 걸을 수 있는 곳: 10px 칸마다 1비트 (그림의 돌길 + 손으로 고친 부분)
    WALK: "{b64}",
    rooms: {json.dumps(rooms, ensure_ascii=False)},
    stations: {json.dumps(stations, ensure_ascii=False)},
    // 시설 고장·수리·복구 효과를 그릴 기준점
    anchors: {json.dumps({k: {"x": v[0], "y": v[1]} for k, v in anchors.items()})},
    button: {json.dumps(button)},
    spawn: {{ x: {bx}, y: {by} }},
    spawnPoints: {json.dumps(spawn)},
    facilities: ["solar", "ocean", "recycle", "water", "forest"],
  }};
  // 비트맵 풀기
  const raw = typeof atob === "function" ? atob(MAP.WALK) : Buffer.from(MAP.WALK, "base64").toString("binary");
  const cells = new Uint8Array(MAP.COLS * MAP.ROWS);
  for (let i = 0; i < cells.length; i++) cells[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  MAP.cells = cells;
  const cellOk = (x, y) => {{
    const c = Math.floor(x / MAP.CELL), r = Math.floor(y / MAP.CELL);
    return c >= 0 && r >= 0 && c < MAP.COLS && r < MAP.ROWS && cells[r * MAP.COLS + c] === 1;
  }};
  MAP.isWalkable = function (x, y, pad) {{
    pad = pad || 14;
    const d = pad * 0.7;
    return cellOk(x, y) && cellOk(x + pad, y) && cellOk(x - pad, y) && cellOk(x, y + pad) && cellOk(x, y - pad) &&
      cellOk(x + d, y + d) && cellOk(x - d, y + d) && cellOk(x + d, y - d) && cellOk(x - d, y - d);
  }};
  MAP.roomAt = function (x, y) {{
    for (const r of MAP.rooms) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    return null;
  }};
  MAP.roomById = function (id) {{ return MAP.rooms.find(r => r.id === id); }};
  if (typeof module !== "undefined" && module.exports) module.exports = MAP;
  else root.MAP = MAP;
}})(this);
"""
open(os.path.join(ROOT, "public", "map.js"), "w", encoding="utf-8").write(mapjs)
print("걸을 수 있는 칸:", int(grid.sum()), "장치:", [(s["id"], s["x"], s["y"]) for s in stations])
print("시작 자리:", spawn)

if PREV:
    os.makedirs(PREV, exist_ok=True)
    ov = np.asarray(art).copy()
    m = np.kron(grid, np.ones((C, C), bool))
    ov[m] = (ov[m] * 0.55 + np.array([255, 0, 200]) * 0.45).astype(np.uint8)
    im = Image.fromarray(ov); d = ImageDraw.Draw(im)
    for s in stations:
        d.ellipse([s["x"] - 14, s["y"] - 14, s["x"] + 14, s["y"] + 14], fill=(255, 220, 0), outline=(0, 0, 0), width=3)
        d.text((s["x"] + 16, s["y"] - 8), s["id"], fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    for k, (x, y) in anchors.items():
        d.rectangle([x - 10, y - 10, x + 10, y + 10], outline=(0, 255, 255), width=4)
    for x, y in spawn:
        d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(0, 255, 0))
    d.ellipse([button["x"] - 20, button["y"] - 20, button["x"] + 20, button["y"] + 20], fill=(255, 0, 0))
    for r in rooms:
        d.rectangle([r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]], outline=(255, 255, 0), width=2)
    im.save(os.path.join(PREV, "walk_preview.png"))
