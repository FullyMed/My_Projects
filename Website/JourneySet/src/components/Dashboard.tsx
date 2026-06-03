import React, { useState } from 'react';
import {
  Calendar,
  Target,
  CheckSquare,
  User,
  LogOut,
  Moon,
  Sun,
  Quote,
  Compass,
  Menu,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { storage } from '../utils/storage';
import WeeklyPlanner from './WeeklyPlanner';
import GoalTracker from './GoalTracker';
import EventCalendar from './EventCalendar';
import QuoteDisplay from './QuoteDisplay';
import PrintView from './PrintView';
import ExportButton from './ExportButton';

type ActiveTab = 'planner' | 'goals' | 'calendar';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [printView, setPrintView] = useState<'planner' | 'goals' | 'calendar' | null>(null);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { id: 'planner', name: 'Weekly Planner', icon: CheckSquare },
    { id: 'goals', name: 'Goal Tracker', icon: Target },
    { id: 'calendar', name: 'Event Calendar', icon: Calendar },
  ];

  const handleResetData = () => {
    if (user) {
      const plannerKey = storage.getUserKey('planner', user.id);
      const goalsKey = storage.getUserKey('goals', user.id);
      const eventsKey = storage.getUserKey('events', user.id);

      localStorage.removeItem(plannerKey);
      localStorage.removeItem(goalsKey);
      localStorage.removeItem(eventsKey);

      setShowResetModal(false);
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'planner':
        return <WeeklyPlanner key={activeTab} />;
      case 'goals':
        return <GoalTracker key={activeTab} />;
      case 'calendar':
        return <EventCalendar key={activeTab} />;
      default:
        return <WeeklyPlanner key={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Compass className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">JourneySet</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">Reset Data</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {navigation.find(item => item.id === activeTab)?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ExportButton
                onPrint={() => setPrintView(activeTab)}
                label="Export"
              />
              <QuoteDisplay />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Reset Data Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Reset All Data?
            </h3>

            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all your tasks, goals, and events. This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      {printView && (
        <PrintView view={printView} onClose={() => setPrintView(null)} />
      )}
    </div>
  );
};

export default Dashboard;