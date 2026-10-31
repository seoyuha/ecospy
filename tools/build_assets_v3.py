"""
에코 스파이 그래픽 — 최종 묶음(상세 일러스트 원본 묶음 1~4/7, '00_화려한_원본_통짜시안')에서만 그림을 가져온다.

  python3 tools/build_assets_v3.py <묶음을_푼_폴더> [출력_폴더=public/assets] [미리보기.png]

- 이전 묶음(1차 패키지, 2차 묶음 5~7)의 그림은 전혀 쓰지 않는다. 출력 폴더를 비우고 새로 만든다.
- 시안(통짜 그림)에서 쓸 부분을 좌표로 잘라 내고, 바탕을 지워 투명하게 만든다. 원본 그림은 바꾸지 않는다.
- 게임 화면이 읽는 manifest.json 의 이름(키)은 이전과 같게 유지한다.
"""
import colorsys, json, os, shutil, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage as nd

SRC = os.path.join(os.path.abspath(sys.argv[1]), "00_화려한_원본_통짜시안")
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "public", "assets"))
PREVIEW = sys.argv[3] if len(sys.argv) > 3 else None
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"

if os.path.isdir(OUT): shutil.rmtree(OUT)
for d in ["map", "chars", "ui", "fx", "v2", "teacher"]: os.makedirs(os.path.join(OUT, d))
man = {"source": "상세 일러스트 원본 묶음 — 00_화려한_원본_통짜시안", "map": {}, "chars": {}, "ui": {}, "fx": {}, "teacher": {}, "v2": {}}
previews = []


def S(name): return Image.open(os.path.join(SRC, name)).convert("RGBA")


def save(im, rel, colors=256):
    p = os.path.join(OUT, rel)
    if rel.endswith(".jpg"): im.convert("RGB").save(p, quality=86, optimize=True, progressive=True)
    elif rel.startswith("chars/"): im.save(p, optimize=True)
    else: im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(p, optimize=True)
    previews.append((rel, im))
    return "assets/" + rel


def fit(im, w=None, h=None):
    if w and not h: h = round(im.height * w / im.width)
    if h and not w: w = round(im.width * h / im.height)
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


def trim(im, thr=20, pad=2):
    a = np.asarray(im)[:, :, 3] > thr
    ys, xs = np.nonzero(a)
    if not len(xs): return im
    return im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1)))


def largest(im, thr=40, dil=4):
    a = np.asarray(im).copy()
    m = nd.binary_dilation(a[:, :, 3] > thr, iterations=dil)
    lab, n = nd.label(m)
    if n > 1:
        sizes = nd.sum(m, lab, range(1, n + 1))
        a[:, :, 3] = np.where(lab == 1 + int(np.argmax(sizes)), a[:, :, 3], 0)
    return trim(Image.fromarray(a, "RGBA"))


def knock_out(im, light=212, chroma=34, keep_min=400, connected=True):
    """밝고 색이 옅은 바탕(흰색·회색 체크무늬 등)을 지운다. connected=True 면 테두리와 이어진 부분만."""
    a = np.asarray(im).astype(int)
    rgb = a[:, :, :3]
    bg = (rgb.min(2) > light) & ((rgb.max(2) - rgb.min(2)) < chroma)
    if connected:
        lab, _ = nd.label(bg)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(edge))
    alpha = np.where(bg, 0, a[:, :, 3])
    keep = alpha > 0
    l2, n2 = nd.label(keep)
    if n2:
        sizes = nd.sum(keep, l2, range(1, n2 + 1))
        alpha = np.where(np.isin(l2, [i + 1 for i, s in enumerate(sizes) if s < keep_min]), 0, alpha)
    soft = nd.binary_erosion(alpha > 0, iterations=1)
    alpha = np.where((alpha > 0) & ~soft, alpha * 0.6, alpha).astype(np.uint8)
    out = a.astype(np.uint8).copy(); out[:, :, 3] = alpha
    return trim(Image.fromarray(out, "RGBA"))


