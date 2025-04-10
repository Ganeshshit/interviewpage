// import { io } from 'socket.io-client';

// class WebRTCService {
//   constructor() {
//     this.peerConnection = null;
//     this.localStream = null;
//     this.remoteStream = null;
//     this.screenStream = null;
//     this.roomId = null;
//     this.socket = null;
//     this.isCaller = false;
//     this.iceCandidates = [];
//     this.connectionState = 'disconnected';
//     this.onStreamCallback = null;
//     this.onMessageCallback = null;
//     this.connectionAttempts = 0;
//     this.maxConnectionAttempts = 3;
//     this.connectionTimeout = 5000;
//     this.reconnectTimer = null;
//     this.isConnected = false;
//   }

//   onStream(callback) {
//     this.onStreamCallback = callback;
//   }

//   onMessage(callback) {
//     this.onMessageCallback = callback;
//   }

//   async initialize(roomId,userId,role, isCaller = false) {
//     try {
//       this.userId = userId;
//       this.role = role;
//       this.roomId = roomId;
//       this.isCaller = isCaller;
//       this.connectionAttempts = 0;
//       this.isConnected = false;

//       // Initialize socket connection with proper configuration
//       this.socket = io('http://localhost:5000', {
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         timeout: this.connectionTimeout,
//         forceNew: true,
//         autoConnect: true,
//         withCredentials: true,
//         path: '/socket.io',
//         query: {
//           roomId: this.roomId,
//           userId:this.userId,
//           role: this.role
//         }
//       });

//       // Initialize peer connection with proper configuration
//       this.peerConnection = new RTCPeerConnection({
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//         ]
//       });

//       // Set up event listeners
//       this.peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           this.socket.emit('ice-candidate', {
//             roomId: this.roomId,
//             candidate: event.candidate
//           });
//         }
//       };

//       this.peerConnection.ontrack = (event) => {
//         if (this.remoteStream) {
//           event.streams[0].getTracks().forEach(track => {
//             this.remoteStream.addTrack(track);
//           });
//         } else {
//           this.remoteStream = event.streams[0];
//         }
//         if (this.onStreamCallback) {
//           this.onStreamCallback(this.remoteStream);
//         }
//       };

//       this.peerConnection.onconnectionstatechange = () => {
//         this.connectionState = this.peerConnection.connectionState;
//         console.log('Connection state changed:', this.connectionState);
//       };

//       // Set up socket event listeners
//       this.socket.on('connect', () => {
//         console.log('Socket connected');
//         this.connectionAttempts = 0;
//         this.isConnected = true;
//         if (this.reconnectTimer) {
//           clearTimeout(this.reconnectTimer);
//           this.reconnectTimer = null;
//         }
//       });

//       this.socket.on('connection-confirmed', (data) => {
//         console.log('Connection confirmed:', data);
//         this.isConnected = true;
//       });

//       this.socket.on('disconnect', () => {
//         console.log('Socket disconnected');
//         this.isConnected = false;
//         if (this.connectionAttempts < this.maxConnectionAttempts) {
//           this.connectionAttempts++;
//           console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.maxConnectionAttempts})...`);
//           this.reconnectTimer = setTimeout(() => {
//             this.socket.connect();
//           }, 1000);
//         }
//       });

//       this.socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//         this.isConnected = false;
//         if (this.connectionAttempts < this.maxConnectionAttempts) {
//           this.connectionAttempts++;
//           console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.maxConnectionAttempts})...`);
//           this.reconnectTimer = setTimeout(() => {
//             this.socket.connect();
//           }, 1000);
//         }
//       });

//       this.socket.on('error', (error) => {
//         console.error('Socket error:', error);
//         this.isConnected = false;
//       });

//       this.socket.on('offer', async (data) => {
//         try {
//           await this.handleOffer(data.offer);
//         } catch (error) {
//           console.error('Error handling offer:', error);
//         }
//       });

//       this.socket.on('answer', async (data) => {
//         try {
//           await this.handleAnswer(data.answer);
//         } catch (error) {
//           console.error('Error handling answer:', error);
//         }
//       });

