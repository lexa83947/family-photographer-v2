# Changelog

Все заметные изменения документируются здесь. Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [2.0.0] — 2026-07-24

### ✨ Главное

Полный редизайн в эстетике «плёночный альбом из 80-х»: повёрнутые полароиды,
рукописные подписи маркером, штампы `KODACOLOR · 86`, малярный скотч, зубчатые
билеты, открытки-отзывы, форма-почтовая открытка. Палитра «тёплая бумага»,
4 рукописных/серифных шрифта с поддержкой кириллицы, пружинные анимации.

### ✅ Добавлено

- **Контент:** реальные цены (250 / 200 / 300 BYN), 3 отзыва, биография,
  осмысленные alt-тексты на 16 фото
- **Hero-портрет** заменил `home-screenshot.png`
- **WebP-версии** всех 16 фото + hero (`-480` для мобильных), jpg-фолбэк через `<picture>`
- **Open Graph / Twitter Card** + `og-image.jpg` (1200×630) + `og:image:alt`
- **Schema.org `LocalBusiness`** JSON-LD
- **`robots.txt` + `sitemap.xml`**
- **Favicon** (32×32 ICO, буква «Н»)
- **`<link rel="preload">`** для Caveat и EB Garamond
- **Асинхронная загрузка Google Fonts** (`media="print" onload="this.media='all'"`)
- **Skip-link** «Перейти к содержимому»
- **Фокус-менеджмент** в лайтбоксе (захват + возврат)
- **aria-label** на всех иконочных кнопках
- **`prefers-reduced-motion`** отключает автопрокрутку отзывов и анимации
- **`script.min.js`** (terser, 7.8 КБ) подключён с `defer`

### 🔧 Изменено

- **Шрифт заголовков:** `Caveat Brush` → `Caveat` (поддержка кириллицы)
- **Палитра:** `--stamp: #B8472A` → `#A33D24`, `--olive: #7A6A4D` → `#5C4F36`,
  `--ink: #2A1F12` → `#3A2E1F` — усилена контрастность для WCAG AA
- **Форма:** Formspree (заглушка) → Telegram-бот `@NadyaFamilyPhotoBot`
  (реальная отправка в личку `@bantsarevich`)
- **Inline-стили на мобильных:** `min-width: 0` на детях грида
  (фикс overflow на 360 px)
- **Цена на featured-билете:** с `var(--stamp)` на `var(--polaroid)` (фикс
  color-contrast в Lighthouse)

### 🐛 Исправлено

- Переполнение `.about__inner` на 360 px (iPhone SE) — `min-width: 0`
- 404 на `/favicon.ico` — добавлен favicon
- `label-content-name-mismatch` на `.logo` (убран `aria-label` без видимого текста)
- `color-contrast` на featured-билете (4.5:1+ на всех текстах)
- `forced reflow` от inline-скрипта (перенесён в `script.min.js` с `defer`)

### 📊 Lighthouse (production)

| Категория | v1 | v2.0.0 |
|-----------|----|--------|
| Performance | ~70 | **95** |
| Accessibility | ~85 | **100** |
| Best Practices | ~85 | **100** |
| SEO | ~70 | **100** |

### 📁 Структура

- Добавлено: `script.min.js`, `favicon.ico`, `assets/og-image.jpg`,
  `assets/photographer-480.{jpg,webp}`, `assets/family-*.webp`, `robots.txt`,
  `sitemap.xml`, `scripts/make-og-image.py`, `docs/PLAN.md`,
  `docs/CONTENT-REQUEST.md`, `CHANGELOG.md`
- Удалено: `home-screenshot.png` (мок-картинка с первых дней)

## [1.0.0] — ранее

Скандинавский минимализм: Fraunces + Inter, бежевая палитра, идеальные сетки.
Не публиковался, сохранён как референс стиля.