def solid(im, thr=215):
    """가장자리 번짐 빛(반투명)을 지우고 거의 불투명한 부분만 남김"""
    a = np.asarray(im).copy(); a[:, :, 3] = np.where(a[:, :, 3] > thr, 255, 0)
    return trim(Image.fromarray(a, "RGBA"))


def circle_cut(im, cx, cy, r, blur=0.8):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(blur))
    o = Image.new("RGBA", im.size); o.paste(im, (0, 0), m)
    return o.crop((cx - r, cy - r, cx + r, cy + r))


# ======================================================================== 1. 지도
# 이 묶음의 상세 지도(a_bright_colorful_detailed_isometric_top_down_ca)는 게임의 걷는 길(map.js)과 같은 배치다.
art = Image.open(os.path.join(SRC, "a_bright_colorful_detailed_isometric_top_down_ca.png")).convert("RGB")
big = art.resize((1800, 1200), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
man["map"]["image"] = save(big, "map/map.jpg")
man["map"]["mini"] = save(big.resize((450, 300), Image.LANCZOS), "map/mini.jpg")
man["map"]["size"] = [1800, 1200]

# ======================================================================== 2. 캐릭터
CS = S("a_bright_colorful_cartoon_game_asset_sheet_style.png")
IDLE = {"red": (23, 15, 134, 173), "orange": (146, 13, 257, 170), "yellow": (267, 13, 382, 171), "green": (392, 12, 509, 171),
        "blue": (519, 10, 636, 171), "purple": (644, 10, 760, 170), "pink": (768, 10, 883, 171), "brown": (891, 11, 1005, 168),
        "black": (1013, 12, 1127, 170)}
FROZEN, GHOST, REPORT = (1149, 25, 1253, 179), (1266, 33, 1359, 161), (1368, 43, 1511, 175)
WALK = [(23, 182, 108, 291), (119, 182, 218, 291), (234, 182, 331, 291), (366, 182, 447, 287), (468, 182, 570, 292),
        (602, 182, 684, 287), (713, 182, 791, 290), (818, 182, 901, 291), (931, 182, 1010, 294), (1043, 182, 1122, 292)]
CW, CHH, FOOT = 172, 176, 170          # 칸 크기, 발 위치(칸 위에서부터)


def cut(box, thr=110):
    return largest(solid(CS.crop(box), thr), thr=110)


def place(im, scale):
    """발을 칸 아래쪽에, 몸 가운데를 칸 가운데에 맞춰 넣음"""
    im = fit(im, im.width * scale, im.height * scale)
    a = np.asarray(im)[:, :, 3] > 128
    cols = np.nonzero(a[int(im.height * 0.35):int(im.height * 0.8)].any(0))[0]
    body_cx = (cols.min() + cols.max()) / 2 if len(cols) else im.width / 2
    cell = Image.new("RGBA", (CW, CHH))
    cell.alpha_composite(im, (int(round(CW / 2 - body_cx)), FOOT - im.height))
    return cell

# 색 바꾸기: 빨강 몸 픽셀의 밝기·채도 비율을 지키며 목표 색으로
def body_color(im):
    """몸 왼쪽 아래(창·새싹이 없는 곳)의 색을 대표색으로"""
    a = np.asarray(im).astype(float) / 255
    al = a[:, :, 3] > 0.9
    ys, xs = np.nonzero(al)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    px = a[int(y0 + (y1 - y0) * 0.55):int(y0 + (y1 - y0) * 0.75), int(x0 + (x1 - x0) * 0.18):int(x0 + (x1 - x0) * 0.45)]
    px = px[px[:, :, 3] > 0.9][:, :3]
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in px])
    hsv = hsv[hsv[:, 2] > 0.12]
    return float(np.median(hsv[:, 0])), float(np.median(hsv[:, 1])), float(np.percentile(hsv[:, 2], 70))


