"use client"

import { useTheme } from "@/context/ThemeContext"
import { ArrowRight, CheckCheck } from "lucide-react"
import Link from "next/link"

export function MessagesPreview() {
  const { isDark } = useTheme()

  // Mock data
  const chats = [
    {
      id: 1,
      name: "Emily W.",
      message: "When are you free for a viewing?",
      time: "10m ago",
      unread: true,
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      name: "Michael R.",
      message: "Thanks! I'll see you then.",
      time: "2h ago",
      unread: false,
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: 3,
      name: "Sarah L.",
      message: "Is the price negotiable?",
      time: "1d ago",
      unread: false,
      avatar: "https://i.pravatar.cc/150?u=3",
    },
  ]

  return (
    <div
      className={`flex h-full flex-col rounded-3xl border p-6 ${isDark
        ? "bg-dark-900 border-dark-700"
        : "bg-white border-slate-100"
        }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          Messages
        </h3>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${isDark
            ? "bg-blue-500 text-white"
            : "bg-blue-100 text-blue-600"
            }`}
        >
          3
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors ${isDark ? "hover:bg-dark-800" : "hover:bg-slate-50"
              } ${chat.unread
                ? isDark
                  ? "bg-dark-800"
                  : "bg-blue-50/50"
                : ""
              }`}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              {chat.unread && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-blue-500"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <h4
                  className={`truncate text-sm font-semibold ${isDark
                    ? "text-white"
                    : "text-slate-900"
                    }`}
                >
                  {chat.name}
                </h4>
                <span
                  className={`text-xs ${isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                    }`}
                >
                  {chat.time}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!chat.unread && (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                )}
                <p
                  className={`truncate text-xs ${chat.unread
                    ? isDark
                      ? "text-white font-medium"
                      : "text-slate-900 font-medium"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {chat.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/messages"
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${isDark
          ? "bg-dark-800 text-white hover:bg-dark-700"
          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
          }`}
      >
        Open Inbox <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
