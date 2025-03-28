import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track!
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">Need help? Try these links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/schedule" className="hover:text-gray-900">
              Schedule
            </Link>
            <Link to="/profile" className="hover:text-gray-900">
              Profile
            </Link>
            <Link to="/settings" className="hover:text-gray-900">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

