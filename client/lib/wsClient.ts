import { WSEvent } from '../types/events';

type WSCallback = (payload: any) => void;

class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<WSCallback>> = new Map();
  private messageQueue: string[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      this.emit('CONNECTED', null);
      
      // Flush queue
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) this.ws?.send(msg);
      }

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const { event: eventName, payload } = JSON.parse(event.data);
        this.emit(eventName, payload);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket, reconnecting...');
      this.emit('DISCONNECTED', null);
      this.reconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  private emit(eventName: string, payload: any) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => callback(payload));
    }
  }

  private reconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      this.reconnectTimeout = null;
    }, 3000);
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(event: string, payload: any = {}) {
    const message = JSON.stringify({ event, payload });
    
    if (this.isConnected()) {
      this.ws?.send(message);
    } else {
      // If still connecting, queue the message
      this.messageQueue.push(message);
      if (!this.ws || this.ws.readyState !== WebSocket.CONNECTING) {
        this.connect();
      }
    }
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

const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3021';
const wsClient = typeof window !== 'undefined' ? new WSClient(wsUrl) : null;

export default wsClient;
