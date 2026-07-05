const initAdmin = () => {
  const root = document.getElementById('admin-root');
  if (!root) return;

  const token = localStorage.getItem('adminToken');

  const setFormStatus = (element, message, type = 'info') => {
    if (!element) return;
    element.textContent = message;
    element.className = `admin-status ${type}`;
  };

  const attachPasswordToggles = () => {
    document.querySelectorAll('.password-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const target = document.getElementById(toggle.dataset.target);
        if (!target) return;

        const isVisible = target.type === 'text';
        target.type = isVisible ? 'password' : 'text';
        toggle.textContent = isVisible ? 'Show' : 'Hide';
        toggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
      });
    });
  };

  const renderLogin = () => {
    root.innerHTML = `
      <div class="admin-shell">
        <div class="admin-card">
          <h2>Admin Login</h2>
          <form id="admin-login-form">
            <input name="username" placeholder="Username" required />
            <div class="password-field">
              <input id="login-password" name="password" type="password" placeholder="Password" required />
              <button type="button" class="password-toggle" data-target="login-password" aria-label="Show password">Show</button>
            </div>
            <div id="login-status" class="admin-status"></div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    `;

    attachPasswordToggles();

    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const body = {
        username: form.username.value,
        password: form.password.value,
      };

      const status = document.getElementById('login-status');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          localStorage.setItem('adminToken', data.token);
          window.location.reload();
        } else {
          if (response.status === 502 || response.status === 504) {
            setFormStatus(status, 'Backend server is offline. Please start the server by running: npm run dev:server', 'error');
          } else {
            setFormStatus(status, data.message || 'Invalid username or password.', 'error');
          }
        }
      } catch (error) {
        setFormStatus(status, 'Unable to connect to the admin API. Please ensure the backend server is running.', 'error');
      }
    });
  };

  const renderDashboard = () => {
    root.innerHTML = `
      <div class="admin-shell">
        <aside class="admin-sidebar">
          <h2>Admin Panel</h2>
          <button class="admin-nav-btn active" data-section="dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            <span>Dashboard</span>
          </button>
          <button class="admin-nav-btn" data-section="projects">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Projects</span>
          </button>
          <button class="admin-nav-btn" data-section="messages">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>Messages</span>
          </button>
          <button class="admin-nav-btn" data-section="skills">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>Skills</span>
          </button>
          <button class="admin-nav-btn" data-section="settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </button>
          <button class="admin-nav-btn" data-section="account">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Account</span>
          </button>
          <button id="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Logout</span>
          </button>
        </aside>
        <main class="admin-main">
          <section id="dashboard" class="admin-section active" data-section="dashboard">
            <h3>Dashboard</h3>
            <div class="stats-grid"></div>
          </section>
          <section id="projects" class="admin-section" data-section="projects">
            <h3>Projects</h3>
            <form id="project-form" class="admin-form">
              <input name="title" placeholder="Title" required />
              <textarea name="description" placeholder="Description" required></textarea>
              <input name="techStack" placeholder="Tech Stack (comma separated)" />
              <input name="githubUrl" placeholder="GitHub URL" />
              <input name="liveUrl" placeholder="Live URL" />
              <input name="image" type="file" />
              <label><input type="checkbox" name="featured" /> Featured</label>
              <div id="project-status" class="admin-status"></div>
              <button type="submit">Save Project</button>
            </form>
            <div id="project-list" class="admin-list"></div>
          </section>
          <section id="messages" class="admin-section" data-section="messages">
            <div class="section-header">
              <h3>Messages</h3>
              <button class="btn-mark-all-read" data-action="mark-all-read">Mark All Read</button>
            </div>
            <div id="message-list" class="admin-list"></div>
          </section>
          <section id="skills" class="admin-section" data-section="skills">
            <h3>Skills</h3>
            <form id="skill-form" class="admin-form">
              <input name="name" placeholder="Skill Name" required />
              <input name="percentage" type="number" min="0" max="100" placeholder="Percentage" required />
              <select name="category" required>
                <option value="" disabled selected>Category</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Tools">Tools</option>
              </select>
              <div id="skill-status" class="admin-status"></div>
              <button type="submit">Save Skill</button>
            </form>
            <div id="skill-list" class="admin-list"></div>
          </section>
          <section id="settings" class="admin-section" data-section="settings">
            <h3>Settings</h3>
            <form id="settings-form" class="admin-form">
              <input name="name" placeholder="Name" />
              <input name="title" placeholder="Title" />
              <textarea name="bio" placeholder="Bio"></textarea>
              <input name="email" placeholder="Email" />
              <input name="github" placeholder="GitHub URL" />
              <input name="linkedin" placeholder="LinkedIn URL" />
              <input name="profilePhoto" type="file" />
              <button type="submit">Save Settings</button>
            </form>
          </section>
          <section id="account" class="admin-section" data-section="account">
            <h3>Account</h3>
            <form id="account-form" class="admin-form">
              <div class="password-field">
                <input id="account-current-password" name="currentPassword" type="password" placeholder="Current password" required />
                <button type="button" class="password-toggle" data-target="account-current-password" aria-label="Show password">Show</button>
              </div>
              <input name="newUsername" placeholder="New username" />
              <div class="password-field">
                <input id="account-new-password" name="newPassword" type="password" placeholder="New password" />
                <button type="button" class="password-toggle" data-target="account-new-password" aria-label="Show password">Show</button>
              </div>
              <div class="password-field">
                <input id="account-confirm-password" name="confirmPassword" type="password" placeholder="Confirm new password" />
                <button type="button" class="password-toggle" data-target="account-confirm-password" aria-label="Show password">Show</button>
              </div>
              <button type="submit">Update Account</button>
            </form>
          </section>
        </main>
      </div>
    `;

    attachPasswordToggles();

    const showSection = (sectionName = 'dashboard') => {
      const sections = document.querySelectorAll('.admin-section');
      const navButtons = document.querySelectorAll('.admin-nav-btn');
      sections.forEach((section) => {
        section.classList.toggle('active', section.dataset.section === sectionName);
      });
      navButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.section === sectionName);
      });
      history.replaceState(null, '', `#${sectionName}`);
    };

    document.querySelectorAll('.admin-nav-btn').forEach((button) => {
      button.addEventListener('click', () => showSection(button.dataset.section));
    });

    const statsGrid = document.querySelector('.stats-grid');
    const projectList = document.getElementById('project-list');
    const messageList = document.getElementById('message-list');
    const skillList = document.getElementById('skill-list');
    const messageNavButton = document.querySelector('.admin-nav-btn[data-section="messages"]');
    const markAllReadButton = document.querySelector('[data-action="mark-all-read"]');

    const updateMessageBadge = (messages = []) => {
      if (!messageNavButton) return;
      const unreadCount = messages.filter((message) => !message.read).length;
      messageNavButton.classList.toggle('has-alert', unreadCount > 0);
      messageNavButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <span>Messages</span>
        ${unreadCount > 0 ? `<span class="admin-badge">${unreadCount}</span>` : ''}
      `;
    };

    const loadDashboard = async () => {
      try {
        const [projects, messages, skills] = await Promise.all([
          fetch('/api/projects').then((response) => response.json()),
          fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()),
          fetch('/api/skills').then((response) => response.json()),
        ]);
        const unread = messages.filter((item) => !item.read).length;
        if (markAllReadButton) {
          markAllReadButton.style.display = unread ? 'inline-flex' : 'none';
        }
        if (statsGrid) {
          statsGrid.innerHTML = `
            <div class="stat-card" data-nav="projects" style="cursor:pointer;" title="Go to Projects">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Projects</span>
                <span class="stat-value">${projects.length}</span>
              </div>
            </div>
            <div class="stat-card" data-nav="messages" style="cursor:pointer;" title="Go to Messages">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Messages</span>
                <span class="stat-value">${messages.length}</span>
              </div>
            </div>
            <div class="stat-card" data-nav="messages" style="cursor:pointer;" title="Go to Messages">
              <div class="stat-icon" style="color: var(--warning);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Unread Messages</span>
                <span class="stat-value">${unread}</span>
              </div>
            </div>
            <div class="stat-card" data-nav="skills" style="cursor:pointer;" title="Go to Skills">
              <div class="stat-icon" style="color: var(--success);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Skills</span>
                <span class="stat-value">${skills.length}</span>
              </div>
            </div>
          `;

          // Make stat cards navigate to their section on click
          statsGrid.querySelectorAll('.stat-card[data-nav]').forEach((card) => {
            card.addEventListener('click', () => showSection(card.getAttribute('data-nav')));
          });
        }
      } catch (error) {
        if (statsGrid) {
          statsGrid.innerHTML = '<div class="stat-card">Unable to load dashboard data.</div>';
        }
      }
    };

    const loadProjects = async () => {
      try {
        const projects = await fetch('/api/projects').then((response) => response.json());
        if (projectList) {
          projectList.innerHTML = projects.map((project) => `
            <div class="admin-item">
              <div class="admin-item-content">
                <div class="admin-item-header">
                  <strong>${project.title}</strong>
                  ${project.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
                </div>
                <p class="admin-item-desc">${project.description}</p>
                <div class="admin-item-meta">
                  ${(project.techStack || []).map((tech) => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
              </div>
              <div class="admin-item-actions">
                <button class="btn-delete" data-id="${project._id}" data-action="delete-project">Delete</button>
              </div>
            </div>
          `).join('');
        }
      } catch (error) {
        if (projectList) {
          projectList.innerHTML = '<p>Unable to load projects.</p>';
        }
      }
    };

    const loadMessages = async () => {
      try {
        const messages = await fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json());
        updateMessageBadge(messages);
        if (messageList) {
          if (!messages.length) {
            messageList.innerHTML = '<p>No messages yet.</p>';
            return;
          }

          messageList.innerHTML = messages.map((message) => {
            const formattedDate = new Date(message.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            return `
              <div class="admin-item message-card ${message.read ? 'read' : 'unread'}">
                <div class="message-header">
                  <div class="sender-info">
                    <span class="sender-avatar">${message.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <h4 class="sender-name">${message.name}</h4>
                      <a href="mailto:${message.email}" class="sender-email">${message.email}</a>
                    </div>
                  </div>
                  <span class="message-time">${formattedDate}</span>
                </div>
                <div class="message-body">
                  <h5 class="message-subject">${message.subject}</h5>
                  <p class="message-content">${message.message || ''}</p>
                </div>
                <div class="admin-item-actions">
                  ${!message.read ? `<button class="btn-read" data-id="${message._id}" data-action="read-message">Mark Read</button>` : '<span class="status-read">Read</span>'}
                  <button class="btn-delete" data-id="${message._id}" data-action="delete-message">Delete</button>
                </div>
              </div>
            `;
          }).join('');
        }
      } catch (error) {
        updateMessageBadge([]);
        if (messageList) {
          messageList.innerHTML = '<p>Unable to load messages.</p>';
        }
      }
    };

    const markAllMessagesRead = async () => {
      try {
        const messages = await fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json());
        const unreadMessages = messages.filter((message) => !message.read);
        if (!unreadMessages.length) return;

        await Promise.all(
          unreadMessages.map((message) =>
            fetch(`/api/contact/${message._id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
          )
        );

        await Promise.all([loadMessages(), loadDashboard()]);
      } catch (error) {
        alert('Unable to mark all messages as read. Please try again.');
      }
    };

    const loadSkills = async () => {
      try {
        const skills = await fetch('/api/skills').then((response) => response.json());
        if (skillList) {
          skillList.innerHTML = skills.map((skill) => `
            <div class="admin-item skill-item-card">
              <div class="skill-info-wrapper">
                <strong>${skill.name}</strong>
                <span class="skill-category-badge">${skill.category || 'General'}</span>
                <div class="skill-progress-container">
                  <div class="skill-progress-bar" style="width: ${skill.percentage || 0}%"></div>
                  <span class="skill-percentage-text">${skill.percentage || 0}%</span>
                </div>
              </div>
              <div class="admin-item-actions">
                <button class="btn-delete" data-id="${skill._id}" data-action="delete-skill">Delete</button>
              </div>
            </div>
          `).join('');
        }
      } catch (error) {
        if (skillList) {
          skillList.innerHTML = '<p>Unable to load skills.</p>';
        }
      }
    };

    const projectForm = document.getElementById('project-form');
    if (projectForm) {
      projectForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const projectStatus = document.getElementById('project-status');
        const formData = new FormData(event.target);
        formData.set('featured', event.target.featured.checked ? 'true' : 'false');

        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setFormStatus(projectStatus, data.message || 'Unable to save project.', 'error');
          return;
        }

        setFormStatus(projectStatus, 'Project saved successfully.', 'success');
        event.target.reset();
        loadProjects();
        loadDashboard();
      });
    }

    const skillForm = document.getElementById('skill-form');
    if (skillForm) {
      skillForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const skillStatus = document.getElementById('skill-status');
        const payload = Object.fromEntries(new FormData(event.target));
        const response = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...payload, percentage: Number(payload.percentage) }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setFormStatus(skillStatus, data.message || 'Unable to save skill.', 'error');
          return;
        }

        setFormStatus(skillStatus, 'Skill saved successfully.', 'success');
        event.target.reset();
        loadSkills();
        loadDashboard();
      });
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        event.target.reset();
      });
    }

    const accountForm = document.getElementById('account-form');
    if (accountForm) {
      accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(event.target));
        if (!payload.currentPassword) {
          alert('Current password is required.');
          return;
        }
        if (payload.newPassword && payload.newPassword !== payload.confirmPassword) {
          alert('New passwords do not match.');
          return;
        }

        const body = {
          currentPassword: payload.currentPassword,
        };
        if (payload.newUsername?.trim()) {
          body.newUsername = payload.newUsername.trim();
        }
        if (payload.newPassword) {
          body.newPassword = payload.newPassword;
        }

        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.message || 'Unable to update account.');
          return;
        }

        alert(data.message || 'Account updated successfully.');
        event.target.reset();
      });
    }

    document.addEventListener('click', async (event) => {
      const button = event.target.closest('button');
      if (!button) return;

      const { action, id } = button.dataset;
      if (action === 'delete-project') {
        await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadProjects();
        loadDashboard();
      }
      if (action === 'read-message') {
        await fetch(`/api/contact/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        loadMessages();
        loadDashboard();
      }
      if (action === 'mark-all-read') {
        await markAllMessagesRead();
      }
      if (action === 'delete-message') {
        await fetch(`/api/contact/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadMessages();
        loadDashboard();
      }
      if (action === 'delete-skill') {
        await fetch(`/api/skills/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadSkills();
        loadDashboard();
      }
    });

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin.html';
      });
    }

    const initialSection = window.location.hash.replace('#', '') || 'dashboard';
    showSection(initialSection);

    loadDashboard();
    loadProjects();
    loadMessages();
    loadSkills();

    setInterval(() => {
      loadMessages();
      loadDashboard();
    }, 5000);
  };

  if (!token) {
    renderLogin();
    return;
  }

  renderDashboard();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
