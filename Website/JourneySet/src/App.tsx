import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompactModeProvider } from './contexts/CompactModeContext';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import NotFoundPage from './components/NotFoundPage';
import LoadingScreen from './components/LoadingScreen';

// Route-level code-splitting: the landing page, auth modal and app shell stay
// in the main bundle (first paint); everything else loads on demand.
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

/** Fallback while an in-app page chunk loads — the sidebar/header stay visible. */
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center py-24" role="status" aria-label="Loading">
    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const { user, isLoading, passwordRecovery } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // A password-reset link opens a short-lived recovery session; make sure the
  // user lands on the "choose a new password" page wherever Supabase sent them.
  if (passwordRecovery && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/app/planner" replace /> : (
              <>
                <LandingPage onShowAuth={(mode) => setShowAuth(mode)} />
                {showAuth && (
                  <AuthModal
                    mode={showAuth}
                    onClose={() => setShowAuth(null)}
                    onSwitchMode={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')}
                  />
                )}
              </>
            )
          } />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/planner" element={<PlannerPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to="/app/planner" replace />} />
                    <Route path="*" element={<NotFoundPage fullPage={false} />} />
                  </Routes>
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CompactModeProvider>
            <AppContent />
          </CompactModeProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
