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
