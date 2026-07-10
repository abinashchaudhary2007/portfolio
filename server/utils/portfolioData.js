/**
 * Centralized Portfolio Knowledge Base
 * Contains structured information about Abinash Kumar Chaudhary
 * This is injected into the AI system prompt for context
 */

export const getPortfolioData = (settings = {}, projects = [], skills = [], faqs = []) => {
  // Merge with defaults if not provided
  const defaults = {
    name: 'Abinash Kumar Chaudhary',
    title: 'Full-Stack Developer',
    bio: 'Passionate full-stack developer specializing in MERN stack. Crafting elegant digital experiences with modern web technologies.',
    email: settings.email || 'abinashchaudhary2007@gmail.com',
    github: settings.github || 'https://github.com/abinashchaudhary2007',
    linkedin: settings.linkedin || 'https://linkedin.com',
    instagram: settings.socialLinks?.instagram || 'https://www.instagram.com/jaiz_abhi08',
    location: 'Kathmandu, Nepal',
    education: [
      {
        institution: 'Tribhuvan University',
        degree: 'BSc. Computer Science and Information Technology (CSIT)',
        status: 'Pursuing',
      }
    ],
    experience: [
      {
        title: 'Full-Stack Developer',
        description: 'Building web applications using modern JavaScript technologies',
        duration: 'Present'
      }
    ],
    services: [
      'Full-Stack Web Development',
      'React/Vue.js Frontend Development',
      'Node.js Backend Development',
      'MongoDB Database Design',
      'REST API Development',
      'Real-time Applications with Socket.io',
      'UI/UX Implementation',
      'Performance Optimization'
    ],
    availability: settings.availability_status || 'Available for freelance work and full-time opportunities',
    resumeUrl: settings.resumeUrl || '/resume.pdf',
    coreSkills: {
      frontend: ['React.js', 'Vue.js', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite'],
      backend: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST APIs'],
      tools: ['Git', 'GitHub', 'VS Code', 'Postman', 'Figma'],
      other: ['Socket.io', 'JWT Authentication', 'Responsive Design']
    }
  };

  const mergedSettings = { ...defaults, ...settings };

  // Build formatted portfolio context
  const portfolioContext = `
=== PORTFOLIO ASSISTANT CONTEXT ===

**Owner Information:**
- Name: ${mergedSettings.name}
- Title: ${mergedSettings.title}
- Bio: ${mergedSettings.bio}
- Location: ${mergedSettings.location}
- Availability: ${mergedSettings.availability}

**Contact Information:**
- Email: ${mergedSettings.email}
- GitHub: ${mergedSettings.github}
- LinkedIn: ${mergedSettings.linkedin}
- Instagram: ${mergedSettings.instagram}

**Education:**
${mergedSettings.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.status})`).join('\n')}

**Core Competencies:**
Frontend: ${mergedSettings.coreSkills.frontend.join(', ')}
Backend: ${mergedSettings.coreSkills.backend.join(', ')}
Tools & Platforms: ${mergedSettings.coreSkills.tools.join(', ')}
Other: ${mergedSettings.coreSkills.other.join(', ')}

**Services Offered:**
${mergedSettings.services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Recent Projects:**
${projects.slice(0, 5).map(p => `
- **${p.title}**
  Description: ${p.description}
  Tech Stack: ${(p.techStack || []).join(', ')}
  ${p.liveUrl ? `Live: ${p.liveUrl}` : ''}
  ${p.githubUrl ? `Code: ${p.githubUrl}` : ''}`).join('\n')}

**Technical Skills:**
${skills.slice(0, 15).map(s => `- ${s.name} (${s.category}): ${s.percentage}%`).join('\n')}

**Frequently Asked Questions:**
${faqs.slice(0, 10).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
`;

  return {
    portfolioContext,
    settings: mergedSettings,
    projects,
    skills,
    faqs
  };
};

/**
 * System prompt template for the AI assistant
 * This defines how the AI should behave
 */
export const getSystemPrompt = (portfolioData) => {
  const firstName = portfolioData.settings.name.split(' ')[0];

  return `You are a helpful AI assistant on ${portfolioData.settings.name}'s portfolio website — similar to ChatGPT in capability and tone.

## Portfolio questions (about ${firstName})
When asked about ${firstName}, his work, skills, projects, experience, or hiring:
- Use ONLY the portfolio context below — never invent facts about him
- If something isn't in the context, say: "I don't have that information about ${firstName}."
- Reference specific projects and skills when relevant

## General questions (everything else)
For coding help, explanations, writing, math, advice, or any other topic:
- Answer fully and helpfully like ChatGPT would
- Use bullet lists, numbered steps, and code blocks when useful
- Do NOT redirect back to the portfolio unless the user asks

## Style
- Friendly, clear, and match length to the question
- Use markdown: **bold**, \`inline code\`, and \`\`\`language code blocks\`\`\`

## Portfolio context (authoritative for questions about ${firstName}):
${portfolioData.portfolioContext}`;
};
