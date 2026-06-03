import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompactModeProvider } from './contexts/CompactModeContext';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import PlannerPage from './pages/PlannerPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
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

        <Route path="/app/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/app/planner" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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