import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const InterviewerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [interviews, setInterviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [stats, setStats] = useState({
    completedInterviews: 0,
    averageRating: 0,
    upcomingInterviews: 0,
    totalHours: 0
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Fetch interviews, availability, and stats
    setInterviews([
      {
        id: 1,
        candidateName: "John Doe",
        date: "2024-03-25T10:00:00",
        type: "Frontend Development",
        level: "Senior",
        status: "scheduled"
      },
      // Add more mock interviews...
    ]);

    setStats({
      completedInterviews: 45,
      averageRating: 4.8,
      upcomingInterviews: 3,
      totalHours: 67
    });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </div>
    </div>
  );

  const InterviewCard = ({ interview }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {interview.candidateName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(interview.date)}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Type: {interview.type}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Level: {interview.level}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Join Interview
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const AvailabilityCalendar = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Manage Availability
      </h3>
      {/* Add calendar component here */}
      <div className="grid grid-cols-7 gap-2">
        {/* Calendar implementation */}
      </div>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        Update Availability
      </button>
    </div>
  );

  const ExpertiseSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Areas of Expertise
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Programming Languages
          </label>
          <select multiple className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Interview Levels
          </label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              <span className="ml-2">Entry Level</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              <span className="ml-2">Mid Level</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              <span className="ml-2">Senior Level</span>
            </label>
          </div>
        </div>
      </div>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        Save Preferences
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your interviews and availability
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Completed Interviews"
            value={stats.completedInterviews}
            icon={<span>📊</span>}
          />
          <StatCard
            title="Average Rating"
            value={`${stats.averageRating}/5.0`}
            icon={<span>⭐</span>}
          />
          <StatCard
            title="Upcoming Interviews"
            value={stats.upcomingInterviews}
            icon={<span>📅</span>}
          />
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours}h`}
            icon={<span>⏱️</span>}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['upcoming', 'past', 'availability'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-6">
            {/* Past interviews list */}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvailabilityCalendar />
            <ExpertiseSettings />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewerDashboardPage; 