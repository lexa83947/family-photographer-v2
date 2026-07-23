#!/usr/bin/env python3
"""
Конвертирует JPG-фото в WebP (плитка + полный размер).
Оптимизация для семейного сайта.

Использование:
    python3 scripts/convert-to-webp.py

Результат:
    assets/family-XX.thumb.webp   — 400×600, q=80 (~30 КБ) для плиток
    assets/family-XX.webp         — 1152×?, q=85 (~80 КБ) для лайтбокса
    assets/photographer.webp      — q=82 для hero
"""
from PIL import Image
import os
import sys

ASSETS = 'assets'
THUMB_MAX = 400    # ширина плитки
FULL_QUALITY = 85  # качество для полного
THUMB_QUALITY = 80 # качество для плитки


def convert_one(src_path):
    name, ext = os.path.splitext(os.path.basename(src_path))
    if ext.lower() not in ('.jpg', '.jpeg'):
        return None

    img = Image.open(src_path)
    # EXIF orientation
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # RGB (WebP не поддерживает CMYK)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    out_full = os.path.join(ASSETS, f'{name}.webp')
    img.save(out_full, 'WEBP', quality=FULL_QUALITY, method=6)

    # thumb
    img_thumb = img.copy()
    img_thumb.thumbnail((THUMB_MAX, 9999), Image.LANCZOS)
    out_thumb = os.path.join(ASSETS, f'{name}.thumb.webp')
    img_thumb.save(out_thumb, 'WEBP', quality=THUMB_QUALITY, method=6)

    orig_size = os.path.getsize(src_path)
    new_size = os.path.getsize(out_full)
    thumb_size = os.path.getsize(out_thumb)
    saved = orig_size - new_size
    print(f'  {name}: {orig_size//1024}KB → {new_size//1024}KB (full), {thumb_size//1024}KB (thumb) — saved {saved//1024}KB')
    return out_full, out_thumb


def main():
    if not os.path.isdir(ASSETS):
        print(f'Нет папки {ASSETS}/', file=sys.stderr)
        sys.exit(1)

    targets = [f for f in os.listdir(ASSETS) if f.startswith('family-') and f.lower().endswith('.jpg')]
    targets.sort()

    if not targets:
        print('Нет family-*.jpg в assets/', file=sys.stderr)
        sys.exit(1)

    print(f'Конвертирую {len(targets)} файлов...')
    total_orig = 0
    total_new = 0
    for t in targets:
        sizes = convert_one(os.path.join(ASSETS, t))
        if sizes:
            total_orig += os.path.getsize(os.path.join(ASSETS, t))
            total_new += os.path.getsize(sizes[0])

    # photographer
    if os.path.exists(os.path.join(ASSETS, 'photographer.jpg')):
        print()
        print('photographer.jpg:')
        img = Image.open(os.path.join(ASSETS, 'photographer.jpg'))
        try:
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass
        if img.mode != 'RGB':
            img = img.convert('RGB')
        out = os.path.join(ASSETS, 'photographer.webp')
        img.save(out, 'WEBP', quality=82, method=6)
        orig = os.path.getsize(os.path.join(ASSETS, 'photographer.jpg'))
        new = os.path.getsize(out)
        total_orig += orig
        total_new += new
        print(f'  photographer: {orig//1024}KB → {new//1024}KB')

    print()
    print(f'ИТОГО: {total_orig//1024}KB → {total_new//1024}KB (экономия {(total_orig-total_new)//1024}KB, {(total_orig-total_new)*100//total_orig}%)')


if __name__ == '__main__':
    main()
