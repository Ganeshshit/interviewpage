import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import ScheduleModal from "../components/ScheduleModal";
import {api} from '../config/axios';
import { toast } from "react-hot-toast";
import {
  Calendar,
  Star,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronRight,
  Loader2,
  Plus,
  Video
} from "lucide-react";
import VideoCall from '../components/VideoCall';
import { socketService } from '../services/socketService';
import { io } from "socket.io-client";
import { format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaUser, FaVideo, FaDoorOpen, FaLink, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bell,
  AlertCircle,
  User
} from "lucide-react";

const InterviewerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    completedInterviews: [],
    availableCandidates: [],
    stats: {
      completedInterviews: 0,
      upcomingInterviews: 0,
      totalHours: 0,
      averageRating: 0
    }
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch upcoming interviews
        const upcomingResponse = await api.get(`/api/interviews/upcoming/interviewer/${user._id}`);
        if (upcomingResponse.data.success) {
          setDashboardData(prev => ({
            ...prev,
            upcomingInterviews: upcomingResponse.data.data,
            stats: {
              ...prev.stats,
              upcomingInterviews: upcomingResponse.data.data.length
            }
          }));
        }

        // Fetch completed interviews
        const completedResponse = await api.get(`/api/interviews/completed/interviewer/${user._id}`);
        if (completedResponse.data.success) {
          setDashboardData(prev => ({
            ...prev,
            completedInterviews: completedResponse.data.data,
            stats: {
              ...prev.stats,
              completedInterviews: completedResponse.data.data.length
            }
          }));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io("http://localhost:5000");

      newSocket.emit("joinRoom", { userId: user.id, role: "interviewer" });

      newSocket.on("interviewScheduled", (data) => {
        if (data.interviewerId === user.id) {
          toast.success("New interview scheduled!");
          setDashboardData((prev) => ({
            ...prev,
            upcomingInterviews: [...prev.upcomingInterviews, data.interview],
            stats: {
              ...prev.stats,
              upcomingInterviews: prev.stats.upcomingInterviews + 1,
              totalHours: prev.stats.totalHours + (data.interview.duration || 0),
            },
          }));
          setNotifications((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "success",
              message: `New interview scheduled for ${new Date(
                data.interview.scheduledTime
              ).toLocaleDateString()}`,
              time: new Date(),
            },
          ]);
        }
      });

      newSocket.on("interviewReminder", (data) => {
        toast.info(`Reminder: Interview starting in ${data.timeUntil} minutes`);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "info",
            message: `Interview reminder: Starting in ${data.timeUntil} minutes`,
            time: new Date(),
          },
        ]);
      });

      newSocket.on("interviewCancelled", (data) => {
        toast.error("Interview cancelled");
        setDashboardData((prev) => ({
          ...prev,
          upcomingInterviews: prev.upcomingInterviews.filter(
            (interview) => interview._id !== data.interviewId
          ),
          stats: {
            ...prev.stats,
            upcomingInterviews: prev.stats.upcomingInterviews - 1,
            totalHours: prev.stats.totalHours - (data.interview.duration || 0),
          },
        }));
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "error",
            message: "Interview has been cancelled",
            time: new Date(),
          },
        ]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const handleJoinInterview = async (interview) => {
    try {
      // Check if interview exists
      if (!interview?._id) {
        toast.error('Invalid interview data');
        return;
      }

      // First verify if the interview is still valid
      const verifyResponse = await api.get(`/api/interviews/${interview._id}`);
      if (!verifyResponse.data.success) {
        toast.error('Interview not found or no longer available');
        return;
      }

      // Generate interview URL with necessary data
      const interviewUrl = `/interview/${interview._id}?role=${user.role}&userId=${user._id}`;
      
      // Open in new tab
      window.open(interviewUrl, '_blank');

    } catch (err) {
      console.error('Error joining interview:', err);
      let errorMessage;
      
      if (err.response?.status === 500) {
        errorMessage = 'Server error while accessing interview. Please try again or contact support.';
        console.error('Server Error Details:', err.response?.data);
      } else if (err.response?.status === 404) {
        errorMessage = 'Interview room not found. Please try again or contact support.';
      } else {
        errorMessage = err.response?.data?.message || 'Failed to join interview. Please try again later.';
      }
      
      toast.error(errorMessage);
    }
  };

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

  const handleScheduleInterview = async (formData) => {
    try {
      const response = await api.post('/api/interviews/schedule', {
        ...formData,
        interviewerId: user._id,
        candidateId: selectedCandidate._id
      });

      if (response.data.success) {
        toast.success('Interview scheduled successfully!');
        setIsScheduleModalOpen(false);
        setSelectedCandidate(null);
        
        // Fetch updated dashboard data
        const profileResponse = await api.get('/api/auth/me');
        const userData = profileResponse.data.data;

        // Fetch updated upcoming interviews
        const upcomingResponse = await api.get(`/api/interviews/upcoming/${userData._id}`);
        const upcomingData = upcomingResponse.data.data;

        // Fetch updated completed interviews
        const completedResponse = await api.get(`/api/interviews/completed/${userData._id}`);
        const completedData = completedResponse.data.data;

        // Fetch updated candidates list
        const candidatesResponse = await api.get('/api/users/candidates');
        const availableCandidates = candidatesResponse.data.data;
        console.log(availableCandidates);

        // Calculate updated stats
        const stats = {
          completedInterviews: completedData.length,
          upcomingInterviews: upcomingData.asInterviewer.length + upcomingData.asCandidate.length,
          totalHours: completedData.reduce((acc, curr) => acc + (curr.duration || 0), 0),
          averageRating: completedData.length > 0
            ? completedData.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) / completedData.length
            : 0
      };

      // Update dashboard data
        setDashboardData({
          upcomingInterviews: upcomingData,
          completedInterviews: completedData,
          availableCandidates,
          stats,
          userRole: upcomingResponse.data.userRole
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const NotificationBadge = () => (
    <div className="relative">
      <Bell className="h-6 w-6 text-slate-400" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </div>
  );

  const InterviewCard = ({ interview }) => {
    const isUpcoming = new Date(interview.scheduledTime) > new Date();
    const formattedDate = format(new Date(interview.scheduledTime), 'MMM dd, yyyy');
    const formattedTime = format(new Date(interview.scheduledTime), 'hh:mm a');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {interview.topic}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              with {interview.candidate?.name || 'Candidate'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isUpcoming 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaCalendarAlt className="mr-2" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaClock className="mr-2" />
            <span>{interview.duration} minutes</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaDoorOpen className="mr-2" />
            <span>Room ID: {interview.roomId}</span>
          </div>
        </div>

        {isUpcoming && interview.meetingLink && (
          <div className="mt-4">
            <button
              onClick={() => handleJoinInterview(interview)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              <FaVideo className="mr-2" />
              Start Interview
            </button>
          </div>
        )}

        {!isUpcoming && interview.feedback && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feedback</h4>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-gray-600 dark:text-gray-300">
                {interview.feedback.rating}/5
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {interview.feedback.comments}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    const interviews = activeTab === 'upcoming' ? dashboardData.upcomingInterviews : dashboardData.completedInterviews;

    return (
      <div>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
            {activeTab === 'upcoming' 
              ? `You have ${dashboardData.upcomingInterviews.length} upcoming interview${dashboardData.upcomingInterviews.length !== 1 ? 's' : ''}`
              : `You have completed ${dashboardData.completedInterviews.length} interview${dashboardData.completedInterviews.length !== 1 ? 's' : ''}`}
          </h3>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No {activeTab} interviews
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming interviews scheduled."
                : "You haven't completed any interviews yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map(interview => (
              <InterviewCard key={interview._id} interview={interview} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">{error}</h3>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  if (error.includes('session has expired') || error.includes('Please login')) {
                    logout();
                    navigate('/login');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {error.includes('session has expired') || error.includes('Please login')
                  ? 'Go to Login'
                  : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {user?.role === 'interviewer' 
              ? `You have ${dashboardData.stats.upcomingInterviews} upcoming interviews`
              : `You have ${dashboardData.stats.upcomingInterviews} interviews to conduct`
            }
          </p>
          <NotificationBadge />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Completed Interviews
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {dashboardData.stats.completedInterviews}
                </p>
              </div>
              <div className="p-3 bg-[#fcc250]/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-[#fcc250]" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upcoming Interviews</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.stats.upcomingInterviews}</p>
              </div>
              <div className="p-3 bg-[#fcc250]/10 rounded-full">
                <Calendar className="h-6 w-6 text-[#fcc250]" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Hours</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.stats.totalHours}h</p>
              </div>
              <div className="p-3 bg-[#fcc250]/10 rounded-full">
                <Clock className="h-6 w-6 text-[#fcc250]" />
              </div>
            </div>
          </div>
          

          <div className="bg-white dark:bg-[#29354d] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.stats.averageRating.toFixed(1)}/5</p>
              </div>
              <div className="p-3 bg-[#fcc250]/10 rounded-full">
                <Star className="h-6 w-6 text-[#fcc250]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {['upcoming', 'completed'].map((tab) => (
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

      {showVideoCall && (
        <VideoCall
          roomId={currentRoomId}
          onClose={() => {
            setShowVideoCall(false);
            setCurrentRoomId(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default InterviewerDashboardPage;
