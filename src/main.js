import './styles.css';

/* ========================================
   Loader
   ======================================== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

/* ========================================
   Navbar Scroll Effect
   ======================================== */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

/* ========================================
   Mobile Menu
   ======================================== */
const mobileToggle = document.getElementById('mobile-toggle');
const navLinksContainer = document.querySelector('.nav-links');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinksContainer.classList.toggle('mobile-open');
});

navLinksContainer.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navLinksContainer.classList.remove('mobile-open');
  });
});

/* ========================================
   Theme Toggle
   ======================================== */
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ========================================
   Typing Effect
   ======================================== */
const typingEl = document.getElementById('typing-text');
const titles = [
  'Full-Stack Developer',
  'CSIT Student',
  'Problem Solver',
  'Open Source Enthusiast',
  'MERN Stack Developer',
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentTitle = titles[titleIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typingEl.textContent = currentTitle.slice(0, charIndex);

  let speed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentTitle.length) {
    speed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    titleIndex = (titleIndex + 1) % titles.length;
    speed = 300;
  }

  setTimeout(typeEffect, speed);
}

typeEffect();

/* ========================================
   Scroll Reveal
   ======================================== */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ========================================
   Skill Bars Animation
   ======================================== */
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.getAttribute('data-level');
        entry.target.style.width = `${level}%`;
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

skillFills.forEach((fill) => skillObserver.observe(fill));

/* ========================================
   Counter Animation
   ======================================== */
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'), 10);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statNumbers.forEach((num) => counterObserver.observe(num));

function animateCounter(el, target) {
  let current = 0;
  const increment = Math.max(1, Math.floor(target / 30));
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 50);
}

/* ========================================
   Project Filtering
   ======================================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ========================================
   Contact Form
   ======================================== */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = contactForm.querySelector('#name').value.trim();
  const email = contactForm.querySelector('#email').value.trim();

  if (!name || !email) {
    showFormStatus('Please fill in all fields.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFormStatus('Please enter a valid email address.', 'error');
    return;
  }

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
    contactForm.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
  }, 1500);
});

function showFormStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = type;
  setTimeout(() => {
    formStatus.className = '';
    formStatus.style.display = 'none';
  }, 5000);
}

/* ========================================
   Smooth Scroll for anchor links
   ======================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
