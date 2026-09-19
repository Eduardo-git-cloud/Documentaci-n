/**
 * ============================================================
 * PULMÓN VERDE - Módulo JavaScript Principal
 * ============================================================
 * Funcionalidades:
 *  1. Navbar sticky & ScrollSpy (detección de sección activa)
 *  2. Menú móvil interactivo (Hamburger + ARIA)
 *  3. Animaciones al scroll con IntersectionObserver
 *  4. Navegación fluida (Smooth Scroll con offset)
 *  5. Slider interactivo Antes / Después (Touch & Mouse)
 *  6. Filtro dinámico de proyectos por categoría
 *  7. Cotizador digital / Calculadora inteligente de presupuestos
 *  8. Acordeón de preguntas frecuentes (FAQ)
 *  9. Validación en tiempo real y envío de formulario de cotización
 *  10. Botón flotante 'Volver arriba' y sistema de notificaciones Toast
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollSpy();
  initMobileMenu();
  initScrollAnimations();
  initSmoothScroll();
  initBeforeAfterSlider();
  initPortfolioFilter();
  initCalculator();
  initFaqAccordion();
  initFormValidation();
  initScrollToTop();
});


/* ----------------------------------------------------------
   1. NAVBAR STICKY
   ---------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40;
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
  }, { passive: true });
}


/* ----------------------------------------------------------
   2. SCROLLSPY (Actualización automática de enlaces activos)
   ---------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('#desktopNav .navbar__link');
  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('navbar__link--active');
          } else {
            link.classList.remove('navbar__link--active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => spyObserver.observe(sec));
}


/* ----------------------------------------------------------
   3. MENÚ MÓVIL (HAMBURGER)
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
    if (icon) {
      icon.textContent = isOpen ? 'close' : 'menu';
    }
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

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 960 && mobileMenu.classList.contains('mobile-menu--open')) {
      closeMenu();
    }
  });
}


/* ----------------------------------------------------------
   4. ANIMACIONES AL SCROLL
   ---------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.service-card, .project-card, .process-card, .testimonial-card, .comparison-card, .calculator-card, .section__header'
  );

  if (!animatedElements.length) return;

  animatedElements.forEach(el => el.classList.add('animate-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  animatedElements.forEach(el => observer.observe(el));
}


/* ----------------------------------------------------------
   5. NAVEGACIÓN SUAVE (SMOOTH SCROLL)
   ---------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const NAVBAR_HEIGHT = 76;

  links.forEach(link => {
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
    });
  });
}


/* ----------------------------------------------------------
   6. SLIDER ANTES Y DESPUÉS
   ---------------------------------------------------------- */
function initBeforeAfterSlider() {
  const card = document.getElementById('comparisonCard');
  const beforeWrapper = document.getElementById('beforeImageWrapper');
  const handle = document.getElementById('sliderHandle');
  if (!card || !beforeWrapper || !handle) return;

  let isDragging = false;

  function setSliderPosition(percentage) {
    // Clamping entre 5% y 95% para preservar visibilidad de ambos lados
    const clamped = Math.max(5, Math.min(95, percentage));
    beforeWrapper.style.width = `${clamped}%`;
    handle.style.left = `${clamped}%`;
    handle.setAttribute('aria-valuenow', Math.round(clamped));
  }

  function getPercentageFromEvent(e) {
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    return (offsetX / rect.width) * 100;
  }

  function onStart(e) {
    isDragging = true;
    setSliderPosition(getPercentageFromEvent(e));
  }

  function onMove(e) {
    if (!isDragging) return;
    setSliderPosition(getPercentageFromEvent(e));
  }

  function onEnd() {
    isDragging = false;
  }

  // Mouse Events
  card.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  // Touch Events
  card.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);

  // Teclado (Accesibilidad)
  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') {
      setSliderPosition(current - 5);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setSliderPosition(current + 5);
      e.preventDefault();
    }
  });
}


/* ----------------------------------------------------------
   7. FILTRO DE PROYECTOS POR CATEGORÍA
   ---------------------------------------------------------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.portfolio-filter');
  const projectCards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar botón activo
      filterBtns.forEach(b => {
        b.classList.remove('portfolio-filter--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('portfolio-filter--active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      // Filtrar tarjetas
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          // Micro animación de reentrada
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}


/* ----------------------------------------------------------
   8. COTIZADOR DIGITAL INTELIGENTE
   ---------------------------------------------------------- */
