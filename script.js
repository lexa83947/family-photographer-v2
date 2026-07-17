/* =============================================
   «ПЛЁНОЧНЫЙ АЛЬБОМ» — interactivity
   ============================================= */

(function () {
  'use strict';

  /* ---------------------------------------
     1) Year in footer
  --------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------
     2) Header — приклеиваем к верху страницы
        (т.к. сверху плёночная перфорация 26px)
  --------------------------------------- */
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 26) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------
     3) Reveal on scroll (IntersectionObserver)
        с поддержкой пружинного «выравнивания»
        карточек портфолио (rotate → 0)
  --------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  const gridItems = document.querySelectorAll('.grid__item');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');
          // восстановить inline-rotate карточки после reveal
          if (el.classList.contains('grid__item')) {
            const r = el.dataset.rotate || '0';
            el.style.setProperty('--restored-rotate', `rotate(${r}deg)`);
          }
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => io.observe(el));
    gridItems.forEach((el, i) => {
      // стаггер для плиток портфолио: колонка за колонкой, не одновременно
      el.style.setProperty('--reveal-delay', `${(i % 4) * 70}ms`);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
    gridItems.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------
     4) Lightbox (галерея портфолио)
  --------------------------------------- */
  const items = Array.from(document.querySelectorAll('[data-lightbox]'));
  const root = document.querySelector('[data-lightbox-root]');
  const imgEl = root ? root.querySelector('[data-lightbox-img]') : null;
  const counterEl = root ? root.querySelector('.lightbox__counter') : null;
  const btnClose = root ? root.querySelector('[data-lightbox-close]') : null;
  const btnPrev = root ? root.querySelector('[data-lightbox-prev]') : null;
  const btnNext = root ? root.querySelector('[data-lightbox-next]') : null;
  let current = -1;

  const updateCounter = () => {
    if (!counterEl) return;
    counterEl.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };

  const openAt = (i) => {
    if (!root || !imgEl || i < 0 || i >= items.length) return;
    current = i;
    const src = items[i].getAttribute('href');
    imgEl.src = src;
    imgEl.alt = items[i].querySelector('img')?.alt || '';
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    updateCounter();
  };
  const close = () => {
    if (!root) return;
    root.hidden = true;
    imgEl.src = '';
    current = -1;
    document.body.style.overflow = '';
  };
  const prev = () => openAt((current - 1 + items.length) % items.length);
  const next = () => openAt((current + 1) % items.length);

  items.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openAt(i);
    });
  });
  if (btnClose) btnClose.addEventListener('click', close);
  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (root && !root.hidden) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
  });
  if (root) {
    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });
  }

  /* ---------------------------------------
     5) Отзывы — открытки
  --------------------------------------- */
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const track = slider.querySelector('.postcards__track');
    const slides = slider.querySelectorAll('.postcard');
    const prevBtn = slider.querySelector('[data-prev]');
    const nextBtn = slider.querySelector('[data-next]');
    const dotsBox = document.querySelector('[data-dots]');
    let idx = 0;

    if (dotsBox && slides.length) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Отзыв ${i + 1}`);
        if (i === 0) b.classList.add('active');
        b.addEventListener('click', () => goTo(i));
        dotsBox.appendChild(b);
      });
    }
    const dots = dotsBox ? dotsBox.querySelectorAll('button') : [];

    const goTo = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('active', j === idx));
    };

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(idx + 1));

    // автопрокрутка: уважаем prefers-reduced-motion (доступность)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;
    if (!prefersReducedMotion) {
      timer = setInterval(() => goTo(idx + 1), 7000);
      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', () => {
        clearInterval(timer);
        timer = setInterval(() => goTo(idx + 1), 7000);
      });
    }
  }

  /* ---------------------------------------
     6) Форма — открытка «улетает»
        Отправляет заявку в Telegram-бот @NadyaFamilyPhotoBot
  --------------------------------------- */
  const TELEGRAM_BOT_TOKEN = '8904516188:AAFsIr88maaDSoRXp3MDj_sACjejeEWgGgw';
  const TELEGRAM_CHAT_ID = '513123664'; // чат с Надей (Telegram)

  const form = document.querySelector('[data-form]');
  if (form) {
    const action = (form.getAttribute('action') || '').trim();
    const hasRealEndpoint = /^https?:\/\//i.test(action)
      && !action.includes('your-form-id');

    const showReply = (title, text) => {
      // убираем предыдущую открытку, если она ещё висит
      const old = form.parentElement.querySelector('.postcard-reply');
      if (old) old.remove();

      form.classList.add('is-sent');
      const reply = document.createElement('div');
      reply.className = 'postcard-reply';
      reply.innerHTML = `
        <p class="postcard-reply__title handwritten">${title}</p>
        <p class="postcard-reply__text">${text}</p>
      `;
      form.parentElement.appendChild(reply);
      requestAnimationFrame(() => reply.classList.add('is-visible'));
      // 30 секунд — чтобы успеть прочитать chat_id
      setTimeout(() => {
        reply.classList.remove('is-visible');
        setTimeout(() => reply.remove(), 600);
      }, 30000);
    };

    // Сообщение, которое бот отправляет клиенту в Telegram
    // (если клиент указал свой @username в форме).
    // Чтобы поменять — отредактируйте текст ниже.
    const CLIENT_GREETING = 'Привет! ✿ Я получила вашу заявку с сайта. ' +
      'Скоро напишу и мы обсудим детали съёмки. ' +
      'А пока — можно посмотреть работы в инстаграме: @nadya.bantsarevich';

    // Нормализовать @username → chat_id (через getChat).
    // Telegram не даёт прямого «username → chat_id», но getChat работает.
    const resolveUsernameToChatId = async (username) => {
      const clean = username.replace(/^@/, '').trim();
      if (!clean) return null;
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: `@${clean}` }),
      });
      const json = await res.json();
      if (json.ok && json.result && json.result.id) {
        return json.result.id;
      }
      return null;
    };

    const sendToTelegram = async (data) => {
      const lines = [
        '✿ Новая заявка с сайта',
        '',
        `Имя: ${data.name || '—'}`,
        `Телефон: ${data.contact || '—'}`,
        `Telegram: ${data.telegram || '—'}`,
        `Тип съёмки: ${data.type || '—'}`,
        `О себе: ${data.about || '—'}`,
      ];
      const text = lines.join('\n');

      // 1) уведомление тебе
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const notify = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      }).then(r => r.json());

      // 2) приветствие клиенту (если указан telegram)
      let clientReply = null;
      if (data.telegram && data.telegram.trim()) {
        try {
          const clientChatId = await resolveUsernameToChatId(data.telegram);
          if (clientChatId) {
            clientReply = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: clientChatId,
                text: CLIENT_GREETING,
              }),
            }).then(r => r.json());
          } else {
            clientReply = { ok: false, reason: 'username_not_resolved_or_not_started_bot' };
          }
        } catch (err) {
          clientReply = { ok: false, error: String(err) };
        }
      }

      return { notify, clientReply };
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      if (TELEGRAM_CHAT_ID === '__SET_ME__') {
        console.error('Telegram: TELEGRAM_CHAT_ID не заполнен в script.js');
        showReply('Техническая ошибка ✿', 'Попробуйте написать в Telegram напрямую — ссылка в контактах.');
        form.reset();
        return;
      }

      try {
        const { notify, clientReply } = await sendToTelegram(data);
        if (notify && notify.ok) {
          let extra = '';
          if (clientReply) {
            extra = clientReply.ok
              ? ' Бот написал вам в Telegram.'
              : ' Откройте @NadyaFamilyPhotoBot и нажмите Start, чтобы бот смог ответить.';
          }
          showReply('Спасибо! ✿', 'Я&nbsp;свяжусь с&nbsp;вами в&nbsp;течение дня.' + extra);
          form.reset();
        } else {
          console.error('Telegram API error:', notify);
          showReply('Ошибка ✿', 'Не получилось отправить. Попробуйте позже или напишите в Telegram напрямую.');
        }
      } catch (err) {
        console.error('Сеть:', err);
        showReply('Ошибка сети ✿', 'Проверьте подключение и попробуйте ещё раз.');
      }
    });
  }

  /* ---------------------------------------
     7) Smooth scroll для in-page ссылок
  --------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------------------------------------
     8) Пасхалка: клик по лого → показать дату-штамп
        на всех полароидах
  --------------------------------------- */
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      document.body.classList.toggle('show-dates');
    });
  }
})();