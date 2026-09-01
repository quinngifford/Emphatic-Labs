"""Render the 1200x630 Open Graph card from the real brand assets and fonts."""
import os
from PIL import Image, ImageDraw, ImageFont

SITE = r"C:\Users\quinn\OneDrive\CS Projects\Emphatic\site"
ASSETS = os.path.join(SITE, "assets")
FONTS = "fonts"

W, H = 1200, 630
BG = (255, 255, 255)
TEXT = (15, 21, 18)
MUTED = (95, 111, 102)
ACCENT = (14, 122, 69)

card = Image.new("RGB", (W, H), BG)

# --- soft green wash, top-left, matching the hero ---
wash = Image.new("RGB", (W, H), BG)
wd = ImageDraw.Draw(wash)
for i in range(150, 0, -1):
    t = i / 150.0
    r = int(560 * t)
    a = 0.16 * (1 - t)
    col = (
        int(255 + (46 - 255) * a),
        int(255 + (194 - 255) * a),
        int(255 + (126 - 255) * a),
    )
    wd.ellipse([170 - r, -110 - r, 170 + r, -110 + r], fill=col)
card = Image.blend(card, wash, 1.0)

# --- pour artwork along the bottom ---
hero = Image.open(os.path.join(ASSETS, "hero-bg.png")).convert("RGBA")
hw = W
hh = round(hero.height * (W / hero.width))
hero = hero.resize((hw, hh), Image.LANCZOS)
card.paste(hero, (0, H - hh), hero)

draw = ImageDraw.Draw(card)


def font(file, size, variation):
    f = ImageFont.truetype(os.path.join(FONTS, file), size)
    f.set_variation_by_name(variation)
    return f


f_word = font("manrope.ttf", 40, "Bold")
f_dim = font("manrope.ttf", 40, "Medium")
f_head = font("outfit.ttf", 74, "Light")
f_sub = font("manrope.ttf", 27, "Regular")

M = 80  # margin

# --- logo mark + wordmark ---
logo = Image.open(os.path.join(ASSETS, "logo.png")).convert("RGBA")
lh = 84
lw = round(logo.width * (lh / logo.height))
logo = logo.resize((lw, lh), Image.LANCZOS)
card.paste(logo, (M - 24, 66), logo)   # the PNG is padded square, so pull it left

x = M - 24 + lw + 10
draw.text((x, 92), "Emphatic", font=f_word, fill=TEXT)
x += draw.textlength("Emphatic", font=f_word) + 12
draw.text((x, 92), "Labs", font=f_dim, fill=MUTED)

# --- headline, with "AI" picked out in the accent ---
lines = [
    [("Advancing the integration", TEXT)],
    [("of ", TEXT), ("AI", ACCENT), (" into consumer", TEXT)],
    [("software.", TEXT)],
]
y = 236
for line in lines:
    cx = M
    for text, colour in line:
        draw.text((cx, y), text, font=f_head, fill=colour)
        cx += draw.textlength(text, font=f_head)
    y += 88

draw.text((M, y + 20), "emphaticlab.com", font=f_sub, fill=MUTED)

out = os.path.join(ASSETS, "og.png")
card.save(out, optimize=True)
print("og.png", card.size, round(os.path.getsize(out) / 1024, 1), "KB")