function initCalculator() {
  const serviceBtns = document.querySelectorAll('.calc-btn-option');
  const areaSlider = document.getElementById('areaSlider');
  const areaDisplay = document.getElementById('areaValueDisplay');
  const optSmartSensors = document.getElementById('optSmartSensors');
  const optNativePlants = document.getElementById('optNativePlants');
  const optLighting = document.getElementById('optLighting');

  const calculatedPrice = document.getElementById('calculatedPrice');
  const calculatedPeriod = document.getElementById('calculatedPeriod');
  const calculatedWaterSave = document.getElementById('calculatedWaterSave');
  const calculatedTime = document.getElementById('calculatedTime');
  const applyBtn = document.getElementById('applyQuoteBtn');

  if (!areaSlider || !calculatedPrice) return;

  let currentService = 'diseno';
  let currentBasePrice = 12; // $/m2

  function calculate() {
    const area = parseInt(areaSlider.value, 10);
    areaDisplay.textContent = `${area} m²`;

    let multiplier = 1;
    if (optSmartSensors && optSmartSensors.checked) multiplier += 0.15;
    if (optNativePlants && optNativePlants.checked) multiplier += 0.10;
    if (optLighting && optLighting.checked) multiplier += 0.12;

    let total = Math.round(area * currentBasePrice * multiplier);

    // Ajustar sufijo según servicio
    if (currentService === 'mantenimiento') {
      calculatedPeriod.textContent = '/ mensual programado';
      calculatedTime.textContent = 'Visitas cada 15 días';
    } else {
      calculatedPeriod.textContent = '/ inversión estimada';
      if (area < 80) calculatedTime.textContent = '3 a 5 días hábiles';
      else if (area < 200) calculatedTime.textContent = '6 a 10 días hábiles';
      else calculatedTime.textContent = '12 a 18 días hábiles';
    }

    // Ahorro de agua
    if (currentService === 'riego' || currentService === 'integral') {
      const extraSave = optNativePlants && optNativePlants.checked ? 5 : 0;
      calculatedWaterSave.textContent = `-${40 + extraSave}% en factura`;
    } else if (optNativePlants && optNativePlants.checked) {
      calculatedWaterSave.textContent = '-25% por especies nativas';
    } else {
      calculatedWaterSave.textContent = '-15% optimización básica';
    }

    // Formatear precio con separador de miles
    calculatedPrice.textContent = total.toLocaleString('es-CL');
  }

  // Selección de servicio
  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceBtns.forEach(b => b.classList.remove('calc-btn-option--active'));
      btn.classList.add('calc-btn-option--active');
      currentService = btn.getAttribute('data-service');
      currentBasePrice = parseFloat(btn.getAttribute('data-base-price')) || 12;
      calculate();
    });
  });

  // Slider de área
  areaSlider.addEventListener('input', calculate);

  // Checkboxes
  if (optSmartSensors) optSmartSensors.addEventListener('change', calculate);
  if (optNativePlants) optNativePlants.addEventListener('change', calculate);
  if (optLighting) optLighting.addEventListener('change', calculate);

  // Botón "Aplicar al Formulario de Contacto"
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const selectService = document.getElementById('service');
      const inputArea = document.getElementById('terrainArea');
      const inputDetails = document.getElementById('details');

      if (selectService) {
        if (currentService === 'integral') selectService.value = 'integral';
        else if (currentService === 'riego') selectService.value = 'riego';
        else if (currentService === 'mantenimiento') selectService.value = 'mantenimiento';
        else selectService.value = 'diseno';
      }

      if (inputArea) {
        inputArea.value = `${areaSlider.value} m²`;
      }

      if (inputDetails) {
        const extrasList = [];
        if (optSmartSensors && optSmartSensors.checked) extrasList.push('Sensores Smart WiFi');
        if (optNativePlants && optNativePlants.checked) extrasList.push('Especies autóctonas sustentables');
        if (optLighting && optLighting.checked) extrasList.push('Iluminación solar LED');

        inputDetails.value = `Cotización desde Calculadora Web: ${areaSlider.value} m², Servicio: ${currentService}. Adicionales: ${extrasList.length ? extrasList.join(', ') : 'Ninguno'}.`;
      }

      // Scroll hacia formulario
      const contactSection = document.getElementById('contacto');
      if (contactSection) {
        const offset = contactSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }

      showToast('¡Datos de la calculadora aplicados al formulario! Completa tus datos de contacto.', 'info');
    });
  }

  // Ejecutar cálculo inicial
  calculate();
}


