import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronRight,
  Loader2,
  BookOpen,
  Bell,
  AlertCircle,
  Star,
  Video,
  User,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from '../config/axios';
import { format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaUser, FaVideo, FaDoorOpen, FaLink, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CandidateDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    completedInterviews: [],
    availableInterviewers: [],
    stats: {
      completedInterviews: 0,
      upcomingInterviews: 0,
      totalHours: 0,
      averageRating: 0
    }
  });

  useEffect(() => {
    const fetchInterviewers = async () => { 
      try {
        const response = await api.get("/api/users/interviewers");
        if (response.data.success) {
          setInterviewers(response.data.data);
          console.log(response.data.data)
          setDashboardData(prev => ({
            ...prev,
            availableInterviewers: response.data.data
          }));
          setShowInterviewers(true);
        }
      } catch (err) {
        console.error('Error fetching interviewers:', err);
      }
    }
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch upcoming interviews
        const upcomingResponse = await api.get(`/api/interviews/upcoming/candidate/${user._id}`);
        if (upcomingResponse.data.success) {
          setDashboardData(prev => ({
            ...prev,
            upcomingInterviews: upcomingResponse.data.data,
            stats: {
              ...prev.stats,
              upcomingInterviews: upcomingResponse.data.data.length
            }
          }));
          console.log(dashboardData)
        }

        // Fetch completed interviews
        const completedResponse = await api.get(`/api/interviews/completed/candidate/${user._id}`);
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
      fetchInterviewers();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io("http://localhost:5000");

      newSocket.emit("joinRoom", { userId: user.id, role: "candidate" });

      newSocket.on("interviewScheduled", (data) => {
        if (data.candidateId === user.id) {
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
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-lg border border-indigo-100/20 p-6 mb-4 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
              {interview.topic}
            </h3>
            <p className="text-indigo-600/70 dark:text-indigo-400/70 mt-1">
              with {interview.interviewer?.name || 'Interviewer'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isUpcoming 
              ? 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 dark:from-indigo-900/50 dark:to-violet-900/50 dark:text-indigo-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
            <FaCalendarAlt className="mr-2" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
            <FaClock className="mr-2" />
            <span>{interview.duration} minutes</span>
          </div>
          <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
            <FaDoorOpen className="mr-2" />
            <span>Room ID: {interview.roomId}</span>
          </div>
        </div>

        {isUpcoming && interview.meetingLink && (
          <div className="mt-6">
            <motion.button
              onClick={() => handleJoinInterview(interview)}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-indigo-200/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaVideo className="mr-2" />
              Join Interview
            </motion.button>
          </div>
        )}

        {!isUpcoming && interview.feedback && (
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feedback</h4>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-indigo-600/70 dark:text-indigo-400/70">
                {interview.feedback.rating}/5
              </span>
            </div>
            <p className="text-indigo-600/70 dark:text-indigo-400/70">
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

  const InterviewersList = () => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-indigo-100/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
            Available Interviewers
          </h3>
          <p className="text-sm text-indigo-600/70 mt-1">
            Connect with experienced interviewers for your next session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sort by Rating
          </motion.button>
          <motion.button
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Filter by Expertise
          </motion.button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardData.availableInterviewers?.length > 0 ? (
          dashboardData.availableInterviewers.map((interviewer) => (
            <motion.div
              key={interviewer._id}
              className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl p-5 border border-indigo-100/20 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-lg">
                      <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {interviewer.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        interviewer.isActive 
                          ? 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 dark:from-indigo-900/50 dark:to-violet-900/50 dark:text-indigo-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {interviewer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
                      <span className="font-medium mr-2">Email:</span>
                      <span>{interviewer.email}</span>
                    </div>
                    <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
                      <span className="font-medium mr-2">Expertise:</span>
                      <div className="flex flex-wrap gap-1">
                        {interviewer.expertise?.map((skill, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
                      <span className="font-medium mr-2">Experience:</span>
                      <span>{interviewer.experience || 'Not specified'} years</span>
                    </div>
                    <div className="flex items-center text-indigo-600/70 dark:text-indigo-400/70">
                      <span className="font-medium mr-2">Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (interviewer.rating || 0)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm">({interviewer.rating || 0}/5)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-indigo-200/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Profile
                </motion.button>
                <motion.button
                  className="flex-1 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Schedule Interview
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl inline-block">
              <Users className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No interviewers available
            </h3>
            <p className="mt-1 text-indigo-600/70 dark:text-indigo-400/70">
              Please check back later for available interviewers.
            </p>
          </div>
        )}
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-indigo-600/70">
            You have {dashboardData.stats.upcomingInterviews} upcoming interviews
          </p>
          <NotificationBadge />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-indigo-100/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">
                  Completed Interviews
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {dashboardData.stats.completedInterviews}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-indigo-100/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">Upcoming Interviews</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.stats.upcomingInterviews}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-indigo-100/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">Total Hours</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.stats.totalHours}h</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-full">
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-indigo-100/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {(dashboardData.stats?.averageRating || 0).toFixed(1)}/5
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-full">
                <Star className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Interviewers Section - Only show for candidates */}
        {user?.role === 'candidate' && <InterviewersList />}

        {/* Tabs */}
        <div className="border-b border-indigo-100/20 dark:border-indigo-900/20 mb-6">
          <nav className="flex space-x-8">
            {['upcoming', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;

