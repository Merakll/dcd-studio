document.addEventListener('DOMContentLoaded', () => {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (burgerBtn && mobileMenu) {
    // Открытие и закрытие по клику на бургер
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Закрытие при переходе по любой ссылке в мобильном меню
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
});