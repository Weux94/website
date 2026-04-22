// ============================================
// Mobile-first сайт — Vanilla JS
// ============================================

// ---------- Бургер-меню ----------

// Знаходимо кнопку-бургер, панель меню та затемнення
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const overlay = document.querySelector('.overlay');

// Функція відкриття/закриття меню
const toggleMenu = () => {
  burger.classList.toggle('burger--active');
  menu.classList.toggle('menu--open');
  overlay.classList.toggle('overlay--visible');
};

// Клік по бургеру — відкрити/закрити меню
burger.addEventListener('click', toggleMenu);

// Клік по затемненню — закрити меню
overlay.addEventListener('click', toggleMenu);

// Клік по звичайному пункту меню — закрити меню
menu.addEventListener('click', (e) => {
  if (e.target.classList.contains('menu__link') || e.target.classList.contains('menu__sublink')) {
    toggleMenu();
  }
});


// ---------- Аккордеон в меню (+/−) ----------

// Знаходимо всі кнопки-аккордеони
const toggleButtons = document.querySelectorAll('.menu__toggle');

toggleButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Знаходимо батьківський li
    const item = btn.closest('.menu__item');
    // Знаходимо іконку +/−
    const icon = btn.querySelector('.menu__icon');
    // Перевіряємо чи вже відкритий
    const isOpen = item.classList.contains('menu__item--open');

    // Закриваємо всі інші відкриті пункти
    toggleButtons.forEach((otherBtn) => {
      const otherItem = otherBtn.closest('.menu__item');
      const otherIcon = otherBtn.querySelector('.menu__icon');
      otherItem.classList.remove('menu__item--open');
      otherIcon.textContent = '+';
    });

    // Якщо цей пункт був закритий — відкриваємо
    if (!isOpen) {
      item.classList.add('menu__item--open');
      icon.textContent = '−';
    }
  });
});


// ---------- Анімація цифр ----------

// Знаходимо всі елементи з цільовим числом (stats в hero, бейджі переваг тощо)
const statNumbers = document.querySelectorAll('[data-target]');

// Функція плавного підрахунку від 0 до цільового числа
const animateNumber = (element) => {
  const target = parseInt(element.dataset.target, 10);
  const duration = 2000;
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out — швидко на початку, повільно в кінці
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

// Запускаємо анімацію коли цифри з'являються на екрані
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateNumber(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach((el) => observer.observe(el));


// ---------- Лента продуктів на головній (snap-scroll + активна точка) ----------

// Знаходимо ленту і точки — якщо ми не на головній, їх не буде
const productsTrack = document.querySelector('.products__track');
const productsDots = document.querySelectorAll('.products__dot');

if (productsTrack && productsDots.length > 0) {
  const productCards = productsTrack.querySelectorAll('.product');
  const prevArrow = document.querySelector('.products__arrow--prev');
  const nextArrow = document.querySelector('.products__arrow--next');

  // Поточний активний індекс — зберігаємо, щоб стрілки знали куди крутити
  let activeIndex = 0;

  // Скрол до карточки по індексу
  const scrollToCard = (index) => {
    if (index < 0 || index >= productCards.length) return;
    productCards[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  // Оновлюємо стан стрілок — на краях ленти відповідна стрілка неактивна
  const updateArrowsState = () => {
    if (prevArrow) prevArrow.disabled = activeIndex === 0;
    if (nextArrow) nextArrow.disabled = activeIndex === productCards.length - 1;
  };

  // При скроллі — визначаємо який індекс активний і підсвічуємо відповідну точку
  const updateActiveDot = () => {
    const scrollLeft = productsTrack.scrollLeft;
    const maxScroll = productsTrack.scrollWidth - productsTrack.clientWidth;

    let closestIndex;

    // Крайові випадки: якщо у самому початку або в самому кінці — фіксуємо перший/останній індекс явно.
    // Без цього на широкому десктопі остання карточка ніколи не буде "в центрі" (за неї нема куди скролити),
    // і алгоритм "closest to center" залипає на передостанній карточці.
    if (scrollLeft <= 1) {
      closestIndex = 0;
    } else if (scrollLeft >= maxScroll - 1) {
      closestIndex = productCards.length - 1;
    } else {
      // Середина ленти — беремо карточку, найближчу до центру viewport
      const trackRect = productsTrack.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestDistance = Infinity;
      closestIndex = 0;

      productCards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - trackCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
    }

    activeIndex = closestIndex;

    productsDots.forEach((dot, i) => {
      dot.classList.toggle('products__dot--active', i === activeIndex);
    });

    updateArrowsState();
  };

  // Слухаємо скролл ленти (throttle через requestAnimationFrame для плавності)
  let scrollRaf = null;
  productsTrack.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateActiveDot();
      scrollRaf = null;
    });
  });

  // Клік по точці — скролимо ленту до відповідної карточки
  productsDots.forEach((dot, i) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => scrollToCard(i));
  });

  // Стрілки — скрол до попередньої/наступної
  if (prevArrow) {
    prevArrow.addEventListener('click', () => scrollToCard(activeIndex - 1));
  }
  if (nextArrow) {
    nextArrow.addEventListener('click', () => scrollToCard(activeIndex + 1));
  }

  // Початковий стан стрілок — попередня неактивна, бо стартуємо з першої карточки
  updateArrowsState();


  // ---- Drag-to-scroll мишкою (десктоп) ----
  // Коли юзер тисне і тягне мишкою — лента скролиться, як при свайпі на телефоні.
  // Складність: треба не плутати перетягування з кліком по лінку всередині карточки.

  let isMouseDown = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let hasDragged = false;

  // При мishdown запам'ятовуємо старт
  productsTrack.addEventListener('mousedown', (e) => {
    // Якщо юзер натиснув прямо по лінку/кнопці — не перехоплюємо
    if (e.target.closest('a, button')) return;

    isMouseDown = true;
    hasDragged = false;
    dragStartX = e.pageX;
    dragStartScroll = productsTrack.scrollLeft;

    // Під час перетягування тимчасово вимикаємо snap — щоб не було "дергання" на кожному кроці
    productsTrack.style.scrollSnapType = 'none';
  });

  // Під час руху — рахуємо зміщення і скролимо вручну
  productsTrack.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;

    const dx = e.pageX - dragStartX;
    // 5 пікселів — поріг "це вже точно drag, а не випадковий мishдвиг"
    if (Math.abs(dx) > 5) {
      hasDragged = true;
      e.preventDefault();
      productsTrack.scrollLeft = dragStartScroll - dx;
    }
  });

  // Завершення перетягування — повертаємо snap, і він сам доїде до найближчої карточки
  const endDrag = () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    productsTrack.style.scrollSnapType = '';
  };

  productsTrack.addEventListener('mouseup', endDrag);
  productsTrack.addEventListener('mouseleave', endDrag);

  // Якщо юзер перетягнув — блокуємо click, що прилетить після mouseup (інакше браузер відкриє лінк)
  productsTrack.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged = false;
    }
  }, true);
}


