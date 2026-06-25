import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/shared/Sidebar'
import RoleGuard from './components/auth/RoleGuard'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import Profil from './pages/Profil'
import GradesPage from './pages/GradesPage'
import AbsencesPage from './pages/AbsencesPage'
import TasksPage from './pages/TasksPage'
import FeedbackPage from './pages/FeedbackPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProgressTrackerPage from './pages/ProgressTrackerPage'
import ReflectionPage from './pages/ReflectionPage'
import AuthForm from './components/auth/AuthForm'

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">Chargement...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <div className="ml-[220px] flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-white)] px-8">
          <div className="text-[var(--text-sm)] font-semibold text-[var(--color-primary)]">EduTrack</div>
          <div className="rounded-full bg-[var(--color-gray-bg)] px-3 py-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {today}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-xs)] font-semibold text-white">
              {user.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'ET'}
            </div>
            <span className="text-[var(--text-sm)] text-[var(--color-text)]">{user.user_metadata?.name ?? user.email}</span>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<GradesPage />} />
            <Route path="/absences" element={<AbsencesPage />} />
            <Route path="/taches" element={<TasksPage />} />
            <Route path="/profil" element={<Profil />} />

            <Route path="/modules" element={
              <RoleGuard allowedRoles={['student']}><Modules /></RoleGuard>
            } />
            <Route path="/avis" element={
              <RoleGuard allowedRoles={['student']}><FeedbackPage /></RoleGuard>
            } />
            <Route path="/analytics" element={
              <RoleGuard allowedRoles={['student']}><AnalyticsPage /></RoleGuard>
            } />
            <Route path="/progression" element={
              <RoleGuard allowedRoles={['student']}><ProgressTrackerPage /></RoleGuard>
            } />
            <Route path="/reflexion" element={
              <RoleGuard allowedRoles={['student']}><ReflectionPage /></RoleGuard>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  )
}

function LoginRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="text-[var(--color-text-secondary)]">Chargement...</div></div>
  if (user) return <Navigate to="/" replace />
  return <AuthForm />
}
