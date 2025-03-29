import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  Calendar,
  Star,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronRight,
} from "lucide-react";

const InterviewerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    completedInterviews: 45,
    averageRating: 4.8,
    upcomingInterviews: 3,
    totalHours: 67,
  });

  useEffect(() => {
    // Mock Data
    setInterviews([
      {
        id: 1,
        candidateName: "John Doe",
        date: "2024-03-25T10:00:00",
        type: "Frontend Development",
        level: "Senior",
        status: "scheduled",
      },
    ]);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div className="text-[#fcc250]">{icon}</div>
    </div>
  );

  const InterviewCard = ({ interview }) => (
    <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex justify-between items-start">
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
      <div className="flex space-x-3">
        <button className="flex items-center gap-1 px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33] focus:outline-none transition">
          Join <UserCheck size={16} />
        </button>
        <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition">
          Details <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your interviews and availability
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Completed Interviews"
            value={stats.completedInterviews}
            icon={<CheckCircle size={32} />}
          />
          <StatCard
            title="Average Rating"
            value={`${stats.averageRating}/5.0`}
            icon={<Star size={32} />}
          />
          <StatCard
            title="Upcoming Interviews"
            value={stats.upcomingInterviews}
            icon={<Calendar size={32} />}
          />
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours}h`}
            icon={<Clock size={32} />}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {["upcoming", "past", "availability"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-b-2 border-[#fcc250] text-[#fcc250]"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                } whitespace-nowrap py-4 px-1 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-4">
            {/* Past interviews */}
            <p className="text-sm text-gray-500">
              No past interviews available.
            </p>
          </div>
        )}

        {activeTab === "availability" && (
          <div className="space-y-4">
            {/* Availability */}
            <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Manage Availability
              </h3>
              <button className="px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33]">
                Update Availability
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewerDashboardPage;
