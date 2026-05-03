import { io, Socket } from 'socket.io-client';

type WSCallback = (payload: any) => void;

class WSClient {
  private socket: Socket | null = null;
  private url: string;
  private listeners: Map<string, Set<WSCallback>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket (Socket.IO)');
      this.emit('CONNECTED', null);
    });

    this.socket.on('message', (data: string) => {
      try {
        const { event: eventName, payload } = JSON.parse(data);
        this.emit(eventName, payload);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket (Socket.IO)');
      this.emit('DISCONNECTED', null);
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err);
    });
  }

  private emit(eventName: string, payload: any) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => callback(payload));
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  send(event: string, payload: any = {}) {
    const message = JSON.stringify({ event, payload });
    
    if (!this.socket) {
      this.connect();
    }
    
    // Socket.IO automatically buffers messages when disconnected
    this.socket?.emit('message', message);
  }

  on(event: string, callback: WSCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: WSCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }
}

// Convert ws:// to http:// if needed, or just use the provided URL.
// Socket.IO supports both ws:// and http:// formats.
const wsUrl = process.env.NEXT_PUBLIC_WS_URL 
  ? process.env.NEXT_PUBLIC_WS_URL.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:') 
  : 'http://localhost:3021';

const wsClient = typeof window !== 'undefined' ? new WSClient(wsUrl) : null;

export default wsClient;
