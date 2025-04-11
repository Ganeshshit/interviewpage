"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Send,
  X,
  Monitor,
  User,
  MessageSquare,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Code2,
  Layout,
  Maximize2,
  Minimize2,
  PhoneOff,
} from "lucide-react";
import ChatPanel from '../components/ChatPanel';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { webrtcService } from "../services/webrtc";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";
import { codingQuestions } from "../data/codingquestions";
import VideoCall from "../components/VideoCall";
import ChatBox from "../components/ChatBox";
import QuestionSection from "../components/QuestionSection";
import api from '../services/api';

const InterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isCandidate, loading: authLoading } = useAuth();
  const role = searchParams.get("role");
  const userId = user?._id;

  // UI State
  const [theme, setTheme] = useState("light");
  const [layout, setLayout] = useState("default");
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);

  // Connection State
  const [isJoined, setIsJoined] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [networkStats, setNetworkStats] = useState({
    bitrate: 0,
    packetLoss: 0,
    latency: 0
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [otherUserJoined, setOtherUserJoined] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);
  const joinSoundRef = useRef(new Audio('/sounds/join.mp3'));
  const waitingSoundRef = useRef(new Audio('/sounds/waiting.mp3'));

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenShareRef = useRef(null);

  const [openQuestionId, setOpenQuestionId] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user?._id) {
      setError("User ID not found. Please log in again.");
      return;
    }
    if (!role && !isCandidate) {
      setError("Invalid role. Please specify your role.");
      return;
    }

    // If we have all required data, initialize the interview
    if (user?._id && interviewId && role) {
      handleJoinInterview();
    }
  }, [isAuthenticated, user, role, isCandidate, navigate, interviewId]);

  useEffect(() => {
    if (!user || !userId) {
      navigate('/login');
      return;
    }

    // Only set up event handlers once
    if (!initializedRef.current) {
  webrtcService.onStream((stream) => {
        setRemoteStream(stream);
  });

  webrtcService.onMessage((message) => {
    setMessages((prev) => [...prev, message]);
  });

      webrtcService.onUserJoined((userInfo) => {
        setOtherUser(userInfo);
        setIsWaiting(false);
        // Play join sound
        joinSoundRef.current.play().catch(console.error);
        toast.success(`${userInfo.role} has joined the interview`);
      });

      webrtcService.onUserLeft((userInfo) => {
        setOtherUser(null);
        setIsWaiting(true);
        // Play waiting sound
        waitingSoundRef.current.play().catch(console.error);
        toast.info(`${userInfo.role} has left the interview`);
      });

      initializedRef.current = true;
    }

    return () => {
      webrtcService.cleanup();
      initializedRef.current = false;
    };
  }, [user, userId, navigate]);

  // Video initialization is now handled by VideoCall component

  const handleJoinInterview = useCallback(async () => {
    if (!interviewId || !userId || !role) {
      const error = "Missing required parameters to join the interview";
      console.error(error, { interviewId, userId, role });
      setError(error);
      toast.error(error);
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      
      console.log("Initializing WebRTC service with:", { interviewId, userId, role });
      
      // Initialize WebRTC service with proper parameters
      try {
        await webrtcService.initialize(interviewId, userId, role);
      } catch (error) {
        throw new Error(`Failed to initialize WebRTC service: ${error.message}`);
      }
      
      // Set up event handlers
      webrtcService.onStream((stream) => {
        if (stream) {
          console.log("Received remote stream");
          setRemoteStream(stream);
        }
      });
      
      webrtcService.onUserJoined((user) => {
        if (user) {
          console.log("User joined:", user);
          setOtherUserJoined(true);
          setOtherUserInfo(user);
          toast.success(`${user.role === 'interviewer' ? 'Interviewer' : 'Candidate'} has joined the interview`);
        }
      });
      
      webrtcService.onUserLeft((user) => {
        if (user) {
          console.log("User left:", user);
          setOtherUserJoined(false);
          toast.info(`${user.role === 'interviewer' ? 'Interviewer' : 'Candidate'} has left the interview`);
        }
      });
      
      // Get local stream
      const localStream = await webrtcService.getLocalStream();
      if (localStream) {
        localStreamRef.current = localStream;
      }
      
      setIsJoined(true);
      setIsWaiting(false);
      toast.success("Successfully joined the interview");
    } catch (error) {
      console.error("Failed to join interview:", error);
      setError(error.message || "Failed to join interview. Please try again.");
      toast.error(error.message || "Failed to join interview. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }, [interviewId, userId, role]);

  const fetchInterviewDetails = async () => {
    try {
      const response = await axios.get(`/api/interviews/${interviewId}`);
      setInterview(response.data);
      
      // If there's a selected question in the interview data, set it
      if (response.data.selectedQuestion) {
        setSelectedQuestion(response.data.selectedQuestion);
        setCode(response.data.selectedQuestion.starterCode || '');
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      throw new Error('Failed to fetch interview details');
    }
  };

  const setupConnectionMonitoring = () => {
    // Set up event listeners for WebRTC events
    webrtcService.onStream((stream) => {
      setRemoteStream(stream);
    });

    webrtcService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    webrtcService.onUserJoined((userInfo) => {
      setOtherUser(userInfo);
      setIsWaiting(false);
      // Play join sound
      joinSoundRef.current.play().catch(console.error);
      toast.success(`${userInfo.role} has joined the interview`);
    });

    webrtcService.onUserLeft((userInfo) => {
      setOtherUser(null);
      setIsWaiting(true);
      // Play waiting sound
      waitingSoundRef.current.play().catch(console.error);
      toast.info(`${userInfo.role} has left the interview`);
    });
  };

  const toggleAudio = useCallback(() => {
    const enabled = webrtcService.toggleAudio();
    setIsMuted(!enabled);
  }, []);

  const toggleVideo = useCallback(() => {
    const enabled = webrtcService.toggleVideo();
    setIsVideoOff(!enabled);
  }, []);

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await webrtcService.startScreenShare();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      } else {
        await webrtcService.stopScreenShare();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = webrtcService.getLocalStream();
        }
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      }
    } catch (error) {
      console.error("Screen share error:", error);
      toast.error("Failed to toggle screen sharing");
    }
  };

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      const messageData = {
        content: newMessage,
        sender: user._id,
        timestamp: new Date().toISOString(),
      };

      webrtcService.socket?.emit("chat-message", {
        roomId: interviewId,
        message: messageData,
      });

      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    },
    [newMessage, user._id, interviewId]
  );

  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);
      webrtcService.socket?.emit("code-update", {
        roomId: interviewId,
        code: newCode,
        language,
      });
    },
    [interviewId, language]
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: user._id }]);
      setNewMessage("");
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleLeaveInterview = useCallback(async () => {
    try {
      await api.post(`/interviews/${interviewId}/leave`);
      if (webrtcService) {
        webrtcService.cleanup();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving interview:", error);
      toast.error(error.response?.data?.message || "Failed to leave interview");
    }
  }, [interviewId, navigate]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setCode(question.starterCode);
    setLanguage("javascript");
  };

  const handleStartVideoCall = async () => {
    try {
      const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCurrentRoomId(roomId);
      setShowVideoCall(true);
      setIsWaiting(true);
      setOtherUserJoined(false);
    } catch (error) {
      console.error("Failed to start video call:", error);
      toast.error("Failed to start video call");
    }
  };

  // Add a useEffect to monitor connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (webrtcService) {
        setConnectionStatus(webrtcService.connectionStatus);
        if (webrtcService.connectionError) {
          setError(webrtcService.connectionError);
        }
      }
    };
    
    const interval = setInterval(checkConnectionStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        if (!interviewId || !userId || !role) {
          console.log('Missing required parameters');
          return;
        }

        console.log('Initializing WebRTC service with:', { interviewId, userId, role });

        // Request camera and microphone permissions first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        });

        // Initialize WebRTC service
        await webrtcService.initialize(interviewId, userId, role);
        
        // Set the local stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Local video stream set successfully');
        }

        setIsWebRTCInitialized(true);
        setIsWaiting(false);
        console.log('WebRTC initialization completed successfully');

      } catch (error) {
        console.error('Failed to initialize WebRTC service:', error);
        toast.error('Failed to join interview');
        setIsWebRTCInitialized(false);
      }
    };

    if (!isWebRTCInitialized && userId && interviewId && role) {
      initializeWebRTC();
    }

    return () => {
      if (isWebRTCInitialized) {
        webrtcService.cleanup();
        setIsWebRTCInitialized(false);
      }
    };
  }, [interviewId, userId, role, isWebRTCInitialized]);

  // Render waiting screen
  const renderWaitingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-indigo-200/20 dark:border-indigo-500/20">
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            <div className="relative rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 p-5">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 text-transparent bg-clip-text">
            Waiting for {role === 'candidate' ? 'Interviewer' : 'Candidate'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we connect you with the {role === 'candidate' ? 'interviewer' : 'candidate'}...
          </p>
        </div>
        
        {/* Video Preview Section */}
        <div className="mb-8 rounded-xl overflow-hidden border border-indigo-200/20 dark:border-indigo-500/20">
          <div className="bg-gradient-to-r from-indigo-900 to-violet-900 p-4 flex justify-between items-center">
            <h3 className="font-semibold text-white">Your Video Preview</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-indigo-700'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
              </button>
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-indigo-700'}`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
          <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-violet-900">
            {localVideoRef.current && localVideoRef.current.srcObject ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                  <p className="text-indigo-400">Initializing camera...</p>
                </div>
              </div>
            )}
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/50">
                <VideoOff className="w-12 h-12 text-indigo-400" />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-indigo-900/50 p-6 rounded-xl mb-8 backdrop-blur-sm border border-indigo-200/20 dark:border-indigo-500/20">
          <h3 className="font-semibold mb-4 text-indigo-800 dark:text-indigo-200">Connection Details</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-indigo-700 dark:text-indigo-300">
              <User className="w-4 h-4" />
              <span className="font-medium">Role:</span>
              <span className="ml-auto">{role}</span>
            </div>
            <div className="flex items-center space-x-3 text-indigo-700 dark:text-indigo-300">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Interview ID:</span>
              <span className="ml-auto font-mono">{interviewId}</span>
            </div>
          </div>
        </div>

        <div className="text-center bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <div className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <div className="animate-pulse w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-sm">You'll be notified when they join</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render candidate interface
  const renderCandidateInterface = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Left Panel - Questions */}
        <div className="col-span-3 bg-indigo-900/10 backdrop-blur-lg rounded-xl p-4 border border-indigo-500/20">
          <h3 className="text-lg font-semibold text-indigo-200 mb-4">Interview Questions</h3>
          <div className="space-y-4">
            {codingQuestions.map((question, index) => (
              <div 
                key={index} 
                className={`bg-indigo-900/5 rounded-lg overflow-hidden transition-all duration-300 ${
                  openQuestionId === index ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => setOpenQuestionId(openQuestionId === index ? null : index)}
                >
                  <h4 className="text-indigo-200 font-medium">{question.title || `Question ${index + 1}`}</h4>
                  <ChevronRight 
                    className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${
                      openQuestionId === index ? 'transform rotate-90' : ''
                    }`} 
                  />
                </div>
                
                {openQuestionId === index && (
                  <div className="p-4 pt-0 border-t border-indigo-500/10">
                    <p className="text-indigo-300 text-sm">{question.description}</p>
                    {question.examples && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-indigo-200 text-sm font-medium">Examples:</h5>
                        {question.examples.map((example, i) => (
                          <div key={i} className="bg-indigo-900/10 p-2 rounded text-xs">
                            <p className="text-indigo-300">Input: {example.input}</p>
                            <p className="text-indigo-300">Output: {example.output}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.constraints && (
                      <div className="mt-3">
                        <h5 className="text-indigo-200 text-sm font-medium">Constraints:</h5>
                        <ul className="list-disc list-inside text-indigo-300 text-sm mt-1">
                          {question.constraints.map((constraint, i) => (
                            <li key={i}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => handleQuestionClick(question)}
                      className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-md text-sm transition-colors"
                    >
                      Start Solving
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Code Editor */}
        <div className="col-span-6 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Right Panel - Video Call */}
        <div className="col-span-3 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
          <VideoCall
            roomId={interviewId}
            userId={user?.id}
            role={user?.role}
            onClose={handleLeaveInterview}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-indigo-900/90 backdrop-blur-lg border-t border-indigo-500/20 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing ? 'bg-violet-500 hover:bg-violet-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full transition-colors ${
              isChatOpen ? 'bg-violet-500 hover:bg-violet-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleLeaveInterview}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  // Render interviewer interface
  const renderInterviewerInterface = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Left Panel - Live Preview */}
        <div className="col-span-3 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
          <div className="h-full">
            <h3 className="text-lg font-semibold text-indigo-200 p-4">Candidate's Screen</h3>
            <div className="relative h-[calc(100%-4rem)]">
              {isScreenSharing ? (
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-indigo-400">
                  <Monitor className="w-12 h-12 mb-3" />
                  <p>Waiting for screen share...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Code Editor */}
        {isScreenSharing ? (
          <div className="col-span-6 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
            <div className="h-full">
              <h3 className="text-lg font-semibold text-indigo-200 p-4">Candidate's Code Editor</h3>
              <div className="relative h-[calc(100%-4rem)]">
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-6 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden flex items-center justify-center border border-indigo-500/20">
            <div className="text-center text-indigo-400">
              <Monitor className="w-12 h-12 mx-auto mb-3" />
              <p>Waiting for candidate to share their screen...</p>
            </div>
          </div>
        )}

        {/* Right Panel - Video Call */}
        <div className="col-span-3 bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
          <VideoCall
            roomId={interviewId}
            userId={user?.id}
            role={user?.role}
            onClose={handleLeaveInterview}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-indigo-900/90 backdrop-blur-lg border-t border-indigo-500/20 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full transition-colors ${
              isChatOpen ? 'bg-violet-500 hover:bg-violet-600' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleLeaveInterview}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  // Show error state only if there's an error and not joined
  if (error && !isJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-indigo-200/20 dark:border-indigo-500/20">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show waiting screen only if not joined and not loading
  if (!isJoined && !isLoading) {
    return renderWaitingScreen();
  }

  // Show the main interview interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-violet-900 text-white">
      {/* Header */}
      <header className="bg-indigo-900/40 backdrop-blur-lg border-b border-indigo-500/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 text-transparent bg-clip-text">
                Interview Room
              </h1>
              <div className="h-6 w-px bg-indigo-500/20" />
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                  {role === "interviewer" ? "Interviewer" : "Candidate"}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-sm">
                  ID: {interviewId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)]">
        {role === "candidate" ? renderCandidateInterface() : renderInterviewerInterface()}
      </div>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 bg-indigo-900/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 border border-indigo-500/20"
          >
            <div className="flex justify-between items-center p-4 border-b border-indigo-500/20">
              <h3 className="font-medium text-lg bg-gradient-to-r from-indigo-400 to-violet-400 text-transparent bg-clip-text">Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-indigo-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-[400px] overflow-y-auto">
              <ChatBox
                messages={messages}
                onSendMessage={sendMessage}
                role={role}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewPage;
