import bcrypt from 'bcryptjs';

const fallbackStore = {
  contacts: [],
  projects: [],
  skills: [],
  settings: null,
  admin: null,
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
};
