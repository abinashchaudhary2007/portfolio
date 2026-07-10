const initAdmin = () => {
  const root = document.getElementById('admin-root');
  if (!root) return;

  const token = sessionStorage.getItem('adminToken');

  const setFormStatus = (element, message, type = 'info') => {
    if (!element) return;
    element.textContent = message;
    element.className = `admin-status ${type}`;
    setTimeout(() => {
      element.textContent = '';
      element.className = 'admin-status';
    }, 4000);
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
          sessionStorage.setItem('adminToken', data.token);
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
          <button class="admin-nav-btn" data-section="analytics">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span>Analytics</span>
          </button>
          <button class="admin-nav-btn" data-section="ai-settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>AI Assistant</span>
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
            <div class="dashboard-header">
              <div>
                <h3>Dashboard</h3>
                <p class="dashboard-subtitle">Welcome back! Here's what's happening.</p>
              </div>
              <button id="dashboard-refresh-btn" class="btn-analytics">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Refresh
              </button>
            </div>

            <!-- Content Stats Row -->
            <p class="dashboard-section-label">Content Overview</p>
            <div class="stats-grid" id="content-stats-grid"></div>

            <!-- Analytics KPI Row -->
            <p class="dashboard-section-label">Visitor Analytics</p>
            <div class="analytics-stats-grid" id="dashboard-analytics-grid"></div>

            <!-- Mini Charts Row -->
            <div class="dashboard-charts-row">
              <div class="chart-container dashboard-chart">
                <h4>Daily Visitors (Last 7 Days)</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-dashboard-visitors"></canvas>
                </div>
              </div>
              <div class="chart-container dashboard-chart">
                <h4>Device Breakdown</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-dashboard-devices"></canvas>
                </div>
              </div>
            </div>

            <!-- Recent Visitors Table -->
            <div class="dashboard-recent-header">
              <h4>Recent Visitors</h4>
              <button class="btn-analytics btn-primary-action" onclick="document.querySelector('.admin-nav-btn[data-section=analytics]').click()">
                View Full Analytics →
              </button>
            </div>
            <div class="analytics-table-container">
              <table class="analytics-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Browser</th>
                    <th>Device</th>
                    <th>Page</th>
                  </tr>
                </thead>
                <tbody id="dashboard-recent-tbody">
                  <tr><td colspan="6" class="empty-state">Loading...</td></tr>
                </tbody>
              </table>
            </div>
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

          <section id="analytics" class="admin-section" data-section="analytics">
            <div class="analytics-header">
              <h3>Visitor Analytics</h3>
              <div class="analytics-actions">
                <button class="btn-analytics" id="btn-analytics-refresh">Refresh Data</button>
                <button class="btn-analytics btn-primary-action" id="btn-analytics-csv">Export CSV</button>
              </div>
            </div>

            <!-- Stats KPI Cards Grid -->
            <div class="analytics-stats-grid" id="analytics-stats-grid">
              <!-- Cards load dynamically -->
            </div>

            <!-- Charts Row -->
            <div class="analytics-charts-grid">
              <div class="chart-container">
                <h4>Daily Unique Visitors (Last 7 Days)</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-daily-visitors"></canvas>
                </div>
              </div>
              <div class="chart-container">
                <h4>Browser Usage</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-browsers"></canvas>
                </div>
              </div>
              <div class="chart-container">
                <h4>Top Pages</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-pages"></canvas>
                </div>
              </div>
              <div class="chart-container">
                <h4>Device Types</h4>
                <div class="chart-wrapper">
                  <canvas id="chart-devices"></canvas>
                </div>
              </div>
            </div>

            <!-- Filtering & Visitor Log Table -->
            <div class="analytics-table-header">
              <h4>Visitor Log</h4>
              <div class="analytics-filters">
                <input type="text" id="analytics-search" placeholder="Search logs..." />
                <select id="analytics-filter-device">
                  <option value="">All Devices</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                </select>
                <select id="analytics-filter-country">
                  <option value="">All Countries</option>
                  <!-- Populated dynamically -->
                </select>
              </div>
            </div>

            <div class="analytics-table-container">
              <table class="analytics-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Browser</th>
                    <th>OS</th>
                    <th>Device</th>
                    <th>Page</th>
                    <th>Session ID</th>
                  </tr>
                </thead>
                <tbody id="analytics-tbody">
                  <!-- Row details loads here -->
                </tbody>
              </table>
            </div>

            <div class="pagination-controls">
              <div class="pagination-info" id="analytics-pagination-info">
                Showing 0 to 0 of 0 entries
              </div>
              <div class="pagination-buttons" id="analytics-pagination-buttons">
                <!-- Page buttons load here -->
              </div>
            </div>
          </section>

          <section id="ai-settings" class="admin-section" data-section="ai-settings">
            <h3>AI Portfolio Assistant Settings</h3>
            <form id="ai-settings-form" class="admin-form">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="enabled" id="ai-enabled-toggle" />
                <strong>Enable AI Assistant widget</strong>
              </label>
              <div class="form-group">
                <label>Welcome Message</label>
                <input type="text" name="welcome_message" id="ai-welcome-msg" required />
              </div>
              <div class="form-group">
                <label>Suggested Questions (Comma separated)</label>
                <input type="text" name="suggested_questions" id="ai-suggested-questions" required />
              </div>
              <div class="form-group">
                <label>Availability Status</label>
                <input type="text" name="availability_status" id="ai-availability-status" required />
              </div>
              <div id="ai-settings-status" class="admin-status"></div>
              <button type="submit">Save AI Settings</button>
            </form>

            <div class="faq-admin-container">
              <h4>Custom FAQs Management</h4>
              <form id="faq-form" class="faq-form admin-form">
                <div class="form-group">
                  <label>Question</label>
                  <input type="text" name="question" id="faq-question" required placeholder="e.g. Tell me about his hackathons" />
                </div>
                <div class="form-group">
                  <label>Answer</label>
                  <input type="text" name="answer" id="faq-answer" required placeholder="e.g. Abinash has completed 3+ hackathons in 2026..." />
                </div>
                <button type="submit" class="btn-analytics btn-primary-action" style="height: 42px;">Add FAQ</button>
              </form>
              <div id="faq-status" class="admin-status"></div>
              <div class="analytics-table-container">
                <table class="analytics-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="faq-tbody">
                    <!-- FAQ Rows load here -->
                  </tbody>
                </table>
              </div>
            </div>
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

    const dashboardRefreshBtn = document.getElementById('dashboard-refresh-btn');
    if (dashboardRefreshBtn) {
      dashboardRefreshBtn.addEventListener('click', () => loadDashboard());
    }

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

      if (sectionName === 'dashboard') {
        loadDashboard();
      } else if (sectionName === 'analytics') {
        loadAnalyticsStats();
        loadAnalyticsCharts();
        loadAnalyticsTable(1);
      } else if (sectionName === 'ai-settings') {
        loadAISettings();
        loadFAQs();
      }
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

    let dashboardChartInstances = {};

    const loadDashboard = async () => {
      const contentGrid = document.getElementById('content-stats-grid');
      const analyticsGrid = document.getElementById('dashboard-analytics-grid');
      const recentTbody = document.getElementById('dashboard-recent-tbody');

      // Show skeletons
      if (contentGrid) contentGrid.innerHTML = Array(4).fill('<div class="stat-card skeleton-card"></div>').join('');
      if (analyticsGrid) analyticsGrid.innerHTML = Array(5).fill('<div class="stat-card skeleton-card"></div>').join('');

      try {
        const [projects, messages, skills, analyticsStats, chartsData, visitorsData] = await Promise.all([
          fetch('/api/projects').then(r => r.json()).catch(() => []),
          fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
          fetch('/api/skills').then(r => r.json()).catch(() => []),
          fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
          fetch('/api/analytics/charts', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
          fetch('/api/analytics/visitors?page=1&limit=6', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({}))
        ]);

        const unread = Array.isArray(messages) ? messages.filter(m => !m.read).length : 0;
        if (markAllReadButton) markAllReadButton.style.display = unread ? 'inline-flex' : 'none';
        updateMessageBadge(Array.isArray(messages) ? messages : []);

        // ── Content Stats ──────────────────────────────────────────────
        if (contentGrid) {
          contentGrid.innerHTML = `
            <div class="stat-card" data-nav="projects" style="cursor:pointer;" title="Go to Projects">
              <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
              <div class="stat-info"><span class="stat-label">Projects</span><span class="stat-value">${Array.isArray(projects) ? projects.length : 0}</span></div>
            </div>
            <div class="stat-card" data-nav="messages" style="cursor:pointer;" title="Go to Messages">
              <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div class="stat-info"><span class="stat-label">Total Messages</span><span class="stat-value">${Array.isArray(messages) ? messages.length : 0}</span></div>
            </div>
            <div class="stat-card" data-nav="messages" style="cursor:pointer;">
              <div class="stat-icon" style="color:var(--warning);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
              <div class="stat-info"><span class="stat-label">Unread Messages</span><span class="stat-value">${unread}</span></div>
            </div>
            <div class="stat-card" data-nav="skills" style="cursor:pointer;">
              <div class="stat-icon" style="color:var(--success);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
              <div class="stat-info"><span class="stat-label">Skills</span><span class="stat-value">${Array.isArray(skills) ? skills.length : 0}</span></div>
            </div>
          `;
          contentGrid.querySelectorAll('.stat-card[data-nav]').forEach(card => {
            card.addEventListener('click', () => showSection(card.getAttribute('data-nav')));
          });
        }

        // ── Analytics KPI Cards ─────────────────────────────────────────
        if (analyticsGrid) {
          const lastVisitorStr = analyticsStats.lastVisitor
            ? `${new Date(analyticsStats.lastVisitor.visited_at).toLocaleTimeString()} · ${analyticsStats.lastVisitor.country || 'Unknown'}`
            : 'No visitors yet';
          analyticsGrid.innerHTML = `
            <div class="stat-card" data-nav="analytics" style="cursor:pointer;">
              <div class="stat-icon">👀</div>
              <div class="stat-info"><span class="stat-label">Total Visitors</span><span class="stat-value">${analyticsStats.totalVisitors || 0}</span></div>
            </div>
            <div class="stat-card" data-nav="analytics" style="cursor:pointer;">
              <div class="stat-icon">📅</div>
              <div class="stat-info"><span class="stat-label">Visitors Today</span><span class="stat-value">${analyticsStats.visitorsToday || 0}</span></div>
            </div>
            <div class="stat-card" data-nav="analytics" style="cursor:pointer;">
              <div class="stat-icon">🌍</div>
              <div class="stat-info"><span class="stat-label">Countries</span><span class="stat-value">${analyticsStats.totalCountries || 0}</span></div>
            </div>
            <div class="stat-card" data-nav="analytics" style="cursor:pointer;">
              <div class="stat-icon">📱</div>
              <div class="stat-info"><span class="stat-label">Unique Sessions</span><span class="stat-value">${analyticsStats.uniqueSessions || 0}</span></div>
            </div>
            <div class="stat-card" data-nav="analytics" style="cursor:pointer;">
              <div class="stat-icon">🕒</div>
              <div class="stat-info"><span class="stat-label">Last Visitor</span><span class="stat-value" style="font-size:0.85rem;">${lastVisitorStr}</span></div>
            </div>
          `;
          analyticsGrid.querySelectorAll('.stat-card[data-nav]').forEach(card => {
            card.addEventListener('click', () => showSection(card.getAttribute('data-nav')));
          });
        }

        // ── Mini Charts ─────────────────────────────────────────────────
        const palette = ['rgba(59,130,246,0.85)', 'rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)', 'rgba(139,92,246,0.85)'];
        const chartColor = 'rgba(255,255,255,0.65)';
        const gridColor = 'rgba(255,255,255,0.08)';

        const renderDashChart = (id, config) => {
          if (dashboardChartInstances[id]) dashboardChartInstances[id].destroy();
          const canvas = document.getElementById(id);
          if (!canvas) return;
          dashboardChartInstances[id] = new Chart(canvas.getContext('2d'), config);
        };

        renderDashChart('chart-dashboard-visitors', {
          type: 'line',
          data: {
            labels: (chartsData.dailyVisitors || []).map(d => d.date),
            datasets: [{ label: 'Unique Visitors', data: (chartsData.dailyVisitors || []).map(d => d.count), borderColor: 'rgba(59,130,246,1)', backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: chartColor } } }, scales: { x: { ticks: { color: chartColor }, grid: { color: gridColor } }, y: { ticks: { color: chartColor }, grid: { color: gridColor }, beginAtZero: true } } }
        });

        renderDashChart('chart-dashboard-devices', {
          type: 'doughnut',
          data: {
            labels: (chartsData.deviceTypes || []).map(d => d.device),
            datasets: [{ data: (chartsData.deviceTypes || []).map(d => d.count), backgroundColor: palette, borderWidth: 1, borderColor: 'rgba(15,23,42,0.5)' }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: chartColor }, position: 'bottom' } } }
        });

        // ── Recent Visitors Table ───────────────────────────────────────
        if (recentTbody) {
          const visitors = visitorsData.visitors || [];
          if (!visitors.length) {
            recentTbody.innerHTML = `<tr><td colspan="6" class="empty-state">No visitor records yet.</td></tr>`;
          } else {
            recentTbody.innerHTML = visitors.slice(0, 6).map(v => {
              const dt = new Date(v.visited_at || v.created_at);
              const timeStr = isNaN(dt) ? '—' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const deviceIcon = v.device === 'Mobile' ? '📱' : '🖥️';
              return `<tr>
                <td>${timeStr}</td>
                <td>${v.country || '—'}</td>
                <td>${v.city || '—'}</td>
                <td>${v.browser || '—'}</td>
                <td>${deviceIcon} ${v.device || '—'}</td>
                <td><span class="tech-tag">${v.page || '/'}</span></td>
              </tr>`;
            }).join('');
          }
        }

      } catch (error) {
        console.error('Dashboard load error:', error);
        if (contentGrid) contentGrid.innerHTML = '<div class="stat-card"><p style="color:var(--error)">Unable to load dashboard data.</p></div>';
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
      if (action === 'delete-faq') {
        if (!confirm('Delete this FAQ?')) return;
        await fetch(`/api/ai/faqs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadFAQs();
      }
    });

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin.html';
      });
    }

    const initialSection = window.location.hash.replace('#', '') || 'dashboard';
    showSection(initialSection);

    loadDashboard();
    loadProjects();
    loadMessages();
    loadSkills();

    // ====================================================
    // ANALYTICS DASHBOARD
    // ====================================================

    // Track current analytics state
    let currentAnalyticsPage = 1;
    let analyticsSearchTerm = '';
    let analyticsDeviceFilter = '';
    let analyticsCountryFilter = '';
    let cachedVisitorsData = [];
    let analyticsChartInstances = {};

    const loadAnalyticsStats = async () => {
      const statsGrid = document.getElementById('analytics-stats-grid');
      if (!statsGrid) return;

      // Show loading skeletons
      statsGrid.innerHTML = Array(9).fill('<div class="stat-card skeleton-card"></div>').join('');

      try {
        const data = await fetch('/api/analytics/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        const lastVisitorStr = data.lastVisitor
          ? `${new Date(data.lastVisitor.visited_at).toLocaleString()} — ${data.lastVisitor.country || 'Unknown'}`
          : 'No visitors yet';

        statsGrid.innerHTML = `
          <div class="stat-card">
            <div class="stat-icon">👀</div>
            <div class="stat-info">
              <span class="stat-label">Total Visitors</span>
              <span class="stat-value">${data.totalVisitors || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <span class="stat-label">Visitors Today</span>
              <span class="stat-value">${data.visitorsToday || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📆</div>
            <div class="stat-info">
              <span class="stat-label">This Month</span>
              <span class="stat-value">${data.visitorsThisMonth || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-info">
              <span class="stat-label">Most Viewed</span>
              <span class="stat-value" style="font-size:1.2rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${data.mostViewedPage || 'N/A'}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📥</div>
            <div class="stat-info">
              <span class="stat-label">Resume Downloads</span>
              <span class="stat-value">${data.resumeDownloads || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📩</div>
            <div class="stat-info">
              <span class="stat-label">Contact Messages</span>
              <span class="stat-value">${data.contactMessages || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🌍</div>
            <div class="stat-info">
              <span class="stat-label">Countries</span>
              <span class="stat-value">${data.totalCountries || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📱</div>
            <div class="stat-info">
              <span class="stat-label">Unique Sessions</span>
              <span class="stat-value">${data.uniqueSessions || 0}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🕒</div>
            <div class="stat-info">
              <span class="stat-label">Last Visitor</span>
              <span class="stat-value" style="font-size:0.9rem; overflow:hidden; text-overflow:ellipsis;">${lastVisitorStr}</span>
            </div>
          </div>
        `;
      } catch (err) {
        statsGrid.innerHTML = `<div class="stat-card"><p style="color:var(--error);">Failed to load analytics stats.</p></div>`;
      }
    };

    const loadAnalyticsCharts = async () => {
      try {
        const data = await fetch('/api/analytics/charts', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        const chartDefaults = {
          color: 'rgba(255,255,255,0.7)',
          borderColor: 'rgba(255,255,255,0.1)'
        };

        const palette = [
          'rgba(59,130,246,0.8)',
          'rgba(16,185,129,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(239,68,68,0.8)',
          'rgba(139,92,246,0.8)'
        ];

        // Helper: destroy and re-create a chart to avoid canvas reuse errors
        const renderChart = (id, config) => {
          if (analyticsChartInstances[id]) {
            analyticsChartInstances[id].destroy();
          }
          const canvas = document.getElementById(id);
          if (!canvas) return;
          analyticsChartInstances[id] = new Chart(canvas.getContext('2d'), config);
        };

        // 1. Daily Visitors Line Chart
        renderChart('chart-daily-visitors', {
          type: 'line',
          data: {
            labels: (data.dailyVisitors || []).map(d => d.date),
            datasets: [{
              label: 'Daily Unique Visitors',
              data: (data.dailyVisitors || []).map(d => d.count),
              borderColor: 'rgba(59,130,246,1)',
              backgroundColor: 'rgba(59,130,246,0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: chartDefaults.color } } },
            scales: {
              x: { ticks: { color: chartDefaults.color }, grid: { color: chartDefaults.borderColor } },
              y: { ticks: { color: chartDefaults.color }, grid: { color: chartDefaults.borderColor }, beginAtZero: true }
            }
          }
        });

        // 2. Browser Usage Doughnut
        renderChart('chart-browsers', {
          type: 'doughnut',
          data: {
            labels: (data.browserUsage || []).map(b => b.browser),
            datasets: [{
              data: (data.browserUsage || []).map(b => b.count),
              backgroundColor: palette,
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.5)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: chartDefaults.color }, position: 'bottom' } }
          }
        });

        // 3. Top Pages Bar Chart
        renderChart('chart-pages', {
          type: 'bar',
          data: {
            labels: (data.topPages || []).map(p => p.page),
            datasets: [{
              label: 'Page Views',
              data: (data.topPages || []).map(p => p.count),
              backgroundColor: palette,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: chartDefaults.color }, grid: { color: chartDefaults.borderColor } },
              y: { ticks: { color: chartDefaults.color }, grid: { color: chartDefaults.borderColor }, beginAtZero: true }
            }
          }
        });

        // 4. Device Types Pie
        renderChart('chart-devices', {
          type: 'pie',
          data: {
            labels: (data.deviceTypes || []).map(d => d.device),
            datasets: [{
              data: (data.deviceTypes || []).map(d => d.count),
              backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)'],
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.5)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: chartDefaults.color }, position: 'bottom' } }
          }
        });

      } catch (err) {
        console.warn('Failed to load charts:', err.message);
      }
    };

    const loadAnalyticsTable = async (page = 1) => {
      const tbody = document.getElementById('analytics-tbody');
      const paginationInfo = document.getElementById('analytics-pagination-info');
      const paginationButtons = document.getElementById('analytics-pagination-buttons');
      const countrySelect = document.getElementById('analytics-filter-country');

      if (!tbody) return;

      // Show loading skeleton rows
      tbody.innerHTML = Array(5).fill(`<tr class="skeleton-row"><td colspan="8"></td></tr>`).join('');
      currentAnalyticsPage = page;

      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          search: analyticsSearchTerm,
          device: analyticsDeviceFilter,
          country: analyticsCountryFilter
        });

        const data = await fetch(`/api/analytics/visitors?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        cachedVisitorsData = data.visitors || [];

        // Populate country filter from available countries
        if (countrySelect && data.filters && data.filters.countries) {
          const currentCountry = countrySelect.value;
          countrySelect.innerHTML = '<option value="">All Countries</option>' +
            data.filters.countries.map(c => `<option value="${c}" ${c === currentCountry ? 'selected' : ''}>${c}</option>`).join('');
        }

        // Render rows
        if (!cachedVisitorsData.length) {
          tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No visitor records found.</td></tr>`;
        } else {
          tbody.innerHTML = cachedVisitorsData.map(v => {
            const dt = new Date(v.visited_at || v.created_at);
            const dateStr = dt.toLocaleDateString();
            const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
              <tr>
                <td>${dateStr} ${timeStr}</td>
                <td>${v.country || '—'}</td>
                <td>${v.city || '—'}</td>
                <td>${v.browser || '—'}</td>
                <td>${v.operating_system || '—'}</td>
                <td>${v.device || '—'}</td>
                <td>${v.page || '—'}</td>
                <td class="session-id-cell" title="${v.session_id}">${(v.session_id || '').substring(0, 14)}...</td>
              </tr>
            `;
          }).join('');
        }

        // Pagination info
        const { page: pg, limit, totalCount, totalPages } = data.pagination || {};
        const startEntry = totalCount === 0 ? 0 : (pg - 1) * limit + 1;
        const endEntry = Math.min(pg * limit, totalCount);
        if (paginationInfo) {
          paginationInfo.textContent = `Showing ${startEntry} to ${endEntry} of ${totalCount} entries`;
        }

        // Pagination buttons
        if (paginationButtons && totalPages > 0) {
          let btns = '';
          btns += `<button class="btn-page" onclick="window._loadAnalyticsPage(${pg - 1})" ${pg <= 1 ? 'disabled' : ''}>&lt; Prev</button>`;
          for (let i = Math.max(1, pg - 2); i <= Math.min(totalPages, pg + 2); i++) {
            btns += `<button class="btn-page ${i === pg ? 'active' : ''}" onclick="window._loadAnalyticsPage(${i})">${i}</button>`;
          }
          btns += `<button class="btn-page" onclick="window._loadAnalyticsPage(${pg + 1})" ${pg >= totalPages ? 'disabled' : ''}>Next &gt;</button>`;
          paginationButtons.innerHTML = btns;
        }

      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state" style="color:var(--error);">Failed to load visitor logs.</td></tr>`;
      }
    };

    // Global helpers for pagination clicks (needed for inline onclick in table)
    window._loadAnalyticsPage = (pg) => {
      if (pg < 1) return;
      loadAnalyticsTable(pg);
    };

    // Search and filter event listeners for analytics
    const analyticsSearch = document.getElementById('analytics-search');
    if (analyticsSearch) {
      let searchDebounce;
      analyticsSearch.addEventListener('input', (e) => {
        analyticsSearchTerm = e.target.value;
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => loadAnalyticsTable(1), 400);
      });
    }

    const deviceFilter = document.getElementById('analytics-filter-device');
    if (deviceFilter) {
      deviceFilter.addEventListener('change', (e) => {
        analyticsDeviceFilter = e.target.value;
        loadAnalyticsTable(1);
      });
    }

    const countryFilter = document.getElementById('analytics-filter-country');
    if (countryFilter) {
      countryFilter.addEventListener('change', (e) => {
        analyticsCountryFilter = e.target.value;
        loadAnalyticsTable(1);
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('btn-analytics-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadAnalyticsStats();
        loadAnalyticsCharts();
        loadAnalyticsTable(currentAnalyticsPage);
      });
    }

    // CSV Export button
    const csvBtn = document.getElementById('btn-analytics-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', async () => {
        try {
          const params = new URLSearchParams({ page: 1, limit: 10000, search: analyticsSearchTerm, device: analyticsDeviceFilter, country: analyticsCountryFilter });
          const data = await fetch(`/api/analytics/visitors?${params}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
          const rows = data.visitors || [];

          const headers = ['Date', 'Time', 'Country', 'City', 'Browser', 'OS', 'Device', 'Page', 'Session ID', 'Is Returning'];
          const csvContent = [
            headers.join(','),
            ...rows.map(v => {
              const dt = new Date(v.visited_at || v.created_at);
              return [
                `"${dt.toLocaleDateString()}"`,
                `"${dt.toLocaleTimeString()}"`,
                `"${v.country || ''}"`,
                `"${v.city || ''}"`,
                `"${v.browser || ''}"`,
                `"${v.operating_system || ''}"`,
                `"${v.device || ''}"`,
                `"${v.page || ''}"`,
                `"${v.session_id || ''}"`,
                `"${v.is_returning ? 'Yes' : 'No'}"`
              ].join(',');
            })
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `visitor-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (err) {
          alert('Failed to export CSV. Please try again.');
        }
      });
    }


    // ====================================================
    // AI SETTINGS & FAQS
    // ====================================================

    const loadAISettings = async () => {
      try {
        const data = await fetch('/api/ai/settings', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        const enabledToggle = document.getElementById('ai-enabled-toggle');
        const welcomeMsg = document.getElementById('ai-welcome-msg');
        const suggestedQ = document.getElementById('ai-suggested-questions');
        const availability = document.getElementById('ai-availability-status');

        if (enabledToggle) enabledToggle.checked = data.enabled !== false;
        if (welcomeMsg) welcomeMsg.value = data.welcome_message || '';
        if (suggestedQ) {
          const questions = Array.isArray(data.suggested_questions)
            ? data.suggested_questions.join(', ')
            : (data.suggested_questions || '');
          suggestedQ.value = questions;
        }
        if (availability) availability.value = data.availability_status || '';
      } catch (err) {
        console.warn('Failed to load AI settings:', err.message);
      }
    };

    const aiSettingsForm = document.getElementById('ai-settings-form');
    if (aiSettingsForm) {
      aiSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('ai-settings-status');
        const enabledToggle = document.getElementById('ai-enabled-toggle');
        const welcomeMsg = document.getElementById('ai-welcome-msg');
        const suggestedQ = document.getElementById('ai-suggested-questions');
        const availability = document.getElementById('ai-availability-status');

        const payload = {
          enabled: enabledToggle?.checked || false,
          welcome_message: welcomeMsg?.value || '',
          suggested_questions: (suggestedQ?.value || '').split(',').map(q => q.trim()).filter(Boolean),
          availability_status: availability?.value || ''
        };

        try {
          const res = await fetch('/api/ai/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            setFormStatus(status, 'AI settings saved successfully.', 'success');
          } else {
            const d = await res.json().catch(() => ({}));
            setFormStatus(status, d.message || 'Failed to save AI settings.', 'error');
          }
        } catch (err) {
          setFormStatus(status, 'Connection error saving AI settings.', 'error');
        }
      });
    }

    const loadFAQs = async () => {
      const tbody = document.getElementById('faq-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr class="skeleton-row"><td colspan="3"></td></tr>';

      try {
        const faqs = await fetch('/api/ai/faqs', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        if (!faqs.length) {
          tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No custom FAQs yet. Add one above!</td></tr>';
          return;
        }

        tbody.innerHTML = faqs.map(faq => `
          <tr>
            <td style="max-width:250px; white-space:normal;">${faq.question}</td>
            <td style="max-width:350px; white-space:normal; color:var(--text-secondary);">${faq.answer}</td>
            <td>
              <button class="btn-delete" data-action="delete-faq" data-id="${faq.id}">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state" style="color:var(--error);">Failed to load FAQs.</td></tr>';
      }
    };

    const faqForm = document.getElementById('faq-form');
    if (faqForm) {
      faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('faq-status');
        const question = document.getElementById('faq-question')?.value?.trim();
        const answer = document.getElementById('faq-answer')?.value?.trim();

        if (!question || !answer) {
          setFormStatus(status, 'Both question and answer are required.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/ai/faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, answer })
          });

          if (res.ok) {
            setFormStatus(status, 'FAQ added successfully!', 'success');
            faqForm.reset();
            loadFAQs();
          } else {
            const d = await res.json().catch(() => ({}));
            setFormStatus(status, d.message || 'Failed to add FAQ.', 'error');
          }
        } catch (err) {
          setFormStatus(status, 'Connection error while adding FAQ.', 'error');
        }
      });
    }

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
