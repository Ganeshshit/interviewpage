import React, { useEffect, useRef, useState } from 'react';
import { webrtcService } from '../services/webrtc';
import { toast } from 'react-hot-toast';
import { Video, Mic, MicOff, VideoOff, Monitor, X, User } from 'lucide-react';

const VideoCall = ({ roomId, userId, role, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  // Initialize local video stream
  useEffect(() => {
    let mounted = true;

    const initializeLocalVideo = async () => {
      try {
        if (!roomId || !userId || !role) {
          console.log('Waiting for required parameters...');
          return;
        }

        // Get local media stream first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        });

        // Check if component is still mounted
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        console.log('Local stream obtained:', stream.getVideoTracks().length > 0 ? 'with video' : 'audio only');

        // Set local stream
        setLocalStream(stream);
        
        // Ensure video element exists and set stream
        if (localVideoRef.current) {
          console.log('Setting stream to video element');
          localVideoRef.current.srcObject = stream;
          
          // Set video element properties
          localVideoRef.current.muted = true;
          localVideoRef.current.playsInline = true;
          localVideoRef.current.autoplay = true;
          
          // Force play the video with retry
          const playVideo = async () => {
            try {
              await localVideoRef.current.play();
              console.log('Video playing successfully');
            } catch (error) {
              console.error('Error playing video:', error);
              // Retry after a short delay
              setTimeout(playVideo, 1000);
            }
          };
          
          playVideo();
        }

        // Initialize WebRTC service with the local stream
        await webrtcService.initialize(roomId, userId, role);
        webrtcService.setLocalStream(stream);

        // Set up event handlers
        webrtcService.onStream((remoteStream) => {
          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteStream(remoteStream);
          }
        });

        if (mounted) {
          setIsInitialized(true);
          console.log('Local video initialized successfully');
        }

      } catch (error) {
        console.error('Error initializing local video:', error);
        toast.error('Failed to initialize video');
      }
    };

    initializeLocalVideo();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      webrtcService.cleanup();
    };
  }, [roomId, userId, role]);

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="flex flex-col h-full bg-indigo-900/10 backdrop-blur-lg rounded-xl overflow-hidden border border-indigo-500/20">
      <div className="flex-1 grid grid-cols-1 gap-4 p-4">
        {/* Local Video */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video for self-view
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/50">
              <VideoOff className="w-12 h-12 text-indigo-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex space-x-2">
            <button 
              onClick={toggleMute}
              className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-indigo-700'}`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-indigo-700'}`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/50">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                <p className="text-indigo-400">Waiting for {role === 'interviewer' ? 'candidate' : 'interviewer'} to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 