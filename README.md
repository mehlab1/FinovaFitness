# Finova Fitness - Full Stack Gym Management System

A comprehensive gym management system with separate frontend and backend applications.

## Project Structure

```
FinovaFitnessSite/
├── client/                 # Frontend React application
│   ├── src/               # React source code
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── README.md         # Frontend documentation
├── backend/               # Backend Express API
│   ├── src/              # Backend source code
│   ├── package.json      # Backend dependencies
│   └── README.md        # Backend documentation
└── README.md            # This file
```

## Quick Start

### Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Backend (API)

```bash
cd backend
npm install
npm run dev
```

Backend API will be available at `http://localhost:3001`

## Features

### Frontend
- **Multi-Portal System**: Different interfaces for public users, members, trainers, nutritionists, administrators, and front desk staff
- **AI Chat Assistant**: Context-aware chatbot with portal-specific responses
- **Booking System**: Multi-step booking process for classes and sessions
- **Mock Authentication**: Role-based access with localStorage persistence
- **Responsive Design**: Mobile-friendly interface with animations
- **Neon Theme**: Dark UI with bright neon accents

### Backend
- **Express.js** server with modern ES modules
- **CORS** enabled for frontend communication
- **Helmet** for security headers
- **Morgan** for request logging
- **Health check** endpoint
- **Error handling** middleware

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with custom neon theme
- **Radix UI** components with shadcn/ui
- **Mock Data**: Comprehensive hardcoded data for demonstration

### Backend
- **Node.js** with Express
- **ES Modules** for modern JavaScript
- **CORS** for cross-origin requests
- **Helmet** for security
- **Morgan** for logging

## Development

### Running Both Services

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```

### API Endpoints

- `GET /api/health` - Server health status
- `GET /api` - API information and available endpoints

## Deployment

### Frontend
The frontend is a static application that can be deployed to any static hosting platform:
- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect your repository
- **GitHub Pages**: Enable Pages in your repository settings

### Backend
The backend can be deployed to:
- **Railway**: Easy deployment with automatic scaling
- **Render**: Free tier available with automatic deployments
- **Heroku**: Traditional Node.js hosting
- **DigitalOcean**: VPS or App Platform

## License

MIT License 