//       this.socket.on('ice-candidate', async (data) => {
//         try {
//           await this.handleIceCandidate(data.candidate);
//         } catch (error) {
//           console.error('Error handling ICE candidate:', error);
//         }
//       });

//       this.socket.on('screen-share-started', () => {
//         console.log('Other peer started screen sharing');
//       });

//       this.socket.on('screen-share-ended', () => {
//         console.log('Other peer stopped screen sharing');
//       });

//       this.socket.on('chat-message', (message) => {
//         if (this.onMessageCallback) {
//           this.onMessageCallback(message);
//         }
//       });

//       // Wait for socket connection
//       await new Promise((resolve, reject) => {
//         const timeout = setTimeout(() => {
//           if (!this.isConnected) {
//             reject(new Error('Socket connection timeout'));
//           }
//         }, this.connectionTimeout);

//         if (this.socket.connected) {
//           clearTimeout(timeout);
//           resolve();
//         } else {
//           this.socket.on('connect', () => {
//             clearTimeout(timeout);
//             resolve();
//           });

//           this.socket.on('connect_error', (error) => {
//             clearTimeout(timeout);
//             reject(error);
//           });
//         }
//       });

//     } catch (error) {
//       console.error('Error initializing WebRTC service:', error);
//       throw error;
//     }
//   }

//   async startCall() {
//     try {
//       // Get local media stream
//       this.localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true
//       });

//       // Add local tracks to peer connection
//       this.localStream.getTracks().forEach(track => {
//         this.peerConnection.addTrack(track, this.localStream);
//       });

//       // Create and set local description
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);

//       // Send offer to other peer
//       this.socket.emit('offer', {
//         roomId: this.roomId,
//         offer: offer
//       });

//       return this.localStream;
//     } catch (error) {
//       console.error('Error starting call:', error);
//       throw error;
//     }
//   }

//   // async handleOffer(offer) {
//   //   try {
//   //     if (this.peerConnection.signalingState !== 'stable') {
//   //       console.log('Signaling state is not stable, waiting...');
//   //       await Promise.all([
//   //         this.peerConnection.setLocalDescription({ type: 'rollback' }),
//   //         this.peerConnection.setRemoteDescription(offer)
//   //       ]);
//   //     } else {
//   //       await this.peerConnection.setRemoteDescription(offer);
//   //     }

//   //     // Create and set local description
//   //     const answer = await this.peerConnection.createAnswer();
//   //     await this.peerConnection.setLocalDescription(answer);

//   //     // Send answer to other peer
//   //     this.socket.emit('answer', {
//   //       roomId: this.roomId,
//   //       answer: answer
//   //     });
//   //   } catch (error) {
//   //     console.error('Error handling offer:', error);
//   //     throw error;
//   //   }
//   // }
//   async handleOffer(offer) {
//     try {
//       const parsedOffer = typeof offer === 'string' ? JSON.parse(offer) : offer;

//       if (!parsedOffer || !parsedOffer.sdp || !parsedOffer.type) {
//         throw new Error('Invalid offer received');
//       }

//       if (this.peerConnection.signalingState !== 'stable') {
//         await Promise.all([
//           this.peerConnection.setLocalDescription({ type: 'rollback' }),
//           this.peerConnection.setRemoteDescription(new RTCSessionDescription(parsedOffer))
//         ]);
//       } else {
//         await this.peerConnection.setRemoteDescription(new RTCSessionDescription(parsedOffer));
//       }

//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);

//       this.socket.emit('answer', {
//         roomId: this.roomId,
//         answer: answer
//       });
//     } catch (error) {
//       console.error('Error handling offer:', error);
//       throw error;
//     }
//   }
//   async handleAnswer(answer) {
//     try {
//       if (this.peerConnection.signalingState !== 'stable') {
//         console.log('Signaling state is not stable, waiting...');
//         await Promise.all([
//           this.peerConnection.setLocalDescription({ type: 'rollback' }),
//           this.peerConnection.setRemoteDescription(answer)
//         ]);
//       } else {
//         await this.peerConnection.setRemoteDescription(answer);
//       }
//     } catch (error) {
//       console.error('Error handling answer:', error);
//       throw error;
//     }
//   }

