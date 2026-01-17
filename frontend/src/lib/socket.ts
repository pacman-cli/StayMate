import { Client, StompSubscription } from '@stomp/stompjs'
import Cookies from 'js-cookie'
import SockJS from 'sockjs-client'

// Socket configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/ws`
    : 'http://localhost:8080/ws'

// Presence update type
export interface PresenceUpdate {
    userId: number
    online: boolean
    timestamp: string
}

class SocketService {
    private client: Client | null = null;
    private connected: boolean = false;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private presenceCallbacks: ((update: PresenceUpdate) => void)[] = [];
    private messageCallbacks: ((message: any) => void)[] = [];

    connect(userId: number, onMessageReceived: (message: any) => void) {
        if (this.client && this.client.active) {
            // Already connected, just add the callback
            if (!this.messageCallbacks.includes(onMessageReceived)) {
                this.messageCallbacks.push(onMessageReceived)
            }
            return
        }

        const token = Cookies.get('accessToken')

        if (!token) {
            console.error('WebSocket connection failed: No access token found')
            return
        }

        this.messageCallbacks = [onMessageReceived]

        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[WS]', str)
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        })

        this.client.onConnect = () => {
            console.log('✅ Connected to WebSocket')
            this.connected = true

            // Subscribe to user-specific message queue
            this.subscribe('/user/queue/messages', (message) => {
                this.messageCallbacks.forEach(cb => cb(message))
            })

            // Subscribe to global presence updates
            this.subscribe('/topic/presence', (update: PresenceUpdate) => {
                console.log('👤 Presence update:', update)
                this.presenceCallbacks.forEach(cb => cb(update))
            })
        }

        this.client.onStompError = (frame) => {
            console.error('❌ STOMP error:', frame.headers['message'])
            console.error('Details:', frame.body)
        }

        this.client.onDisconnect = () => {
            console.log('🔌 Disconnected from WebSocket')
            this.connected = false
        }

        this.client.activate()
    }

    subscribe(destination: string, callback: (data: any) => void) {
        if (!this.client || !this.connected) return

        if (this.subscriptions.has(destination)) {
            return
        }

        const subscription = this.client.subscribe(destination, (message) => {
            if (message.body) {
                callback(JSON.parse(message.body))
            }
        })

        this.subscriptions.set(destination, subscription)
    }

    // Add a presence callback
    onPresenceUpdate(callback: (update: PresenceUpdate) => void) {
        if (!this.presenceCallbacks.includes(callback)) {
            this.presenceCallbacks.push(callback)
        }
    }

    // Remove a presence callback
    offPresenceUpdate(callback: (update: PresenceUpdate) => void) {
        const index = this.presenceCallbacks.indexOf(callback)
        if (index > -1) {
            this.presenceCallbacks.splice(index, 1)
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate()
            this.client = null
            this.connected = false
            this.subscriptions.clear()
            this.presenceCallbacks = []
            this.messageCallbacks = []
            console.log('🔌 Disconnected from WebSocket')
        }
    }

    isConnected(): boolean {
        return this.connected
    }

    sendMessage(destination: string, body: any) {
        if (this.client && this.connected) {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
            })
        } else {
            console.warn('Cannot send message: WebSocket is not connected')
        }
    }
}

export const socketService = new SocketService()
