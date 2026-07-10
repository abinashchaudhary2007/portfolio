import { supabase } from '../config/db.js';
import { isFallbackMode, getFallbackStore } from '../utils/fallbackStore.js';
import { getPortfolioData, getSystemPrompt } from '../utils/portfolioData.js';

/**
 * Main chat endpoint
 * Processes user messages and returns AI responses
 */
export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Message is required and must be a non-empty string' 
      });
    }

    // Fetch portfolio data from database or fallback
    const portfolioData = await fetchPortfolioData();
    
    // Check if AI assistant is enabled
    if (portfolioData.aiSettings?.enabled === false) {
      return res.status(403).json({ 
        error: 'Service unavailable',
        message: 'AI Portfolio Assistant is currently disabled' 
      });
    }

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Try Gemini API first
    if (apiKey) {
      try {
        const reply = await callGeminiAPI(
          apiKey,
          message.trim(),
          history,
          portfolioData
        );
        
        if (reply) {
          return res.json({ reply });
        }
      } catch (err) {
        console.error('Gemini API error:', err.message);
        // Fall through to fallback
      }
    }

    // Fallback to keyword matching
    const reply = generateFallbackResponse(message, portfolioData);
    return res.json({ reply });

  } catch (err) {
    console.error('Chat error:', err);
    next(err);
  }
};

/**
 * Fetch all portfolio data from database or fallback store
 */
async function fetchPortfolioData() {
  try {
    let projects = [];
    let skills = [];
    let settings = {};
    let faqs = [];
    let aiSettings = { enabled: true, welcome_message: '', suggested_questions: [], availability_status: '' };

    if (isFallbackMode()) {
      const store = getFallbackStore();
      projects = store.projects || [];
      skills = store.skills || [];
      settings = store.settings || {};
      faqs = store.aiFaqs || [];
      aiSettings = store.aiSettings || aiSettings;
    } else {
      // Fetch all data in parallel
      const [projectsRes, skillsRes, settingsRes, faqsRes, aiSettingsRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('settings').select('*').limit(1),
        supabase.from('ai_faqs').select('*'),
        supabase.from('ai_settings').select('*').eq('id', 1).single()
      ]);

      projects = projectsRes.data || [];
      skills = skillsRes.data || [];
      settings = (settingsRes.data && settingsRes.data[0]) || {};
      faqs = faqsRes.data || [];
      if (aiSettingsRes.data) aiSettings = aiSettingsRes.data;
    }

    const portfolioData = getPortfolioData(settings, projects, skills, faqs);
    
    return {
      ...portfolioData,
      aiSettings,
      projects,
      skills,
      settings: portfolioData.settings,
      faqs
    };
  } catch (err) {
    console.error('Error fetching portfolio data:', err);
    // Return minimal fallback data
    return getPortfolioData({}, [], [], []);
  }
}

/**
 * Call Gemini API with proper error handling
 * Tries multiple models in order of preference
 */