def recolor(im, src_hsv, dst_hsv):
    h0, s0, v0 = src_hsv; h1, s1, v1 = dst_hsv
    a = np.asarray(im).astype(float) / 255
    out = a.copy()
    rgb = a[:, :, :3].reshape(-1, 3)
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in rgb]).reshape(a.shape[0], a.shape[1], 3)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    red = ((h < 0.07) | (h > 0.93)) & (s > 0.35) & (v > 0.15) & (a[:, :, 3] > 0)
    nh = np.full_like(h, h1)
    ns = np.clip(s * (s1 / max(s0, 1e-3)), 0, 1)
    nv = np.clip(v * (v1 / max(v0, 1e-3)), 0, 1)
    for y, x in zip(*np.nonzero(red)):
        out[y, x, :3] = colorsys.hsv_to_rgb(nh[y, x], ns[y, x], nv[y, x])
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")


SCALE_IDLE = 1.0
SCALE_WALK = 158 / 110 * 0.98
red_idle = cut(IDLE["red"])
RED = body_color(red_idle)
walk_red = [cut(b) for b in WALK]
report_red = cut(REPORT)
frozen = place(cut(FROZEN), 1.0)
ghost = place(cut(GHOST), 1.08)
EXTRA = {"white": (0.58, 0.04, 0.97), "cyan": (0.5, 0.75, 0.86), "lime": (0.24, 0.8, 0.9)}
ORDER = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink", "brown", "white", "lime", "black"]
FRAMES = ["idle"] + [f"walk{i + 1}" for i in range(len(WALK))] + ["frozen", "ghost", "report"]
man["chars"] = {"cell": [CW, CHH], "foot": FOOT, "frames": FRAMES, "colors": [],
                "idx": {"idle": 0, "walk": 1, "walkN": len(WALK), "frozen": 1 + len(WALK), "ghost": 2 + len(WALK), "report": 3 + len(WALK)}}
for name in ORDER:
    if name in IDLE:
        idle = cut(IDLE[name]); target = body_color(idle)
    else:
        target = EXTRA[name]; idle = recolor(red_idle, RED, target)
    if name == "red":
        walks, rep = walk_red, report_red
    else:
        walks = [recolor(w, RED, target) for w in walk_red]; rep = recolor(report_red, RED, target)
    frames = [place(idle, SCALE_IDLE)] + [place(w, SCALE_WALK) for w in walks] + [frozen, ghost, place(rep, 1.05)]
    sheet = Image.new("RGBA", (CW * len(frames), CHH))
    for i, f in enumerate(frames): sheet.alpha_composite(f, (i * CW, 0))
    r, g, b = [int(c * 255) for c in colorsys.hsv_to_rgb(*target)]
    man["chars"]["colors"].append({"name": name, "hex": "#%02x%02x%02x" % (r, g, b), "sheet": save(sheet, f"chars/{name}.png")})

# ======================================================================== 3. 역할 시트 (카드·얼굴·배지·행동 버튼·마커·상태 아이콘)
RS = S("a_clean_colorful_game_ui_asset_sheet_illustration.png")
ra = np.asarray(RS)[:, :, 3]
V = man["v2"]
CARD_X = {"guardian": (10, 336), "destroyer": (340, 645), "reporter": (648, 940), "trash": (942, 1236), "investor": (1238, 1530)}
V["role_card"] = {}
for k, (x0, x1) in CARD_X.items():
    sub = ra[0:505, x0:x1] > 215
    ys, xs = np.nonzero(sub)
    V["role_card"][k] = save(fit(solid(RS.crop((x0 + xs.min(), ys.min(), x0 + xs.max() + 1, ys.max() + 1))), 300), f"v2/card_{k}.png")
