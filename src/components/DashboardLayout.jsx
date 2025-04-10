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
  LogOut
} from 'lucide-react';

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
    <div className="min-h-screen bg-gray-100 dark:bg-[#1a1f2e]">
      {/* Header */}
      <header className="bg-white dark:bg-[#29354d] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
             
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col items-center justify-center h-32 px-4 bg-slate-900">
            <h1 className="text-xl font-bold text-white">Interview Platform</h1>
            <div className="mt-2 text-sm text-slate-300">
              {user?.name}
              <span className="px-2 py-1 ml-2 text-xs capitalize bg-slate-100 text-slate-900 rounded-full">
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
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    location.pathname === item.href
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-200">
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                {user?.email}
              </p>
              {user?.role === 'interviewer' && (
                <p className="text-sm text-slate-500">
                  {user?.department}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-150 flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 