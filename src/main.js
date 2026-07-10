import './styles.css';

const loader = document.getElementById('loader');
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinksContainer = document.querySelector('.nav-links');
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const typingEl = document.getElementById('typing-text');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

window.addEventListener('load', () => {
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

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

mobileToggle?.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinksContainer.classList.toggle('mobile-open');
});

navLinksContainer?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileToggle?.classList.remove('active');
    navLinksContainer?.classList.remove('mobile-open');
  });
});

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

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

// Animate hardcoded skill bars that use data-level attribute
function initSkillBars() {
  const skillFills = document.querySelectorAll('.skill-fill[data-level]');
  if (!skillFills.length) return;

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
    { threshold: 0.3 }
  );

  skillFills.forEach((fill) => skillObserver.observe(fill));
}

initSkillBars();

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

async function apiRequest(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function initializeProjectFilters() {
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
}

function renderSkills(skills) {
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) return;

  if (!skills.length) return; // Nothing to add

  const grouped = skills.reduce((acc, skill) => {
    const category = skill.category || 'Tools';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  Object.keys(grouped).forEach((category) => {
    const items = grouped[category];

    // Check if a category block already exists in the hardcoded HTML
    const existing = skillsGrid.querySelector(`[data-category="${category.toLowerCase()}"]`);

    if (existing) {
      // Append new skill items into the existing category block
      const skillItemsContainer = existing.querySelector('.skill-items');
      if (skillItemsContainer) {
        items.forEach((skill) => {
          const div = document.createElement('div');
          div.className = 'skill-item';
          div.innerHTML = `
            <span>${skill.name}</span>
            <div class="skill-bar">
              <div class="skill-fill" style="width: ${skill.percentage || 80}%"></div>
            </div>
          `;
          skillItemsContainer.appendChild(div);
        });
      }
    } else {
      // Create a brand new category card and append it to the grid
      const card = document.createElement('div');
      card.className = 'skill-category reveal visible';
      card.setAttribute('data-category', category.toLowerCase());
      card.innerHTML = `
        <div class="skill-category-header">
          <div class="skill-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <h3>${category}</h3>
        </div>
        <div class="skill-items">
          ${items.map((skill) => `
            <div class="skill-item">
              <span>${skill.name}</span>
              <div class="skill-bar">
                <div class="skill-fill" style="width: ${skill.percentage || 80}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      skillsGrid.appendChild(card);
    }
  });
}

function getProjectCategory(project) {
  const tech = (project.techStack || []).join(' ').toLowerCase();
  if (tech.includes('node') || tech.includes('express') || tech.includes('mongodb') || tech.includes('socket')) return 'fullstack';
  if (tech.includes('react') || tech.includes('html') || tech.includes('css') || tech.includes('javascript') || tech.includes('vite')) return 'frontend';
  return 'tool';
}

function renderProjects(projects) {
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return;

  if (!projects.length) return; // Nothing new to add

  // Prepend each new DB project BEFORE the existing hardcoded ones
  projects.forEach((project) => {
    const article = document.createElement('article');
    article.className = 'project-card reveal visible';
    article.setAttribute('data-category', getProjectCategory(project));
    article.innerHTML = `
      <div class="project-image">
        <img src="${project.image || 'portfolio.png'}" alt="${project.title}" loading="lazy" />
        <div class="project-overlay">
          ${project.liveUrl ? `<a href="${project.liveUrl}" class="project-link" aria-label="View project" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : ''}
          ${project.githubUrl ? `<a href="${project.githubUrl}" class="project-link" aria-label="View code" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>` : ''}
        </div>
      </div>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tech">
          ${(project.techStack || []).map((tech) => `<span>${tech}</span>`).join('')}
        </div>
      </div>
    `;
    projectsGrid.insertBefore(article, projectsGrid.firstChild);
  });

  initializeProjectFilters();
}

function applySettings(settings) {
  const heroName = document.querySelector('.hero-name');
  const heroDescription = document.querySelector('.hero-description');
  const aboutHeading = document.querySelector('#about .about-content h3');
  const aboutText = document.querySelector('#about .about-content p');
  const detailValues = document.querySelectorAll('.detail-value');
  const heroImage = document.querySelector('.hero-avatar img');
  const aboutImage = document.querySelector('.about-img-wrapper img');
  const contactItems = document.querySelectorAll('.contact-item span');
  const githubLink = document.querySelector('.social-links a[aria-label="GitHub"]');
  const linkedinLink = document.querySelector('.social-links a[aria-label="LinkedIn"]');
  const instagramLink = document.querySelector('.social-links a[aria-label="Instagram"]');
  const facebookLink = document.querySelector('.social-links a[aria-label="Facebook"]');

  if (heroName) heroName.textContent = settings.name || heroName.textContent;
  if (heroDescription) heroDescription.textContent = settings.bio || heroDescription.textContent;
  if (aboutHeading) aboutHeading.textContent = settings.title || aboutHeading.textContent;
  if (aboutText) aboutText.textContent = settings.bio || aboutText.textContent;
  if (detailValues[0]) detailValues[0].textContent = settings.name || detailValues[0].textContent;
  if (detailValues[1]) detailValues[1].textContent = 'BSc. CSIT';
  if (detailValues[2]) detailValues[2].textContent = settings.title || detailValues[2].textContent;
  if (detailValues[3]) detailValues[3].textContent = 'Kathmandu Nepal';
  const isAbsoluteUrl = (url) => typeof url === 'string' && url.startsWith('http');
  if (heroImage && isAbsoluteUrl(settings.profilePhoto)) heroImage.src = settings.profilePhoto;
  if (aboutImage && isAbsoluteUrl(settings.profilePhoto)) aboutImage.src = settings.profilePhoto;
  if (contactItems[0]) contactItems[0].textContent = settings.email || contactItems[0].textContent;
  if (contactItems[1]) contactItems[1].textContent = 'Kathmandu Nepal';
  if (githubLink) githubLink.href = settings.github || githubLink.href;
  if (linkedinLink) linkedinLink.href = settings.linkedin || linkedinLink.href;
  if (instagramLink) instagramLink.href = settings.socialLinks?.instagram || instagramLink.href;
  if (facebookLink) facebookLink.href = settings.socialLinks?.facebook || facebookLink.href;
  document.title = `${settings.name || 'Abinash Kumar Chaudhary'} | ${settings.title || 'Full-Stack Developer'}`;
}

async function loadPortfolioData() {
  try {
    const [settings, projects, skills] = await Promise.all([
      apiRequest('/api/settings'),
      apiRequest('/api/projects'),
      apiRequest('/api/skills'),
    ]);

    applySettings(settings || {});
    renderProjects(projects || []);
    renderSkills(skills || []);
  } catch (error) {
    console.error(error);
  }
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = contactForm.querySelector('#name').value.trim();
  const email = contactForm.querySelector('#email').value.trim();
  const subject = contactForm.querySelector('#subject').value.trim();
  const message = contactForm.querySelector('#message').value.trim();

  if (!name || !email || !subject || !message) {
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

  try {
    await apiRequest('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });
    showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
    contactForm.reset();
  } catch (error) {
    showFormStatus(error.message || 'Unable to send message right now.', 'error');
  } finally {
    btn.textContent = 'Send Message';
    btn.disabled = false;
  }
});

function showFormStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = type;
  formStatus.style.display = 'block';
  setTimeout(() => {
    formStatus.className = '';
    formStatus.style.display = 'none';
  }, 5000);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

loadPortfolioData();

// ====================================================
// VISITOR TRACKING & CHATBOT CLIENT
// ====================================================

// Generate or retrieve Session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    localStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

// Detect browser, OS, and device types
const detectMetadata = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; device = 'Mobile'; }

  return {
    browser,
    operating_system: os,
    device,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    referrer: document.referrer || ''
  };
};

// Track Page Visit
const trackVisit = async (pageName) => {
  const cacheKey = `logged_visit_${pageName}`;
  if (sessionStorage.getItem(cacheKey)) return;

  const sessionId = getSessionId();
  const metadata = detectMetadata();

  try {
    let geo = { country: 'Local', city: 'Local' };
    try {
      const geoRes = await fetch('https://ipapi.co/json/').then(r => r.json());
      if (geoRes && geoRes.country_name) {
        geo.country = geoRes.country_name;
        geo.city = geoRes.city;
      }
    } catch (_) {}

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page: pageName,
        ...geo,
        ...metadata
      })
    });
    sessionStorage.setItem(cacheKey, 'true');
  } catch (err) {
    console.warn('Tracking failed:', err.message);
  }
};

// Bind resume download button tracking
const bindResumeTracking = () => {
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const sessionId = getSessionId();
      const metadata = detectMetadata();
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          page: 'resume_download',
          country: 'Local',
          city: 'Local',
          ...metadata
        })
      }).catch(err => console.warn(err.message));
    });
  }
};

// AI Chatbot Frontend Integration - Enhanced Version
const initAIChatbot = async () => {
  const container = document.getElementById('ai-assistant-container');
  const toggleBtn = document.getElementById('ai-assistant-toggle');
  const chatWindow = document.getElementById('ai-assistant-chat');
  const closeBtn = document.getElementById('chat-close-btn');
  const chatForm = document.getElementById('chat-input-form');
  const messageInput = document.getElementById('chat-input');
  const messagesList = document.getElementById('chat-messages');
  const suggestionsBox = document.getElementById('chat-suggestions');

  if (!container || !messagesList || !chatForm || !messageInput) return;

  // Fetch AI settings
  let aiSettings = { 
    enabled: true, 
    welcome_message: "Hi! I'm your AI assistant. Ask me anything — coding, general questions, or about Abinash's work.",
    suggested_questions: [
      'Explain async/await in JavaScript',
      'What projects has Abinash built?',
      'Help me write a professional email',
      'What are his core skills?'
    ],
    availability_status: 'Available for freelance work and collaboration'
  };
  
  try {
    const settingsRes = await fetch('/api/ai/settings');
    if (settingsRes.ok) {
      aiSettings = await settingsRes.json();
    }
  } catch (err) {
    console.warn('Failed to load AI settings:', err.message);
  }

  // Hide if disabled
  if (aiSettings.enabled === false) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  /**
   * Escape HTML to prevent XSS
   */
  const escapeHTML = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  };

  // Set header status
  const headerStatus = container.querySelector('.chat-status');
  if (headerStatus) {
    headerStatus.textContent = aiSettings.availability_status || 'Online';
  }

  // Display welcome message
  const welcomeText = aiSettings.welcome_message || "Hi! I'm Abinash's AI Portfolio Assistant. How can I help you today?";
  messagesList.innerHTML = `
    <div class="chat-bubble bot">
      <div class="message-content">${escapeHTML(welcomeText)}</div>
    </div>
  `;

  // Display suggested questions
  if (suggestionsBox && aiSettings.suggested_questions?.length > 0) {
    suggestionsBox.innerHTML = aiSettings.suggested_questions.map(q => `
      <button class="suggestion-pill" type="button">${escapeHTML(q)}</button>
    `).join('');

    suggestionsBox.querySelectorAll('.suggestion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        messageInput.value = pill.textContent;
        messageInput.focus();
        chatForm.dispatchEvent(new Event('submit'));
      });
    });
  }

  // Toggle chat window
  toggleBtn?.addEventListener('click', () => {
    chatWindow?.classList.toggle('hidden');
    if (!chatWindow?.classList.contains('hidden')) {
      messageInput.focus();
    }
  });

  closeBtn?.addEventListener('click', () => {
    chatWindow?.classList.add('hidden');
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWindow && !chatWindow.classList.contains('hidden')) {
      chatWindow.classList.add('hidden');
    }
  });

  // Conversation history
  const conversationHistory = [];
  let isWaitingForResponse = false;
  let retryCount = 0;
  const MAX_RETRIES = 2;

  /**
   * Convert markdown to HTML (simple version)
   */
  const parseMarkdown = (text) => {
    if (typeof text !== 'string') return text;
    
    let html = escapeHTML(text);
    
    // Bold: **text** → <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* → <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code: `code` → <code>code</code>
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Links: [text](url) → <a href="url" target="_blank">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  /**
   * Append message bubble
   */
  const appendBubble = (text, sender, canCopy = false) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = parseMarkdown(text);
    
    bubble.appendChild(content);

    // Add copy button for bot messages
    if (sender === 'bot' && canCopy) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'message-copy-btn';
      copyBtn.setAttribute('aria-label', 'Copy message');
      copyBtn.innerHTML = '📋';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '✓';
          setTimeout(() => { copyBtn.innerHTML = '📋'; }, 2000);
        });
      });
      bubble.appendChild(copyBtn);
    }

    messagesList?.appendChild(bubble);
    messagesList.scrollTop = messagesList.scrollHeight;
  };

  /**
   * Show typing indicator
   */
  const appendTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble bot typing-indicator-bubble';
    indicator.id = 'ai-typing-indicator';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesList?.appendChild(indicator);
    messagesList.scrollTop = messagesList.scrollHeight;
  };

  /**
   * Remove typing indicator
   */
  const removeTypingIndicator = () => {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  };

  /**
   * Show error message with retry option
   */
  const showError = (errorMsg, retryable = true) => {
    const errorBubble = document.createElement('div');
    errorBubble.className = 'chat-bubble bot error-message';
    errorBubble.innerHTML = `
      <div class="message-content">
        <strong>⚠️ Error:</strong> ${escapeHTML(errorMsg)}
        ${retryable ? '<br><small>Try again or rephrase your question.</small>' : ''}
      </div>
    `;
    messagesList?.appendChild(errorBubble);
    messagesList.scrollTop = messagesList.scrollHeight;
  };

  /**
   * Send message to API with retry logic
   */
  const sendMessage = async (userMsg, attempt = 0) => {
    appendTypingIndicator();
    isWaitingForResponse = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: conversationHistory
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      removeTypingIndicator();

      if (response.ok && data.reply) {
        appendBubble(data.reply, 'bot', true);
        conversationHistory.push({ role: 'model', text: data.reply });
        retryCount = 0;
      } else if (response.status === 429 && attempt < MAX_RETRIES) {
        // Rate limited - retry after delay
        removeTypingIndicator();
        showError('I\'m getting too many requests. Let me try again...', true);
        retryCount++;
        setTimeout(() => sendMessage(userMsg, attempt + 1), 2000 + (attempt * 1000));
      } else if (response.status === 403) {
        removeTypingIndicator();
        showError('The AI Assistant is currently disabled. Please try again later.', false);
      } else if (response.status === 401 || response.status === 403) {
        removeTypingIndicator();
        showError('Authentication error. Please contact support.', false);
      } else {
        removeTypingIndicator();
        const errorMsg = data.message || data.error || 'Unexpected error occurred';
        showError(errorMsg, true);
      }
    } catch (err) {
      removeTypingIndicator();
      
      if (err.name === 'AbortError') {
        showError('Request timed out. The server took too long to respond.', true);
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        showError('Connection error. Please check your internet and try again.', true);
      } else {
        showError('Unable to connect to the AI. Please try again.', true);
      }
      
      console.error('Chat error:', err);
    } finally {
      isWaitingForResponse = false;
      messageInput.focus();
    }
  };

  /**
   * Handle form submission
   */
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isWaitingForResponse) {
      messageInput.focus();
      return;
    }

    const userMsg = messageInput.value.trim();
    if (!userMsg) return;

    // Add user message
    appendBubble(userMsg, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    conversationHistory.push({ role: 'user', text: userMsg });

    // Send to API
    await sendMessage(userMsg);
  });

  /**
   * Auto-resize textarea
   */
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
  });

  /**
   * Shift+Enter to send
   */
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      chatForm.dispatchEvent(new Event('submit'));
    }
  });
};

// Initialize everything on load
trackVisit(window.location.pathname || '/');
bindResumeTracking();
initAIChatbot();