ROLES = ["guardian", "destroyer", "reporter", "trash", "investor"]
small = lambda cx, cy, w=30, h=32: fit(largest(knock_out(RS.crop((cx - w, cy - h, cx + w, cy + h)), light=150, chroma=60, keep_min=60)), 96)
V["role_face"] = {k: save(small(cx, 974, 28), f"v2/face_{k}.png") for k, cx in zip(ROLES, [40, 92, 145, 198, 251])}
V["role_badge"] = {k: save(small(cx, 976), f"v2/badge_{k}.png") for k, cx in zip(ROLES, [1003, 1061, 1116, 1171, 1228])}
# 상태 아이콘 줄 (잎·마른 잎·지구·쓰레기통·! ·? ·말풍선) / 사용자 마커 (핀) / 미니맵 마커
STAT = dict(zip(["leaf", "deadleaf", "earth", "trash", "alert", "question", "chat"], [322, 367, 413, 461, 515, 563, 614]))
PIN = dict(zip(["blue", "red", "yellow", "green", "pink", "danger"], [692, 738, 784, 830, 878, 925]))
MM = dict(zip(["leaf", "warn", "shield", "help", "astro"], [1303, 1354, 1404, 1453, 1500]))
st = {k: small(cx, 976) for k, cx in STAT.items()}
pin = {k: small(cx, 976) for k, cx in PIN.items()}
mm = {k: small(cx, 976) for k, cx in MM.items()}

