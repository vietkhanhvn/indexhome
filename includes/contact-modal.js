(function () {
  function safeText(node, text) {
    if (!node) return;
    node.textContent = text;
  }

  function applySettings(settings) {
    if (!settings) return;

    // populate contact links
    var zaloEls = document.querySelectorAll('[data-contact="zalo"]');
    zaloEls.forEach(function (el) {
      var val = settings.zalo || '';
      if (el.tagName === 'A') el.href = val ? ('https://zalo.me/' + encodeURIComponent(val)) : '#';
      el.textContent = val;
    });

    var fbEls = document.querySelectorAll('[data-contact="facebook"]');
    fbEls.forEach(function (el) {
      var val = settings.facebook || '';
      if (el.tagName === 'A') el.href = val || '#';
      el.textContent = val;
    });

    // modal
    var modalContainer = document.querySelector('.hm-contact-modal');
    if (modalContainer) {
      var titleEl = modalContainer.querySelector('[data-hm="modalTitle"]');
      var bodyEl = modalContainer.querySelector('[data-hm="modalBody"]');
      var contactEl = modalContainer.querySelector('[data-hm="modalContactText"]');
      var btnEl = modalContainer.querySelector('[data-hm="modalButton"]');

      if (titleEl) safeText(titleEl, settings.modalTitle || '');
      if (bodyEl) safeText(bodyEl, (settings.modalBody || '').replace(/\\n/g, '\n'));
      if (contactEl) safeText(contactEl, settings.modalContactText || '');
      if (btnEl) safeText(btnEl, settings.modalButtonLabel || '');

      // control visibility: if modalAlwaysShow true -> show on each load
      if (settings.modalAlwaysShow === undefined || settings.modalAlwaysShow === null) settings.modalAlwaysShow = true;
      if (settings.modalAlwaysShow) {
        modalContainer.style.display = '';
      }
    }

    // close handlers for temporary hide
    var hideBtns = document.querySelectorAll('[data-hm-hide-temporary]');
    hideBtns.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var modal = btn.closest('.hm-contact-modal') || btn.closest('.modal') || btn.parentElement;
        if (modal) modal.style.display = 'none';
      });
    });
  }

  function loadAndApply() {
    fetch('/data/contact-settings.json', { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('no-settings');
      return res.json();
    }).then(function (json) {
      applySettings(json);
      try { localStorage.setItem('hm-contact-settings', JSON.stringify(json)); } catch (e) {}
    }).catch(function () {
      try {
        var raw = localStorage.getItem('hm-contact-settings');
        if (raw) {
          var parsed = JSON.parse(raw);
          applySettings(parsed);
          return;
        }
      } catch (e) {}
    });
  }

  // initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApply);
  } else {
    loadAndApply();
  }

  // reapply when admin saves
  window.addEventListener('hm-contact-updated', function () {
    loadAndApply();
  });
})();
