/* ============================================================
   General Cleaning Services — Phoenix, AZ
   Site interactions + LeadrVision form handling
   ============================================================ */
(function () {
  'use strict';

  var ENDPOINT = 'https://vision.leadrai.com/api/forms/494aa799bd78ef34c5334ae6c3aa64d8';

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Populate hidden _page fields on load ---------- */
  var pageFields = document.querySelectorAll('[data-page-field]');
  for (var p = 0; p < pageFields.length; p++) {
    pageFields[p].value = window.location.href;
  }

  /* ---------- Mobile navigation ---------- */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('is-stuck');
      else header.classList.remove('is-stuck');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.card, .review, .steps, .areas__panel, .faq__item, .contact__form-card, .strip__item'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    for (var r = 0; r < revealTargets.length; r++) {
      revealTargets[r].classList.add('reveal');
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var o = 0; o < revealTargets.length; o++) {
      observer.observe(revealTargets[o]);
    }
  }

  /* ---------- Form helpers ---------- */
  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    var wrapper = field.closest('.field');
    if (!wrapper) return;
    var msg = wrapper.querySelector('.field__error');
    if (msg) msg.parentNode.removeChild(msg);
  }

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    var wrapper = field.closest('.field');
    if (!wrapper) return;
    var msg = wrapper.querySelector('.field__error');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'field__error';
      wrapper.appendChild(msg);
    }
    msg.textContent = message;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    var digits = value.replace(/[^0-9]/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  function validateForm(form) {
    var ok = true;
    var firstInvalid = null;
    var fields = form.querySelectorAll('input, select, textarea');

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === 'hidden' || field.name === '_gotcha') continue;

      clearFieldError(field);
      var value = (field.value || '').trim();

      if (field.hasAttribute('required') && !value) {
        setFieldError(field, 'This field is required.');
        ok = false;
        if (!firstInvalid) firstInvalid = field;
        continue;
      }
      if (value && field.type === 'email' && !isValidEmail(value)) {
        setFieldError(field, 'Please enter a valid email address.');
        ok = false;
        if (!firstInvalid) firstInvalid = field;
        continue;
      }
      if (value && field.type === 'tel' && !isValidPhone(value)) {
        setFieldError(field, 'Please enter a valid phone number.');
        ok = false;
        if (!firstInvalid) firstInvalid = field;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      if (firstInvalid.scrollIntoView) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return ok;
  }

  function showSuccess(form) {
    var id = form.getAttribute('data-success');
    var panel = id ? document.getElementById(id) : null;
    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    form.hidden = true;
  }

  /* ---------- Fetch submission (progressive enhancement) ---------- */
  var forms = document.querySelectorAll('.js-lead-form');

  for (var f = 0; f < forms.length; f++) {
    (function (form) {
      var errorBox = form.querySelector('.form__error');

      form.addEventListener('submit', function (event) {
        // Honeypot filled? Silently pretend success and never send.
        var pot = form.querySelector('input[name="_gotcha"]');
        if (pot && pot.value) {
          event.preventDefault();
          showSuccess(form);
          return;
        }

        if (!validateForm(form)) {
          event.preventDefault();
          return;
        }

        // No fetch support: let the plain HTML POST proceed.
        if (typeof window.fetch !== 'function') return;

        event.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalLabel = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }
        if (errorBox) errorBox.hidden = true;

        // Refresh _page immediately before sending.
        var pageField = form.querySelector('[data-page-field]');
        if (pageField) pageField.value = window.location.href;

        var payload = {};
        var data = new FormData(form);
        data.forEach(function (value, key) {
          if (key === '_gotcha') return;
          payload[key] = typeof value === 'string' ? value : String(value);
        });
        payload._page = window.location.href;

        fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(function (response) {
            return response.json().catch(function () { return { ok: response.ok }; });
          })
          .then(function (result) {
            if (result && result.ok) {
              showSuccess(form);
              form.reset();
            } else {
              throw new Error('Submission rejected');
            }
          })
          .catch(function () {
            if (errorBox) {
              errorBox.textContent =
                'Sorry, we could not send that. Please try again or call (602) 555-0182.';
              errorBox.hidden = false;
            }
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalLabel;
            }
          });
      });
    })(forms[f]);
  }

  /* ---------- ?submitted=1 confirmation (no-JS fallback round trip) ---------- */
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') === '1') {
      var panels = document.querySelectorAll('.form-success');
      if (panels.length) {
        var target = document.getElementById('quoteSuccess') || panels[0];
        target.hidden = false;
        var relatedForm = document.querySelector('[data-success="' + target.id + '"]');
        if (relatedForm) relatedForm.hidden = true;
        window.setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  } catch (err) {
    /* URLSearchParams unavailable — the server-rendered page still works. */
  }
})();
