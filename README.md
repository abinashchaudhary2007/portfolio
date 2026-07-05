# Portfolio Management System

A full-stack portfolio website with a secure admin dashboard, MongoDB-backed content management, and a preserved public portfolio experience.

## Features
- Visitor contact form with MongoDB persistence
- Admin login with JWT authentication
- Project, skill, message, and settings management
- Protected admin dashboard UI
- Responsive, dark-mode friendly design

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
npm install express cors helmet dotenv express-rate-limit mongoose multer jsonwebtoken bcryptjs
node server/app.js
```

## Environment Variables
Copy .env.example to .env and update values.

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