async function callGeminiAPI(apiKey, message, history, portfolioData) {
  // Build conversation contents for Gemini
  const contents = [];

  // Add conversation history (limit to last 10 messages)
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-10).forEach(h => {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });
  }

  // Add current user message
  contents.push({ role: 'user', parts: [{ text: message }] });

  const systemPrompt = getSystemPrompt(portfolioData);

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 1024 }
  };

  // Try models in priority order
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b'];

  for (const model of models) {
    console.log(`[AI] Trying model: ${model}`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log(`[AI] ${model} → HTTP ${response.status}`);

      if (response.status === 401 || response.status === 403) {
        console.error(`[AI] Auth error for ${model}:`, data.error?.message);
        return null; // Key issue — no point trying other models
      }

      if (response.status === 429) {
        console.warn(`[AI] Rate limited on ${model}, trying next model...`);
        continue; // Try next model
      }

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = data.candidates[0].content.parts[0].text;
        console.log(`[AI] ✓ Got response from ${model} (${reply.length} chars)`);
        return reply;
      }

      console.warn(`[AI] Unexpected response from ${model}:`, JSON.stringify(data).slice(0, 200));

    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[AI] Timeout on ${model}`);
      } else {
        console.warn(`[AI] Error on ${model}:`, err.message);
      }
    }
  }

  console.warn('[AI] All models exhausted — using fallback');
  return null;
}

/**
 * Generate response using keyword matching + general knowledge (fallback)
 */
function generateFallbackResponse(message, portfolioData) {
  const cleanMsg = message.toLowerCase().trim();
  const { projects, skills, faqs, settings } = portfolioData;
  const name = settings.name || 'Abinash';
  const firstName = name.split(' ')[0];

  // ── 1. Check FAQs first ──────────────────────────────────────────
  for (const faq of faqs) {
    if (cleanMsg.includes(faq.question.toLowerCase())) {
      return faq.answer;
    }
  }

  // ── 2. Portfolio-specific keywords ───────────────────────────────
  if (cleanMsg.includes('project') || cleanMsg.includes('portfolio') || cleanMsg.includes('built')) {
    const projectsList = projects.slice(0, 3).map(p => `**${p.title}**: ${p.description}`).join('\n');
    return `${firstName} has worked on several projects:\n${projectsList}\n\nCheck out more on [GitHub](${settings.github})`;
  }

  if (cleanMsg.includes('skill') || cleanMsg.includes('tech stack') || cleanMsg.includes('technologies')) {
    const skillsList = skills.slice(0, 8).map(s => `**${s.name}** (${s.category})`).join(', ');
    return `${firstName}'s core competencies include: ${skillsList}. He specializes in **${settings.title || 'Full-Stack Development'}**.`;
  }

  if (cleanMsg.includes('contact') || cleanMsg.includes('email') || cleanMsg.includes('hire') || cleanMsg.includes('freelance') || cleanMsg.includes('reach')) {
    return `You can reach ${firstName} at **${settings.email}** for any inquiries. He is currently ${portfolioData.aiSettings?.availability_status || 'available for opportunities'}.`;
  }

  if ((cleanMsg.includes('who') && (cleanMsg.includes('abinash') || cleanMsg.includes('you'))) || cleanMsg.includes('about abinash') || cleanMsg.includes('introduce yourself')) {
    return `I'm ${firstName}'s AI Portfolio Assistant! ${name} is a **${settings.title}** based in ${portfolioData.settings.location}. ${settings.bio || 'He creates amazing digital experiences.'}\n\nFeel free to ask me anything — about ${firstName}'s work **or** general coding/tech questions!`;
  }

  // ── 3. Greetings ─────────────────────────────────────────────────
  if (/^(hi|hello|hey|sup|yo|howdy|hii+|helo)[\.!\?]?$/.test(cleanMsg)) {
    return `Hey there! 👋 I'm ${firstName}'s AI assistant. I can help you with:\n\n• **About ${firstName}** — projects, skills, experience, contact\n• **General questions** — coding help, explanations, tech concepts\n\nWhat's on your mind?`;
  }

  if (cleanMsg.includes('good morning') || cleanMsg.includes('good afternoon') || cleanMsg.includes('good evening') || cleanMsg.includes('good night')) {
    const greetings = ['Good morning! ☀️', 'Good afternoon! 🌤️', 'Good evening! 🌙', 'Good night! 🌙'];
    const g = cleanMsg.includes('morning') ? greetings[0] : cleanMsg.includes('afternoon') ? greetings[1] : cleanMsg.includes('evening') ? greetings[2] : greetings[3];
    return `${g} How can I help you today?`;
  }

  if (cleanMsg.includes('how are you') || cleanMsg.includes('how r u') || cleanMsg.includes("what's up") || cleanMsg.includes('whats up')) {
    return `I'm doing great, thanks for asking! 😊 Ready to help. What would you like to know?`;
  }

  if (cleanMsg.includes('thank') || cleanMsg.includes('thanks') || cleanMsg.includes('thx') || cleanMsg.includes('ty')) {
    return `You're welcome! 😊 Feel free to ask if you need anything else.`;
  }

  if (cleanMsg === 'ok' || cleanMsg === 'okay' || cleanMsg === 'cool' || cleanMsg === 'nice' || cleanMsg === 'great') {
    return `Glad to help! Let me know if you have any other questions. 👍`;
  }

  // ── 4. General coding / tech questions ───────────────────────────
  if (cleanMsg.includes('what is javascript') || cleanMsg.includes('what is js')) {
    return `**JavaScript** is a lightweight, interpreted programming language primarily used to make web pages interactive.\n\n**Key features:**\n• Runs in the browser (and on servers via Node.js)\n• Dynamic typing\n• Event-driven & asynchronous (Promises, async/await)\n• Supports OOP and functional programming\n\n**Example:**\n\`\`\`js\nconsole.log('Hello, World!');\n\`\`\``;
  }

  if (cleanMsg.includes('async') && cleanMsg.includes('await')) {
    return `**async/await** is modern JavaScript syntax for handling asynchronous operations cleanly.\n\n\`\`\`js\nasync function fetchData() {\n  try {\n    const res = await fetch('https://api.example.com/data');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}\n\`\`\`\n\n• **async** — marks a function as asynchronous (always returns a Promise)\n• **await** — pauses execution until the Promise resolves\n• Always wrap in **try/catch** to handle errors`;
  }

  if (cleanMsg.includes('what is react') || cleanMsg.includes('explain react')) {
    return `**React** is a JavaScript library by Meta for building user interfaces.\n\n**Core concepts:**\n• **Components** — reusable UI building blocks\n• **JSX** — HTML-like syntax in JavaScript\n• **State & Props** — manage and pass data\n• **Hooks** — useState, useEffect, etc.\n\n\`\`\`jsx\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\`\`\`\n\nReact makes it easy to build fast, interactive UIs with a virtual DOM.`;
  }

  if (cleanMsg.includes('what is node') || cleanMsg.includes('explain node')) {
    return `**Node.js** is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript on the **server side**.\n\n**Why use Node.js?**\n• Non-blocking, event-driven I/O — handles thousands of connections efficiently\n• Same language (JS) for frontend & backend\n• Huge ecosystem via npm\n\n\`\`\`js\nconst http = require('http');\nhttp.createServer((req, res) => {\n  res.end('Hello from Node!');\n}).listen(3000);\n\`\`\``;
  }

  if (cleanMsg.includes('what is api') || cleanMsg.includes('explain api')) {
    return `**API (Application Programming Interface)** is a set of rules that lets different software communicate.\n\n**REST API** (most common):\n• Uses HTTP methods: GET, POST, PUT, DELETE\n• Returns JSON data\n\n\`\`\`js\n// Fetching data from an API\nconst res = await fetch('https://api.example.com/users');\nconst users = await res.json();\n\`\`\``;
  }

  if (cleanMsg.includes('what is git') || cleanMsg.includes('explain git')) {
    return `**Git** is a distributed version control system that tracks changes in your code.\n\n**Essential commands:**\n\`\`\`bash\ngit init          # initialize a repo\ngit add .         # stage all changes\ngit commit -m "msg" # save a snapshot\ngit push          # upload to remote\ngit pull          # download latest changes\ngit branch        # list branches\n\`\`\`\n\nGitHub/GitLab host your Git repositories online for collaboration.`;
  }

  if (cleanMsg.includes('what is css') || cleanMsg.includes('explain css')) {
    return `**CSS (Cascading Style Sheets)** is used to style HTML elements — controlling layout, colors, fonts, animations, and more.\n\n\`\`\`css\n.button {\n  background: #3b82f6;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 8px;\n  transition: transform 0.2s;\n}\n.button:hover {\n  transform: scale(1.05);\n}\n\`\`\``;
  }

  if (cleanMsg.includes('what is html') || cleanMsg.includes('explain html')) {
    return `**HTML (HyperText Markup Language)** is the backbone of every web page — it defines the structure and content.\n\n\`\`\`html\n<!DOCTYPE html>\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Hello World</h1>\n    <p>Welcome to my site!</p>\n  </body>\n</html>\n\`\`\``;
  }

  if (cleanMsg.includes('what is mongodb') || cleanMsg.includes('explain mongodb')) {
    return `**MongoDB** is a NoSQL database that stores data as flexible JSON-like documents.\n\n**Key concepts:**\n• **Collection** — like a table in SQL\n• **Document** — like a row, but can have nested objects/arrays\n• **Schema-flexible** — no rigid table structure\n\n\`\`\`js\n// Example document\n{\n  _id: ObjectId("..."),\n  name: "Abinash",\n  skills: ["React", "Node.js", "MongoDB"]\n}\n\`\`\``;
  }

  if ((cleanMsg.includes('difference') || cleanMsg.includes('vs') || cleanMsg.includes('versus')) && cleanMsg.includes('sql') && cleanMsg.includes('nosql')) {
    return `**SQL vs NoSQL:**\n\n| Feature | SQL | NoSQL |\n|---------|-----|-------|\n| Structure | Tables & rows | Documents, key-value, graph |\n| Schema | Fixed | Flexible |\n| Examples | MySQL, PostgreSQL | MongoDB, Redis |\n| Best for | Complex queries, relations | Large scale, unstructured data |\n| Scaling | Vertical | Horizontal |`;
  }

  if (cleanMsg.includes('what is python') || cleanMsg.includes('explain python')) {
    return `**Python** is a high-level, beginner-friendly programming language known for its clean syntax.\n\n**Popular uses:**\n• Data Science & Machine Learning (NumPy, Pandas, TensorFlow)\n• Web development (Django, FastAPI)\n• Automation & scripting\n• AI/ML research\n\n\`\`\`python\nfor i in range(5):\n    print(f"Hello {i}")\n\`\`\``;
  }

  if (cleanMsg.includes('what is mern') || cleanMsg.includes('mern stack')) {
    return `**MERN Stack** is a popular full-stack JavaScript framework:\n\n• **M** — MongoDB (database)\n• **E** — Express.js (backend framework)\n• **R** — React.js (frontend UI)\n• **N** — Node.js (server runtime)\n\nAll four use JavaScript/JSON, making it easy to share code and data between frontend and backend. It's the stack ${firstName} specializes in! 🚀`;
  }

  if (cleanMsg.includes('what is promise') || cleanMsg.includes('javascript promise')) {
    return `A **Promise** in JavaScript represents the eventual result of an asynchronous operation.\n\n\`\`\`js\nconst fetchUser = new Promise((resolve, reject) => {\n  setTimeout(() => resolve({ name: 'Abinash' }), 1000);\n});\n\nfetchUser\n  .then(user => console.log(user.name))  // 'Abinash'\n  .catch(err => console.error(err));\n\`\`\`\n\n**3 states:** pending → fulfilled or rejected\n\nModern code uses **async/await** which is cleaner syntax over Promises.`;
  }

  if (cleanMsg.includes('what is rest') || cleanMsg.includes('restful')) {
    return `**REST (Representational State Transfer)** is an architectural style for APIs using HTTP.\n\n**HTTP Methods:**\n• **GET** — Read data\n• **POST** — Create data\n• **PUT/PATCH** — Update data\n• **DELETE** — Remove data\n\n**Example REST API:**\n\`\`\`\nGET    /api/users       → get all users\nGET    /api/users/1     → get user by id\nPOST   /api/users       → create user\nPUT    /api/users/1     → update user\nDELETE /api/users/1     → delete user\n\`\`\``;
  }

  // ── 5. General help ──────────────────────────────────────────────
  if (cleanMsg.includes('help') || cleanMsg.includes('what can you do') || cleanMsg.includes('what can you')) {
    return `I can help you with:\n\n**About ${firstName}:**\n• Projects & portfolio\n• Skills & technologies\n• Experience & education\n• Contact & availability\n\n**General Topics:**\n• Coding concepts (JavaScript, React, Node, Python...)\n• Tech explanations\n• Career advice\n• General questions\n\nJust ask! 😊`;
  }

  // ── 6. Default ───────────────────────────────────────────────────
  return `I'm ${firstName}'s AI assistant! I can answer questions about his portfolio **and** general tech/coding topics.\n\nTry asking me:\n• "What projects has he built?"\n• "Explain async/await"\n• "What is React?"\n• "What is the MERN stack?"`;
}