//   async handleIceCandidate(candidate) {
//     try {
//       if (candidate && candidate.candidate) {
//         await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//       } else {
//         console.warn("Invalid ICE candidate received:", candidate);
//       }
//     } catch (error) {
//       console.error("Error handling ICE candidate:", error);
//     }
//   }


//   async startScreenShare() {
//     try {
//       this.screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true
//       });

//       // Add screen share tracks to peer connection
//       this.screenStream.getTracks().forEach(track => {
//         this.peerConnection.addTrack(track, this.screenStream);
//       });

//       // Notify other peer about screen share
//       this.socket.emit('screen-share-started', {
//         roomId: this.roomId
//       });

//       return this.screenStream;
//     } catch (error) {
//       console.error('Error starting screen share:', error);
//       throw error;
//     }
//   }

//   async stopScreenShare() {
//     try {
//       if (this.screenStream) {
//         this.screenStream.getTracks().forEach(track => track.stop());
//         this.screenStream = null;

//         // Notify other peer about screen share end
//         this.socket.emit('screen-share-ended', {
//           roomId: this.roomId
//         });
//       }
//     } catch (error) {
//       console.error('Error stopping screen share:', error);
//       throw error;
//     }
//   }

//   toggleAudio() {
//     if (this.localStream) {
//       const audioTrack = this.localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         return audioTrack.enabled;
//       }
//     }
//     return false;
//   }

//   toggleVideo() {
//     if (this.localStream) {
//       const videoTrack = this.localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         return videoTrack.enabled;
//       }
//     }
//     return false;
//   }

//   getLocalStream() {
//     return this.localStream;
//   }

//   cleanup() {
//     if (this.reconnectTimer) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer = null;
//     }
//     if (this.localStream) {
//       this.localStream.getTracks().forEach(track => track.stop());
//     }
//     if (this.screenStream) {
//       this.screenStream.getTracks().forEach(track => track.stop());
//     }
//     if (this.peerConnection) {
//       this.peerConnection.close();
//     }
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//     this.localStream = null;
//     this.remoteStream = null;
//     this.screenStream = null;
//     this.peerConnection = null;
//     this.socket = null;
//     this.connectionState = 'disconnected';
//     this.onStreamCallback = null;
//     this.onMessageCallback = null;
//     this.isConnected = false;
//   }
// }

// // Create and export a single instance
// const webrtcService = new WebRTCService();
// export default webrtcService; 

// WebRTCService.js
import { io } from 'socket.io-client';

class WebRTCService {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = new MediaStream();
    this.screenStream = null;
    this.roomId = null;
    this.userId = null;
    this.role = null;
    this.socket = null;
    this.isCaller = false;
    this.connectionState = 'disconnected';
    this.onStreamCallback = null;
    this.onMessageCallback = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.connectionTimeout = 5000;
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  onStream(callback) {
    this.onStreamCallback = callback;
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  async initialize(roomId, userId, role, isCaller = false) {
    this.resetState();
    this.roomId = roomId;
    this.userId = userId;
    this.role = role;
    this.isCaller = isCaller;

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxConnectionAttempts,
      reconnectionDelay: 1000,
      timeout: this.connectionTimeout,
      autoConnect: true,
      path: '/socket.io',
      query: { roomId, userId, role },
      timeout: 20000,
    });

