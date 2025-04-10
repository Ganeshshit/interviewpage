// import { io } from 'socket.io-client';

// class SocketService {
//     constructor() {
//         this.socket = null;
//         this.callbacks = new Map();
//     }

//     connect(userId, role) {
//         this.socket = io(process.env.BACKEND_URL || 'http://localhost:3000');

//         this.socket.emit('joinRoom', { userId, role });

//         // Set up default event listeners
//         this.setupEventListeners();

//         return this.socket;
//     }

//     setupEventListeners() {
//         // Interview events
//         this.socket.on('interviewScheduled', (data) => {
//             this.executeCallback('interviewScheduled', data);
//         });

//         this.socket.on('interviewCancelled', (data) => {
//             this.executeCallback('interviewCancelled', data);
//         });

//         this.socket.on('interviewUpdated', (data) => {
//             this.executeCallback('interviewUpdated', data);
//         });

//         // Participant events
//         this.socket.on('candidateJoined', (data) => {
//             this.executeCallback('candidateJoined', data);
//         });

//         this.socket.on('candidateLeft', (data) => {
//             this.executeCallback('candidateLeft', data);
//         });

//         this.socket.on('interviewerJoined', (data) => {
//             this.executeCallback('interviewerJoined', data);
//         });

//         // Reminder events
//         this.socket.on('interviewReminder', (data) => {
//             this.executeCallback('interviewReminder', data);
//         });
//     }

//     on(event, callback) {
//         this.callbacks.set(event, callback);
//     }

//     executeCallback(event, data) {
//         const callback = this.callbacks.get(event);
//         if (callback) {
//             callback(data);
//         }
//     }

//     emit(event, data) {
//         if (this.socket) {
//             this.socket.emit(event, data);
//         }
//     }

//     disconnect() {
//         if (this.socket) {
//             this.socket.disconnect();
//             this.socket = null;
//         }
//     }
// }

// export const socketService = new SocketService();

// src/services/SocketService.js
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './SOCKET_EVENTS.js';

class SocketService {
    constructor() {
        if (SocketService.instance) return SocketService.instance;
        this.socket = null;
        this.callbacks = new Map();
        SocketService.instance = this;
    }

    connect(userId, role, roomId) {
        if (this.socket && this.socket.connected) {
            console.warn('⚠️ Socket already connected');
            return this.socket;
        }

        // ✅ Extract roomId from pathname
  
        

        if (!roomId || !userId || !role) {
            console.error('❌ Missing URL parameters:', { roomId, userId, role });
            return;
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        this.socket = io(backendUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            query: {
                userId,
                role,
                roomId
            }
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');
            this.socket.emit('joinRoom', { userId, role, roomId });
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('⚠️ Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message);
        });

        this._setupEventListeners();

        return this.socket;
    }

    _setupEventListeners() {
        SOCKET_EVENTS.forEach((event) => {
            this.socket.on(event, (data) => this._executeCallback(event, data));
        });
    }

    on(event, callback) {
        this.callbacks.set(event, callback);
    }

    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn(`⚠️ Cannot emit "${event}", socket not connected`);
        }
    }

    disconnect() {
        if (this.socket) {
            SOCKET_EVENTS.forEach(event => this.socket.off(event));
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.callbacks.clear();
            this.socket = null;
            console.log('👋 Disconnected and cleaned up');
        }
    }

    _executeCallback(event, data) {
        const cb = this.callbacks.get(event);
        if (cb) cb(data);
    }
}

export const socketService = new SocketService();