/**
 * Get AI assistant settings
 */
export const getSettings = async (req, res, next) => {
  try {
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

    if (isFallbackMode()) {
      const store = getFallbackStore();
      aiSettings = store.aiSettings || aiSettings;
    } else {
      const { data } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) aiSettings = data;
    }

    return res.json(aiSettings);
  } catch (err) {
    console.error('Error fetching AI settings:', err);
    next(err);
  }
};

/**
 * Update AI assistant settings (admin only)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { enabled, welcome_message, suggested_questions, availability_status } = req.body;

    const updatedSettings = {
      enabled,
      welcome_message,
      suggested_questions,
      availability_status
    };

    if (isFallbackMode()) {
      const store = getFallbackStore();
      store.aiSettings = {
        ...store.aiSettings,
        ...updatedSettings
      };
      return res.json({ 
        message: 'AI settings updated successfully', 
        settings: store.aiSettings 
      });
    } else {
      const { data, error } = await supabase
        .from('ai_settings')
        .upsert({
          id: 1,
          ...updatedSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.json({ 
        message: 'AI settings updated successfully', 
        settings: data 
      });
    }
  } catch (err) {
    console.error('Error updating AI settings:', err);
    next(err);
  }
};

/**
 * Get all custom FAQs
 */
export const getFAQs = async (req, res, next) => {
  try {
    let faqs = [];

    if (isFallbackMode()) {
      const store = getFallbackStore();
      faqs = store.aiFaqs || [];
    } else {
      const { data, error } = await supabase
        .from('ai_faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      faqs = data || [];
    }

    return res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    next(err);
  }
};

/**
 * Create a new FAQ (admin only)
 */
export const createFAQ = async (req, res, next) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        message: 'Question and answer are both required' 
      });
    }

    if (isFallbackMode()) {
      const store = getFallbackStore();
      const newFAQ = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
        question,
        answer,
        created_at: new Date().toISOString()
      };
      store.aiFaqs.unshift(newFAQ);
      return res.status(201).json({ 
        message: 'FAQ created successfully', 
        faq: newFAQ 
      });
    } else {
      const { data, error } = await supabase
        .from('ai_faqs')
        .insert([{ question, answer }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ 
        message: 'FAQ created successfully', 
        faq: data 
      });
    }
  } catch (err) {
    console.error('Error creating FAQ:', err);
    next(err);
  }
};

/**
 * Delete a FAQ (admin only)
 */
export const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'FAQ ID is required' });
    }

    if (isFallbackMode()) {
      const store = getFallbackStore();
      const initialLength = store.aiFaqs.length;
      store.aiFaqs = store.aiFaqs.filter(faq => faq.id !== id);

      if (store.aiFaqs.length === initialLength) {
        return res.status(404).json({ message: 'FAQ not found' });
      }
      return res.json({ message: 'FAQ deleted successfully' });
    } else {
      const { error } = await supabase
        .from('ai_faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ message: 'FAQ deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    next(err);
  }
};
