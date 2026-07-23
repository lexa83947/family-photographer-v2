#!/usr/bin/env python3
"""
Генерирует og-image.jpg (1200×630) для Open Graph / Telegram / Facebook.
Использует photographer.jpg, делает head-crop до 1200×630
и накладывает плашку с именем.

Запуск: python3 scripts/make-og-image.py
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 1200, 630
SRC = 'assets/photographer.jpg'
OUT = 'assets/og-image.jpg'


def load_font(size, bold=False):
    """Пытаемся найти системные шрифты. Если нет — fallback."""
    candidates = []
    if bold:
        candidates += [
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/Library/Fonts/Arial Bold.ttf',
        ]
    else:
        candidates += [
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            '/Library/Fonts/Arial.ttf',
        ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    if not os.path.exists(SRC):
        print(f'Нет {SRC}', flush=True)
        return
    src = Image.open(SRC).convert('RGB')
    sw, sh = src.size
    print(f'Источник: {sw}×{sh}')

    # Head-crop: оставим верхнюю часть портрета (где лицо),
    # обрежем до квадрата по центру, потом впишем в 1200×630.
    # У вертикального 853×1280 лицо обычно в верхней трети.
    # Берём квадрат с центром выше середины (1/3 высоты).
    side = min(sw, sh)  # 853
    left = (sw - side) // 2
    top = int(sh * 0.12)  # начинаем чуть выше
    src = src.crop((left, top, left + side, top + side))
    # src теперь 853×853, лицо примерно по центру

    # Resize до 1200×630 с сохранением пропорций (cover) + crop по бокам
    # Целевое соотношение: 1200/630 ≈ 1.905
    # Исходное: 1.0 (квадрат)
    # Нам нужно расширить по бокам — поэтому scale до высоты 630, потом обрежем бока до 1200.
    scale = H / 853
    new_w = int(853 * scale)  # ≈ 630
    src = src.resize((new_w, H), Image.LANCZOS)
    # обрезаем симметрично до 1200
    if new_w < W:
        # надо расширить — не может быть, т.к. H/side = 630/853 = 0.738 → 853*0.738=630
        # фактически new_w == 630
        # значит картинка УЖЕ, чем 1200. Решение: padding по бокам.
        canvas = Image.new('RGB', (W, H), (58, 74, 46))  # --olive
        x = (W - new_w) // 2
        canvas.paste(src, (x, 0))
        src = canvas
    elif new_w > W:
        # обрезаем центр
        x = (new_w - W) // 2
        src = src.crop((x, 0, x + W, H))

    print(f'После обработки: {src.size}')

    # Лёгкий затемняющий градиент снизу — для читаемости текста
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    # градиент от 0 (прозрачно) вверху до ~180 (тёмный) снизу
    for y in range(H):
        if y < H * 0.55:
            a = 0
        else:
            # от 0 на 55% до 170 на 100%
            t = (y - H * 0.55) / (H * 0.45)
            a = int(170 * min(1, t))
        draw.line([(0, y), (W, y)], fill=(0, 0, 0, a))
    src = src.convert('RGBA')
    src = Image.alpha_composite(src, overlay)
    src = src.convert('RGB')

    # Текст плашка
    draw = ImageDraw.Draw(src)
    # Имя (рукописный шрифт Caveat доступен в Google Fonts — скачаем или используем системный)
    # Системного рукописного обычно нет, берём жирный sans
    title_font = load_font(72, bold=True)
    sub_font = load_font(28, bold=False)

    title = 'Надя ✿ семейный фотограф'
    sub = 'Минск · плёночная, тёплая, настоящая'

    # title
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (W - tw) // 2
    ty = H - th - 90
    # лёгкая "тень" для контраста
    for off in [(2, 2), (-2, 2), (2, -2), (-2, -2)]:
        draw.text((tx + off[0], ty + off[1]), title, font=title_font,
                  fill=(0, 0, 0, 200))
    draw.text((tx, ty), title, font=title_font, fill=(244, 233, 212))  # --paper

    # sub
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    sw_t = bbox[2] - bbox[0]
    sh_t = bbox[3] - bbox[1]
    sx = (W - sw_t) // 2
    sy = ty + th + 8
    draw.text((sx, sy), sub, font=sub_font, fill=(244, 233, 212))

    # Сохраняем
    src.save(OUT, 'JPEG', quality=85, optimize=True, progressive=True)
    size = os.path.getsize(OUT)
    print(f'OK: {OUT} ({W}×{H}, {size//1024} KB)')


if __name__ == '__main__':
    main()
