(function () {
  const STORAGE_KEY = 'hm-contact-settings';
  const modal = document.querySelector('.hm-contact-modal');
  if (!modal) return;

  const titleEl = modal.querySelector('.hm-contact-modal__title');
  const bodyEl = modal.querySelector('.hm-contact-modal__body');
  const contactEl = modal.querySelector('.hm-contact-modal__contact');
  const btnEl = modal.querySelector('.hm-contact-modal__button');
  const closeEl = modal.querySelector('[data-hm-close]');
  const backdropEl = modal.querySelector('.hm-contact-modal__backdrop');

  // Mặc định
  const DEFAULTS = {
    zalo: '0345345553',
    facebook: 'https://www.facebook.com/profile.php?id=100069526895693',
    modalTitle: 'THÔNG BÁO',
    modalBody: '',
    modalContactText: 'Liên hệ ngay Zalo: 0345345553',
    modalButtonLabel: 'Vay Vốn Qua iCloud Ngay',
    modalAlwaysShow: true
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Object.assign({}, DEFAULTS, JSON.parse(saved));
    } catch (e) {}
    return Object.assign({}, DEFAULTS);
  }

  function applySettings() {
    const s = loadSettings();
    if (titleEl) titleEl.textContent = s.modalTitle || DEFAULTS.modalTitle;
    if (bodyEl) bodyEl.innerHTML = (s.modalBody || '').replace(/\n/g, '<br>');
    if (contactEl) {
      contactEl.textContent = s.modalContactText || '';
      contactEl.style.display = s.modalContactText ? 'block' : 'none';
    }
    if (btnEl) {
      btnEl.textContent = s.modalButtonLabel || DEFAULTS.modalButtonLabel;
      btnEl.href = 'https://homemoney.com.vn/vay-tien-qua-icloud';
    }
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('hm-open');
    document.body.style.overflow = '';
  }

  function openModal() {
    applySettings();
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('hm-open');
    document.body.style.overflow = 'hidden';
  }

  // Đóng modal
  if (closeEl) closeEl.addEventListener('click', closeModal);
  if (backdropEl) backdropEl.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('hm-open')) closeModal();
  });

  // LUÔN hiện modal khi load trang
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openModal);
  } else {
    openModal();
 }

  // Lắng nghe sự kiện cập nhật từ admin
  window.addEventListener('hm-contact-updated', function () {
    applySettings();
  });
})();