// ---------- Crossfade слайдер (сторінка проєктів) ----------

// Перевіряємо чи ми на сторінці проєктів
const cfSlides = document.querySelectorAll('.cf-slider__slide');

if (cfSlides.length > 0) {
  const cfDots = document.querySelectorAll('.cf-slider__dot');
  const cfName = document.querySelector('.cf-slider__name');
  const cfDesc = document.querySelector('.cf-slider__desc');
  const cfBtn = document.querySelector('.cf-slider__btn');

  let cfIndex = 0;
  const cfTotal = cfSlides.length;
  let cfTimer = null;

  // Функція переходу до слайду
  const goToCfSlide = (index) => {
    // Прибираємо активний клас з поточного слайду
    cfSlides[cfIndex].classList.remove('cf-slider__slide--active');
    cfDots[cfIndex].classList.remove('cf-slider__dot--active');
    // Оновлюємо індекс (циклічно)
    cfIndex = index % cfTotal;
    // Додаємо активний клас новому слайду
    cfSlides[cfIndex].classList.add('cf-slider__slide--active');
    cfDots[cfIndex].classList.add('cf-slider__dot--active');
    // Оновлюємо інфо-блок під слайдером
    const slide = cfSlides[cfIndex];
    cfName.textContent = slide.dataset.name;
    cfDesc.textContent = slide.dataset.desc;
    cfBtn.href = slide.dataset.url;
  };

  // Автоперемикання кожні 5 секунд
  const startAutoplay = () => {
    cfTimer = setInterval(() => {
      goToCfSlide(cfIndex + 1);
    }, 5000);
  };

  // Клік по крапках
  cfDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(cfTimer);
      goToCfSlide(i);
      startAutoplay();
    });
  });

  // Свайп по слайдеру
  let cfStartX = 0;
  const cfSlidesContainer = document.querySelector('.cf-slider__slides');

  cfSlidesContainer.addEventListener('touchstart', (e) => {
    cfStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  cfSlidesContainer.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - cfStartX;
    if (Math.abs(diff) > 50) {
      clearInterval(cfTimer);
      if (diff < 0) {
        goToCfSlide((cfIndex + 1) % cfTotal);
      } else {
        goToCfSlide((cfIndex - 1 + cfTotal) % cfTotal);
      }
      startAutoplay();
    }
  }, { passive: true });

  // Запускаємо автоперемикання
  startAutoplay();
}
