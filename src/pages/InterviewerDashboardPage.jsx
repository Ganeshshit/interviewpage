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
  Loader2
} from "lucide-react";

const InterviewerDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedInterviews: 0,
    averageRating: 0,
    upcomingInterviews: 0,
    totalHours: 0,
  });

  useEffect(() => {
    if (user) {
      // Calculate stats from user's interviews
      const completedInterviews = user.completedInterviews || [];
      const upcomingInterviews = user.interviews?.filter(
        interview => interview.status === 'scheduled'
      ) || [];

      setStats({
        completedInterviews: completedInterviews.length,
        averageRating: completedInterviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / completedInterviews.length || 0,
        upcomingInterviews: upcomingInterviews.length,
        totalHours: (completedInterviews.length + upcomingInterviews.length) * 1.5 // Assuming 1.5 hours per interview
      });

      // Set interviews from user data
      setInterviews(user.interviews || []);
      setLoading(false);
    }
  }, [user]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#fcc250]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'interviewer') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">Unauthorized access. Please login as an interviewer.</p>
        </div>
      </DashboardLayout>
    );
  }

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
            value={`${stats.averageRating.toFixed(1)}/5.0`}
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
            {interviews.filter(interview => interview.status === 'scheduled').length > 0 ? (
              interviews
                .filter(interview => interview.status === 'scheduled')
                .map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming interviews scheduled.
              </p>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-4">
            {interviews.filter(interview => interview.status === 'completed').length > 0 ? (
              interviews
                .filter(interview => interview.status === 'completed')
                .map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No past interviews available.
              </p>
            )}
          </div>
        )}

        {activeTab === "availability" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Manage Availability
              </h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Availability
                </h4>
                {user?.availability?.length > 0 ? (
                  <div className="space-y-2">
                    {user.availability.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {slot.date}: {slot.slots.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No availability set
                  </p>
                )}
              </div>
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
