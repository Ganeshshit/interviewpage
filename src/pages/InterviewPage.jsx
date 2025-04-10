// "use client"

// import React, { useRef, useEffect, useState, useCallback } from "react"
// import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom"
// import DashboardLayout from "../components/DashboardLayout"
// import CodeEditor from "../components/CodeEditor"
// import { useAuth } from "../context/AuthContext"
// import { toast } from 'react-hot-toast'
// import { Video, Mic, MicOff, VideoOff, MessageSquare, Send, X, Share2, Monitor } from 'lucide-react'
// import { api } from '../config/axios'
// import webrtcService from '../services/webrtc'

// const InterviewPage = () => {
//   const { interviewId } = useParams()
//   const navigate = useNavigate()
//   const [searchParams] = useSearchParams()
//   const { user, isAuthenticated, isCandidate } = useAuth()
//   const role = searchParams.get('role')

//   // State management
//   const [isConnecting, setIsConnecting] = useState(true)
//   const [isConnected, setIsConnected] = useState(false)
//   const [isMuted, setIsMuted] = useState(false)
//   const [isVideoOff, setIsVideoOff] = useState(false)
//   const [isScreenSharing, setIsScreenSharing] = useState(false)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState("")
//   const [code, setCode] = useState("")
//   const [language, setLanguage] = useState("javascript")
//   const [error, setError] = useState(null)
//   const [connectionStatus, setConnectionStatus] = useState('disconnected')

//   // Refs
//   const localVideoRef = useRef(null)
//   const remoteVideoRef = useRef(null)
//   const messagesEndRef = useRef(null)

//   // Check authentication and role
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/login')
//       return
//     }

//     if (!user?._id) {
//       setError('User ID not found. Please log in again.')
//       return
//     }

//     if (!role && !isCandidate) {
//       setError('Invalid role. Please specify your role.')
//       return
//     }
//   }, [isAuthenticated, user, role, isCandidate, navigate])

//   const initializeConnection = useCallback(async () => {
//     try {
//       setIsConnecting(true);
//       setError(null);

//       // Initialize WebRTC service
//       await webrtcService.initialize(interviewId, true);

//       // Set up stream callback
//       webrtcService.onStream((stream) => {
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = stream;
//         }
//       });

//       // Set up message callback
//       webrtcService.onMessage((message) => {
//         setMessages(prev => [...prev, message]);
//       });

//       // Start the call
//       const localStream = await webrtcService.startCall();
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = localStream;
//       }

//       // Set up connection state change handler
//       webrtcService.peerConnection.onconnectionstatechange = () => {
//         setConnectionStatus(webrtcService.peerConnection.connectionState);
//       };

//       setIsConnecting(false);
//     } catch (error) {
//       console.error('Connection error:', error);
//       setError(error.message || 'Failed to establish connection');
//       setIsConnecting(false);
//       toast.error('Failed to establish connection. Please try again.');
//     }
//   }, [interviewId]);

//   // Initialize connection when component mounts
//   useEffect(() => {
//     if (user && interviewId && role) {
//       initializeConnection();
//     }
//   }, [user, interviewId, role, initializeConnection]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (webrtcService) {
//         webrtcService.cleanup();
//       }
//     };
//   }, []);

//   // Handle media controls
//   const toggleAudio = useCallback(() => {
//     const enabled = webrtcService.toggleAudio()
//     setIsMuted(!enabled)
//   }, [])

//   const toggleVideo = useCallback(() => {
//     const enabled = webrtcService.toggleVideo()
//     setIsVideoOff(!enabled)
//   }, [])

//   const toggleScreenShare = useCallback(async () => {
//     try {
//       if (!isScreenSharing) {
//         const screenStream = await webrtcService.startScreenShare()
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = screenStream
//         }
//         setIsScreenSharing(true)
//       } else {
//         await webrtcService.stopScreenShare()
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = webrtcService.getLocalStream()
//         }
//         setIsScreenSharing(false)
//       }
//     } catch (error) {
//       console.error('Screen share error:', error)
//       toast.error('Failed to toggle screen sharing')
//     }
//   }, [isScreenSharing])

