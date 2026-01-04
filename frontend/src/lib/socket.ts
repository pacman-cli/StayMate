import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

// Socket configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/ws`
    : 'http://localhost:8080/ws';

class SocketService {
    private client: Client | null = null;
    private connected: boolean = false;
    private subscriptions: Map<string, StompSubscription> = new Map();

    connect(userId: number, onMessageReceived: (message: any) => void) {
        if (this.client && this.client.active) {
            return;
        }

        const token = Cookies.get('accessToken');

        if (!token) {
            console.error('WebSocket connection failed: No access token found');
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected to WebSocket');
            this.connected = true;

            // Subscribe to user-specific queue
            // The backend broadcasts to /user/{userId}/queue/messages
            // STOMP client automatically handles the /user prefix mapping if configured correctly
            // But typically we subscribe to /user/queue/messages and the broker maps it 
            // based on the authenticated user session.

            this.subscribe('/user/queue/messages', onMessageReceived);
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    subscribe(destination: string, callback: (message: any) => void) {
        if (!this.client || !this.connected) return;

        if (this.subscriptions.has(destination)) {
            return;
        }

        const subscription = this.client.subscribe(destination, (message) => {
            if (message.body) {
                callback(JSON.parse(message.body));
            }
        });

        this.subscriptions.set(destination, subscription);
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
            this.subscriptions.clear();
            console.log('Disconnected from WebSocket');
        }
    }

    sendMessage(destination: string, body: any) {
        if (this.client && this.connected) {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
            });
        } else {
            console.warn('Cannot send message: WebSocket is not connected');
        }
    }
}

export const socketService = new SocketService();
