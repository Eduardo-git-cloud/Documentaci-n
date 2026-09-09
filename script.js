/**
 * ============================================================
 * PULMÓN VERDE - Módulo JavaScript Principal v2.0
 * Optimizado para 60fps, animaciones GPU-accelerated y
 * validación reactiva con feedback visual premium.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initFormValidation();
  initSmoothScroll();
});


/* ----------------------------------------------------------
   MÓDULO 1: NAVBAR STICKY
   requestAnimationFrame para máximo rendimiento (60fps).
   ---------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 50;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY || window.pageYOffset;
    navbar.classList.toggle('navbar--scrolled', scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });
}


/* ----------------------------------------------------------
   MÓDULO 2: MENÚ MÓVIL
   ---------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!toggleBtn || !mobileMenu) return;

  const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);

    const icon = toggleBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isOpen ? 'close' : 'menu';

    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');

    const icon = toggleBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'menu';

    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu.classList.contains('mobile-menu--open')) {
      closeMenu();
    }
  });
}


/* ----------------------------------------------------------
   MÓDULO 3: ANIMACIONES DE ENTRADA POR SCROLL
   IntersectionObserver optimizado con rootMargin negativo
   para iniciar la animación antes de que el elemento sea 100%
   visible. Solo usa transform y opacity (GPU layers).
   ---------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  if (animatedElements.length === 0) return;

  // Aplicar clase base de animación a cada elemento
  animatedElements.forEach(el => el.classList.add('animate-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Añadir will-change momentáneamente para optimizar composición
        entry.target.style.willChange = 'transform, opacity';
        entry.target.classList.add('animate-on-scroll--visible');

        // Liberar will-change después de la transición para ahorrar GPU
        entry.target.addEventListener('transitionend', () => {
          entry.target.style.willChange = 'auto';
        }, { once: true });

        observer.unobserve(entry.target);
      }
    });
  }, {
    // rootMargin negativo: dispara cuando el elemento está entrando
    // al viewport (150px antes de ser completamente visible)
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  });

  animatedElements.forEach(el => observer.observe(el));
}


/* ----------------------------------------------------------
   MÓDULO 4: VALIDACIÓN DE FORMULARIO
   Validación reactiva con regex + feedback visual premium:
   - Shake suave en errores (GPU: solo translateX)
   - Transición fluida de colores en estados valid/error
   - Enfoque automático al primer campo inválido
   ---------------------------------------------------------- */
function initFormValidation() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const fields = {
    name: {
      element: document.getElementById('name'),
      validate: (value) => value.trim().length >= 3,
      message: 'El nombre debe tener al menos 3 caracteres'
    },
    phone: {
      element: document.getElementById('phone'),
      validate: (value) => /^[\+\d\s\-\(\)]{7,}$/.test(value.trim()),
      message: 'Ingresa un número de teléfono válido'
    },
    email: {
      element: document.getElementById('email'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: 'Ingresa un correo electrónico válido'
    },
    service: {
      element: document.getElementById('service'),
      validate: (value) => value !== '',
      message: 'Selecciona un tipo de servicio'
    }
  };

  function getErrorSpan(input) {
    return input.closest('.form__group')?.querySelector('.form__error');
  }

  function showError(fieldKey) {
    const field = fields[fieldKey];
    const input = field.element;
    const errorSpan = getErrorSpan(input);

    input.classList.remove('form__input--valid');
    input.classList.add('form__input--error');

    if (errorSpan) {
      errorSpan.textContent = field.message;
      errorSpan.style.opacity = '1';
      errorSpan.style.transform = 'translateY(0)';
    }
  }

  function clearError(fieldKey) {
    const field = fields[fieldKey];
    const input = field.element;
    const errorSpan = getErrorSpan(input);

    input.classList.remove('form__input--error');

    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.opacity = '0';
      errorSpan.style.transform = 'translateY(-4px)';
    }
  }

  function markValid(fieldKey) {
    const input = fields[fieldKey].element;
    input.classList.remove('form__input--error');
    input.classList.add('form__input--valid');
  }

  function validateField(fieldKey) {
    const field = fields[fieldKey];
    const value = field.element.value;

    if (!field.validate(value)) {
      showError(fieldKey);
      return false;
    } else {
      clearError(fieldKey);
      markValid(fieldKey);
      return true;
    }
  }

  // Validación en blur (cuando el usuario sale del campo)
  Object.keys(fields).forEach(key => {
    const input = fields[key].element;
    if (!input) return;

    input.addEventListener('blur', () => {
      if (input.value.trim() !== '') {
        validateField(key);
      }
    });

    // Limpiar error al escribir de nuevo
    input.addEventListener('input', () => {
      if (input.classList.contains('form__input--error')) {
        clearError(key);
      }
    });
  });

  // Submit del formulario
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;
    let firstInvalidKey = null;

    Object.keys(fields).forEach(key => {
      if (!validateField(key)) {
        isValid = false;
        if (!firstInvalidKey) firstInvalidKey = key;
      }
    });

    if (isValid) {
      const submitBtn = form.querySelector('.btn--submit');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">sync</span>
        Enviando...
      `;

      setTimeout(() => {
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
          ¡Solicitud enviada!
        `;
        submitBtn.style.backgroundColor = '#357A3E';

        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          submitBtn.style.backgroundColor = '';

          Object.keys(fields).forEach(key => {
            fields[key].element.classList.remove('form__input--valid');
          });
        }, 2500);
      }, 1500);

    } else {
      // Enfocar el primer campo inválido para accesibilidad
      if (firstInvalidKey) {
        fields[firstInvalidKey].element.focus();
      }
    }
  });
}


/* ----------------------------------------------------------
   MÓDULO 5: SMOOTH SCROLL
   Offset dinámico para el navbar sticky.
   ---------------------------------------------------------- */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const NAVBAR_HEIGHT = 80;

  anchorLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      updateActiveNavLink(href);
    });
  });

  function updateActiveNavLink(activeHref) {
    document.querySelectorAll('.navbar__link').forEach(link => {
      link.classList.toggle('navbar__link--active', link.getAttribute('href') === activeHref);
    });
  }
}