//   // Handle chat
//   const sendMessage = useCallback((e) => {
//     e.preventDefault()
//     if (!newMessage.trim()) return

//     const messageData = {
//         content: newMessage,
//       sender: user._id,
//       timestamp: new Date().toISOString()
//     }

//     webrtcService.socket?.emit('chat-message', {
//       roomId: interviewId,
//       message: messageData
//     })

//     setMessages(prev => [...prev, messageData])
//       setNewMessage("")
//   }, [newMessage, user._id, interviewId])

//   // Handle code updates
//   const handleCodeChange = useCallback((newCode) => {
//     setCode(newCode)
//     webrtcService.socket?.emit('code-update', {
//       roomId: interviewId,
//           code: newCode,
//       language
//     })
//   }, [interviewId, language])

//   // Handle leaving interview
//   const handleLeaveInterview = useCallback(async () => {
//     try {
//       await api.post(`/api/interviews/${interviewId}/leave`)
//       if (webrtcService) {
//         webrtcService.cleanup()
//       }
//       window.close()
//     } catch (error) {
//       console.error('Error leaving interview:', error)
//       toast.error(error.response?.data?.message || 'Failed to leave interview')
//     }
//   }, [interviewId])

//   // Show error state
//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//           <h2 className="text-2xl font-semibold text-red-600 mb-4">Connection Error</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <div className="flex justify-between">
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//             >
//               Try Again
//             </button>
//             <button
//               onClick={() => window.close()}
//               className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//             >
//               Close Window
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="container mx-auto p-4">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           {/* Video Section */}
//           <div className="lg:col-span-2 space-y-4">
//             <div className="bg-white rounded-lg shadow-md p-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Local Video */}
//                 <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
//                   <video
//                     ref={localVideoRef}
//                     autoPlay
//                     muted
//                     playsInline
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute bottom-2 left-2 flex space-x-2">
//                     <button
//                       onClick={toggleAudio}
//                       className="p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
//                     >
//                       {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
//                     </button>
//                     <button
//                       onClick={toggleVideo}
//                       className="p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
//                     >
//                       {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Remote Video */}
//                 <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
//                   <video
//                     ref={remoteVideoRef}
//                     autoPlay
//                     playsInline
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Screen Share Button */}
//             <div className="flex justify-center">
//               <button
//                 onClick={toggleScreenShare}
//                 className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//               >
//                 {isScreenSharing ? (
//                   <>
//                     <Monitor size={20} />
//                     <span>Stop Sharing</span>
//                   </>
//                 ) : (
//                   <>
//                     <Share2 size={20} />
//                     <span>Share Screen</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Right Sidebar */}
//           <div className="space-y-4">
//             {/* Chat Section */}
//             <div className="bg-white rounded-lg shadow-md p-4 h-[300px] flex flex-col">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Chat</h3>
//                 <MessageSquare size={20} />
//               </div>
//               <div className="flex-1 overflow-y-auto mb-4 space-y-2">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={`p-2 rounded-lg ${
//                       message.sender === user._id
//                         ? 'bg-indigo-100 ml-auto'
//                         : 'bg-gray-100'
//                     }`}
//                   >
//                     <p className="text-sm">{message.content}</p>
//                     <span className="text-xs text-gray-500">
//                       {new Date(message.timestamp).toLocaleTimeString()}
//                     </span>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>
//               <form onSubmit={sendMessage} className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="Type a message..."
//                   className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 <button
//                   type="submit"
//                   className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </div>

