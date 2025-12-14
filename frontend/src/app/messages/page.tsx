"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import { messageApi, userSearchApi } from "@/lib/api";
import { socketService } from "@/lib/socket";
import {
    ConversationResponse,
    MessageResponse,
    SendMessageRequest,
    User,
} from "@/types/auth";
import {
    Search,
    Send,
    MoreVertical,
    Phone,
    Video,
    ArrowLeft,
    Check,
    CheckCheck,
    Smile,
    Paperclip,
    Image as ImageIcon,
    Trash2,
    Circle,
    MessageSquare,
    Plus,
    X,
    Loader2,
    Users,
    Home,
    Clock,
    ChevronDown,
    UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { isDark } = useTheme();

    const [conversations, setConversations] = useState<ConversationResponse[]>(
        [],
    );
    const [selectedConversation, setSelectedConversation] =
        useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);

    // New conversation modal state
    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [initialMessage, setInitialMessage] = useState("");
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const response = await messageApi.getConversations(
                0,
                50,
                searchQuery || undefined,
            );
            setConversations(response.conversations);
            setTotalUnread(response.totalUnreadCount);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        }
    }, [searchQuery]);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(
        async (conversationId: number) => {
            try {
                const response = await messageApi.getMessages(
                    conversationId,
                    0,
                    100,
                );
                setMessages(response.messages);
                // Mark as read
                await messageApi.markConversationAsRead(conversationId);
                // Refresh conversations to update unread count
                fetchConversations();
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        },
        [fetchConversations],
    );

    // Initial load
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (isAuthenticated) {
            setIsLoading(true);
            fetchConversations().finally(() => setIsLoading(false));
        }
    }, [authLoading, isAuthenticated, router, fetchConversations]);

    // Handle URL params for direct conversation
    useEffect(() => {
        const conversationId = searchParams.get("conversation");
        if (conversationId && conversations.length > 0) {
            const conv = conversations.find(
                (c) => c.id === parseInt(conversationId),
            );
            if (conv) {
                setSelectedConversation(conv);
                fetchMessages(conv.id);
                setShowMobileChat(true);
            }
        }
    }, [searchParams, conversations, fetchMessages]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (selectedConversation?.id) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation?.id, fetchMessages]);

    // Sync selectedConversation with updated conversations list (for online status)
    useEffect(() => {
        if (selectedConversation && conversations.length > 0) {
            const updatedConv = conversations.find(c => c.id === selectedConversation.id);
            if (updatedConv && (
                updatedConv.otherParticipantOnline !== selectedConversation.otherParticipantOnline ||
                updatedConv.lastMessage !== selectedConversation.lastMessage ||
                updatedConv.lastMessageAt !== selectedConversation.lastMessageAt
            )) {
                setSelectedConversation(updatedConv);
            }
        }
    }, [conversations, selectedConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // WebSocket connection
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            socketService.connect(user.id, (message: MessageResponse) => {
                // Handle new message
                if (selectedConversation && message.conversationId === selectedConversation.id) {
                    setMessages((prev) => [...prev, message]);
                    scrollToBottom();
                    // Mark as read immediately if current conversation is open
                    messageApi.markConversationAsRead(message.conversationId);
                }
                
                // Refresh conversations list to update last message/unread count
                fetchConversations();
            });
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, user, selectedConversation, scrollToBottom, fetchConversations]);

    // User search with debounce
    useEffect(() => {
        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        if (userSearchQuery.trim().length < 2) {
            setUserSearchResults([]);
            return;
        }

        userSearchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingUsers(true);
            try {
                const results =
                    await userSearchApi.searchUsers(userSearchQuery);
                setUserSearchResults(results);
            } catch (error) {
                console.error("Failed to search users:", error);
            } finally {
                setIsSearchingUsers(false);
            }
        }, 300);

        return () => {
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
        };
    }, [userSearchQuery]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || isSending) return;

        setIsSending(true);
        try {
            const request: SendMessageRequest = {
                conversationId: selectedConversation.id,
                content: newMessage.trim(),
            };
            const sentMessage = await messageApi.sendMessage(request);
            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage("");
            scrollToBottom();
            fetchConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Create new conversation
    const handleCreateConversation = async () => {
        if (!selectedUser || !initialMessage.trim() || isCreatingConversation)
            return;

        setIsCreatingConversation(true);
        try {
            const response = await messageApi.createConversation({
                recipientId: selectedUser.id,
                initialMessage: initialMessage.trim(),
            });

            // Close modal and reset
            setShowNewConversationModal(false);
            setSelectedUser(null);
            setUserSearchQuery("");
            setUserSearchResults([]);
            setInitialMessage("");

            // Refresh conversations and select the new one
            await fetchConversations();
            setSelectedConversation(response);
            setShowMobileChat(true);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        } finally {
            setIsCreatingConversation(false);
        }
    };

    // Handle enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 0) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: "short" });
        } else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }
    };

    // Format message time
    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Group messages by date
    const groupMessagesByDate = (msgs: MessageResponse[]) => {
        const groups: { date: string; messages: MessageResponse[] }[] = [];
        let currentDate = "";

        msgs.forEach((msg) => {
            const msgDate = new Date(msg.createdAt).toLocaleDateString();
            if (msgDate !== currentDate) {
                currentDate = msgDate;
                groups.push({ date: msgDate, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        });

        return groups;
    };

    // Get date label
    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
            });
        }
    };

    if (authLoading || isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2
                            className={`w-8 h-8 animate-spin ${isDark ? "text-primary-400" : "text-primary-600"}`}
                        />
                        <p
                            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                            Loading messages...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <DashboardLayout>
            <div
                className={`h-[calc(100vh-120px)] flex rounded-xl overflow-hidden border ${isDark ? "bg-dark-800/50 border-white/10" : "bg-white border-slate-200"}`}
            >
                {/* Conversations Sidebar */}
                <div
                    className={`w-full md:w-96 flex-shrink-0 flex flex-col border-r ${isDark ? "border-white/10" : "border-slate-200"} ${showMobileChat ? "hidden md:flex" : "flex"}`}
                >
                    {/* Sidebar Header */}
                    <div
                        className={`p-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h1
                                className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                            >
                                Messages
                                {totalUnread > 0 && (
                                    <span
                                        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"}`}
                                    >
                                        {totalUnread}
                                    </span>
                                )}
                            </h1>
                            <button
                                onClick={() =>
                                    setShowNewConversationModal(true)
                                }
                                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                                title="New conversation"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search
                                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                            />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
                                    isDark
                                        ? "bg-white/5 text-white placeholder-slate-500 focus:bg-white/10"
                                        : "bg-slate-100 text-slate-900 placeholder-slate-400 focus:bg-slate-200"
                                } outline-none`}
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                                >
                                    <MessageSquare
                                        className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                    />
                                </div>
                                <h3
                                    className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
                                >
                                    No conversations yet
                                </h3>
                                <p
                                    className={`text-sm mb-4 ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                >
                                    Start a conversation by contacting a
                                    landlord or roommate
                                </p>
                                <button
                                    onClick={() =>
                                        setShowNewConversationModal(true)
                                    }
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isDark
                                            ? "bg-primary-500 text-white hover:bg-primary-600"
                                            : "bg-primary-500 text-white hover:bg-primary-600"
                                    }`}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        setSelectedConversation(conv);
                                        setShowMobileChat(true);
                                    }}
                                    className={`w-full p-4 flex items-center gap-3 transition-colors ${
                                        selectedConversation?.id === conv.id
                                            ? isDark
                                                ? "bg-white/10"
                                                : "bg-primary-50"
                                            : isDark
                                              ? "hover:bg-white/5"
                                              : "hover:bg-slate-50"
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {conv.otherParticipantProfilePicture ? (
                                            <img
                                                src={
                                                    conv.otherParticipantProfilePicture
                                                }
                                                alt={conv.otherParticipantName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-primary-500/20" : "bg-primary-100"}`}
                                            >
                                                <span
                                                    className={`text-lg font-semibold ${isDark ? "text-primary-400" : "text-primary-600"}`}
                                                >
                                                    {conv.otherParticipantName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {conv.otherParticipantOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <p
                                                className={`font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}
                                            >
                                                {conv.otherParticipantName}
                                            </p>
                                            {conv.lastMessageAt && (
                                                <span
                                                    className={`text-xs flex-shrink-0 ml-2 ${conv.unreadCount > 0 ? (isDark ? "text-primary-400" : "text-primary-600") : isDark ? "text-slate-500" : "text-slate-400"}`}
                                                >
                                                    {formatTime(
                                                        conv.lastMessageAt,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {conv.propertyTitle && (
                                            <p
                                                className={`text-xs mb-1 flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                            >
                                                <Home className="w-3 h-3" />
                                                <span className="truncate">
                                                    {conv.propertyTitle}
                                                </span>
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <p
                                                className={`text-sm truncate ${conv.unreadCount > 0 ? (isDark ? "text-slate-300" : "text-slate-700") : isDark ? "text-slate-500" : "text-slate-500"}`}
                                            >
                                                {conv.lastMessage ||
                                                    "No messages yet"}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span
                                                    className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${isDark ? "bg-primary-500 text-white" : "bg-primary-500 text-white"}`}
                                                >
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    className={`flex-1 flex flex-col ${!showMobileChat ? "hidden md:flex" : "flex"}`}
                >
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div
                                className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowMobileChat(false)}
                                        className={`md:hidden p-2 -ml-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="relative">
                                        {selectedConversation.otherParticipantProfilePicture ? (
                                            <img
                                                src={
                                                    selectedConversation.otherParticipantProfilePicture
                                                }
                                                alt={
                                                    selectedConversation.otherParticipantName
                                                }
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-primary-500/20" : "bg-primary-100"}`}
                                            >
                                                <span
                                                    className={`font-semibold ${isDark ? "text-primary-400" : "text-primary-600"}`}
                                                >
                                                    {selectedConversation.otherParticipantName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedConversation.otherParticipantOnline && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800" />
                                        )}
                                    </div>
                                    <div>
                                        <h2
                                            className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                                        >
                                            {
                                                selectedConversation.otherParticipantName
                                            }
                                        </h2>
                                        <p
                                            className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                        >
                                            {selectedConversation.otherParticipantOnline ? (
                                                <span className="text-emerald-500">
                                                    Online
                                                </span>
                                            ) : (
                                                "Offline"
                                            )}
                                            {selectedConversation.propertyTitle && (
                                                <span>
                                                    {" "}
                                                    •{" "}
                                                    {
                                                        selectedConversation.propertyTitle
                                                    }
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                                    >
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                                    >
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div
                                className={`flex-1 overflow-y-auto p-4 space-y-6 ${isDark ? "bg-dark-900/50" : "bg-slate-50"}`}
                            >
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-white"}`}
                                        >
                                            <MessageSquare
                                                className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                            />
                                        </div>
                                        <h3
                                            className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
                                        >
                                            Start the conversation
                                        </h3>
                                        <p
                                            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                        >
                                            Send a message to{" "}
                                            {
                                                selectedConversation.otherParticipantName
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    messageGroups.map((group, groupIdx) => (
                                        <div key={groupIdx}>
                                            {/* Date Divider */}
                                            <div className="flex items-center justify-center mb-4">
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full ${isDark ? "bg-white/10 text-slate-400" : "bg-white text-slate-500"}`}
                                                >
                                                    {getDateLabel(group.date)}
                                                </span>
                                            </div>

                                            {/* Messages */}
                                            <div className="space-y-3">
                                                {group.messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.isOwnMessage ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={`flex items-end gap-2 max-w-[75%] ${msg.isOwnMessage ? "flex-row-reverse" : ""}`}
                                                        >
                                                            {/* Avatar for other user */}
                                                            {!msg.isOwnMessage && (
                                                                <div className="flex-shrink-0">
                                                                    {msg.senderProfilePicture ? (
                                                                        <img
                                                                            src={
                                                                                msg.senderProfilePicture
                                                                            }
                                                                            alt={
                                                                                msg.senderName
                                                                            }
                                                                            className="w-8 h-8 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-slate-200"}`}
                                                                        >
                                                                            <span
                                                                                className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                                                                            >
                                                                                {msg.senderName
                                                                                    .charAt(
                                                                                        0,
                                                                                    )
                                                                                    .toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Message Bubble */}
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl ${
                                                                    msg.isOwnMessage
                                                                        ? "bg-primary-500 text-white rounded-br-md"
                                                                        : isDark
                                                                          ? "bg-white/10 text-white rounded-bl-md"
                                                                          : "bg-white text-slate-900 rounded-bl-md shadow-sm"
                                                                }`}
                                                            >
                                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                                    {
                                                                        msg.content
                                                                    }
                                                                </p>
                                                                <div
                                                                    className={`flex items-center justify-end gap-1 mt-1 ${msg.isOwnMessage ? "text-white/70" : isDark ? "text-slate-500" : "text-slate-400"}`}
                                                                >
                                                                    <span className="text-xs">
                                                                        {formatMessageTime(
                                                                            msg.createdAt,
                                                                        )}
                                                                    </span>
                                                                    {msg.isOwnMessage &&
                                                                        (msg.read ? (
                                                                            <CheckCheck className="w-3.5 h-3.5" />
                                                                        ) : (
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div
                                className={`p-4 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}
                            >
                                <div
                                    className={`flex items-end gap-3 p-2 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                                >
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <textarea
                                        ref={messageInputRef}
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className={`flex-1 px-2 py-2 bg-transparent outline-none resize-none text-sm max-h-32 ${isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
                                        style={{ minHeight: "40px" }}
                                    />
                                    <button
                                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={
                                            !newMessage.trim() || isSending
                                        }
                                        className={`p-2.5 rounded-xl transition-colors ${
                                            newMessage.trim() && !isSending
                                                ? "bg-primary-500 text-white hover:bg-primary-600"
                                                : isDark
                                                  ? "bg-white/5 text-slate-600"
                                                  : "bg-slate-200 text-slate-400"
                                        }`}
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* No Conversation Selected */
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                            >
                                <MessageSquare
                                    className={`w-12 h-12 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                />
                            </div>
                            <h2
                                className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
                            >
                                Your Messages
                            </h2>
                            <p
                                className={`text-sm max-w-sm mb-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}
                            >
                                Select a conversation to start chatting or reach
                                out to landlords and potential roommates
                            </p>
                            <button
                                onClick={() =>
                                    setShowNewConversationModal(true)
                                }
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                                    isDark
                                        ? "bg-primary-500 text-white hover:bg-primary-600"
                                        : "bg-primary-500 text-white hover:bg-primary-600"
                                }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                New Conversation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNewConversationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowNewConversationModal(false);
                            setSelectedUser(null);
                            setUserSearchQuery("");
                            setUserSearchResults([]);
                            setInitialMessage("");
                        }}
                    />

                    {/* Modal */}
                    <div
                        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-dark-800" : "bg-white"}`}
                    >
                        {/* Header */}
                        <div
                            className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}
                        >
                            <h2
                                className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                            >
                                New Conversation
                            </h2>
                            <button
                                onClick={() => {
                                    setShowNewConversationModal(false);
                                    setSelectedUser(null);
                                    setUserSearchQuery("");
                                    setUserSearchResults([]);
                                    setInitialMessage("");
                                }}
                                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!selectedUser ? (
                                <>
                                    {/* User Search */}
                                    <div className="relative mb-4">
                                        <Search
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search users by name or email..."
                                            value={userSearchQuery}
                                            onChange={(e) =>
                                                setUserSearchQuery(
                                                    e.target.value,
                                                )
                                            }
                                            autoFocus
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors ${
                                                isDark
                                                    ? "bg-white/5 text-white placeholder-slate-500 focus:bg-white/10 border border-white/10 focus:border-primary-500/50"
                                                    : "bg-slate-100 text-slate-900 placeholder-slate-400 focus:bg-white border border-transparent focus:border-primary-500"
                                            } outline-none`}
                                        />
                                    </div>

                                    {/* Search Results */}
                                    <div
                                        className={`min-h-[200px] max-h-[300px] overflow-y-auto rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}
                                    >
                                        {isSearchingUsers ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2
                                                    className={`w-6 h-6 animate-spin ${isDark ? "text-primary-400" : "text-primary-600"}`}
                                                />
                                            </div>
                                        ) : userSearchQuery.length < 2 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Users
                                                    className={`w-10 h-10 mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`}
                                                />
                                                <p
                                                    className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                                >
                                                    Type at least 2 characters
                                                    to search
                                                </p>
                                            </div>
                                        ) : userSearchResults.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Users
                                                    className={`w-10 h-10 mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`}
                                                />
                                                <p
                                                    className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                                >
                                                    No users found
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {userSearchResults.map(
                                                    (searchUser) => (
                                                        <button
                                                            key={searchUser.id}
                                                            onClick={() =>
                                                                setSelectedUser(
                                                                    searchUser,
                                                                )
                                                            }
                                                            className={`w-full flex items-center gap-3 p-3 transition-colors ${
                                                                isDark
                                                                    ? "hover:bg-white/5"
                                                                    : "hover:bg-white"
                                                            }`}
                                                        >
                                                            {/* Avatar */}
                                                            {searchUser.profilePictureUrl ? (
                                                                <img
                                                                    src={
                                                                        searchUser.profilePictureUrl
                                                                    }
                                                                    alt={
                                                                        searchUser.fullName ||
                                                                        searchUser.email
                                                                    }
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-primary-500/20" : "bg-primary-100"}`}
                                                                >
                                                                    <span
                                                                        className={`font-semibold ${isDark ? "text-primary-400" : "text-primary-600"}`}
                                                                    >
                                                                        {(
                                                                            searchUser.firstName ||
                                                                            searchUser.email
                                                                        )
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Info */}
                                                            <div className="flex-1 text-left">
                                                                <p
                                                                    className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                                                                >
                                                                    {searchUser.fullName ||
                                                                        `${searchUser.firstName || ""} ${searchUser.lastName || ""}`.trim() ||
                                                                        searchUser.email}
                                                                </p>
                                                                <p
                                                                    className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                                                >
                                                                    {
                                                                        searchUser.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Selected User */}
                                    <div
                                        className={`flex items-center gap-3 p-3 mb-4 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                                    >
                                        {/* Avatar */}
                                        {selectedUser.profilePictureUrl ? (
                                            <img
                                                src={
                                                    selectedUser.profilePictureUrl
                                                }
                                                alt={
                                                    selectedUser.fullName ||
                                                    selectedUser.email
                                                }
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-primary-500/20" : "bg-primary-100"}`}
                                            >
                                                <span
                                                    className={`text-lg font-semibold ${isDark ? "text-primary-400" : "text-primary-600"}`}
                                                >
                                                    {(
                                                        selectedUser.firstName ||
                                                        selectedUser.email
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1">
                                            <p
                                                className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                                            >
                                                {selectedUser.fullName ||
                                                    `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() ||
                                                    selectedUser.email}
                                            </p>
                                            <p
                                                className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                                            >
                                                {selectedUser.email}
                                            </p>
                                        </div>

                                        {/* Change User */}
                                        <button
                                            onClick={() =>
                                                setSelectedUser(null)
                                            }
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                isDark
                                                    ? "text-primary-400 hover:bg-white/10"
                                                    : "text-primary-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            Change
                                        </button>
                                    </div>

                                    {/* Message Input */}
                                    <div className="mb-4">
                                        <label
                                            className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                        >
                                            Message
                                        </label>
                                        <textarea
                                            value={initialMessage}
                                            onChange={(e) =>
                                                setInitialMessage(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={`Say hello to ${selectedUser.firstName || selectedUser.email}...`}
                                            rows={4}
                                            autoFocus
                                            className={`w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors ${
                                                isDark
                                                    ? "bg-white/5 text-white placeholder-slate-500 focus:bg-white/10 border border-white/10 focus:border-primary-500/50"
                                                    : "bg-slate-100 text-slate-900 placeholder-slate-400 focus:bg-white border border-transparent focus:border-primary-500"
                                            } outline-none`}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setShowNewConversationModal(
                                                    false,
                                                );
                                                setSelectedUser(null);
                                                setUserSearchQuery("");
                                                setUserSearchResults([]);
                                                setInitialMessage("");
                                            }}
                                            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                                isDark
                                                    ? "text-slate-300 hover:bg-white/10"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateConversation}
                                            disabled={
                                                !initialMessage.trim() ||
                                                isCreatingConversation
                                            }
                                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                                initialMessage.trim() &&
                                                !isCreatingConversation
                                                    ? "bg-primary-500 text-white hover:bg-primary-600"
                                                    : isDark
                                                      ? "bg-white/5 text-slate-600 cursor-not-allowed"
                                                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            }`}
                                        >
                                            {isCreatingConversation ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
