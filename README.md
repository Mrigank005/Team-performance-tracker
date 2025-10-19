#  UPES ACM Performance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ECF8E.svg)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)

A modern, full-featured performance tracking and management system designed for UPES ACM and ACM-W committee heads to monitor and evaluate core team member performance across events and tasks.

> **Built with:** React, TypeScript, Supabase, Tailwind CSS, shadcn/ui

---

##  Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

##  Features

###  Member Management
- Add, edit, and delete team members
- Track member roles and contact information
- View individual member performance profiles
- Real-time member status updates

###  Task Management
- Create and assign tasks to team members
- Track task progress with multiple statuses (Not Started, In Progress, Review, Completed)
- Add subtasks for granular task breakdown
- Attach files and documents to tasks
- View task analytics and completion rates

###  Performance Rating System
- **Daily Check-ins:** Quick performance evaluations during ongoing work
- **Final Reviews:** Comprehensive end-of-task assessments
- **4-Dimensional Rating:**
  - Quality of Work (1-5)
  - Timeliness (1-5)
  - Communication/Collaboration (1-5)
  - Initiative (1-5)
- Add contextual comments for each rating

###  Analytics & Insights
- **Leaderboard:** Rank members by average performance ratings
- **Member Profiles:** Individual performance history and trends
- **Task Analytics:** Team performance on specific tasks
- **Completion Tracking:** Monitor task and subtask completion rates

###  Export & Reporting
- **PDF Export:** Generate professional performance reports
  - Individual member reports with detailed statistics
  - Task-specific performance reports
  - Team-wide performance summaries
- **Custom Formatting:** Professional layouts with charts and tables

###  Real-time Features
- Instant UI updates after every action
- Live synchronization across multiple devices
- Real-time collaboration for multiple users
- Automatic data refresh

###  Modern UI/UX
- Responsive design for desktop, tablet, and mobile
- Beautiful gradient themes and animations
- Intuitive navigation with sidebar
- Toast notifications for user feedback
- Loading states and error boundaries
- Dark mode compatible (via shadcn/ui)

---

## 🎥 Demo

**Live Demo:** [Coming Soon]

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Recharts 2.15** - Data visualization
- **React Router 6.30** - Client-side routing
- **React Hook Form 7.61** - Form management
- **Zod 3.25** - Schema validation

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Automatic backups

### PDF Generation
- **jsPDF 3.0** - PDF document creation
- **jsPDF-AutoTable 5.0** - Table generation

### Development Tools
- **ESLint 9.32** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **bun**
- **Supabase Account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mrigank005/upesacm-performance-tracker.git
   cd upesacm-performance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up Supabase**
   
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql`
   - Copy your project URL and anon key

4. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   See `.env.example` for reference.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:8080](http://localhost:8080) in your browser.

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📁 Project Structure

```
upesacm-performance-tracker/
├── public/                # Static assets
│   └── robots.txt        # SEO configuration
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Layout.tsx   # Main layout with navigation
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── contexts/        # React Context providers
│   │   ├── MembersContext.tsx
│   │   ├── TasksContext.tsx
│   │   └── RatingsContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── use-toast.ts
│   │   ├── use-mobile.tsx
│   │   └── useCalculations.ts
│   ├── lib/             # Utility libraries
│   │   ├── utils.ts     # Helper functions
│   │   └── supabase.ts  # Supabase client configuration
│   ├── pages/           # Page components
│   │   ├── Index.tsx           # Dashboard
│   │   ├── MembersPage.tsx     # Member management
│   │   ├── MemberProfilePage.tsx
│   │   ├── TasksPage.tsx       # Task management
│   │   ├── TaskDetailPage.tsx
│   │   ├── LeaderboardPage.tsx # Performance rankings
│   │   ├── ArchivePage.tsx     # Archived data
│   │   └── NotFound.tsx        # 404 page
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── pdfExport.ts # PDF generation logic
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── supabase-schema.sql  # Database schema
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

---

## 🗄️ Database Schema

The application uses 6 main tables in Supabase PostgreSQL:

### Tables Overview

1. **members** - Team member information
2. **tasks** - Task details and metadata
3. **task_assignments** - Many-to-many relationship between tasks and members
4. **subtasks** - Checklist items for tasks
5. **task_attachments** - File attachments (stored as base64)
6. **ratings** - Performance ratings with dimensional scores

### Schema Details

See [`supabase-schema.sql`](./supabase-schema.sql) for the complete schema definition.

**Key Features:**
- UUID primary keys
- Foreign key constraints with CASCADE delete
- Check constraints for data validation
- Indexes for query optimization
- Row Level Security (RLS) enabled
- Real-time replication enabled

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Getting Your Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** (VITE_SUPABASE_URL)
4. Copy the **anon public** key (VITE_SUPABASE_ANON_KEY)

> ⚠️ **Never commit `.env.local` to version control!** It's already in `.gitignore`.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Apply to all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Other Deployment Options

- **Netlify:** Supports Vite out of the box
- **Cloudflare Pages:** Fast global CDN
- **Railway:** Includes database hosting
- **Self-hosted:** Build and serve the `dist` folder

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint rules (`npm run lint`)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes locally before submitting

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Built For
- **UPES ACM Student Chapter** - Association for Computing Machinery
- **UPES ACM-W** - ACM Women's Chapter
- Event committee heads and core team members

### Technologies
- [React](https://reactjs.org/) - UI Library
- [Supabase](https://supabase.com) - Backend Platform
- [shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Vercel](https://vercel.com) - Deployment Platform

### Inspiration
Created to streamline performance tracking and provide data-driven insights for student organization management.

---

## 📞 Support

### Issues & Bugs
- Open an issue on [GitHub Issues](https://github.com/Mrigank005/upesacm-performance-tracker/issues)
- Check existing issues before creating a new one

### Questions
- Refer to the documentation in the project
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Documentation](https://react.dev/)

### Feature Requests
- Open a feature request on GitHub Issues
- Describe the feature and its use case
- Discuss implementation approaches

---

## 📊 Project Status

### Current Version
- **v1.0.0** - Production Ready

### Features Status
- ✅ Member Management
- ✅ Task Management  
- ✅ Performance Ratings
- ✅ Analytics Dashboard
- ✅ PDF Report Generation
- ✅ Real-time Updates
- ✅ Data Persistence
- ✅ Error Handling
- ✅ Responsive Design

---

## 🌟 Star This Repository

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for UPES ACM Community**

[Report Bug](https://github.com/Mrigank005/upesacm-performance-tracker/issues) · 
[Request Feature](https://github.com/Mrigank005/upesacm-performance-tracker/issues) · 
[Documentation](./SUPABASE_SETUP_GUIDE.md)

</div>