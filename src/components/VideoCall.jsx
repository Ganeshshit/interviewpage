import React, { useEffect, useRef, useState } from 'react';
import { webrtcService } from '../services/webrtc';
import { toast } from 'react-hot-toast';
import { Video, Mic, MicOff, VideoOff, Monitor, X, User, AlertCircle } from 'lucide-react';

const VideoCall = ({ roomId, userId, role, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);

  // Function to detect browser
  const getBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('firefox') > -1) return 'firefox';
    if (userAgent.indexOf('chrome') > -1) return 'chrome';
    return 'other';
  };

  // Function to check available devices
  const checkMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('Available devices:', {
        video: videoDevices.map(d => ({ label: d.label, id: d.deviceId })),
        audio: audioDevices.map(d => ({ label: d.label, id: d.deviceId }))
      });

      return {
        hasVideo: videoDevices.length > 0,
        hasAudio: audioDevices.length > 0,
        videoDevices,
        audioDevices
      };
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return { hasVideo: true, hasAudio: true }; // Assume devices exist if enumeration fails
    }
  };

  // Function to get video constraints based on browser and available devices
  const getVideoConstraints = async () => {
    const browser = getBrowser();
    console.log('Browser detected:', browser);

    const devices = await checkMediaDevices();
    console.log('Media devices check:', devices);

    // Firefox-specific adjustments
    if (browser === 'firefox') {
      // Try to get the first video device ID if available
      const videoDeviceId = devices.videoDevices?.[0]?.deviceId;
      
      return {
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true }
        },
        video: {
          ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {}),
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          frameRate: { ideal: 24 }
        }
      };
    }

    // Default constraints for other browsers
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
  };

  // Validate props
  useEffect(() => {
    console.log('VideoCall props:', { roomId, userId, role });
    if (!roomId || !userId || !role) {
      const missing = [];
      if (!roomId) missing.push('roomId');
      if (!userId) missing.push('userId');
      if (!role) missing.push('role');
      const error = `Missing required props: ${missing.join(', ')}`;
      console.error(error);
      setError(error);
      return;
    }
    setError(null);
  }, [roomId, userId, role]);

  // Initialize video
  useEffect(() => {
    if (error) return;

    async function initVideo() {
      try {
        console.log('Initializing video with:', { roomId, userId, role });
        
        // First try: Get camera access with browser-specific constraints
        const constraints = await getVideoConstraints();
        console.log('Using constraints:', constraints);

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaError) {
          console.error('Error with initial constraints:', mediaError);
          
          // Second try: Minimal constraints with exact device
          console.log('Retrying with minimal constraints and device selection...');
          const devices = await checkMediaDevices();
          const videoDeviceId = devices.videoDevices?.[0]?.deviceId;
          
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
              audio: true
            });
          } catch (minimalError) {
            console.error('Error with minimal constraints:', minimalError);
            
            // Final try: Absolute minimal
            console.log('Final attempt with basic constraints...');
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
          }
        }

        console.log('Got media stream:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length
        });

        // Log video track capabilities
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          console.log('Video track settings:', videoTrack.getSettings());
          console.log('Video track constraints:', videoTrack.getConstraints());
          console.log('Video track capabilities:', videoTrack.getCapabilities());
        }

        // Set stream to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // Mute local video to prevent echo
          
          try {
            await localVideoRef.current.play();
            console.log('Local video element is playing');
          } catch (playError) {
            console.error('Error playing video:', playError);
            // Add autoplay and playsinline attributes as fallback
            localVideoRef.current.setAttribute('autoplay', '');
            localVideoRef.current.setAttribute('playsinline', '');
          }
        } else {
          console.error('No local video element found');
        }

        // Save stream
        setLocalStream(stream);

        // Initialize WebRTC
        if (roomId && userId && role) {
          await webrtcService.initialize(roomId, userId, role);
          webrtcService.setLocalStream(stream);
          setIsInitialized(true);
          console.log('WebRTC initialized successfully');
        }
      } catch (error) {
        console.error('Video initialization error:', error);
        setError(error.message);
        toast.error('Failed to access camera. Please check your camera permissions and make sure no other application is using the camera.');
      }
    }

    initVideo();

    // Cleanup
    return () => {
      if (localStream) {
        console.log('Cleaning up video call');
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      webrtcService.cleanup();
    };
  }, [roomId, userId, role, error]);

  // Handle remote stream
  useEffect(() => {
    if (!isInitialized) return;

    webrtcService.onStream((stream) => {
      if (stream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setRemoteStream(stream);
      }
    });
  }, [isInitialized]);

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
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/50">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            <>
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
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/50">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                    <p className="text-indigo-400">Initializing camera...</p>
                  </div>
                </div>
              )}
            </>
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