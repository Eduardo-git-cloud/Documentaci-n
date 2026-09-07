/**
 * ============================================================
 * PULMÓN VERDE - Módulo JavaScript Principal
 * ============================================================
 * Funcionalidades:
 *  1. Navbar sticky con detección de scroll
 *  2. Menú móvil hamburger (toggle + cierre automático)
 *  3. Animaciones de entrada al scroll (Intersection Observer)
 *  4. Validación de formulario de cotización
 *  5. Smooth scroll para navegación interna
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar todos los módulos
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initFormValidation();
  initSmoothScroll();
});


/* ----------------------------------------------------------
   MÓDULO 1: NAVBAR STICKY
   Detecta scroll > 50px y añade clase para fondo sólido
   ---------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Umbral de scroll para activar el estado "scrolled"
  const SCROLL_THRESHOLD = 50;

  // Función optimizada con requestAnimationFrame
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }

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
   MÓDULO 2: MENÚ MÓVIL (HAMBURGER)
   Abre/cierra menú lateral y gestiona atributos ARIA
   ---------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!toggleBtn || !mobileMenu) return;

  const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

  /**
   * Alterna el estado abierto/cerrado del menú móvil
   */
  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');

    // Actualizar atributos ARIA para accesibilidad
    toggleBtn.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);

    // Cambiar icono del botón
    const icon = toggleBtn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = isOpen ? 'close' : 'menu';
    }

    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /**
   * Cierra el menú móvil explícitamente
   */
  function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');

    const icon = toggleBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'menu';

    document.body.style.overflow = '';
  }

  // Event listener del botón hamburger
  toggleBtn.addEventListener('click', toggleMenu);

  // Cerrar menú al hacer click en cualquier link del menú móvil
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar menú al redimensionar a desktop (>=768px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu.classList.contains('mobile-menu--open')) {
      closeMenu();
    }
  });
}


/* ----------------------------------------------------------
   MÓDULO 3: ANIMACIONES DE ENTRADA AL SCROLL
   Usa IntersectionObserver para detectar elementos visibles
   ---------------------------------------------------------- */
function initScrollAnimations() {
  // Seleccionar elementos que queremos animar
  const animatedElements = document.querySelectorAll(
    '.service-card, .project-card, .section__header, .quote-card'
  );

  if (animatedElements.length === 0) return;

  // Añadir clase base de animación a cada elemento
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
  });

  /**
   * IntersectionObserver: detecta cuando un elemento entra al viewport
   * rootMargin: inicia la animación 50px antes de que sea visible
   * threshold: dispara cuando al menos 10% del elemento es visible
   */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll--visible');

        // Dejar de observar una vez animado (one-shot)
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  animatedElements.forEach(el => observer.observe(el));
}


/* ----------------------------------------------------------
   MÓDULO 4: VALIDACIÓN DE FORMULARIO
   Validación en tiempo real + submit con feedback visual
   ---------------------------------------------------------- */
function initFormValidation() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  // Campos a validar
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

  /**
   * Muestra error en un campo específico
   */
  function showError(fieldKey) {
    const field = fields[fieldKey];
    const input = field.element;
    const errorSpan = input.parentElement.querySelector('.form__error');

    input.classList.add('form__input--error');
    input.classList.remove('form__input--valid');

    if (errorSpan) {
      errorSpan.textContent = field.message;
    }
  }

  /**
   * Limpia el error de un campo
   */
  function clearError(fieldKey) {
    const field = fields[fieldKey];
    const input = field.element;
    const errorSpan = input.parentElement.querySelector('.form__error');

    input.classList.remove('form__input--error');

    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  /**
   * Marca un campo como válido
   */
  function markValid(fieldKey) {
    const field = fields[fieldKey];
    const input = field.element;

    input.classList.remove('form__input--error');
    input.classList.add('form__input--valid');
  }

  /**
   * Valida un campo individual
   */
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

  // Validación en tiempo real (al salir del campo - blur)
  Object.keys(fields).forEach(key => {
    const input = fields[key].element;
    if (!input) return;

    input.addEventListener('blur', () => {
      // Solo validar si el usuario ya escribió algo
      if (input.value.trim() !== '') {
        validateField(key);
      }
    });

    // Limpiar error al empezar a escribir de nuevo
    input.addEventListener('input', () => {
      clearError(key);
    });
  });

  // Validación al enviar el formulario
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;

    // Validar todos los campos obligatorios
    Object.keys(fields).forEach(key => {
      if (!validateField(key)) {
        isValid = false;
      }
    });

    if (isValid) {
      // ÉXITO: Simular envío (aquí conectarías con tu backend)
      const submitBtn = form.querySelector('.btn--submit');
      const originalText = submitBtn.innerHTML;

      // Feedback visual de carga
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">sync</span>
        Enviando...
      `;

      // Simular latencia de red (1.5s)
      setTimeout(() => {
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
          ¡Solicitud enviada!
        `;
        submitBtn.style.backgroundColor = '#357A3E';

        // Resetear formulario después de mostrar éxito
        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';

          // Limpiar estados de validación
          Object.keys(fields).forEach(key => {
            fields[key].element.classList.remove('form__input--valid');
          });
        }, 2500);
      }, 1500);

    } else {
      // ERROR: Enfocar el primer campo inválido
      const firstInvalid = form.querySelector('.form__input--error');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });
}


/* ----------------------------------------------------------
   MÓDULO 5: SMOOTH SCROLL
   Navegación suave entre secciones con offset para navbar
   ---------------------------------------------------------- */
function initSmoothScroll() {
  // Seleccionar todos los links que apuntan a anclas internas
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  const NAVBAR_HEIGHT = 80; // Altura del navbar sticky

  anchorLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      // Ignorar links vacíos o solo "#"
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      // Calcular posición con offset del navbar
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Actualizar link activo en navbar
      updateActiveNavLink(href);
    });
  });

  /**
   * Actualiza visualmente el link activo en la navegación desktop
   */
  function updateActiveNavLink(activeHref) {
    const navLinks = document.querySelectorAll('.navbar__link');

    navLinks.forEach(link => {
      link.classList.remove('navbar__link--active');
      if (link.getAttribute('href') === activeHref) {
        link.classList.add('navbar__link--active');
      }
    });
  }
}