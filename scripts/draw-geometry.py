"""Draws geometry reference images for the art brief from docs/art/geometry/village.json.
Run: python3 scripts/draw-geometry.py   (needs Pillow)"""
import json
from PIL import Image, ImageDraw, ImageFont
G = json.load(open('docs/art/geometry/village.json'))
OUT = 'docs/art/reference/'
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
except OSError:
    F = FS = ImageFont.load_default()
src = Image.open('dist/map.png').convert('RGB')
PPU = src.width / G['map']['width']
WALL = (230, 60, 50); DOOR = (40, 220, 230); WIN = (250, 215, 60); SLOT = (255, 255, 255)

def overlay(img, s, ox, oy):
    """Draw all geometry onto img; s = px per unit, (ox, oy) = world origin of img."""
    d = ImageDraw.Draw(img, 'RGBA')
    P = lambda x, y: ((x - ox) * s, (y - oy) * s)
    for w in G['woods']:
        x, y = P(w['x'], w['y']); r = w['r'] * s
        d.ellipse([x - r, y - r, x + r, y + r], outline=(80, 230, 90, 255), width=2)
    o = G['objective']; x, y = P(o['x'], o['y']); r = o['radius'] * s
    d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 255, 255, 255), width=2)
    wi, wo = G['wallBand']['inside'], G['wallBand']['outside']
    for b in G['buildings']:
        f = b['footprint']
        # wall band (collision): from `outside` units outside to `inside` units inside the edge
        d.rectangle([*P(f['x'] - wo, f['y'] - wo), *P(f['x'] + f['w'] + wo, f['y'] + f['h'] + wo)], fill=(230, 60, 50, 90))
        d.rectangle([*P(f['x'] + wi, f['y'] + wi), *P(f['x'] + f['w'] - wi, f['y'] + f['h'] - wi)], fill=(0, 0, 0, 0))
        # punch interior back to image
        inner = [*P(f['x'] + wi, f['y'] + wi), *P(f['x'] + f['w'] - wi, f['y'] + f['h'] - wi)]
        box = tuple(int(round(v)) for v in inner)
        img.paste(base.crop(box), box[:2])
        d.rectangle([*P(f['x'], f['y']), *P(f['x'] + f['w'], f['y'] + f['h'])], outline=WALL + (255,), width=2)
        for wnd in b['windows']:
            if 'y' in wnd: d.line([P(wnd['from'], wnd['y']), P(wnd['to'], wnd['y'])], fill=WIN + (255,), width=max(3, int(s * 2)))
            else: d.line([P(wnd['x'], wnd['from']), P(wnd['x'], wnd['to'])], fill=WIN + (255,), width=max(3, int(s * 2)))
        for dr in b['doors']:
            d.line([P(dr['from'], dr['y']), P(dr['to'], dr['y'])], fill=DOOR + (255,), width=max(4, int(s * 3)))
        for sl in b['interiorSlots']:
            x, y = P(sl['x'], sl['y']); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=SLOT + (230,), outline=(0, 0, 0, 255))
        x, y = P(f['x'], f['y'] - 4)
        d.text((x, y - 14), f"{b['id']} {b['name']}", fill=(255, 255, 255, 255), font=F, stroke_width=2, stroke_fill=(0, 0, 0))
    return d

# 1) Overview, 1 px per unit, 100-unit grid
base = src.resize((1200, 800), Image.LANCZOS)
img = base.copy(); d = ImageDraw.Draw(img, 'RGBA')
for v in range(0, 1201, 100):
    d.line([(v, 0), (v, 800)], fill=(255, 255, 255, 70)); d.text((v + 2, 2), str(v), fill='white', font=FS, stroke_width=2, stroke_fill='black')
for v in range(0, 801, 100):
    d.line([(0, v), (1200, v)], fill=(255, 255, 255, 70)); d.text((2, v + 2), str(v), fill='white', font=FS, stroke_width=2, stroke_fill='black')
overlay(img, 1, 0, 0)
img.save(OUT + 'geometry-overview.jpg', quality=90)

# 2) House 0 close-up at 5 px per unit with ticks
b = G['buildings'][0]['footprint']; M = 20
ox, oy, ww, hh = b['x'] - M, b['y'] - M, b['w'] + 2 * M, b['h'] + 2 * M
S = 5
crop = src.crop((int(ox * PPU), int(oy * PPU), int((ox + ww) * PPU), int((oy + hh) * PPU))).resize((ww * S, hh * S), Image.LANCZOS)
crop.save(OUT + 'house0-map-crop-5x.jpg', quality=90)
base = crop.copy(); img = crop.copy()
d = overlay(img, S, ox, oy)
for x in range(int(ox) - int(ox) % 10 + 10, int(ox + ww), 10):
    X = (x - ox) * S; d.line([(X, 0), (X, 8 if x % 20 else 16)], fill='white', width=1)
    if x % 20 == 0: d.text((X - 10, 18), str(x), fill='white', font=FS, stroke_width=2, stroke_fill='black')
for y in range(int(oy) - int(oy) % 10 + 10, int(oy + hh), 10):
    Y = (y - oy) * S; d.line([(0, Y), (8 if y % 20 else 16, Y)], fill='white', width=1)
    if y % 20 == 0: d.text((18, Y - 7), str(y), fill='white', font=FS, stroke_width=2, stroke_fill='black')
d.text((10, hh * S - 22), 'röd = vägg (kollision) · cyan = dörr · gul = fönster (sikt, ej rörelse) · vit prick = soldatplats inne', fill='white', font=F, stroke_width=2, stroke_fill='black')
img.save(OUT + 'house0-geometry-5x.png')
print('ok')
