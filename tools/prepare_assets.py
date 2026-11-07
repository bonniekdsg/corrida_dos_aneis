"""Prepare the supplied art without changing the originals. Requires Pillow."""
from pathlib import Path
from collections import deque
from PIL import Image

SOURCE = Path('/Users/andrebonniek/Documents/Codex/2026-11-07/generate-a-sequence-of-continuous-action-2/outputs/assets-jogo')
OUT = Path(__file__).resolve().parent.parent / 'assets'

def character(path):
    image = Image.open(path).convert('RGB')
    width, height = image.size
    pixels = image.load()
    # Identify only the light background connected to the canvas edges.
    # Estimate partial coverage at the edge and unmix the original white matte.
    seen = bytearray(width * height)
    queue = deque([(x, 0) for x in range(width)] + [(x, height - 1) for x in range(width)] + [(0, y) for y in range(height)] + [(width - 1, y) for y in range(height)])
    output = image.convert('RGBA'); result = output.load()
    while queue:
        x, y = queue.popleft(); index = y * width + x
        if seen[index]: continue
        seen[index] = 1
        rgb = pixels[x, y]; darkness = 255 - min(rgb)
        if darkness >= 75: continue
        alpha = max(0, min(255, round(darkness * 255 / 75)))
        if alpha:
            color = tuple(max(0, min(255, round((c - (255-alpha)) * 255 / alpha))) for c in rgb)
            result[x, y] = (*color, alpha)
        else: result[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0 <= nx < width and 0 <= ny < height and not seen[ny*width+nx]: queue.append((nx,ny))
    # All frames share the same origin and foot baseline; one-pixel differences
    # in the source's sole are normalized without independently scaling the poses.
    solid = output.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
    foot = solid[3]
    return output.crop((0, foot - 326, 272, foot))

for path in sorted((SOURCE / 'personagem').glob('corrida-0*.png')):
    character(path).save(OUT / path.name, optimize=True)

# Crop low-opacity fringe from the bounding box, keeping a small margin for
# antialiasing. The bottom of each output matches the visible support plane.
for name in ('pedra', 'tronco', 'anel'):
    image = Image.open(SOURCE / 'objetos' / f'{name}.png').convert('RGBA')
    box = image.getchannel('A').point(lambda a: 255 if a >= 64 else 0).getbbox()
    left, top, right, bottom = box
    image.crop((max(0,left-3),max(0,top-3),min(image.width,right+3),min(image.height,bottom+1))).save(OUT / f'{name}.png', optimize=True)
for name in ('chao', 'placa-interface', 'marcador'):
    Image.open(SOURCE / 'objetos' / f'{name}.png').save(OUT / f'{name}.png', optimize=True)
