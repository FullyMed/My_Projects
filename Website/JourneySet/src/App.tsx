import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {user ? (
        <Dashboard />
      ) : (
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
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;