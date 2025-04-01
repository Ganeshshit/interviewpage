import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { interviewDetails } from "../data/interviewData";
import {
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronRight,
  Loader2,
  BookOpen,
} from "lucide-react";

const CandidateDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    completedInterviews: [],
    stats: {
      completedInterviews: 0,
      upcomingInterviews: 0,
      totalInterviews: 0,
      averageScore: 0
    }
  });

  useEffect(() => {
    if (user?.id) {
      const candidateInterviews = interviewDetails.getCandidateInterviews(user.id);
      const upcoming = candidateInterviews.filter(i => i.status === 'scheduled');
      const completed = candidateInterviews.filter(i => i.status === 'completed');

      const averageScore = completed.length > 0 
        ? completed.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / completed.length 
        : 0;

      setDashboardData({
        upcomingInterviews: upcoming,
        completedInterviews: completed,
        stats: {
          completedInterviews: completed.length,
          upcomingInterviews: upcoming.length,
          totalInterviews: candidateInterviews.length,
          averageScore: averageScore
        }
      });
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#fcc250]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your next interview {dashboardData.upcomingInterviews.length > 0 
              ? `is scheduled for ${formatDate(dashboardData.upcomingInterviews[0].scheduledAt)}`
              : 'is not yet scheduled'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Upcoming Interviews
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {dashboardData.stats.upcomingInterviews}
                </p>
              </div>
              <Calendar className="text-[#fcc250]" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Completed Interviews
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {dashboardData.stats.completedInterviews}
                </p>
              </div>
              <CheckCircle className="text-[#fcc250]" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Average Score
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {dashboardData.stats.averageScore.toFixed(1)}/10
                </p>
              </div>
              <BookOpen className="text-[#fcc250]" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Interviews
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {dashboardData.stats.totalInterviews}
                </p>
              </div>
              <Clock className="text-[#fcc250]" size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {["upcoming", "completed", "preparation"].map((tab) => (
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

        {/* Content based on active tab */}
        <div className="space-y-4">
          {activeTab === "upcoming" && (
            <>
              {dashboardData.upcomingInterviews.map((interview) => (
                <div key={interview.id} 
                     className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {interview.topic.mainTopic} Interview
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(interview.scheduledAt)}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Duration: {interview.duration} minutes
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Level: {interview.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {interview.meetingDetails?.link && (
                        <a
                          href={interview.meetingDetails.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33] transition"
                        >
                          Join <UserCheck size={16} />
                        </a>
                      )}
                      <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Details <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.upcomingInterviews.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No upcoming interviews scheduled.
                </p>
              )}
            </>
          )}

          {activeTab === "completed" && (
            <>
              {dashboardData.completedInterviews.map((interview) => (
                <div key={interview.id} 
                     className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {interview.topic.mainTopic} Interview
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Completed on {formatDate(interview.conductedAt)}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Score: {interview.feedback?.score}/10
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Feedback: {interview.feedback?.comments}
                        </p>
                      </div>
                    </div>
                    {interview.recording && (
                      <a
                        href={interview.recording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-4 py-2 text-[#fcc250] hover:text-[#ffbb33]"
                      >
                        View Recording
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {dashboardData.completedInterviews.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No completed interviews yet.
                </p>
              )}
            </>
          )}

          {activeTab === "preparation" && (
            <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Interview Preparation Resources
              </h3>
              <div className="space-y-4">
                {user?.skills?.map((skill, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {skill}
                    </h4>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="block text-sm text-[#fcc250] hover:text-[#ffbb33]"
                      >
                        Practice Questions
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-[#fcc250] hover:text-[#ffbb33]"
                      >
                        Study Materials
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage; 