"""Separate the supplied transparent running sequence without changing its poses."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent.parent
source = Image.open(root / 'assets/thais-sequencia-original.png').convert('RGBA')
# The fourth pose extends into the next column only around its forward foot.
# This stepped partition keeps the complete foot and avoids the following cape.
bounds = [0, 270, 545, 810, 1095, 1360, 1630, 1905, 2172]
origins = [0, 270, 545, 810, 1085, 1360, 1630, 1905]
for i in range(8):
    left, right = bounds[i], bounds[i + 1]
    mask = Image.new('L', source.size, 0)
    draw = ImageDraw.Draw(mask)
    if i == 3:
        draw.rectangle((left, 0, right-1, 419), fill=255)
        draw.rectangle((left, 420, 1116, source.height), fill=255)
    elif i == 4:
        draw.rectangle((left, 0, right-1, 419), fill=255)
        draw.rectangle((1117, 420, right-1, source.height), fill=255)
    else:
        draw.rectangle((left, 0, right-1, source.height), fill=255)
    layer = Image.new('RGBA', source.size)
    layer.paste(source, (0, 0), mask)
    # Same height, scale and baseline across poses; airborne stride stays airborne.
    frame = layer.crop((origins[i], 176, origins[i] + 320, 536))
    frame.save(root / 'assets' / f'thais-corrida-{i+1:02}.png', optimize=True)
