"""App-style Jenova icon: squircle, soft shadow, glassy highlight, gentle rim."""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

SRC = sys.argv[1]
S = 1024

def squircle_mask(size, inset, n=5.0):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32) + 0.5
    c = size / 2
    r = c - inset
    v = np.abs((x - c) / r) ** n + np.abs((y - c) / r) ** n
    # anti-aliased edge
    edge = np.clip((1.0 - v) * r / (n * 1.0) * 1.0 + 0.5, 0, 1)
    return Image.fromarray((edge * 255).astype(np.uint8), "L")

def render(shadow=True):
    inset = 70 if shadow else 18
    art = Image.open(SRC).convert("RGB")
    w, h = art.size
    side = min(w, h)
    art = art.crop(((w - side) // 2, 0, (w + side) // 2, side)).resize((S, S), Image.LANCZOS)
    a = np.asarray(art).astype(np.float32) / 255
    y, x = np.mgrid[0:S, 0:S].astype(np.float32) / S
    # soft vignette toward the edges
    d = np.sqrt((x - 0.5) ** 2 + (y - 0.45) ** 2)
    a *= (1 - 0.35 * np.clip((d - 0.3) / 0.45, 0, 1) ** 1.5)[..., None]
    # glassy top highlight
    a = a + (0.10 * np.clip(1 - y / 0.5, 0, 1) ** 2)[..., None]
    art = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

    mask = squircle_mask(S, inset)
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        sm = mask.point(lambda v: v * 0.55).filter(ImageFilter.GaussianBlur(22))
        sh.putalpha(ImageChops.offset(sm, 0, 18))
        out = Image.alpha_composite(out, sh)
    body = art.convert("RGBA")
    body.putalpha(mask)
    out = Image.alpha_composite(out, body)
    # soft light rim just inside the edge
    inner = squircle_mask(S, inset + 7)
    rim = ImageChops.subtract(mask, inner).filter(ImageFilter.GaussianBlur(2))
    rim_layer = Image.new("RGBA", (S, S), (210, 250, 255, 0))
    rim_layer.putalpha(rim.point(lambda v: v * 0.45))
    out = Image.alpha_composite(out, rim_layer)
    return out

big = render(True)
small = render(False)
def at(px):
    src = small if px <= 32 else big
    return src.resize((px, px), Image.LANCZOS)

out = sys.argv[2]
import os
os.makedirs(out, exist_ok=True)
for px in [16, 24, 32, 48, 64, 72, 128, 256, 512]:
    at(px).save(f"{out}/icon_{px}.png")
at(256).save(f"{out}/icon.ico", sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)],
              append_images=[at(p) for p in [16,24,32,48,64,128]])
big.save(f"{out}/icon_1024.png")
