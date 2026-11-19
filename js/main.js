// --- ЛОГИКА МОБИЛЬНОГО МЕНЮ (БУРГЕР) ---
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    
    // Блокируем прокрутку страницы при открытом меню
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Закрываем меню при нажатии на любую ссылку внутри него
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// --- ЛОГИКА МОДАЛЬНЫХ ОКОН ПРОЕКТОВ ---
const projectCards = document.querySelectorAll('.project-card');
const modals = document.querySelectorAll('.modal-overlay');

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const modalId = card.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });
});

modals.forEach(modal => {
  const closeBtn = modal.querySelector('.modal-close');
  
  // Закрытие по крестику
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Закрытие по клику на темный фон вокруг окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// Закрытие модального окна по нажатию клавиши Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modals.forEach(modal => {
      if (modal.classList.contains('open')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
});