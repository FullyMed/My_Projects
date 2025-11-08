import React from 'react';
import { Calendar, Target, CheckSquare, Moon, Sun, BarChart3, Download, Compass } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LandingPageProps {
  onShowAuth: (mode: 'login' | 'register') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowAuth }) => {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: CheckSquare,
      title: "Weekly Planner",
      description: "Plan your tasks for each day of the week with optional time slots"
    },
    {
      icon: Target,
      title: "Goal Tracker",
      description: "Set weekly goals and track your progress with visual indicators"
    },
    {
      icon: Calendar,
      title: "Event Calendar",
      description: "Manage your events with a beautiful monthly calendar view"
    },
    {
      icon: BarChart3,
      title: "Progress Charts",
      description: "Visualize your productivity with detailed progress tracking"
    },
    {
      icon: Download,
      title: "Export & Print",
      description: "Export your weekly plans or print them for offline use"
    },
    {
      icon: isDark ? Sun : Moon,
      title: "Dark Mode",
      description: "Switch between light and dark themes for comfortable viewing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Compass className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">JourneySet</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onShowAuth('login')}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => onShowAuth('register')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Personal
            <span className="text-blue-600 dark:text-blue-400"> Productivity</span>
            <br />Journey Starts Here
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Plan your weekly schedules, set and track goals, and manage events with JourneySet - 
            the beautiful productivity planner designed to help you achieve more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onShowAuth('register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started Free
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-900 dark:text-white rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/30 hover:scale-105 transition-all duration-200"
            >
              <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already started their journey to better organization.
          </p>
          <button
            onClick={() => onShowAuth('register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;