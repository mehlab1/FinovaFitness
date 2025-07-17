# Finova Fitness - Frontend Gym Management System

## Overview

Finova Fitness is a comprehensive gym management system built as a fully static frontend application with multiple user portals. The system provides different interfaces for various user types including public users, members, trainers, nutritionists, administrators, and front desk staff. The application features a neon-themed dark UI with extensive animations and an AI chatbot assistant.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom neon theme and dark mode
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React hooks with custom portal management
- **Animations**: CSS animations and transitions for interactive elements
- **Data**: Hardcoded mock data for demonstration purposes

### Key Design Decisions
1. **Multi-Portal Architecture**: Single application serving different user interfaces based on role
2. **Static Frontend Focus**: Fully frontend-only with comprehensive mock data
3. **Neon Theme**: Consistent dark background with bright neon accents (blue, green, pink, purple, orange)
4. **Component-Based Design**: Modular React components for each portal and feature

## Key Components

### Portal System
- **Portal Selection**: Landing page for choosing user type
- **Public Portal**: No authentication required, browsing facilities and services
- **Member Portal**: Dashboard, workout tracking, booking sessions
- **Trainer Portal**: Schedule management, client requests, session notes
- **Nutritionist Portal**: Meal planning, client consultations
- **Admin Portal**: System oversight, staff management, analytics
- **Front Desk Portal**: Check-ins, sales, customer service

### Core Features
- **AI Chat Assistant**: Floating chatbot with context-aware responses
- **Booking System**: Multi-step booking process for classes and sessions
- **Authentication**: Mock login system with role-based access
- **Responsive Design**: Mobile-friendly interface with animations
- **Toast Notifications**: User feedback system for actions

### UI Components
- **Glass Cards**: Translucent cards with backdrop blur effects
- **Neon Borders**: Glowing borders and hover effects
- **Animated Buttons**: Hover animations with glow effects
- **Modal System**: Consistent modal patterns across features
- **Navigation**: Sidebar navigation for authenticated portals

## Data Flow

### Authentication Flow
1. User selects portal type from landing page
2. Public portal allows immediate access
3. Other portals require mock authentication
4. User credentials stored in localStorage
5. Portal-specific components rendered based on role

### State Management
- **Portal State**: Current user type and authentication status
- **Toast System**: Global notification state
- **Chat State**: AI assistant conversation history
- **Booking State**: Multi-step form progression

### Data Structure
- **Mock Data**: Comprehensive static data for trainers, classes, products, membership plans
- **Type Definitions**: TypeScript interfaces for User, Trainer, Class, Product, etc.
- **Portal Configuration**: Centralized portal definitions with colors and icons

## External Dependencies

### Core Libraries
- **React**: Frontend framework
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Vite**: Build tool and development server

### Development Tools
- **PostCSS**: CSS processing with Tailwind
- **Replit Integration**: Development environment support

### UI Enhancement
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **CLSX**: Conditional class name utility
- **React Hook Form**: Form management
- **TanStack Query**: Data fetching and caching

## Deployment Strategy

### Build Process
1. **Development**: Vite dev server with hot module replacement
2. **Production Build**: Vite builds React app to `dist` directory
3. **Static Assets**: All assets bundled for static hosting

### Environment Configuration
- **Development**: Vite dev server on port 5173
- **Production**: Static files ready for any hosting platform

### Hosting Requirements
- **Frontend**: Can be deployed as static site (Vercel, Netlify, GitHub Pages)
- **No Backend Required**: Fully self-contained frontend application

### Key Configuration Files
- **Vite Config**: Frontend build configuration with aliases
- **Tailwind Config**: Theme customization and neon color palette
- **TypeScript Config**: Path mapping and compilation settings

The application is designed to be easily deployable as a static site with comprehensive mock data allowing for immediate demonstration of all features without requiring any backend infrastructure.