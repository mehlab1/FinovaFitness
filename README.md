# Finova Fitness - Frontend Gym Management System

A comprehensive gym management system built as a fully static frontend application with multiple user portals.

## Features

- **Multi-Portal System**: Different interfaces for public users, members, trainers, nutritionists, administrators, and front desk staff
- **AI Chat Assistant**: Context-aware chatbot with portal-specific responses
- **Booking System**: Multi-step booking process for classes and sessions
- **Mock Authentication**: Role-based access with localStorage persistence
- **Responsive Design**: Mobile-friendly interface with animations
- **Neon Theme**: Dark UI with bright neon accents

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with custom neon theme
- **Radix UI** components with shadcn/ui
- **Mock Data**: Comprehensive hardcoded data for demonstration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory, ready for static hosting.

### Preview Build

```bash
npm run preview
```

## Portal Types

1. **Public Portal**: Browse facilities, classes, and membership options
2. **Member Portal**: Dashboard, workout tracking, booking sessions
3. **Trainer Portal**: Schedule management, client requests, session notes
4. **Nutritionist Portal**: Meal planning, client consultations
5. **Admin Portal**: System oversight, staff management, analytics
6. **Front Desk Portal**: Check-ins, sales, customer service

## Deployment

This is a fully static frontend application that can be deployed to any static hosting platform:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect your repository
- **GitHub Pages**: Enable Pages in your repository settings
- **Any static hosting**: Upload the contents of the `dist` folder

## Project Structure

```
client/
├── src/
│   ├── components/     # React components for each portal
│   ├── data/          # Mock data and hardcoded content
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Utility functions and configurations
├── index.html         # Main HTML file
└── main.tsx          # React entry point
```

## Mock Data

All data is hardcoded in `client/src/data/mockData.ts` including:
- Trainers and their specializations
- Classes and schedules
- Membership plans and pricing
- Products and merchandise
- AI chat responses for each portal
- User profiles and statistics

## Features Preserved

- All original features and functionality
- Complete portal system with role-based access
- AI chat assistant with context-aware responses
- Booking system for classes and sessions
- Responsive design and animations
- Toast notifications and user feedback
- Mock authentication system

## License

MIT License 