//             {/* Code Editor Section (for candidates) */}
//             {role === 'candidate' && (
//               <div className="bg-white rounded-lg shadow-md p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold">Code Editor</h3>
//                   <select
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                     className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="javascript">JavaScript</option>
//                     <option value="python">Python</option>
//                     <option value="java">Java</option>
//                     <option value="cpp">C++</option>
//                   </select>
//                 </div>
//                 <CodeEditor
//                   value={code}
//                   onChange={handleCodeChange}
//                   language={language}
//                   height="300px"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default InterviewPage
// "use client";

// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import {
//   Video,
//   Mic,
//   MicOff,
//   VideoOff,
//   Send,
//   X,
//   Monitor,
//   User,
//   MessageSquare,
// } from "lucide-react";
// import axios from "axios";
// import webrtcService from "../services/webrtc";
// import CodeEditor from "../components/CodeEditor";
// import { useAuth } from "../context/AuthContext";
// import { codingQuestions } from "../data/codingquestions";

// const InterviewPage = () => {
//   const { interviewId } = useParams();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { user, isAuthenticated, isCandidate } = useAuth();
//   const role = searchParams.get("role");

//   const [isConnecting, setIsConnecting] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const [error, setError] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [selectedQuestion, setSelectedQuestion] = useState(null);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//       return;
//     }
//     if (!user?._id) {
//       setError("User ID not found. Please log in again.");
//       return;
//     }
//     if (!role && !isCandidate) {
//       setError("Invalid role. Please specify your role.");
//       return;
//     }
//   }, [isAuthenticated, user, role, isCandidate, navigate]);

//   const initializeConnection = useCallback(async () => {
//     try {
//       setIsConnecting(true);
//       setError(null);
//       console.log(user._id, user.role, interviewId);
//       await webrtcService.initialize(interviewId, user._id, user.role, true);
//       webrtcService.onStream((stream) => {
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = stream;
//         }
//       });
//       webrtcService.onMessage((message) => {
//         setMessages((prev) => [...prev, message]);
//       });
//       const localStream = await webrtcService.startCall();
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = localStream;
//       }
//       webrtcService.peerConnection.onconnectionstatechange = () => {
//         setConnectionStatus(webrtcService.peerConnection.connectionState);
//       };
//       setIsConnecting(false);
//     } catch (error) {
//       console.error("Connection error:", error);
//       setError(error.message || "Failed to establish connection");
//       setIsConnecting(false);
//       toast.error("Failed to establish connection. Please try again.");
//     }
//   }, [interviewId]);

//   useEffect(() => {
//     if (user && interviewId && role) {
//       initializeConnection();
//     }
//   }, [user, interviewId, role, initializeConnection]);

//   useEffect(() => {
//     return () => {
//       if (webrtcService) {
//         webrtcService.cleanup();
//       }
//     };
//   }, []);

//   const toggleAudio = useCallback(() => {
//     const enabled = webrtcService.toggleAudio();
//     setIsMuted(!enabled);
//   }, []);

//   const toggleVideo = useCallback(() => {
//     const enabled = webrtcService.toggleVideo();
//     setIsVideoOff(!enabled);
//   }, []);

//   const toggleScreenShare = useCallback(async () => {
//     try {
//       if (!isScreenSharing) {
//         const screenStream = await webrtcService.startScreenShare();
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = screenStream;
//         }
//         setIsScreenSharing(true);
//       } else {
//         await webrtcService.stopScreenShare();
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = webrtcService.getLocalStream();
//         }
//         setIsScreenSharing(false);
//       }
//     } catch (error) {
//       console.error("Screen share error:", error);
//       toast.error("Failed to toggle screen sharing");
//     }
//   }, [isScreenSharing]);

//   const sendMessage = useCallback(
//     (e) => {
//       e.preventDefault();
//       if (!newMessage.trim()) return;

//       const messageData = {
//         content: newMessage,
//         sender: user._id,
//         timestamp: new Date().toISOString(),
//       };

//       webrtcService.socket?.emit("chat-message", {
//         roomId: interviewId,
//         message: messageData,
//       });

