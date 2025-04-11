import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle, 
  Settings, 
  FileText,
  Users,
  GraduationCap,
  LogOut,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Define role-based navigation
  const getNavigation = () => {
    const baseNavigation = [
      {
        name: 'Dashboard',
        href: `/${user?.role}/dashboard`,
        icon: LayoutDashboard
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: UserCircle
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings
      }
    ];

    // Interviewer-specific navigation
    if (user?.role === 'interviewer') {
      return [
        ...baseNavigation,
        {
          name: 'Schedule',
          href: '/schedule',
          icon: Calendar
        },
        {
          name: 'Candidates',
          href: '/candidates',
          icon: Users
        },
        {
          name: 'Reports',
          href: '/reports',
          icon: FileText
        }
      ];
    }

    // Candidate-specific navigation
    if (user?.role === 'candidate') {
      return [
        ...baseNavigation,
        {
          name: 'Interviews',
          href: '/interviews',
          icon: Calendar
        },
        {
          name: 'Resources',
          href: '/resources',
          icon: GraduationCap
        }
      ];
    }

    return baseNavigation;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-indigo-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <Video className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text tracking-tight">InterviewPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-indigo-600/70">
                Welcome, {user?.name}
              </span>
              <motion.button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white/70 backdrop-blur-xl shadow-lg border-r border-indigo-100/20 mt-16">
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex flex-col items-center justify-center h-32 px-4 bg-gradient-to-br from-indigo-600 to-violet-600">
            <h1 className="text-xl font-bold text-white">Interview Platform</h1>
            <div className="mt-2 text-sm text-indigo-100">
              {user?.name}
              <span className="px-2 py-1 ml-2 text-xs capitalize bg-white/20 text-white rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                      : 'text-indigo-600/70 hover:bg-indigo-50/50 hover:text-indigo-600'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-indigo-100/20">
            <div className="mb-4">
              <p className="text-sm text-indigo-600/70">
                {user?.email}
              </p>
              {user?.role === 'interviewer' && (
                <p className="text-sm text-indigo-600/70">
                  {user?.department}
                </p>
              )}
            </div>
            <motion.button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-indigo-200/50 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 pt-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 