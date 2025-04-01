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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col items-center justify-center h-32 px-4 bg-gray-800 dark:bg-gray-900">
            <h1 className="text-xl font-bold text-white">Interview Platform</h1>
            <div className="mt-2 text-sm text-gray-300">
              {user?.name}
              <span className="px-2 py-1 ml-2 text-xs capitalize bg-[#fcc250] text-[#29354d] rounded-full">
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
                      ? 'bg-[#fcc250] text-[#29354d]'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              {user?.role === 'interviewer' && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {user?.department}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150 flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 