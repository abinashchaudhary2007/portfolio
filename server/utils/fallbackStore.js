import bcrypt from 'bcryptjs';

const fallbackStore = {
  contacts: [],
  projects: [],
  skills: [],
  experiences: [],
  certifications: [],
  settings: null,
  admin: null,
  visitors: [],
  aiSettings: {
    enabled: true,
    welcome_message: "Hi, I'm Abinash's AI Assistant. How can I help you today?",
    suggested_questions: [
      "Tell me about Abinash",
      "What projects has he built?",
      "What technologies does he know?",
      "How can I contact him?"
    ],
    availability_status: "Available for freelance work"
  },
  aiFaqs: []
};

export const setFallbackMode = (value) => {
  globalThis.__fallbackMode = value;
};

export const isFallbackMode = () => Boolean(globalThis.__fallbackMode);

export const getFallbackStore = () => fallbackStore;

export const seedFallbackData = async () => {
  if (!fallbackStore.admin) {
    fallbackStore.admin = {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
    };
  }

  if (!fallbackStore.settings) {
    fallbackStore.settings = {
      _id: 'settings-1',
      name: 'Abinash Kumar Chaudhary',
      title: 'Full-Stack Developer',
      bio: 'Passionate developer crafting elegant digital experiences.',
      email: 'abinashchaudhary2007@gmail.com',
      github: 'https://github.com/abinashchaudhary2007',
      linkedin: '#',
      profilePhoto: '/Abhi2.jpg',
      socialLinks: {
        instagram: 'https://www.instagram.com/jaiz_abhi08',
        facebook: '#',
      },
    };
  }

  if (!fallbackStore.projects.length) {
    fallbackStore.projects = [
      {
        _id: 'project-1',
        title: 'Nyaya Mitra',
        description: 'A legal aid platform connecting citizens with legal resources.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
        githubUrl: 'https://github.com/abinashchaudhary2007',
        liveUrl: 'https://anthropicaah-nyayamitra.vercel.app/',
        image: '/nyayamitra.jpeg',
        featured: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  if (!fallbackStore.skills.length) {
    fallbackStore.skills = [
      { _id: 'skill-1', name: 'HTML5', percentage: 95, category: 'Frontend' },
      { _id: 'skill-2', name: 'Node.js', percentage: 80, category: 'Backend' },
      { _id: 'skill-3', name: 'MongoDB', percentage: 75, category: 'Database' },
    ];
  }

  if (!fallbackStore.experiences.length) {
    fallbackStore.experiences = [
      {
        _id: 'exp-1',
        title: '3+Hackathon participation',
        period: '2026',
        description: 'Successful participation in hackathon building Nyaya Mitra, a legal aid platform for underserved communities. Connect grow a platform for students to learn, earn and grow.',
        order: 1,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'exp-2',
        title: 'Open Source Contributor',
        period: '2026',
        description: 'Active contributor to open-source projects with meaningful PRs merged into community repositories.',
        order: 2,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'exp-3',
        title: 'BSc. CSIT Student',
        period: '2026- Present',
        description: 'Pursuing Computer Science & Information Technology with focus on software engineering and web development.',
        order: 3,
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (!fallbackStore.certifications.length) {
    fallbackStore.certifications = [
      {
        _id: 'cert-1',
        title: 'Hackathon experienced',
        subtitle: '3+ Hackathon participation 2026',
        issueDate: '2026',
        icon: 'star',
        credentialUrl: '',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'cert-2',
        title: 'Web Development',
        subtitle: 'Certified Full-Stack Developer',
        issueDate: '2026',
        icon: 'layout',
        credentialUrl: '',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'cert-3',
        title: 'Problem Solving',
        subtitle: 'Competitive Programming Finalist',
        issueDate: '2026',
        icon: 'award',
        credentialUrl: '',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'cert-4',
        title: 'CS Fundamentals',
        subtitle: 'Data Structures & Algorithms Certified',
        issueDate: '2026',
        icon: 'book',
        credentialUrl: '',
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (!fallbackStore.aiFaqs.length) {
    fallbackStore.aiFaqs = [
      {
        id: 'faq-1',
        question: 'What is his college degree?',
        answer: 'Abinash is currently pursuing a B.Sc. in Computer Science and Information Technology (CSIT).',
        created_at: new Date().toISOString()
      },
      {
        id: 'faq-2',
        question: 'What is his main development focus?',
        answer: 'He specializes in building modern web applications using HTML, CSS, JavaScript, Node.js, Express, and Supabase.',
        created_at: new Date().toISOString()
      }
    ];
  }
};
