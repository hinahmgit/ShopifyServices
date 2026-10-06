/* ==========================================================================
   Hina — Portfolio scripts (vanilla JS, no libraries)
   --------------------------------------------------------------------------
   1. Image fallbacks (show placeholders until real screenshots are added)
   2. Sticky header + mobile menu
   3. Active nav link while scrolling
   4. Scroll-reveal animations
   5. Before / After comparison sliders
   6. Desktop / Mobile view tabs
   7. "Book a Free Audit" buttons pre-select the service
   8. Contact form (validation + FormSubmit)
   9. Footer year
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. IMAGE FALLBACKS ====================================================
     Every <img> with data-fallback points at a local file (e.g.
     images/jennyjoy-before.jpg). If that file doesn't exist yet, we swap in
     the placehold.co URL. Once you upload the real image, it just works. */
  function useFallback(img) {
    var fb = img.getAttribute('data-fallback');
    if (fb && img.src !== fb) {
      img.removeAttribute('data-fallback');
      img.src = fb;
    }
  }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    // The image may have already failed before this script ran
    if (img.complete && img.naturalWidth === 0) {
      useFallback(img);
    } else {
      img.addEventListener('error', function () { useFallback(img); }, { once: true });
    }
  });

  /* 2. STICKY HEADER + MOBILE MENU ======================================= */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var toggleLabel = toggle.querySelector('.sr-only');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close the menu after choosing a link
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  // Close with Escape and return focus to the button
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close if the viewport grows to desktop size
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* 3. ACTIVE NAV LINK WHILE SCROLLING =================================== */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav__list a'));
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
  }

  /* 4. SCROLL-REVEAL ANIMATIONS ========================================== */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) {
      // Small stagger for items that sit side by side in a grid
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 5) * 80 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* 5. BEFORE / AFTER COMPARISON SLIDERS =================================
     Markup: <div class="ba" data-ba> two <img>s + .ba__handle[role=slider]
     The "after" image is clipped with clip-path using the --pos variable.
     Works with mouse, touch and pen (Pointer Events) and the keyboard. */
  function initSlider(root) {
    var handle = root.querySelector('.ba__handle');
    var pos = 50;
    var dragging = false;

    function set(value) {
      pos = Math.max(0, Math.min(100, value));
      root.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext', Math.round(100 - pos) + '% of the after view shown');
    }

    function fromPointer(clientX) {
      var rect = root.getBoundingClientRect();
      set(((clientX - rect.left) / rect.width) * 100);
    }

    root.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      root.classList.add('is-dragging');
      root.setPointerCapture(e.pointerId);
      fromPointer(e.clientX);
      handle.focus({ preventScroll: true });
    });

    root.addEventListener('pointermove', function (e) {
      if (dragging) fromPointer(e.clientX);
    });

    function stop() {
      dragging = false;
      root.classList.remove('is-dragging');
    }
    root.addEventListener('pointerup', stop);
    root.addEventListener('pointercancel', stop); // e.g. user starts scrolling vertically

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 2;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown': set(pos - step); break;
        case 'ArrowRight':
        case 'ArrowUp': set(pos + step); break;
        case 'PageDown': set(pos - 10); break;
        case 'PageUp': set(pos + 10); break;
        case 'Home': set(0); break;
        case 'End': set(100); break;
        default: return;
      }
      e.preventDefault();
    });

    set(pos);
  }
  document.querySelectorAll('[data-ba]').forEach(initSlider);

  /* 6. DESKTOP / MOBILE VIEW TABS ======================================== */
  document.querySelectorAll('.view-toggle').forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function select(tab, moveFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      });
      if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* 7. AUDIT BUTTONS PRE-SELECT THE SERVICE ============================== */
  var serviceSelect = document.getElementById('f-service');
  document.querySelectorAll('a[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (serviceSelect && !serviceSelect.value) serviceSelect.value = link.getAttribute('data-service');
    });
  });

  /* 8. CONTACT FORM =======================================================
     Validates in the browser, then sends to FormSubmit's AJAX endpoint so
     the visitor stays on the page and sees a friendly success message.
     The receiving email is set in index.html (form action). */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please tell me your name.'; },
      email: function (v) {
        if (!v.trim()) return 'Please add your email so I can reply.';
        return emailPattern.test(v.trim()) ? '' : 'That email doesn\'t look quite right.';
      },
      store_url: function (v) {
        if (!v.trim()) return '';
        return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v.trim()) ? '' : 'Please enter a valid store link, e.g. yourstore.com';
      },
      service: function (v) { return v ? '' : 'Please choose what you need help with.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A short message helps (at least 10 characters).'; }
    };

    function validateField(field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var msg = rule(field.value);
      var wrapper = field.closest('.field');
      var errorEl = document.getElementById(field.id + '-err');
      wrapper.classList.toggle('has-error', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errorEl) errorEl.textContent = msg;
      return !msg;
    }

    // Validate as people leave each field, and re-check while fixing errors
    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.closest('.field').classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var data = new FormData(form);
      data.append('_replyto', form.elements.email.value.trim()); // "Reply" in Gmail goes to the visitor

      // https://formsubmit.co/you@mail.com -> https://formsubmit.co/ajax/you@mail.com
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (String(json.success) !== 'true') throw new Error(json.message || 'Request failed');
          showSuccess();
        })
        .catch(function () {
          status.classList.add('is-error');
          status.textContent = 'Sorry, something went wrong. Please try again or email me directly.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        });
    });

    function showSuccess() {
      var name = form.elements.name.value.trim().split(' ')[0];
      form.innerHTML =
        '<div class="form-success" role="status" tabindex="-1">' +
          '<span class="form-success__icon"><svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg></span>' +
          '<h3>Thank you' + (name ? ', ' + escapeHtml(name) : '') + '!</h3>' +
          '<p>Your message is on its way. I\'ll get back to you within 24 hours.</p>' +
        '</div>';
      form.querySelector('.form-success').focus();
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
  }

  /* 9. FOOTER YEAR ======================================================= */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