# 행동 버튼: 역할 시트 '행동 버튼 (기본/눌림/비활성)' 한 줄에서 모두 가져와 같은 모양의 이름표를 붙임
def pill_button(icon, label, col, dark, disabled=False, pressed=False):
    W, H = 240, 216
    im = Image.new("RGBA", (W, H))
    ic = fit(icon, 150 if pressed else 142).filter(ImageFilter.UnsharpMask(1.5, 80, 2))
    im.alpha_composite(ic, ((W - ic.width) // 2, 0 if pressed else 4))
    d = ImageDraw.Draw(im)
    if disabled: col, dark = (170, 176, 184), (110, 116, 124)
    if pressed: col = tuple(min(255, int(c * 1.12)) for c in col)
    y0 = 140
    d.rounded_rectangle([10, y0 + 6, W - 10, H - 4], 34, fill=dark)
    d.rounded_rectangle([10, y0, W - 10, H - 10], 34, fill=col, outline=(30, 30, 40), width=5)
    d.rounded_rectangle([24, y0 + 8, W - 24, y0 + 26], 10, fill=tuple(min(255, c + 60) for c in col))
    f = ImageFont.truetype(FONT, 36 if len(label) <= 4 else 30)
    tw = d.textlength(label, font=f)
    d.text(((W - tw) / 2, y0 + 12), label, font=f, fill=(255, 255, 255), stroke_width=4, stroke_fill=dark)
    return im

ACT = {"use": (0, "문제 풀기", (40, 130, 230), (15, 70, 150)), "report": (2, "신고", (230, 50, 60), (130, 20, 30)),
       "emg": (3, "긴급회의", (225, 40, 50), (120, 15, 25)), "frz": (4, "오염시키기", (150, 70, 220), (80, 30, 140)),
       "sab": (5, "시설 방해", (240, 120, 30), (150, 60, 10)), "scp": (6, "특종 지목", (30, 170, 195), (10, 95, 115)),
       "inv": (7, "투자하기", (240, 180, 20), (150, 100, 0)), "repair": (1, "시설 복구", (50, 170, 70), (20, 100, 35))}
V["btn"] = {}
for k, (i, label, col, dark) in ACT.items():
    cx = round(36 + i * 190.7)
    for stt, dx, r in [("normal", 0, 27), ("pressed", 60, 30), ("disabled", 121, 28)]:
        V["btn"][f"{k}_{stt}"] = save(pill_button(circle_cut(RS, cx + dx, 844, r), label, col, dark, stt == "disabled", stt == "pressed"), f"v2/btn_{k}_{stt}.png")

# ======================================================================== 4. 반짝이 아이콘 세트 (회의 버튼·타이머·게이지·확인 등)
GL = S("글로시_소셜_디덕션_ui_아이콘_세트.png")
GLOSSY = {"emg_button": (727, 77, 1126, 384), "warn": (1141, 118, 1401, 363), "check": (53, 444, 313, 638),
          "cross": (327, 442, 582, 637), "skip": (597, 443, 852, 637), "tie": (867, 439, 1137, 641),
          "chat": (1178, 430, 1398, 627), "search": (60, 655, 300, 866), "megaphone": (340, 645, 591, 865), "timer": (610, 654, 793, 859)}
V["icon"] = {k: save(fit(trim(GL.crop(b), 30), 200), f"v2/i_{k}.png") for k, b in GLOSSY.items()}
glossy = {k: trim(GL.crop(b), 30) for k, b in GLOSSY.items()}
# 게이지 (노란 막대의 채움 부분만 색을 바꿔 초록·빨강·파랑·보라)
bf = trim(GL.crop((821, 758, 1398, 847)), 30); be = trim(GL.crop((821, 656, 1398, 743)), 30)
def hue_shift(im, deg):
    hsv = np.asarray(im.convert("RGB").convert("HSV")).astype(int)
    h, sv = hsv[:, :, 0], hsv[:, :, 1]
    y = (h > 17) & (h < 50) & (sv > 90)
    hsv[:, :, 0] = np.where(y, (h + int(deg / 360 * 255)) % 256, h)
    o = Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGB"); o.putalpha(im.split()[3]); return o
fa = np.asarray(fit(bf, 520)).astype(int)
yel = (fa[:, :, 0] > 200) & (fa[:, :, 1] > 150) & (fa[:, :, 2] < 120)
xs, ys = np.nonzero(yel.any(0))[0], np.nonzero(yel.any(1))[0]
pb = (int(xs.min()) - 2, int(ys.min()) - 3, int(xs.max()) + 3, int(ys.max()) + 4)
G = V["gauge"] = {"empty": save(fit(be, 520), "v2/g_empty.png"), "w": 520, "h": fa.shape[0]}
for name, deg in [("yellow", 0), ("green", 65), ("red", -42), ("blue", 165), ("purple", 225)]:
    G["pill_" + name] = save(fit(hue_shift(bf, deg) if deg else bf, 520).crop(pb), f"v2/gp_{name}.png")
# 확인·투표·시작 버튼 (행동 버튼과 같은 모양)
V["btn"].update({
    f"{k}_{s}": save(pill_button(ic, label, col, dark, s == "disabled", s == "pressed"), f"v2/btn_{k}_{s}.png")
    for k, ic, label, col, dark in [("confirm", glossy["check"], "정답 확인", (50, 170, 70), (20, 100, 35)),
                                    ("vote", glossy["search"], "투표하기", (150, 70, 220), (80, 30, 140)),
                                    ("start", st["earth"], "게임 시작", (50, 170, 70), (20, 100, 35))]
    for s in ["normal", "pressed", "disabled"]})

# ======================================================================== 5. 투표 카드 (6색 + 같은 방식으로 6색)
VC = S("새싹_크루메이트_투표_카드_세트.png")
VBOX = {"red": (45, 23, 459, 541), "orange": (515, 23, 931, 541), "yellow": (987, 23, 1400, 541),
        "green": (45, 549, 461, 1065), "blue": (513, 550, 932, 1064), "pink": (986, 550, 1402, 1064)}
V["vote_card"] = {k: save(fit(trim(VC.crop(b), 40), 200), f"v2/vote_{k}.png") for k, b in VBOX.items()}
red_card = fit(trim(VC.crop(VBOX["red"]), 40), 200)
rc_src = (0.0, 0.85, 0.95)
for c in man["chars"]["colors"]:
    if c["name"] in V["vote_card"]: continue
    h, s, v = colorsys.rgb_to_hsv(*[int(c["hex"][i:i + 2], 16) / 255 for i in (1, 3, 5)])
    V["vote_card"][c["name"]] = save(recolor(red_card, rc_src, (h, s, max(v, 0.3))), f"v2/vote_{c['name']}.png")

# ======================================================================== 6. 문제 결과 배지 (Correct! / Wrong! ...)
QS = S("a_bright_colorful_cartoon_style_game_ui_asset_sh.png")
qa = np.asarray(QS)[:200, :, 3] > 60
cols = np.nonzero(qa.any(0))[0]
# 위쪽 줄 배지 5개를 빈 세로줄로 나눔
gaps, start = [], cols[0]
for a_, b_ in zip(cols[:-1], cols[1:]):
    if b_ - a_ > 6: gaps.append((start, a_ + 1)); start = b_
gaps.append((start, cols[-1] + 1))
gaps = [g for g in gaps if g[1] - g[0] > 80][:5]
V["result"] = {}
for k, (x0, x1) in zip(["correct", "wrong", "mission_complete", "level_up", "clear"], gaps):
    V["result"][k] = save(fit(largest(QS.crop((x0, 0, x1, 200))), 260), f"v2/r_{k}.png")

# ======================================================================== 7. 시설 그림 (정상·고장·수리 중·복구)
FS = S("a_clean_bright_colorful_game_asset_sheet_ui_ic.png")
FAC = {"solar": (8, 362), "water": (365, 690), "recycle": (690, 1003), "forest": (1003, 1293), "ocean": (1293, 1536)}
V["facility"], V["facility_state"] = {}, {}
for k, (x0, x1) in FAC.items():
    mid = (x0 + x1) // 2
    boxes = {"normal": (x0, 70, mid, 258), "broken": (mid, 70, x1, 258), "repairing": (x0, 305, mid, 495), "restored": (mid, 305, x1, 495)}
    V["facility_state"][k] = {}
    for stt, b in boxes.items():
        im = fit(largest(knock_out(FS.crop(b), light=226, chroma=22, keep_min=800), dil=6), 220)
        V["facility_state"][k][stt] = save(im, f"v2/f_{k}_{stt}.png")
    V["facility"][k] = V["facility_state"][k]["normal"]
V["facility"]["base"] = save(fit(st["earth"], 160), "v2/f_base.png")

# ======================================================================== 8. 시설 효과 소품 (효과 시트)
FX = S("a_clean_colorful_game_asset_sheet_sprite_sheet.png")
PROPS = {"smoke": (15, 0, 152, 152), "smoke_fire": (548, 0, 700, 150), "fire_s": (12, 160, 78, 252), "fire_l": (238, 138, 342, 252),
         "warn": (660, 168, 752, 252), "barrier": (862, 192, 998, 278), "cone": (998, 172, 1072, 252),
         "crane": (232, 258, 392, 422), "scaffold": (398, 278, 612, 422), "toolbox": (748, 352, 842, 418), "crew_fix": (868, 292, 1002, 418),
         "plus": (1002, 318, 1082, 382), "ring": (12, 428, 168, 558), "burst": (636, 422, 842, 560), "beam_green": (848, 428, 962, 562),
         "dome_leaf": (1352, 408, 1534, 562)}
V["props"] = {}
for k, b in PROPS.items():
    im = trim(FX.crop(b), 12)
    V["props"][k] = {"src": save(im, f"v2/p_{k}.png"), "w": im.width, "h": im.height}

# ======================================================================== 9. 8프레임 효과 (능력 효과 시트 + 효과 스프라이트 시트)
def strip(frames, size, rel):
    s = Image.new("RGBA", (size * len(frames), size))
    for i, f in enumerate(frames):
        k = min((size - 6) / f.width, (size - 6) / f.height); f = fit(f, f.width * k, f.height * k)
        s.alpha_composite(f, (i * size + (size - f.width) // 2, (size - f.height) // 2))
    return {"src": save(s, rel), "size": size, "n": len(frames)}

AB = Image.open(os.path.join(SRC, "a_colorful_game_ui_asset_sheet_image_cartoon_vect.png")).convert("RGBA")
def ab_row(x0, y0, y1):
    out = []
    for i in range(8):
        cx0 = round(x0 + i * 94.6)
        im = AB.crop((cx0 + 7, y0 + 3, cx0 + 85, y1))
        im = knock_out(im, light=170, chroma=30, keep_min=40, connected=False)
        a = np.asarray(im).copy()
        a[:, :, 3] = np.where(nd.binary_opening(a[:, :, 3] > 60, iterations=2), a[:, :, 3], 0)
        out.append(largest(Image.fromarray(a, "RGBA"), thr=60, dil=5))
    return out
fx = man["fx"]
fx["repair"] = strip(ab_row(10, 643, 712), 160, "fx/repair.png")        # 환경 복구 (새싹)
fx["restore"] = fx["repair"]
fx["sabotage"] = strip(ab_row(10, 772, 838), 160, "fx/sabotage.png")    # 시설 방해
fx["investment"] = strip(ab_row(10, 902, 986), 160, "fx/investment.png")  # 투자하기
fx["pollution"] = strip(ab_row(775, 643, 712), 160, "fx/pollution.png")  # 오염시키기
fx["scoop"] = strip(ab_row(775, 772, 838), 160, "fx/scoop.png")          # 특종 지목

ES = S("a_large_high_resolution_sprite_sheet_game_effec.png")
def es_row(y0, y1, n=8, x0=175):
    a = np.asarray(ES)[y0:y1, x0:, 3] > 200
    lab, k = nd.label(nd.binary_dilation(a, iterations=5))
    objs = sorted([o for o in nd.find_objects(lab) if (o[1].stop - o[1].start) * (o[0].stop - o[0].start) > 900], key=lambda o: o[1].start)
    out = [solid(ES.crop((x0 + o[1].start, y0 + o[0].start, x0 + o[1].stop, y0 + o[0].stop)), 150) for o in objs]
    return out[:n] if len(out) >= n else (out * n)[:n]
fx["warning"] = strip(es_row(268, 340), 128, "fx/warning.png")
fx["purify"] = strip(es_row(550, 640, n=6), 128, "fx/purify.png")

# ======================================================================== 10. 조이스틱 (가장 반짝이는 UI 시트)
PU = S("a_bright_polished_colorful_cartoon_game_ui_asset.png")
ring = circle_cut(PU, 188, 427, 51)                     # 화살표 고리
d = ImageDraw.Draw(ring); c = ring.width // 2
d.ellipse([c - 30, c - 30, c + 30, c + 30], fill=(6, 40, 80, 190))
ball = circle_cut(PU, 73, 427, 29)
U = man["ui"]
for s_, br in [("normal", 1.0), ("pressed", 1.15)]:
    U[f"joy_base_{s_}"] = save(fit(ring, 260), f"ui/joy_base_{s_}.png")
    b = ball if br == 1.0 else Image.eval(ball, lambda v: v)  # 같은 그림, 눌림은 아래에서 밝게
    if br != 1.0:
        arr = np.asarray(ball).astype(float); arr[:, :, :3] = np.clip(arr[:, :, :3] * br, 0, 255); b = Image.fromarray(arr.astype(np.uint8), "RGBA")
    U[f"joy_knob_{s_}"] = save(fit(b, 120), f"ui/joy_knob_{s_}.png")

# 지도 표시 (역할 시트의 마커로 통일)
U["new_marker_mission"] = save(fit(mm["shield"], 96), "ui/m_mission.png")
U["new_marker_danger"] = save(fit(mm["warn"], 96), "ui/m_danger.png")
U["new_marker_meeting"] = save(fit(mm["help"], 96), "ui/m_reporter.png")
U["marker_complete"] = save(fit(mm["leaf"], 96), "ui/m_done.png")
U["marker_warning"] = save(fit(pin["danger"], 96), "ui/m_warn_pin.png")
U["marker_player"] = save(fit(pin["blue"], 96), "ui/m_player.png")
# 상태 아이콘
U["status_ghost"] = save(fit(cut(GHOST), h=88), "ui/st_ghost.png")
U["status_frozen"] = save(fit(cut(FROZEN), h=88), "ui/st_frozen.png")
U["status_ready"] = save(fit(st["leaf"], 88), "ui/st_ready.png")
U["status_offline"] = save(fit(st["deadleaf"], 88), "ui/st_offline.png")
U["status_waiting"] = save(fit(glossy["timer"], h=88), "ui/st_waiting.png")
U["status_question"] = save(fit(st["question"], 88), "ui/st_question.png")
# 교사 화면 상태 아이콘
T = man["teacher"]
T.update({"ready": U["status_ready"], "offline": U["status_offline"], "waiting": U["status_waiting"], "question": U["status_question"],
          "running": save(fit(st["earth"], 64), "teacher/running.png"), "issue": save(fit(st["alert"], 64), "teacher/issue.png"),
          "complete": save(fit(glossy["check"], h=64), "teacher/complete.png")})

# ======================================================================== 11. 큰 장면
def scene(name, box, rel, w=1280):
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    return save(fit(im.crop(box) if box else im, w), rel)
P4 = "a_colorful_4_panel_cartoon_game_ui_collage_in_a_cl.png"
VR = "a_vibrant_4_panel_cartoon_cute_sci_fi_game_ui_illu.png"
V["scene"] = {
    "loading": scene(P4, (0, 0, 834, 333), "v2/s_title.jpg"),
    "meeting": scene("긴급_회의_환경_파괴범을_찾아라.png", (0, 0, 1672, 760), "v2/s_meeting.jpg"),
    "guardian_win": scene(P4, (0, 637, 834, 941), "v2/s_gwin.jpg"),
    "destroyer_win": scene(P4, (838, 637, 1672, 941), "v2/s_dwin.jpg"),
    "vote_destroyer": scene(VR, (0, 0, 834, 330), "v2/s_caught.jpg"),
    "vote_ejected": scene(VR, (838, 0, 1672, 330), "v2/s_ejected.jpg"),
    "vote_tie": scene(VR, (0, 469, 834, 800), "v2/s_tie.jpg"),
    "vote_skip": scene(VR, (838, 469, 1672, 800), "v2/s_skip.jpg"),
}

with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(man, f, ensure_ascii=False, indent=1)
tot = sum(os.path.getsize(os.path.join(dp, fn)) for dp, _, fns in os.walk(OUT) for fn in fns)
print(f"그림 {sum(len(f) for _, _, f in os.walk(OUT)) - 1}개, {tot / 1024 / 1024:.2f} MB")

if PREVIEW:
    items = [(n, im) for n, im in previews if not n.endswith(".jpg") and not n.startswith("chars/")]
    cell, cols_ = 150, 11
    rows = (len(items) + cols_ - 1) // cols_
    sh = Image.new("RGB", (cols_ * cell, rows * (cell + 14)), (70, 80, 100)); dd = ImageDraw.Draw(sh)
    for i, (n, im) in enumerate(items):
        t = im.copy(); t.thumbnail((cell - 8, cell - 8))
        bg = Image.new("RGBA", (cell, cell), (90, 100, 120, 255))
        for x in range(0, cell, 10):
            for y in range(0, cell, 10):
                if (x // 10 + y // 10) % 2: ImageDraw.Draw(bg).rectangle([x, y, x + 9, y + 9], fill=(110, 120, 140, 255))
        bg.alpha_composite(t, ((cell - t.width) // 2, (cell - t.height) // 2))
        x, y = (i % cols_) * cell, (i // cols_) * (cell + 14)
        sh.paste(bg.convert("RGB"), (x, y)); dd.text((x + 2, y + cell), n.split("/")[-1][:24], fill=(255, 255, 255))
    sh.save(PREVIEW)
    # 캐릭터 미리보기
    ch = Image.new("RGBA", (CW * len(FRAMES) // 2, CHH * len(ORDER) // 2), (80, 90, 110, 255))
    for i, c in enumerate(man["chars"]["colors"]):
        s_ = Image.open(os.path.join(OUT, c["sheet"][7:])).convert("RGBA")
        ch.alpha_composite(s_.resize((s_.width // 2, s_.height // 2)), (0, i * CHH // 2))
    ch.convert("RGB").save(PREVIEW.replace(".png", "_chars.png"))
