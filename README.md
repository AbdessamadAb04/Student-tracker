# 🎓 EduTrack – Student Progress & Tracker Dashboard

EduTrack is a modern, comprehensive, and premium web application designed to help students track their academic performance, progress, absences, tasks, and reflections. Built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**, it provides an intuitive interface for students to keep their academic life organized and visualizes their growth using interactive analytics.

🚀 **Live Demo:** [Visit EduTrack on Vercel](https://edu-track-rho-roan.vercel.app/)

---

## ✨ Features

- **📊 Centralized Dashboard:** Get an at-a-glance overview of your average grade, tasks to do, overall attendance, and current progress.
- **📚 Module Management:** Organize and manage your academic modules/subjects.
- **📝 Grade Tracker:** Record and visualize your grades across different assignments and modules, featuring automatic average calculations.
- **🕒 Absence / Attendance Log:** Track your absences by module, monitor limits, and keep up with your attendance rate.
- **✅ Tasks & To-Do List:** Manage tasks, homework, and study goals with interactive checkboxes and progress tracking.
- **📈 Advanced Analytics:** View detailed graphs of your grades over time and progress indicators utilizing **Recharts**.
- **🎯 Progress Tracker:** Track your syllabus or coursework progress dynamically.
- **💭 Self-Reflection & Journals:** Keep a learning journal to reflect on your achievements, areas of improvement, and goals.
- **🔒 Secure Authentication:** Powered by **Supabase Auth** for private and safe access to your academic records.

---

## 🛠️ Tech Stack

- **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Authentication:** [Supabase](https://supabase.com/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── auth/           # Login & registration forms
│   ├── reflection/     # Reflection list and forms
│   ├── shared/         # Sidebar, navigation, layout elements
│   └── tasks/          # Task list components
├── context/             # AuthContext, ProgressContext for state management
├── data/                # Mock data / seed data
├── hooks/               # Custom React hooks
├── lib/                 # Third-party configurations (e.g. Supabase, uid utilities)
├── pages/               # Main application pages
│   ├── AbsencesPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── Dashboard.tsx
│   ├── FeedbackPage.tsx
│   ├── GradesPage.tsx
│   ├── Modules.tsx
│   ├── Profil.tsx
│   ├── ProgressTrackerPage.tsx
│   ├── ReflectionPage.tsx
│   └── TasksPage.tsx
├── services/            # Supabase API services
├── types/               # TypeScript interfaces and types
├── utils/               # Common helper functions
├── App.tsx              # Main App entry with Routing and Auth guards
└── main.tsx            # Application entry point
```

---

## 🚀 Getting Started

To run a local copy of this project, follow these simple steps:

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account (for database & auth config)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbdessamadAb04/Student-tracker.git
   cd Student-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