/* ----------------------------------------------------------
   9. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   ---------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const content = item.querySelector('.faq-item__content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('faq-item--active');

      // Cerrar los demás acordeones para UX limpia
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('faq-item--active');
        const otherTrigger = otherItem.querySelector('.faq-item__trigger');
        const otherContent = otherItem.querySelector('.faq-item__content');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        if (otherContent) otherContent.hidden = true;
      });

      // Alternar estado del elemento actual
      if (!isActive) {
        item.classList.add('faq-item--active');
        trigger.setAttribute('aria-expanded', 'true');
        content.hidden = false;
      }
    });
  });
}


/* ----------------------------------------------------------
   10. VALIDACIÓN Y ENVÍO DE FORMULARIO
   ---------------------------------------------------------- */
function initFormValidation() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const fields = {
    name: {
      element: document.getElementById('name'),
      validate: (v) => v.trim().length >= 3,
      message: 'Ingresa tu nombre completo (al menos 3 caracteres)'
    },
    phone: {
      element: document.getElementById('phone'),
      validate: (v) => /^[\+\d\s\-\(\)]{7,}$/.test(v.trim()),
      message: 'Ingresa un número telefónico o WhatsApp válido'
    },
    email: {
      element: document.getElementById('email'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Ingresa un correo electrónico válido'
    },
    service: {
      element: document.getElementById('service'),
      validate: (v) => v !== '' && v !== null,
      message: 'Por favor selecciona un tipo de servicio'
    }
  };

  function showError(key) {
    const field = fields[key];
    const input = field.element;
    if (!input) return;
    const parent = input.closest('.form__group');
    const errorSpan = parent ? parent.querySelector('.form__error') : null;

    input.classList.add('form__input--error');
    input.classList.remove('form__input--valid');
    if (errorSpan) errorSpan.textContent = field.message;
  }

  function clearError(key) {
    const field = fields[key];
    const input = field.element;
    if (!input) return;
    const parent = input.closest('.form__group');
    const errorSpan = parent ? parent.querySelector('.form__error') : null;

    input.classList.remove('form__input--error');
    if (errorSpan) errorSpan.textContent = '';
  }

  function markValid(key) {
    const field = fields[key];
    const input = field.element;
    if (!input) return;
    input.classList.remove('form__input--error');
    input.classList.add('form__input--valid');
  }

  function validateField(key) {
    const field = fields[key];
    if (!field.element) return true;
    const value = field.element.value;

    if (!field.validate(value)) {
      showError(key);
      return false;
    } else {
      clearError(key);
      markValid(key);
      return true;
    }
  }

  // Validación al desenfocar
  Object.keys(fields).forEach(key => {
    const input = fields[key].element;
    if (!input) return;

    input.addEventListener('blur', () => {
      if (input.value.trim() !== '') validateField(key);
    });

    input.addEventListener('input', () => {
      clearError(key);
    });
  });

  // Enlace desde tarjetas de servicio a selector de servicio
  const serviceCTAs = document.querySelectorAll('[data-service-select]');
  serviceCTAs.forEach(cta => {
    cta.addEventListener('click', () => {
      const targetService = cta.getAttribute('data-service-select');
      const select = document.getElementById('service');
      if (select && targetService) {
        select.value = targetService;
        validateField('service');
      }
    });
  });

  // Envío del Formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(fields).forEach(key => {
      if (!validateField(key)) isValid = false;
    });

    if (isValid) {
      const submitBtn = form.querySelector('.btn--submit');
      const originalHtml = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="animation: spin 1s infinite linear;" aria-hidden="true">sync</span>
        <span>Procesando solicitud...</span>
      `;

      setTimeout(() => {
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
          <span>¡Cotización Solicitada con Éxito!</span>
        `;
        submitBtn.style.backgroundColor = '#357A3E';

        showToast('¡Gracias por tu solicitud! Nos pondremos en contacto contigo en menos de 24 horas.', 'success');

        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
          submitBtn.style.backgroundColor = '';

          Object.keys(fields).forEach(key => {
            if (fields[key].element) {
              fields[key].element.classList.remove('form__input--valid');
            }
          });
        }, 3000);
      }, 1200);

    } else {
      const firstInvalid = form.querySelector('.form__input--error');
      if (firstInvalid) firstInvalid.focus();
    }
  });
}


/* ----------------------------------------------------------
   11. BOTÓN VOLVER ARRIBA
   ---------------------------------------------------------- */
function initScrollToTop() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('scroll-top-btn--visible');
    } else {
      scrollBtn.classList.remove('scroll-top-btn--visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ----------------------------------------------------------
   12. SISTEMA DE NOTIFICACIONES TOAST
   ---------------------------------------------------------- */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const iconName = type === 'success' ? 'check_circle' : 'info';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${type === 'success' ? '#357A3E' : '#F2801F'};" aria-hidden="true">${iconName}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
