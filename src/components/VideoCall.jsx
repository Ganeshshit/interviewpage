import React, { useEffect, useRef, useState } from 'react';
import webrtcService from '../services/webrtc';
import { webrtcAPI } from '../services/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';

const VideoCall = ({ roomId, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    setupWebRTC();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      webrtcService.stopCall();
    };
  }, []);

  const setupWebRTC = async () => {
    try {
      // Set up callbacks
      webrtcService.onRemoteStream = (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      webrtcService.onMessage = (message) => {
        setMessages(prev => [...prev, message]);
      };

      webrtcService.onIceCandidate = async (candidate) => {
        try {
          await webrtcAPI.sendIceCandidate(roomId, candidate);
        } catch (error) {
          console.error('Error sending ICE candidate:', error);
        }
      };

      // Initialize WebRTC connection
      await webrtcService.initializePeerConnection();
      
      // Start local stream
      const localStream = await webrtcService.startLocalStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Create and send offer
      const offer = await webrtcService.createOffer();
      await webrtcAPI.sendOffer(roomId, offer);

      // Set up signaling listener
      cleanupRef.current = webrtcAPI.listenToSignaling(roomId, {
        onAnswer: async (answer) => {
          await webrtcService.handleAnswer(answer);
        },
        onIceCandidate: async (candidate) => {
          await webrtcService.handleIceCandidate(candidate);
        },
        onUserJoined: (user) => {
          console.log('User joined:', user);
        },
        onUserLeft: (user) => {
          console.log('User left:', user);
        }
      });

    } catch (error) {
      console.error('Error setting up WebRTC:', error);
    }
  };

  const toggleMute = () => {
    if (webrtcService.localStream) {
      const audioTrack = webrtcService.localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (webrtcService.localStream) {
      const videoTrack = webrtcService.localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      webrtcService.sendMessage({
        type: 'chat',
        content: newMessage,
        sender: 'me',
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white text-sm">
              You
            </div>
          </div>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white text-sm">
              Remote User
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
              } text-white`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
              } text-white`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-red-500 text-white"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* Chat */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="h-48 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  message.sender === 'me' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 