//       setMessages((prev) => [...prev, messageData]);
//       setNewMessage("");
//     },
//     [newMessage, user._id, interviewId]
//   );

//   const handleCodeChange = useCallback(
//     (newCode) => {
//       setCode(newCode);
//       webrtcService.socket?.emit("code-update", {
//         roomId: interviewId,
//         code: newCode,
//         language,
//       });
//     },
//     [interviewId, language]
//   );

//   const handleLeaveInterview = useCallback(async () => {
//     try {
//       await axios.post(`/api/interviews/${interviewId}/leave`);
//       if (webrtcService) {
//         webrtcService.cleanup();
//       }
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Error leaving interview:", error);
//       toast.error(error.response?.data?.message || "Failed to leave interview");
//     }
//   }, [interviewId, navigate]);

//   const handleQuestionClick = (question) => {
//     setSelectedQuestion(question);
//     setCode(question.starterCode);
//     setLanguage("javascript"); // Update this if the language is different
//   };

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-700">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-0 flex flex-col">
//   {/* Main Content Layout */}
//   <div className="flex flex-1 w-full">
    
//     {/* Left Panel for Candidate */}
//     {user.role === "candidate" && (
//       <div className="w-1/4 space-y-4">
//         <div className="bg-white p-4 rounded-xl shadow-lg overflow-y-auto max-h-full">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//             Interview Questions
//           </h2>
//           <ul className="list-disc list-inside text-gray-700 space-y-2">
//             {codingQuestions.map((question, index) => (
//               <li
//                 key={index}
//                 onClick={() => handleQuestionClick(question)}
//                 className="cursor-pointer hover:bg-gray-200 p-2 rounded"
//               >
//                 {question.title}
//               </li>
//             ))}
//           </ul>
//           {selectedQuestion && (
//             <div className="mt-4 p-4 bg-gray-100 rounded-lg">
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 {selectedQuestion.title} ({selectedQuestion.difficulty})
//               </h3>
//               <p className="text-gray-700 mb-4">{selectedQuestion.description}</p>
//               <h4 className="text-lg font-semibold text-gray-800">Examples:</h4>
//               <ul className="list-disc list-inside text-gray-700 space-y-2">
//                 {selectedQuestion.examples.map((example, index) => (
//                   <li key={index}>
//                     <strong>Input:</strong> {example.input}<br />
//                     <strong>Output:</strong> {example.output}<br />
//                     <strong>Explanation:</strong> {example.explanation}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     )}

//     {/* Center Panel */}
//     <div className="flex-1 flex flex-col items-center space-y-4">
//       {user.role === "candidate" && (
//         <div className="w-full h-[90vh] bg-white rounded-xl shadow-lg p-4">
//           <CodeEditor
//             value={code}
//             onChange={handleCodeChange}
//             language={language}
//           />
//         </div>
//       )}

//       {user.role === "interviewer" && (
//         <div className="w-full h-[90vh] bg-white rounded-xl shadow-lg p-4 flex items-center justify-center text-gray-500">
//           <p className="text-lg font-medium">You are viewing the candidate's screen...</p>
//         </div>
//       )}
//     </div>

//     {/* Right Panel for Videos */}
//     <div className="w-1/6 space-y-4">
//       <div className="flex flex-col space-y-4">
//         {[localVideoRef, remoteVideoRef].map((ref, idx) => (
//           <div
//             key={idx}
//             className="relative w-full h-32 rounded-xl shadow-md bg-black flex items-center justify-center overflow-hidden"
//           >
//             <video
//               ref={ref}
//               autoPlay
//               muted={idx === 0}
//               className="w-full h-full object-cover"
//             />
//             {!ref.current?.srcObject && (
//               <div className="absolute text-white opacity-70">
//                 <User size={48} />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>

