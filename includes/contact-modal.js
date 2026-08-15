(function () {
  var STORAGE_KEY = 'hm-contact-settings';

  var defaults = {
    zalo: '',
    facebook: '',
    modalTitle: 'THÔNG BÁO',
    modalBody: '',
    modalContactText: '',
    modalButtonLabel: 'ĐÃ HIỂU',
    modalAlwaysShow: true
  };

  function parseSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function applySettingsToModal(modal, settings) {
    if (!modal) return;
    var title = modal.querySelector('.hm-contact-modal__title');
    var body = modal.querySelector('.hm-contact-modal__body');
    var contact = modal.querySelector('.hm-contact-modal__contact');
    var btn = modal.querySelector('.hm-contact-modal__button');

    var s = Object.assign({}, defaults, settings || {});

    if (title) title.textContent = s.modalTitle || '';
    if (body) {
      var text = s.modalBody || '';
      body.innerHTML = text.split('\n').map(function (ln) { return '<p>' + ln + '</p>'; }).join('');
    }
    if (contact) contact.textContent = s.modalContactText || '';
    if (btn) btn.textContent = s.modalButtonLabel || 'ĐÃ HIỂU';

    // show/hide based on modalAlwaysShow
    if (s.modalAlwaysShow === false) {
      // do not auto-show
    } else {
      modal.classList.add('hm-contact-modal--visible');
    }

    // close handlers
    var closeBtn = modal.querySelector('[data-hm-close]') || modal.querySelector('.hm-contact-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.classList.remove('hm-contact-modal--visible');
      });
    }

    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        modal.classList.remove('hm-contact-modal--visible');
      });
    }
  }

  // support legacy notice markup in index.html (#hm-notice-overlay)
  function applySettingsToLegacyOverlay(settings) {
    var overlay = document.getElementById('hm-notice-overlay');
    if (!overlay) return false;
    var box = document.getElementById('hm-notice-box') || overlay.querySelector('#hm-notice-box');
    if (!box) return false;

    var s = Object.assign({}, defaults, settings || {});

    // title
    var h3 = box.querySelector('h3');
    if (h3) h3.textContent = s.modalTitle || defaults.modalTitle;

    // body
    var desc = box.querySelector('.hm-notice-desc');
    if (desc) {
      var text = s.modalBody || '';
      desc.innerHTML = text.split('\n').map(function (ln) { return '<p>' + ln + '</p>'; }).join('');
    }

    // contact button (highlight area)
    var btn = box.querySelector('.hm-zalo-btn');
    if (btn) {
      var zaloValue = (s.zalo || '').trim();
      var href = zaloValue ? 'https://zalo.me/' + encodeURIComponent(zaloValue) : (s.facebook || '');
      btn.href = href;
      btn.textContent = s.modalButtonLabel || defaults.modalButtonLabel || btn.textContent;
    }

    // dismissal behavior: if modalAlwaysShow true, clear the legacy dismissed key so it appears
    var DISMISS_KEY = 'hm_notice_dismissed_v1';
    if (s.modalAlwaysShow === false) {
      // respect existing dismissal state (do nothing)
      if (!localStorage.getItem(DISMISS_KEY)) overlay.classList.add('show');
    } else {
      try { localStorage.removeItem(DISMISS_KEY); } catch (e) {}
      overlay.classList.add('show');
    }

    // wire up close/dismiss buttons (id-based in legacy markup)
    var close = document.getElementById('hm-notice-close');
    if (close) close.addEventListener('click', function () { overlay.classList.remove('show'); });
    var dismiss = document.getElementById('hm-notice-dismiss');
    if (dismiss) dismiss.addEventListener('click', function () { try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {} overlay.classList.remove('show'); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('show'); });

    return true;
  }

  function loadAndApply() {
    var modal = document.querySelector('.hm-contact-modal');
    if (!modal) return;

    // prefer localStorage
    var saved = parseSaved();
    if (saved) {
      applySettingsToModal(modal, saved);
      return;
    }

    // fallback: try server file
    fetch('./data/contact-settings.json', { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('no-settings');
      return res.json();
    }).then(function (json) {
      applySettingsToModal(modal, json);
    }).catch(function () {
      applySettingsToModal(modal, defaults);
    });
  }

  // initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApply);
  } else {
    loadAndApply();
      // prefer the new modal markup
      var modal = document.querySelector('.hm-contact-modal');
      var saved = parseSaved();

      if (modal) {
        if (saved) { applySettingsToModal(modal, saved); return; }
        fetch('./data/contact-settings.json', { cache: 'no-store' }).then(function (res) {
          if (!res.ok) throw new Error('no-settings');
          return res.json();
        }).then(function (json) {
          applySettingsToModal(modal, json);
        }).catch(function () {
          applySettingsToModal(modal, defaults);
        });
        return;
      }

      // fallback: update legacy overlay if present
      var appliedLegacy = false;
      if (saved) {
        appliedLegacy = applySettingsToLegacyOverlay(saved);
        if (appliedLegacy) return;
      }
      fetch('./data/contact-settings.json', { cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('no-settings');
        return res.json();
      }).then(function (json) {
        if (applySettingsToLegacyOverlay(json)) appliedLegacy = true;
      }).catch(function () {
        applySettingsToLegacyOverlay(defaults);
      });
  }

  // reapply when admin saves
  window.addEventListener('hm-contact-updated', function () {
    loadAndApply();
  });

})();
