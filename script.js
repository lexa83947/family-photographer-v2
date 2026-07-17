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
  const TELEGRAM_CHAT_ID = '__SET_ME__'; // см. инструкцию в README

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

    const sendToTelegram = async (data) => {
      const text = [
        '✿ Новая заявка с сайта',
        '',
        `Имя: ${data.name || '—'}`,
        `Контакт: ${data.contact || '—'}`,
        `Тип съёмки: ${data.type || '—'}`,
        `О себе: ${data.about || '—'}`,
      ].join('\n');

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
        }),
      });
      const json = await res.json();
      return json;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      // вспомогательный режим: chat_id не заполнен — бот вернёт подсказку
      if (TELEGRAM_CHAT_ID === '__SET_ME__') {
        console.warn('Telegram: TELEGRAM_CHAT_ID не заполнен. Открываю getUpdates...');
        try {
          const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
          const j = await r.json();
          console.log('getUpdates →', j);
          const updates = j.result || [];
          // ищем первый апдейт, где есть chat.id
          let foundChatId = null;
          for (const u of updates) {
            const c = u.message?.chat || u.edited_message?.chat || u.my_chat_member?.chat;
            if (c && c.id) { foundChatId = c.id; break; }
          }
          if (foundChatId) {
            showReply(
              'Почти готово! ✿',
              `Ваш chat_id: <code>${foundChatId}</code> — подставьте в script.js и перезагрузите страницу.`
            );
          } else {
            showReply(
              'Бот подключён ✿',
              'Напишите боту любое сообщение, обновите страницу и попробуйте снова.'
            );
          }
        } catch (err) {
          console.error('getUpdates error:', err);
          showReply('Ошибка ✿', 'Не удалось связаться с ботом. Проверьте токен.');
        }
        form.reset();
        return;
      }

      try {
        const json = await sendToTelegram(data);
        if (json.ok) {
          showReply('Спасибо! ✿', 'Я&nbsp;свяжусь с&nbsp;вами в&nbsp;течение дня.');
          form.reset();
        } else {
          console.error('Telegram API error:', json);
          showReply('Ошибка ✿', 'Не получилось отправить. Попробуйте позже или напишите в Telegram напрямую.');
        }
      } catch (err) {
        console.error('Сеть:', err);
        showReply('Ошибка сети ✿', 'Проверьте подключение и попробуйте ещё раз.');
      }

      // совместимость со старой логикой Formspree, если когда-нибудь вернётся
      if (hasRealEndpoint) {
        fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        }).catch((err) => console.error('Ошибка отправки:', err));
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