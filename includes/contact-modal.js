(function () {
  function safeText(node, text) {
    if (!node) return;
    node.textContent = text;
  }

  function applySettings(settings) {
    // populate elements with data-hm attributes
    var zaloEls = document.querySelectorAll('[data-hm="zalo"]');
    zaloEls.forEach(function (el) {
      safeText(el, settings.zalo || '');
    });

    var fbEls = document.querySelectorAll('[data-hm="facebook"]');
    fbEls.forEach(function (el) {
      if (el.tagName === 'A') {
        el.href = settings.facebook || '#';
      }
      safeText(el, settings.facebook || '');
    });

    // close/hide buttons — only hide for current view, but modal will reappear on reload if modalAlwaysShow is true
    var hideBtns = document.querySelectorAll('[data-hm-hide-temporary]');
    hideBtns.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var modal = btn.closest('.modal') || btn.closest('.hm-contact-modal') || btn.closest('.popup') || btn.parentElement;
        if (modal) modal.style.display = 'none';
      });
    });

    // populate modal elements if present
    var modalContainer = document.querySelector('.hm-contact-modal');
    if (modalContainer) {
      var titleEl = modalContainer.querySelector('[data-hm="modalTitle"]');
      var bodyEl = modalContainer.querySelector('[data-hm="modalBody"]');
      var contactEl = modalContainer.querySelector('[data-hm="modalContactText"]');
      var btnEl = modalContainer.querySelector('[data-hm="modalButton"]');

      if (titleEl) safeText(titleEl, settings.modalTitle || '');
      if (bodyEl) safeText(bodyEl, (settings.modalBody || '').replace(/\n/g, '\n'));
      if (contactEl) safeText(contactEl, settings.modalContactText || '');
      if (btnEl) safeText(btnEl, settings.modalButtonLabel || '');

      if (settings.modalAlwaysShow) {
        modalContainer.style.display = '';
      }
    }

    // dispatch an event so legacy code can react
    window.dispatchEvent(new CustomEvent('hm-contact-settings', { detail: settings }));
  }

  fetch('/data/contact-settings.json', {cache: 'no-store'}).then(function (res) {
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  }).then(function (json) {
    applySettings(json);
  }).catch(function () {
    // fallback to localStorage copy if present
    try {
      var raw = localStorage.getItem('hm-contact-settings');
      if (raw) {
        var parsed = JSON.parse(raw);
        applySettings(parsed);
      }
    } catch (e) {
      // ignore
    }
  });
})();
