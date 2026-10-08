/* ==========================================================================
   Hina Manzoor | Portfolio scripts (vanilla JS, no libraries)
   --------------------------------------------------------------------------
   1. Image fallbacks (placeholders until real screenshots are added)
   2. Sticky header + mobile menu
   3. Active nav link while scrolling
   4. Scroll reveals: fade/slide, word-by-word headlines, timeline line
   5. Before / After comparison sliders
   6. Effects: hero pointer parallax, card spotlight
   7. "Get a free audit" buttons pre-select the service
   8. Contact form (validation + FormSubmit)
   9. Footer year
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. IMAGE FALLBACKS ====================================================
     Every <img> with data-fallback points at a local file (e.g.
     images/jennyjoy-before.jpg). If that file doesn't exist yet, we swap in
     a local "coming soon" placeholder. Once you upload the real image, it just works. */
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

  // Review profile photos: if images/client-N.jpg is missing, remove the <img>
  // so the platform avatar underneath shows instead.
  document.querySelectorAll('img[data-avatar]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) img.remove();
    else img.addEventListener('error', function () { img.remove(); }, { once: true });
  });

  var canObserve = 'IntersectionObserver' in window;

  /* 2. STICKY HEADER + MOBILE MENU ======================================= */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var toggleLabel = toggle.querySelector('.sr-only');

  // Solid header once the page has scrolled (watches a tiny sentinel at the top)
  var sentinel = document.querySelector('.header-sentinel');
  if (canObserve && sentinel) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

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

  /* 4. SCROLL REVEALS ===================================================
     [data-reveal]          fades and slides in (variants: scale, zoom, clip)
     [data-split]           headline words rise one by one
     [data-timeline]        the process line draws across                  */

  // Wrap every word of a [data-split] headline in <span class="w"><span>..</span></span>
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement('span');
            var inner = document.createElement('span');
            outer.className = 'w';
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
  }

  var reveals = document.querySelectorAll('[data-reveal], [data-split], [data-timeline]');
  if (reduceMotion || !canObserve) {
    reveals.forEach(function (el) { el.classList.add('is-in', 'is-drawn'); });
  } else {
    document.querySelectorAll('[data-split]').forEach(splitWords);

    // Stagger items that sit side by side (siblings that both reveal)
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--delay', Math.min(index, 6) * 90 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.hasAttribute('data-timeline') ? 'is-drawn' : 'is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
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

    // The first time a slider scrolls into view, nudge the handle so people see it moves
    if (!reduceMotion && canObserve) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        setTimeout(function () {
          if (dragging) return;
          root.classList.add('is-hinting');
          set(32);
          setTimeout(function () { if (!dragging) set(50); }, 750);
          setTimeout(function () { root.classList.remove('is-hinting'); }, 1700);
        }, 500);
      }, { threshold: 0.6 }).observe(root);
    }
  }
  document.querySelectorAll('[data-ba]').forEach(initSlider);

  /* 6. EFFECTS ==========================================================
     Only on devices with a precise pointer (mouse/trackpad), never with
     reduced motion. Values are written to CSS variables; CSS does the rest. */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduceMotion) {
    // Hero: layered screenshots tilt gently toward the cursor
    var stage = document.querySelector('[data-tilt]');
    var hero = document.querySelector('.hero');
    if (stage && hero) {
      var frame = null;
      hero.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          var r = hero.getBoundingClientRect();
          stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
          frame = null;
        });
      });
      hero.addEventListener('pointerleave', function () {
        stage.style.setProperty('--px', 0);
        stage.style.setProperty('--py', 0);
      });
    }

    // Service tiles: a soft light follows the cursor
    document.querySelectorAll('[data-spotlight]').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

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
