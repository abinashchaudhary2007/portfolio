import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Abinash Kumar Chaudhary' },
    title: { type: String, default: 'Full-Stack Developer' },
    bio: { type: String, default: 'Passionate developer crafting elegant digital experiences.' },
    email: { type: String, default: 'abinashchaudhary2007@gmail.com' },
    github: { type: String, default: 'https://github.com/abinashchaudhary2007' },
    linkedin: { type: String, default: '#' },
    profilePhoto: { type: String, default: '/Abhi2.jpg' },
    socialLinks: {
      instagram: { type: String, default: 'https://www.instagram.com/jaiz_abhi08' },
      facebook: { type: String, default: '#' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSettings', siteSettingsSchema);
