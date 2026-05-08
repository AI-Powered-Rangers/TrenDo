import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastProvider } from './components/Toast'
import { Onboarding } from './pages/Onboarding'
import { HomeFeed } from './pages/HomeFeed'
import { ChallengeDetail } from './pages/ChallengeDetail'
import { CultureMapPage } from './pages/CultureMapPage'
import { RetentionPage } from './pages/RetentionPage'
import { MePage } from './pages/MePage'
import { Community } from './pages/Community'
import { SetlogPage } from './pages/Setlog'
import { SavedPage } from './pages/Saved'
import { AdminPage } from './pages/Admin'
import { useUserPrefs } from './store/userPrefs'

export default function App() {
  const [prefs] = useUserPrefs()
  const location = useLocation()
  const publicRoute = location.pathname === '/onboarding' || location.pathname === '/admin'

  if (!prefs.onboarded && !publicRoute) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <ToastProvider>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Shell><HomeFeed /></Shell>} />
        <Route path="/c/:id" element={<Shell><ChallengeDetail /></Shell>} />
        <Route path="/community" element={<Shell><Community /></Shell>} />
        <Route path="/setlog" element={<Shell><SetlogPage /></Shell>} />
        <Route path="/saved" element={<Shell><SavedPage /></Shell>} />
        <Route path="/map" element={<Shell><CultureMapPage /></Shell>} />
        <Route path="/retention" element={<Shell><RetentionPage /></Shell>} />
        <Route path="/me" element={<Shell><MePage /></Shell>} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
