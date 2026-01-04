import { Client, IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Notification {
    id: number
    type: string
    title: string
    message: string
    read: boolean
    createdAt: string
}

interface UnreadCountUpdate {
    count: number
}

interface NewMessageNotification {
    conversationId: number
    senderName: string
    preview: string
}

interface UseWebSocketNotificationsOptions {
    userId: number | null
    accessToken: string | null
    onNotification?: (notification: Notification) => void
    onMessage?: (message: NewMessageNotification) => void
    onUnreadCountUpdate?: (count: number) => void
}

export function useWebSocketNotifications({
    userId,
    accessToken,
    onNotification,
    onMessage,
    onUnreadCountUpdate,
}: UseWebSocketNotificationsOptions) {
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const clientRef = useRef<Client | null>(null)

    const connect = useCallback(() => {
        if (!userId || !accessToken) {
            return
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[STOMP]', str)
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        })

        client.onConnect = () => {
            setConnected(true)
            setError(null)
            console.log('[WebSocket] Connected')

            // Subscribe to notifications
            client.subscribe(`/user/${userId}/queue/notifications`, (message: IMessage) => {
                try {
                    const notification: Notification = JSON.parse(message.body)
                    onNotification?.(notification)
                } catch (e) {
                    console.error('[WebSocket] Failed to parse notification:', e)
                }
            })

            // Subscribe to new messages
            client.subscribe(`/user/${userId}/queue/messages`, (message: IMessage) => {
                try {
                    const msg: NewMessageNotification = JSON.parse(message.body)
                    onMessage?.(msg)
                } catch (e) {
                    console.error('[WebSocket] Failed to parse message:', e)
                }
            })

            // Subscribe to unread count updates
            client.subscribe(`/user/${userId}/queue/unread-count`, (message: IMessage) => {
                try {
                    const update: UnreadCountUpdate = JSON.parse(message.body)
                    onUnreadCountUpdate?.(update.count)
                } catch (e) {
                    console.error('[WebSocket] Failed to parse unread count:', e)
                }
            })
        }

        client.onStompError = (frame) => {
            console.error('[WebSocket] STOMP error:', frame.headers['message'])
            setError(frame.headers['message'])
            setConnected(false)
        }

        client.onDisconnect = () => {
            setConnected(false)
            console.log('[WebSocket] Disconnected')
        }

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [userId, accessToken, onNotification, onMessage, onUnreadCountUpdate])

    useEffect(() => {
        const cleanup = connect()
        return () => {
            cleanup?.()
            clientRef.current?.deactivate()
        }
    }, [connect])

    const disconnect = useCallback(() => {
        clientRef.current?.deactivate()
        setConnected(false)
    }, [])

    return {
        connected,
        error,
        disconnect,
    }
}

export default useWebSocketNotifications
