"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} from "@/features/groupApi/groupApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare } from "lucide-react";

export default function GroupChat() {
  const { data: currentUser } = useGetUserQuery();
  const {
    data: messagesData,
    isLoading,
    isFetching,
  } = useGetGroupMessagesQuery(undefined, {
    pollingInterval: 3000,
  });

  const [sendMessage, { isLoading: isSending }] = useSendGroupMessageMutation();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = messagesData?.data ?? [];
  const myId = currentUser?.data?._id;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput("");
    try {
      await sendMessage({ content: trimmed }).unwrap();
    } catch {
      setInput(trimmed); // restore on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // Group messages by date for date separators
  const groupedMessages: { date: string; msgs: typeof messages }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  }

  return (
    <div className="flex flex-col h-[600px] rounded-xl border bg-muted/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Group Chat</span>
        {isFetching && !isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-20" />
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          groupedMessages.map(({ date, msgs }) => (
            <div key={date} className="space-y-3">
              {/* Date separator */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2 bg-muted/30 rounded-full py-0.5">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages in this date group */}
              {msgs.map((msg) => {
                const isOwn = msg.sender._id === myId;
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {!isOwn && (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage
                          src={msg.sender.imageUrl}
                          alt={msg.sender.fullName}
                        />
                        <AvatarFallback className="text-xs">
                          {msg.sender.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Bubble */}
                    <div
                      className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {!isOwn && (
                        <span className="text-xs text-muted-foreground px-1">
                          {msg.sender.fullName}
                          {msg.sender.role === "teacher" && (
                            <span className="ml-1 text-[10px] text-primary font-semibold">(Mentor)</span>
                          )}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm leading-relaxed break-words ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-background border shadow-sm rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t bg-background/80 backdrop-blur-sm">
        <input
          type="text"
          placeholder="Type a message… (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          maxLength={2000}
          className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition disabled:opacity-50"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="rounded-full h-9 w-9 shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
