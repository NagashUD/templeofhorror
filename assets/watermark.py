#!/usr/bin/env python3
"""Ajoute un filigrane discret aux images, sans modifier les originaux."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'images_originales'
DEST = ROOT / 'images_galeries'
TEXT = '© VeenaDev 2026'
OPACITY = 135  # 0 (transparent) à 255 (opaque)
SIZE_RATIO = 0.026  # taille du texte par rapport à la largeur
MARGIN_RATIO = 0.025
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


def font_for(size):
    options = [
        ROOT / 'police.ttf',
        Path('C:/Windows/Fonts/georgia.ttf'),
        Path('C:/Windows/Fonts/arial.ttf'),
        Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
    ]
    for candidate in options:
        if candidate.is_file():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def watermark(src, dest):
    with Image.open(src) as original:
        image = ImageOps.exif_transpose(original).convert('RGBA')
        w, h = image.size
        size = max(12, round(w * SIZE_RATIO))
        font = font_for(size)
        margin = max(8, round(min(w, h) * MARGIN_RATIO))
        overlay = Image.new('RGBA', image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        bounds = draw.textbbox((0, 0), TEXT, font=font, stroke_width=0)
        tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
        # Si l'image est étroite, on réduit la police.
        while tw > w - 2 * margin and size > 10:
            size -= 1
            font = font_for(size)
            bounds = draw.textbbox((0, 0), TEXT, font=font)
            tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
        x = w - margin - tw - bounds[0]
        y = h - margin - th - bounds[1]
        draw.text((x + 1, y + 1), TEXT, font=font, fill=(0, 0, 0, min(190, OPACITY + 40)))
        draw.text((x, y), TEXT, font=font, fill=(224, 203, 178, OPACITY))
        image = Image.alpha_composite(image, overlay)
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.suffix.lower() in {'.jpg', '.jpeg'}:
            image.convert('RGB').save(dest, quality=93, optimize=True)
        elif dest.suffix.lower() == '.webp':
            image.save(dest, quality=93, method=6)
        else:
            image.save(dest, optimize=True)


def main():
    SOURCE.mkdir(exist_ok=True)
    DEST.mkdir(exist_ok=True)
    images = [p for p in SOURCE.rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS]
    if not images:
        print('Aucune image trouvée. Dépose tes images dans images_originales/ puis relance le script.')
        return
    done = 0
    for src in images:
        dest = DEST / src.relative_to(SOURCE)
        try:
            watermark(src, dest)
            print(f'OK : {src.relative_to(SOURCE)}')
            done += 1
        except Exception as exc:
            print(f'ERREUR : {src.name} : {exc}')
    print(f'\n{done}/{len(images)} image(s) signée(s). Originaux conservés.')


if __name__ == '__main__':
    main()