    this.setupSocketListeners();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers in production
      ]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateData = {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        };

        this.socket.emit("ice-candidate", {
          roomId: this.roomId,
          candidate: candidateData
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      this.onStreamCallback?.(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection.connectionState;
      console.log('Connection state:', this.connectionState);
    };

    await this.waitForSocketConnection();
  } async initialize(roomId, userId, role, isCaller = false) {
    this.resetState();
    this.roomId = roomId;
    this.userId = userId;
    this.role = role;
    this.isCaller = isCaller;

    // Initialize the socket connection
    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxConnectionAttempts,
      reconnectionDelay: 1000,
      timeout: this.connectionTimeout,
      autoConnect: true,
      path: '/socket.io',
      query: { roomId, userId, role },
      timeout: 30000,
    });

    this.setupSocketListeners();

    // Ensure the socket is connected before proceeding with peer connection
    await this.waitForSocketConnection();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers in production
      ]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateData = {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        };

        this.socket.emit("ice-candidate", {
          roomId: this.roomId,
          candidate: candidateData
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      this.onStreamCallback?.(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection.connectionState;
      console.log('Connection state:', this.connectionState);
    };
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      clearTimeout(this.reconnectTimer);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.reconnectTimer = setTimeout(() => this.socket.connect(), 1000);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    this.socket.on('offer', (offer) => this.handleOffer(offer));
    this.socket.on('answer', (answer) => this.handleAnswer(answer));

    this.socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (
          !candidate ||
          typeof candidate !== "object" ||
          !candidate.candidate ||
          candidate.sdpMid === undefined ||
          candidate.sdpMLineIndex === undefined
        ) return;

        const iceCandidate = new RTCIceCandidate(candidate);
        await this.peerConnection.addIceCandidate(iceCandidate);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    this.socket.on('chat-message', (msg) => this.onMessageCallback?.(msg));
    this.socket.on('screen-share-started', () => console.log('Screen share started'));
    this.socket.on('screen-share-ended', () => console.log('Screen share ended'));
  }

  waitForSocketConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), this.connectionTimeout);
      if (this.socket.connected) return resolve();
      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
      this.socket.once('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async startCall() {
    try {
      // Handle the case where a remote offer already exists
      if (this.peerConnection.signalingState === 'have-remote-offer') {
        console.warn("Peer connection already has a remote offer. Answering the offer...");
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send the answer to the remote peer
        this.socket.emit('answer', {
          roomId: this.roomId,
          answer: this.peerConnection.localDescription,
        });
        return; // Exit since we've sent an answer
      }

      // Ensure signaling state is stable before creating an offer
      if (this.peerConnection.signalingState !== "stable") {
        console.warn("Signaling state is not stable. Waiting for stability...");
        await new Promise((resolve) => {
          const onSignalingStateChange = () => {
            if (this.peerConnection.signalingState === "stable") {
              this.peerConnection.removeEventListener('signalingstatechange', onSignalingStateChange);
              resolve();
            }
          };
          this.peerConnection.addEventListener('signalingstatechange', onSignalingStateChange);
        });
      }

      // Get user media for the call
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create and set the local offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Emit the offer to the remote peer via WebSocket
      this.socket.emit('offer', {
        roomId: this.roomId,
        offer: this.peerConnection.localDescription,
      });

      return this.localStream;
    } catch (err) {
      console.error("Error starting call:", err);

      // Handle socket timeout error specifically
      if (err.message.includes("Socket connection timeout")) {
        console.error("The WebSocket connection timed out. Please check your network or signaling server.");
      }

      throw err;
    }
  }
  async handleOffer(offer) {
    try {
      if (this.peerConnection.signalingState !== "stable") {
        await this.peerConnection.setLocalDescription({ type: "rollback" });
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit("answer", {
        roomId: this.roomId,
        answer: this.peerConnection.localDescription,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  async handleAnswer(answer) {
    try {
      if (this.peerConnection.signalingState !== "have-local-offer") return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
      if (sender) await sender.replaceTrack(videoTrack);

      this.screenStream = screenStream;
      this.socket.emit('screen-share-started', { roomId: this.roomId });
      return screenStream;
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  }

  async stopScreenShare() {
    try {
      if (!this.screenStream) return;
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
      if (sender && videoTrack) await sender.replaceTrack(videoTrack);

      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
      this.socket.emit('screen-share-ended', { roomId: this.roomId });
    } catch (error) {
      console.error('Stop screen share error:', error);
    }
  }

  toggleAudio() {
    const track = this.localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
    return false;
  }

  toggleVideo() {
    const track = this.localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
    return false;
  }

  getLocalStream() {
    return this.localStream;
  }

  cleanup() {
    clearTimeout(this.reconnectTimer);
    this.localStream?.getTracks().forEach(t => t.stop());
    this.screenStream?.getTracks().forEach(t => t.stop());
    this.peerConnection?.close();
    this.socket?.disconnect();
    this.resetState();
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;

