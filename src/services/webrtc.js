import { io } from 'socket.io-client';

// Custom EventEmitter implementation for browser
class EventEmitter {
  constructor() {
     this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    if (!listener) {
      delete this.events[event];
      return;
    }
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  once(event, listener) {
    const remove = this.on(event, (...args) => {
      remove();
      listener(...args);
    });
  }
}

class WebRTCService extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.screenStream = null;
    this.remoteStream = null;
    this.isInitialized = false;
    this.roomId = null;
    this.userId = null;
    this.role = null;
    this.onStreamCallback = null;
    this.onMessageCallback = null;
    this.onUserJoinedCallback = null;
    this.onUserLeftCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.connectionTimeout = 120000;
    this.connectionPromise = null;
    this.connectionStatus = 'disconnected';
    this.isHost = false;
    this.connected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.reconnectTimeout = null;
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
    this.socketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000';
  }

  async initialize(roomId, userId, role) {
    try {
      if (!roomId || !userId || !role) {
        throw new Error('Missing required parameters for initialization');
      }

      this.roomId = roomId;
      this.userId = userId;
      this.role = role;

      // Get local media stream first
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        });
        console.log('Local stream obtained successfully');
        
        // Ensure video tracks are enabled
        const videoTracks = this.localStream.getVideoTracks();
        videoTracks.forEach(track => {
          track.enabled = true;
          console.log(`Video track enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });
      } catch (error) {
        console.error('Error accessing media devices:', error);
        // Try audio only if video fails
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Falling back to audio only');
      }

      // Initialize socket connection
      await this.initializeSocket();

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          // Ensure track is enabled before adding
          track.enabled = true;
          this.peerConnection.addTrack(track, this.localStream);
          console.log(`Added ${track.kind} track to peer connection, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });
      }

      // Set up event handlers
      this.setupPeerConnectionHandlers();
      this.setupSocketEventHandlers();

      this.isInitialized = true;
      console.log('WebRTC service initialized successfully');

    } catch (error) {
      console.error('Error initializing WebRTC service:', error);
      this.cleanup();
      throw error;
    }
  }

  async joinRoom(roomId, userId, role) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Room join timeout'));
      }, 10000);

      const onRoomJoined = (data) => {
        clearTimeout(timeout);
        this.socket.off('roomError', onRoomError);
        resolve(data);
      };

      const onRoomError = (error) => {
        clearTimeout(timeout);
        this.socket.off('roomJoined', onRoomJoined);
        reject(error);
      };

      this.socket.once('roomJoined', onRoomJoined);
      this.socket.once('roomError', onRoomError);

      // Emit join room event with all required parameters
      this.socket.emit('joinRoom', {
        roomId,
        userId,
        role,
        socketId: this.socket.id
      });
    });
  }

  setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('Connection state changed:', state);
      this.emit('connectionStateChanged', { status: state });
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log('ICE connection state changed:', state);
      if (state === 'failed' || state === 'disconnected') {
        this.emit('error', { 
          type: 'iceConnectionError', 
          error: new Error(`ICE connection ${state}`) 
        });
      }
    };

    // Handle signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log('Signaling state changed:', this.peerConnection.signalingState);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          userId: this.userId
        });
      }
    };

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onStreamCallback) {
          this.onStreamCallback(this.remoteStream);
        }
      }
    };
  }

  setupSocketEventHandlers() {
    if (!this.socket) return;

    // Handle user joined
    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      if (this.onUserJoinedCallback) {
        this.onUserJoinedCallback(data);
      }
    });

    // Handle user left
    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      if (this.onUserLeftCallback) {
        this.onUserLeftCallback(data);
      }
    });

    // Handle offers
    this.socket.on('offer', async (data) => {
      try {
        console.log('Received offer:', data);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', {
          roomId: this.roomId,
          answer,
          userId: this.userId
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        this.emit('error', { type: 'offerError', error });
      }
    });

    // Handle answers
    this.socket.on('answer', async (data) => {
      try {
        console.log('Received answer:', data);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      } catch (error) {
        console.error('Error handling answer:', error);
        this.emit('error', { type: 'answerError', error });
      }
    });

    // Handle ICE candidates
    this.socket.on('ice-candidate', async (data) => {
      try {
        console.log('Received ICE candidate:', data);
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
        this.emit('error', { type: 'iceCandidateError', error });
      }
    });

    // Handle chat messages
    this.socket.on("chat-message", (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.message);
      }
    });

    // Handle code updates
    this.socket.on("code-update", (data) => {
      // This will be handled by the component
    });

    // Handle reconnection
    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    // Handle reconnection attempts
    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Socket reconnection attempt", attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    // Handle reconnection error
    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    // Handle reconnection failed
    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
    });

    // Handle screen share events
    this.socket.on('screen-share-started', (data) => {
      console.log('Screen share started by:', data.userId);
      this.emit('screenShareStarted', data);
    });

    this.socket.on('screen-share-stopped', (data) => {
      console.log('Screen share stopped by:', data.userId);
      this.emit('screenShareStopped', data);
    });
  }

  async createPeerConnection() {
    if (this.peerConnection) {
      console.log("Peer connection already exists, closing it");
      this.peerConnection.close();
      this.peerConnection = null;
    }

    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Set up event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          roomId: this.roomId,
          candidate: event.candidate,
          userId: this.userId,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log("Received remote track");
      if (this.onStreamCallback) {
        this.onStreamCallback(event.streams[0]);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log(
        "Connection state changed:",
        this.peerConnection.connectionState
      );
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state changed:",
        this.peerConnection.iceConnectionState
      );
    };

    this.peerConnection.onsignalingstatechange = () => {
      console.log(
        "Signaling state changed:",
        this.peerConnection.signalingState
      );
    };

    return this.peerConnection;
  }

  async startLocalStream() {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  async startScreenShare() {
    try {
      if (this.screenStream) {
        await this.stopScreenShare();
      }

      // Get screen share stream with proper constraints
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Handle stream ending
      this.screenStream.getVideoTracks()[0].onended = async () => {
        console.log('Screen share ended by user');
        await this.stopScreenShare();
      };

      // Replace video track in peer connection
      if (this.peerConnection) {
        const videoTrack = this.screenStream.getVideoTracks()[0];
        const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
          console.log('Replaced video track with screen share');
        } else {
          this.peerConnection.addTrack(videoTrack, this.screenStream);
          console.log('Added new screen share track');
        }
      }

      // Notify other participants
      this.socket.emit('screen-share-started', {
        roomId: this.roomId,
        userId: this.userId,
        role: this.role
      });

      return this.screenStream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      throw error;
    }
  }

  async stopScreenShare() {
    try {
      if (this.screenStream) {
        // Stop all tracks
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;

        // Restore video track from local stream
        if (this.peerConnection && this.localStream) {
          const videoTrack = this.localStream.getVideoTracks()[0];
          const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
            console.log('Restored local video track');
          }
        }

        // Notify other participants
        this.socket.emit('screen-share-stopped', {
          roomId: this.roomId,
          userId: this.userId,
          role: this.role
        });
      }
    } catch (error) {
      console.error("Error stopping screen share:", error);
      throw error;
    }
  }

  toggleAudio() {
    try {
      if (!this.localStream) {
        console.error('No local stream available');
        return false;
      }
      
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (!audioTrack) {
        console.error('No audio track available');
        return false;
      }

      audioTrack.enabled = !audioTrack.enabled;
      console.log('Audio track enabled:', audioTrack.enabled);
      return audioTrack.enabled;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  }

  toggleVideo() {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;

    const newState = !videoTracks[0].enabled;
    videoTracks.forEach(track => {
      track.enabled = newState;
      console.log(`Video track enabled: ${track.enabled}`);
    });

    return true;
  }

  onStream(callback) {
    this.onStreamCallback = callback;
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onUserJoined(callback) {
    this.onUserJoinedCallback = callback;
  }

  onUserLeft(callback) {
    this.onUserLeftCallback = callback;
  }

  getLocalStream() {
    return this.localStream;
  }

  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.isInitialized = false;
    this.roomId = null;
    this.userId = null;
    this.role = null;
    this.reconnectAttempts = 0;
  }

  async initializeSocket() {
    try {
      if (!this.roomId || !this.userId || !this.role) {
        throw new Error('Missing required parameters for socket initialization');
      }

      // Clean up existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Initialize socket with robust configuration
      this.socket = io(this.socketServerUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        autoConnect: true,
        forceNew: true,
        query: {
          roomId: this.roomId,
          userId: this.userId,
          role: this.role
        }
      });

      // Set up socket event handlers
      this.setupSocketEventHandlers();

      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
          this.connectionStatus = 'disconnected';
          reject(new Error('Socket connection timeout'));
        }, this.connectionTimeout);

        // Handle successful connection
        this.socket.once('connect', () => {
          console.log('Socket connected successfully');
          this.connectionStatus = 'connected';
          this.connected = true;
          this.connectionAttempts = 0;
          this.emit('connectionStateChanged', { status: 'connected' });
          
          // Join room after connection
          this.socket.emit('joinRoom', {
            roomId: this.roomId,
            userId: this.userId,
            role: this.role,
            socketId: this.socket.id
          });
        });

        // Handle room join success
        this.socket.once('roomJoined', (data) => {
          console.log('Successfully joined room:', data);
          clearTimeout(connectionTimeout);
          this.emit('roomJoined', data);
          resolve(true);
        });

        // Handle room join error
        this.socket.once('roomError', (error) => {
          console.error('Room error:', error);
          clearTimeout(connectionTimeout);
          this.emit('error', { type: 'roomError', error });
          reject(error);
        });

        // Handle connection error
        this.socket.once('connect_error', (error) => {
          console.error('Socket connection error:', error);
          clearTimeout(connectionTimeout);
          this.connectionStatus = 'error';
          this.emit('error', { type: 'connectionError', error });
          reject(error);
        });

        // Handle disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.connectionStatus = 'disconnected';
          this.connected = false;
          this.emit('connectionStateChanged', { status: 'disconnected', reason });
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, attempt reconnection
            this.socket.connect();
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.connectionStatus = 'error';
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      throw error;
    }
  }

  setLocalStream(stream) {
    if (!stream) {
      throw new Error('No stream provided');
    }

    // Remove existing tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    this.localStream = stream;

    // Ensure video tracks are enabled
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = true;
      console.log(`Video track enabled: ${track.enabled}, readyState: ${track.readyState}`);
    });

    // Add new tracks to peer connection
    if (this.peerConnection) {
      stream.getTracks().forEach(track => {
        // Ensure track is enabled before adding
        track.enabled = true;
        this.peerConnection.addTrack(track, stream);
        console.log(`Added ${track.kind} track to peer connection, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
    }
  }
}

export const webrtcService = new WebRTCService();