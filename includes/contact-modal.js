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
  }

  // reapply when admin saves
  window.addEventListener('hm-contact-updated', function () {
    loadAndApply();
  });

})();
