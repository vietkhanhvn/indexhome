(function () {
  function safeText(node, text) {
    if (!node) return;
    node.textContent = text;
  (function () {
    var storageKey = 'hm-contact-settings';
    var modal = document.querySelector('.hm-contact-modal');
    if (!modal) return;

    function applySettings(s) {
      var title = modal.querySelector('.hm-contact-modal__title');
      var body = modal.querySelector('.hm-contact-modal__body');
      var contact = modal.querySelector('.hm-contact-modal__contact');
      var btn = modal.querySelector('.hm-contact-modal__button');
      if (title) title.textContent = s.modalTitle || '';
      if (body) {
        // support newlines in modalBody
        var text = s.modalBody || '';
        body.innerHTML = text.split('\n').map(function (ln) { return '<p>' + ln + '</p>'; }).join('');
      }
      if (contact) contact.textContent = s.modalContactText || '';
      if (btn) btn.textContent = s.modalButtonLabel || 'ĐÃ HIỂU';
    }

    // Primary source: localStorage (edited via admin). Fallback: data/contact-settings.json. Defaults used if none.
    var defaults = { zalo: '', facebook: '', modalTitle: 'THÔNG BÁO', modalBody: '', modalContactText: '', modalButtonLabel: 'ĐÃ HIỂU', modalAlwaysShow: true };

    function showModal() { modal.classList.add('hm-contact-modal--visible'); }
    function hideModalTemporary() { modal.classList.remove('hm-contact-modal--visible'); }

    // try localStorage first
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (e) { saved = null; }
    if (saved) {
      applySettings(Object.assign({}, defaults, saved));
      // Always show on load (per requirement: show after reload)
      showModal();
    } else {
      // fallback to server file (if available)
      fetch('./data/contact-settings.json', { cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('no-settings');
        return res.json();
      }).then(function (json) {
        applySettings(Object.assign({}, defaults, json));
        showModal();
      }).catch(function () {
        // no server settings — use defaults and show
        applySettings(defaults);
        showModal();
      });
    }

    // Close button: hide only until reload (do not persist)
    var close = modal.querySelector('[data-hm-close]');
    if (close) close.addEventListener('click', function () {
      hideModalTemporary();
    });

    // If admin updates settings on another tab, listen to event and reapply
    window.addEventListener('hm-contact-updated', function () {
      try {
        var updated = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (updated) { applySettings(Object.assign({}, defaults, updated)); showModal(); }
      } catch (e) { /* ignore */ }
    });
  })();
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
