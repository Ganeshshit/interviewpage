import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import ScheduleModal from "../components/ScheduleModal";
import { interviewDetails } from "../data/interviewData"; // Import interview details
import { users, getAvailableCandidates } from "../data/userData"; // Add this import
import { emailAPI } from "../services/api"; // Add this import
import { toast } from "react-hot-toast"; // Add toast for notifications
import {
  Calendar,
  Star,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronRight,
  Loader2,
  Plus
} from "lucide-react";

const InterviewerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    completedInterviews: [],
    stats: {
      completedInterviews: 0,
      averageRating: 0,
      upcomingInterviews: 0,
      totalHours: 0,
    }
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (user?.id) {
      try {
        // Get available candidates
        const availableCandidates = getAvailableCandidates();
        setCandidates(availableCandidates);

        // Get interviewer's schedule
        const activeInterviews = interviewDetails.getInterviewerSchedule(user.id);
        
        // Get completed interviews
        const completedInterviews = interviewDetails.completedInterviews
          .filter(interview => interview.interviewerId === user.id);

        // Calculate stats
        const stats = {
          completedInterviews: completedInterviews.length,
          averageRating: completedInterviews.reduce((acc, curr) => 
            acc + (curr.feedback?.rating || 0), 0) / (completedInterviews.length || 1),
          upcomingInterviews: activeInterviews.length,
          totalHours: (completedInterviews.length + activeInterviews.length) * 1
        };

        setDashboardData({
          upcomingInterviews: activeInterviews,
          completedInterviews,
          stats
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
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

  const InterviewCard = ({ interview }) => (
    <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex justify-between items-start">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Interview with {interview.candidateId}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formatDate(interview.scheduledAt)}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Topic: {interview.topic.mainTopic}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Level: {interview.level}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Duration: {interview.duration} minutes
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <a
          href={interview.meetingDetails.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33] focus:outline-none transition"
        >
          Join <UserCheck size={16} />
        </a>
        <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition">
          Details <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const handleScheduleInterview = async (formData) => {
    try {
      setLoading(true);

      // Find candidate from your existing data structure
      const candidate = candidates.find(c => c.id === selectedCandidate.id);
      
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Generate meeting link
      const roomId = `room-${Date.now()}`;
      const meetingLink = `${window.location.origin}/interview/${roomId}`;

      // Prepare email data
      const emailData = {
        receiverEmail: candidate.email, // Use email from your existing data
        candidateName: candidate.name,
        interviewerName: user.name,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        topic: formData.topic,
        roomLink: meetingLink,
        message: formData.message
      };

      // Send email
      await emailAPI.sendMeetingEmail(emailData);

      // Create new interview
      const newInterview = {
        id: `int-${Date.now()}`,
        candidateId: candidate.id,
        interviewerId: user.id,
        scheduledAt: formData.scheduledTime,
        duration: formData.duration,
        topic: {
          mainTopic: formData.topic
        },
        meetingDetails: {
          link: meetingLink,
          roomId
        },
        status: 'scheduled'
      };

      // Update dashboard data
      setDashboardData(prev => ({
        ...prev,
        upcomingInterviews: [...prev.upcomingInterviews, newInterview],
        stats: {
          ...prev.stats,
          upcomingInterviews: prev.stats.upcomingInterviews + 1
        }
      }));

      toast.success('Interview scheduled successfully!');
      setIsScheduleModalOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CandidatesList = () => (
    <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Available Candidates
      </h3>
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {candidate.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Skills: {candidate.skills.join(', ')}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCandidate(candidate);
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33] transition-colors"
            >
              Schedule Interview
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = ["upcoming", "past", "availability", "candidates"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "upcoming":
        return (
          <div className="space-y-4">
            {dashboardData.upcomingInterviews.length > 0 ? (
              dashboardData.upcomingInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming interviews scheduled.
              </p>
            )}
          </div>
        );
      case "past":
        return (
          <div className="space-y-4">
            {dashboardData.completedInterviews.length > 0 ? (
              dashboardData.completedInterviews.map((interview) => (
                <div key={interview.id} className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Interview with {interview.candidateId}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(interview.conductedAt)}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Rating: {interview.feedback.rating}/5
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {interview.feedback.overallComments}
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
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No past interviews found.
              </p>
            )}
          </div>
        );
      case "availability":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Your Availability
              </h3>
              {user?.availability?.map((slot, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {slot.date}
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {slot.slots.map((time, timeIndex) => (
                      <span
                        key={timeIndex}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <button className="mt-4 px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33]">
                Update Availability
              </button>
            </div>
          </div>
        );
      case "candidates":
        return <CandidatesList />;
      default:
        return null;
    }
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
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            You have {dashboardData.stats.upcomingInterviews} upcoming interviews
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Completed Interviews
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {dashboardData.stats.completedInterviews}
              </p>
            </div>
            <div className="text-[#fcc250]">
              <CheckCircle size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Average Rating
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {dashboardData.stats.averageRating.toFixed(1)}/5.0
              </p>
            </div>
            <div className="text-[#fcc250]">
              <Star size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Upcoming Interviews
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {dashboardData.stats.upcomingInterviews}
              </p>
            </div>
            <div className="text-[#fcc250]">
              <Calendar size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Hours
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {dashboardData.stats.totalHours}h
              </p>
            </div>
            <div className="text-[#fcc250]">
              <Clock size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
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
        {renderTabContent()}
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSchedule={handleScheduleInterview}
        candidate={selectedCandidate}
      />
    </DashboardLayout>
  );
};

export default InterviewerDashboardPage;
