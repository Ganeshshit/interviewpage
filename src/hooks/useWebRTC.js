if (!webrtcService || typeof webrtcService !== 'object') {
  throw new Error('Invalid WebRTC service instance');
}

import { io } from 'socket.io-client';
import webrtcService from '../services/webrtc';
import { webrtcAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const useWebRTC = (localVideoRef, remoteVideoRef, roomId, user) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [error, setError] = useState(null);

    const handleError = useCallback((error) => {
        console.error('WebRTC Error:', error);
        setError(error.message);
        toast.error(error.message);
    }, []);

    const initializeConnection = useCallback(async () => {
        try {
            setConnectionStatus('connecting');
            
            // Initialize WebRTC
            await webrtcService.initializePeerConnection();
            
            // Start local stream
            const stream = await webrtcService.startLocalStream();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Set up socket connection
            const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
                auth: {
                    token: localStorage.getItem('token'),
                    userId: user._id
                }
            });

            // Join room
            socket.emit('join-interview', {
                roomId,
                role: user.role
            });

            // Handle remote stream
            webrtcService.onRemoteStream = (stream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                    setIsConnected(true);
                    setConnectionStatus('connected');
                }
            };

            // Handle WebRTC events
            socket.on('user-joined', async () => {
                try {
                    const offer = await webrtcService.createOffer();
                    await webrtcAPI.sendOffer(roomId, offer);
                } catch (error) {
                    handleError(error);
                }
            });

            socket.on('offer', async ({ offer }) => {
                try {
                    const answer = await webrtcService.handleOffer(offer);
                    await webrtcAPI.sendAnswer(roomId, answer);
                } catch (error) {
                    handleError(error);
                }
            });

            socket.on('answer', async ({ answer }) => {
                try {
                    await webrtcService.handleAnswer(answer);
                } catch (error) {
                    handleError(error);
                }
            });

            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await webrtcService.handleIceCandidate(candidate);
                } catch (error) {
                    handleError(error);
                }
            });

            socket.on('user-left', () => {
                setIsConnected(false);
                setConnectionStatus('disconnected');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }
                toast.info('Other participant left the interview');
            });

            return socket;
        } catch (error) {
            handleError(error);
            setConnectionStatus('failed');
            return null;
        }
    }, [roomId, user, localVideoRef, remoteVideoRef, handleError]);

    const toggleAudio = useCallback(() => {
        const isEnabled = webrtcService.toggleAudio();
        setIsMuted(!isEnabled);
    }, []);

    const toggleVideo = useCallback(() => {
        const isEnabled = webrtcService.toggleVideo();
        setIsVideoOff(!isEnabled);
    }, []);

    const toggleScreenShare = useCallback(async () => {
        try {
            if (!isScreenSharing) {
                await webrtcService.startScreenShare();
                setIsScreenSharing(true);
            } else {
                await webrtcService.stopScreenShare();
                setIsScreenSharing(false);
            }
        } catch (error) {
            handleError(error);
        }
    }, [isScreenSharing, handleError]);

    useEffect(() => {
        let socket = null;

        const initialize = async () => {
            socket = await initializeConnection();
        };

        initialize();

        return () => {
            if (socket) {
                socket.disconnect();
            }
            webrtcService.stopCall();
        };
    }, [initializeConnection]);

    return {
        isConnected,
        isMuted,
        isVideoOff,
        isScreenSharing,
        connectionStatus,
        error,
        toggleAudio,
        toggleVideo,
        toggleScreenShare
    };
};

export default useWebRTC; 