//   {/* Bottom Control Buttons */}
//   <div className="flex justify-center gap-4 mt-2 mb-2">
//     {[
//       [toggleAudio, isMuted ? <MicOff /> : <Mic />],
//       [toggleVideo, isVideoOff ? <VideoOff /> : <Video />],
//       [toggleScreenShare, <Monitor />],
//       [() => setIsChatOpen((prev) => !prev), <MessageSquare />],
//       [handleLeaveInterview, <X />],
//     ].map(([onClick, icon], idx) => (
//       <button
//         key={idx}
//         onClick={onClick}
//         className={`p-3 rounded-full shadow-md transition duration-200 ${
//           idx === 4
//             ? "bg-red-500 text-white hover:bg-red-600"
//             : "bg-white text-gray-700 hover:bg-gray-100"
//         }`}
//       >
//         {icon}
//       </button>
//     ))}
//   </div>

//   {/* Chat Popup */}
//   {isChatOpen && (
//     <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-xl p-4 flex flex-col z-50 border border-gray-200">
//       <div className="flex-1 overflow-y-auto border-b pb-2 mb-2">
//         {messages.map((msg, idx) => (
//           <div key={idx} className="text-sm mb-1">
//             <span className="font-semibold text-gray-800">{msg.sender}</span>: {msg.content}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <form onSubmit={sendMessage} className="flex mt-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Type a message"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
//         >
//           <Send size={16} />
//         </button>
//       </form>
//     </div>
//   )}
// </div>
//   )
// };

// export default InterviewPage;
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
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
} from "lucide-react";
import axios from "axios";
import webrtcService from "../services/webrtc";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";
import { codingQuestions } from "../data/codingquestions";

const InterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isCandidate } = useAuth();
  const role = searchParams.get("role");

  const [isConnecting, setIsConnecting] = useState(true);
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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);

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
  }, [isAuthenticated, user, role, isCandidate, navigate]);

