---
name: family-photographer
description: Работа с проектом family-photographer-v2 (сайт-портфолио семейного фотографа в эстетике «плёночный альбом»). Используй, когда пользователь просит запустить сайт локально, проверить здоровье (Lighthouse/axe/форма), пересобрать минификации и ассеты, обновить README/CHANGELOG, закоммитить и запушить, или подготовить проект к релизу. Активируется на фразы про «этот проект», «сайт Нади», «деплой», «Lighthouse», «скриншот», «обнови README».
---

# family-photographer — навык для работы с проектом

Проект: **family-photographer-v2** — статический сайт-портфолио семейного фотографа
Надежды Банцаревич (Минск). Стек: HTML / CSS / vanilla JS, без сборки.
Деплой: Netlify с автодеплоем из `main` (https://taupe-brioche-7aad5d.netlify.app/).

## Когда активировать

- «Запусти сайт локально», «открой в браузере», «покажи как выглядит»
- «Проверь Lighthouse», «прогони axe», «проверь форму», «smoke test»
- «Обнови README», «обнови CHANGELOG», «что нового в v2»
- «Закоммить и запушить», «подготовь релиз», «поставь тег»
- «Пересобери ассеты», «минифицируй JS», «сделай WebP», «обнови og-image»
- «Замени фото», «обнови цены», «поменяй отзыв» — контентные правки

## Структура проекта (запомнить)

```
family-photographer-v2/
├── index.html              ← разметка, ~485 строк
├── styles.css              ← стили
├── script.js               ← исходник (lightbox, slider, scroll-reveal, форма, Telegram-бот)
├── script.min.js           ← минифицированный (для прода, подключён через defer)
├── favicon.ico
├── assets/
│   ├── photographer.jpg / .webp / -480.*
│   ├── family-01..16.jpg / .webp
│   └── og-image.jpg        ← 1200×630, для шаринга
├── scripts/
│   └── make-og-image.py    ← генератор og-image из портрета
├── docs/
│   ├── PLAN.md             ← 2-недельный план релиза
│   ├── CHANGELOG.md
│   └── screenshots/
├── robots.txt
├── sitemap.xml
├── CHANGELOG.md
└── README.md
```

Рабочая директория для команд — `07-Projects/family-photographer-v2/`.

## Ключевые константы

| Что | Значение |
|-----|----------|
| Прод-URL | `https://taupe-brioche-7aad5d.netlify.app/` |
| Репо | `github.com/lexa83947/family-photographer-v2` |
| Telegram-бот | `@NadyaFamilyPhotoBot` |
| Телефон | `+375 44 538 34 06` |
| Email | `nadya124@inbox.ru` |
| Instagram | `instagram.com/nadya.bantsarevich` |
| Услуги | семейная 300 BYN / женский портрет 250 BYN |

⚠️ В `script.js` и `script.min.js` вшиты **токен Telegram-бота и chat_id**.
Это осознанное решение для маленького статического сайта. Не «выносить в env» —
для статики без бэкенда это бессмысленно.

## Команды

### 1. Запустить локально

```bash
cd 07-Projects/family-photographer-v2
python3 -m http.server 8765
```

Затем открыть `http://localhost:8765` через `mcp__playwright__browser_navigate`
и проверить, что:
- 0 ошибок в консоли (`mcp__playwright__browser_console_messages level=error`)
- Hero виден
- Лайтбокс открывается
- Форма отправляется

### 2. Проверить здоровье (smoke test)

Запустить локально или открыть прод через Playwright и проверить:

1. **Консоль** — 0 ошибок. 1 warning про async Google Fonts preload — допустим.
2. **Hero** — картинка видна, alt содержит «Надежда Банцаревич».
3. **Портфолио** — 16 фото, у каждой есть осмысленный alt.
4. **Лайтбокс** — открыть первое фото, нажать Esc, фокус возвращается.
5. **Слайдер отзывов** — кнопки ← → работают, точки кликабельны.
6. **Форма** — заполнить 5 полей, отправить, проверить, что бот получил
   сообщение (владелец смотрит Telegram).
7. **Lighthouse** (опционально):
   ```bash
   npx lighthouse http://localhost:8765 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --quiet
   ```
   Целевые оценки: Performance ≥90, остальные ≥95.

### 3. Пересобрать ассеты

#### Минифицировать JS
```bash
npx terser@5 script.js --compress --mangle --comments=false -o script.min.js
```
Пересобирать **после каждой правки** в `script.js`.

#### Сконвертировать WebP
```bash
cwebp -q 80 assets/family-XX.jpg -o assets/family-XX.webp
cwebp -q 80 assets/photographer.jpg -o assets/photographer.webp
cwebp -q 80 assets/photographer.jpg -o assets/photographer-480.webp  # потом resize до 480
```

Если `cwebp` нет:
```bash
# через imagemagick
convert -quality 80 assets/family-XX.jpg assets/family-XX.webp
```

#### Перегенерировать og-image
```bash
python3 scripts/make-og-image.py
```
Скрипт берёт `assets/photographer.jpg`, кропит до 853×853, ресайзит до 1200×630
с оливковым фоном, накладывает градиент + текст «Надя ✿ семейный фотограф».

### 4. Контентные правки

#### Поменять цену
Файл `index.html`, найти `<span class="handwritten" data-price="...">`, поменять
текст внутри. Затем проверить, что в Schema.org `priceRange` (JSON-LD в конце
`index.html`) диапазон по-прежнему корректен.

#### Добавить/заменить отзыв
В `index.html`, найти `<article class="postcard" data-name="N">`, отредактировать
`<h3>` (имя), `<p class="postcard__date">` (дата), `<blockquote data-review="N">` (текст).
Скрипт сам подставит `data-name` / `data-date` в видимые места.

#### Заменить фото
1. Положить новое в `assets/family-XX.jpg` (имя должно совпадать со старым).
2. Сгенерировать WebP (см. выше).
3. Проверить `alt` в `index.html` — обновить, если сюжет изменился.
4. **Не удалять** старые `.jpg` — они используются как fallback в `<picture>`.

### 5. Обновить README / CHANGELOG

README бывает двух форматов:
- **Технический** (структура, запуск, обновление контента) — для разработчика
- **Финальный проект для сдачи ДЗ** (скриншоты, рефлексия, метрики) — для
  преподавателя

CHANGELOG — формат [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
новая секция сверху с датой.

При добавлении фичи — **обновить оба**: добавить запись в `CHANGELOG.md` и
вписать в соответствующую секцию `README.md`.

### 6. Закоммитить и запушить

```bash
git status                     # посмотреть, что менялось
git diff --stat                # объём изменений
git add -A                     # или точечно по файлам
git commit -m "тип: что сделал" -m "детали"
git push origin main
```

**Conventional commits**, формат: `feat:`, `fix:`, `docs:`, `style:`, `perf:`,
`refactor:`, `chore:`. На русском — допустимо, если так понятнее автору.

⚠️ Netlify автодеплоит из `main`. После `push` подожди ~30 секунд и проверь
прод.

### 7. Подготовить релиз

```bash
# 1. Убедиться, что все изменения закоммичены
git status  # должно быть пусто

# 2. Проверить, что main актуален
git pull origin main

# 3. Обновить версию в CHANGELOG.md (новая секция сверху)

# 4. Поставить тег
git tag vX.Y.Z
git push origin vX.Y.Z
```

**Перед релизом обязательно** сделать smoke test на проде (см. команду 2)
через Playwright.

## Правила безопасности

- **Спрашивать подтверждение** перед удалением файлов в `assets/`, `docs/screenshots/`,
  заменой `photographer.jpg`, изменением `og-image.jpg`, удалением тега.
- **Не трогать** `script.min.js` руками — пересобирать через `terser`.
- **Не редактировать** `script.js` и `script.min.js` в одном коммите без
  пересборки второго.
- **Не удалять** `.DS_Store` (если он появится) — он в `.gitignore`, но если
  попадёт в коммит — попросить разрешения.
- **Не пушить** без явного запроса пользователя. Скилл может подготовить
  коммит, но `git push` — только по команде.

## Частые ошибки (на что смотреть)

| Симптом | Причина | Фикс |
|---------|---------|------|
| `og:image` не показывается | Кэш Telegram/Facebook | Подождать 24ч или залить через https://www.opengraph.xyz/ |
| Hero грузится 200 КБ | Забыли подключить WebP-версию | Проверить `<picture>` в `index.html` |
| `forced reflow` в Lighthouse | Inline `<script>` в `<body>` | Перенести в `<script.min.js defer>` в `<head>` |
| Form отправляет, но бот молчит | Токен отозван | Проверить `@BotFather`, выпустить новый |
| Lightbox не закрывается по Esc | Конфликт с другим обработчиком | Проверить, что в `script.js` только один `keydown` для Escape |
| Mobile overflow на 360px | Дети грида не имеют `min-width: 0` | Добавить `.parent > * { min-width: 0 }` |
| Шрифт не применяется кириллицей | Старый URL шрифта в preload | Закурлить CSS Google Fonts, вытащить актуальные woff/woff2 |
| Lighthouse ругается на color-contrast | `--stamp` или `--ink-soft` слишком светлые | Усилить: `--stamp: #A33D24`, `--olive: #5C4F36` |

## Контекст для следующих сессий

Этот скилл загружается автоматически при работе с проектом. Перед началом задачи
**прочитать `README.md`** (текущее состояние), **`docs/PLAN.md`** (что в работе)
и **`CHANGELOG.md`** (что уже сделано). Это 2 минуты, которые экономят 20
минут на повторное открытие контекста.