const initializeConnection = useCallback(async () => {
try {
  setIsConnecting(true);
  setError(null);

  // Initialize WebRTC
  const res = await webrtcService.initialize(
    interviewId,
    user._id,
    user.role,
    true
  );
  console.log(res);

  // Handle incoming stream and messages
  webrtcService.onStream((stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  });

  webrtcService.onMessage((message) => {
    setMessages((prev) => [...prev, message]);
  });

  // Monitor connection state changes
  webrtcService.peerConnection.onconnectionstatechange = () => {
    const state = webrtcService.peerConnection.connectionState;
    console.log("🌀 Connection state changed:", state);
    setConnectionStatus(state);
  };

  // Wait for signaling state to be stable and then start the call
  if (webrtcService.peerConnection.signalingState === "stable") {
    const localStream = await webrtcService.startCall();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  } else {
    console.warn(
      "⏳ Skipping offer creation — signaling state:",
      webrtcService.peerConnection.signalingState
    );
  }

  setIsConnecting(false);
} catch (error2) {
  console.error("❌ Connection error:", error2);
  setError(error2.message || "Failed to establish connection");
  setIsConnecting(false);
  toast.error("Failed to establish connection. Please try again.");
}
}, [interviewId, user]);


  useEffect(() => {
    if (user && interviewId && role) {
      initializeConnection();
    }
  }, [user, interviewId, role, initializeConnection]);

  useEffect(() => {
    return () => {
      if (webrtcService) {
        webrtcService.cleanup();
      }
    };
  }, []);

  const toggleAudio = useCallback(() => {
    const enabled = webrtcService.toggleAudio();
    setIsMuted(!enabled);
  }, []);

  const toggleVideo = useCallback(() => {
    const enabled = webrtcService.toggleVideo();
    setIsVideoOff(!enabled);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await webrtcService.startScreenShare();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      } else {
        await webrtcService.stopScreenShare();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = webrtcService.getLocalStream();
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Screen share error:", error);
      toast.error("Failed to toggle screen sharing");
    }
  }, [isScreenSharing]);

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

  const handleLeaveInterview = useCallback(async () => {
    try {
      await axios.post(`/api/interviews/${interviewId}/leave`);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-0 flex flex-col">
      <div className="flex flex-1 w-full">
        {user.role === "candidate" && (
          <div className="w-1/4 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg overflow-y-auto max-h-full">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Interview Questions
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {codingQuestions.map((question, index) => (
                  <li
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                  >
                    {question.title}
                  </li>
                ))}
              </ul>
              {selectedQuestion && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {selectedQuestion.title} ({selectedQuestion.difficulty})
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {selectedQuestion.description}
                  </p>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Examples:
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {selectedQuestion.examples.map((example, index) => (
                      <li key={index}>
                        <strong>Input:</strong> {example.input}
                        <br />
                        <strong>Output:</strong> {example.output}
                        <br />
                        <strong>Explanation:</strong> {example.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center space-y-4">
          {user.role === "candidate" && (
            <div className="w-full h-[90vh] bg-white rounded-xl shadow-lg p-4">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                language={language}
              />
            </div>
          )}

          {user.role === "interviewer" && (
            <div className="w-full h-[90vh] bg-white rounded-xl shadow-lg p-4 flex items-center justify-center text-gray-500">
              <p className="text-lg font-medium">
                You are viewing the candidate's screen...
              </p>
            </div>
          )}
        </div>

        <div className="w-1/6 space-y-4">
          <div className="flex flex-col space-y-4">
            {[localVideoRef, remoteVideoRef].map((ref, idx) => (
              <div
                key={idx}
                className="relative w-full h-32 rounded-xl shadow-md bg-black flex items-center justify-center overflow-hidden"
              >
                <video
                  ref={ref}
                  autoPlay
                  muted={idx === 0}
                  className="w-full h-full object-cover"
                />
                {!ref.current?.srcObject && (
                  <div className="absolute text-white opacity-70">
                    <User size={48} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-2 mb-2">
        {[
          [toggleAudio, isMuted ? <MicOff /> : <Mic />],
          [toggleVideo, isVideoOff ? <VideoOff /> : <Video />],
          [toggleScreenShare, <Monitor />],
          [() => setIsChatOpen((prev) => !prev), <MessageSquare />],
          [handleLeaveInterview, <X />],
        ].map(([onClick, icon], idx) => (
          <button
            key={idx}
            onClick={onClick}
            className={`p-3 rounded-full shadow-md transition duration-200 ${
              idx === 4
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-xl p-4 flex flex-col z-50 border border-gray-200">
          <div className="flex-1 overflow-y-auto border-b pb-2 mb-2">
            {messages.map((msg, idx) => (
              <div key={idx} className="text-sm mb-1">
                <span className="font-semibold text-gray-800">
                  {msg.sender}
                </span>
                : {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex mt-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-md"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
// "use client";

// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import {
//   Video,
//   Mic,
//   MicOff,
//   VideoOff,
//   Send,
//   X,
//   Monitor,
//   User,
//   MessageSquare,
// } from "lucide-react";
// import axios from "axios";
// import webrtcService from "../services/webrtc";
// import CodeEditor from "../components/CodeEditor";
// import { useAuth } from "../context/AuthContext";
// import { codingQuestions } from "../data/codingquestions";
// import api from "../services/api";
// import { socketService } from "../services/socketService";

// const InterviewPage = () => {

//   const { interviewId } = useParams();
//   console.log(interviewId)
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { user, isAuthenticated, isCandidate } = useAuth();
//   const role = searchParams.get("role");

//   const [isConnecting, setIsConnecting] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const [error, setError] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [selectedQuestion, setSelectedQuestion] = useState(null);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//       return;
//     }
//     if (!user?._id) {
//       setError("User ID not found. Please log in again.");
//       return;
//     }
//     if (!role && !isCandidate) {
//       setError("Invalid role. Please specify your role.");
//       return;
//     }
//   }, [isAuthenticated, user, role, isCandidate, navigate]);

//  const initializeConnection = useCallback(async () => {
//    try {
//      setIsConnecting(true);
//      setError(null);
//      const isInitiator = role === "interviewer";
//      await webrtcService.initialize(interviewId, isInitiator);
//      webrtcService.onStream((stream) => {
//        if (remoteVideoRef.current) {
//          remoteVideoRef.current.srcObject = stream;
//        }
//      });

//      webrtcService.onMessage((message) => {
//        setMessages((prev) => [...prev, message]);
//      });

//      if (isInitiator) {
//        const localStream = await webrtcService.startCall();
//        if (localVideoRef.current) {
//          localVideoRef.current.srcObject = localStream;
//        }
//      }

//      webrtcService.peerConnection.onconnectionstatechange = () => {
//        setConnectionStatus(webrtcService.peerConnection.connectionState);
//      };

//      setIsConnecting(false);
//    } catch (error) {
//      console.error("Connection error:", error);
//      setError(error.message || "Failed to establish connection");
//      setIsConnecting(false);
//      toast.error(
//        error.response?.data?.message || "Failed to establish connection"
//      );
//    }
//  }, [interviewId, role]);

//   useEffect(() => {
//     if (user && interviewId && role) {
//       initializeConnection();
//       socketService.connect(user._id, interviewId, role);
//     }
//   }, [user, interviewId, role, initializeConnection]);

//   useEffect(() => {
//     return () => {
//       if (webrtcService) {
//         webrtcService.cleanup();
//       }
//     };
//   }, []);

//   const toggleAudio = useCallback(() => {
//     const enabled = webrtcService.toggleAudio();
//     setIsMuted(!enabled);
//   }, []);

//   const toggleVideo = useCallback(() => {
//     const enabled = webrtcService.toggleVideo();
//     setIsVideoOff(!enabled);
//   }, []);

//   const toggleScreenShare = useCallback(async () => {
//     try {
//       if (!isScreenSharing) {
//         const screenStream = await webrtcService.startScreenShare();
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = screenStream;
//         }
//         setIsScreenSharing(true);
//       } else {
//         await webrtcService.stopScreenShare();
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = webrtcService.getLocalStream();
//         }
//         setIsScreenSharing(false);
//       }
//     } catch (error) {
//       console.error("Screen share error:", error);
//       toast.error("Failed to toggle screen sharing");
//     }
//   }, [isScreenSharing]);

//   const sendMessage = useCallback(
//     (e) => {
//       e.preventDefault();
//       if (!newMessage.trim()) return;

//       const messageData = {
//         content: newMessage,
//         sender: user._id,
//         timestamp: new Date().toISOString(),
//       };

//       webrtcService.socket?.emit("chat-message", {
//         roomId: interviewId,
//         message: messageData,
//       });

//       setMessages((prev) => [...prev, messageData]);
//       setNewMessage("");
//     },
//     [newMessage, user._id, interviewId]
//   );

//   const handleCodeChange = useCallback(
//     (newCode) => {
//       setCode(newCode);
//       webrtcService.socket?.emit("code-update", {
//         roomId: interviewId,
//         code: newCode,
//         language,
//       });
//     },
//     [interviewId, language]
//   );

//   const handleLeaveInterview = useCallback(async () => {
//     try {
//       // await apipost(`localhost:5000/api/interviews/${interviewId}/leave`);
//       await
//       api.post(`/interviews/${interviewId}/leave`);
//       if (webrtcService) {
//         webrtcService.cleanup();
//       }
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Error leaving interview:", error);
//       toast.error(error.response?.data?.message || "Failed to leave interview");
//     }
//   }, [interviewId, navigate]);

//   const handleQuestionClick = (question) => {
//     setSelectedQuestion(question);
//     setCode(question.starterCode);
//     setLanguage("javascript"); // Update this if the language is different
//   };

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-700">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-0 flex flex-col">
//       <div className="flex flex-1 w-full">
//         <div className="w-1/4 space-y-4">
//           {/* Questions Section */}
//           <div className="bg-white p-4 rounded-xl shadow-lg overflow-y-auto max-h-full">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//               Interview Questions
//             </h2>
//             <ul className="list-disc list-inside text-gray-700 space-y-2">
//               {codingQuestions.map((question, index) => (
//                 <li
//                   key={index}
//                   onClick={() => handleQuestionClick(question)}
//                   className="cursor-pointer hover:bg-gray-200 p-2 rounded"
//                 >
//                   {question.title}
//                 </li>
//               ))}
//             </ul>
//             {selectedQuestion && (
//               <div className="mt-4 p-4 bg-gray-100 rounded-lg">
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                   {selectedQuestion.title} ({selectedQuestion.difficulty})
//                 </h3>
//                 <p className="text-gray-700 mb-4">
//                   {selectedQuestion.description}
//                 </p>
//                 <h4 className="text-lg font-semibold text-gray-800">
//                   Examples:
//                 </h4>
//                 <ul className="list-disc list-inside text-gray-700 space-y-2">
//                   {selectedQuestion.examples.map((example, index) => (
//                     <li key={index}>
//                       <strong>Input:</strong> {example.input}
//                       <br />
//                       <strong>Output:</strong> {example.output}
//                       <br />
//                       <strong>Explanation:</strong> {example.explanation}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 flex flex-col items-center space-y-4">
//           {/* Code Editor */}
//           <div className="w-full h-[90vh] bg-white rounded-xl shadow-lg p-4">
//             <CodeEditor
//               value={code}
//               onChange={handleCodeChange}
//               language={language}
//             />
//           </div>
//         </div>

//         <div className="w-1/6 space-y-4">
//           {/* Video Section */}
//           <div className="flex flex-col space-y-4">
//             {[localVideoRef, remoteVideoRef].map((ref, idx) => (
//               <div
//                 key={idx}
//                 className="relative w-full h-32 rounded-xl shadow-md bg-black flex items-center justify-center overflow-hidden"
//               >
//                 <video
//                   ref={ref}
//                   autoPlay
//                   muted={idx === 0}
//                   className="w-full h-full object-cover"
//                 />
//                 {!ref.current?.srcObject && (
//                   <div className="absolute text-white opacity-70">
//                     <User size={48} />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="flex justify-center gap-4 mt-2 mb-2">
//         {[
//           [toggleAudio, isMuted ? <MicOff /> : <Mic />],
//           [toggleVideo, isVideoOff ? <VideoOff /> : <Video />],
//           [toggleScreenShare, <Monitor />],
//           [() => setIsChatOpen((prev) => !prev), <MessageSquare />],
//           [handleLeaveInterview, <X />],
//         ].map(([onClick, icon], idx) => (
//           <button
//             key={idx}
//             onClick={onClick}
//             className={`p-3 rounded-full shadow-md transition duration-200 ${
//               idx === 4
//                 ? "bg-red-500 text-white hover:bg-red-600"
//                 : "bg-white text-gray-700 hover:bg-gray-100"
//             }`}
//           >
//             {icon}
//           </button>
//         ))}
//       </div>

//       {/* Chat Popup */}
//       {isChatOpen && (
//         <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-xl p-4 flex flex-col z-50 border border-gray-200">
//           <div className="flex-1 overflow-y-auto border-b pb-2 mb-2">
//             {messages.map((msg, idx) => (
//               <div key={idx} className="text-sm mb-1">
//                 <span className="font-semibold text-gray-800">
//                   {msg.sender}
//                 </span>
//                 : {msg.content}
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//           <form onSubmit={sendMessage} className="flex mt-2">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
//               placeholder="Type a message"
//             />
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
//             >
//               <Send size={16} />
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InterviewPage;
