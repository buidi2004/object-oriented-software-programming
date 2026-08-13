"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

function getChatHubUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/chat`
    : '/hubs/chat';
}

function parseUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.nameid || payload.UserId || payload.id || null;
  } catch {
    return null;
  }
}

function normalizeId(id: string): string {
  return id.toLowerCase();
}

export function LiveChatWidget() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuth = () => {
      const t = localStorage.getItem('accessToken');
      setToken(t);
      setUserId(t ? parseUserIdFromToken(t) : null);
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const fetchMessages = useCallback(async (sid: string, authToken: string) => {
    const res = await fetch(`/api/chats/${sid}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  // Load existing session when widget opens
  useEffect(() => {
    if (!isOpen || !token || sessionId) return;

    fetch('/api/chats/my-active', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setSessionId(data.id);
      })
      .catch((err) => console.error('Error fetching active session:', err));
  }, [isOpen, token, sessionId]);

  // Load messages when session is known
  useEffect(() => {
    if (sessionId && token) {
      fetchMessages(sessionId, token).catch((err) =>
        console.error('Error fetching messages:', err)
      );
    }
  }, [sessionId, token, fetchMessages]);

  // SignalR connection
  useEffect(() => {
    if (!sessionId || !token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(getChatHubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.on('ReceiveMessage', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    newConnection
      .start()
      .then(() => newConnection.invoke('JoinChat', sessionId))
      .catch((err) => console.error('SignalR Connection Error:', err));

    return () => {
      newConnection.invoke('LeaveChat', sessionId).finally(() => newConnection.stop());
    };
  }, [sessionId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !token) return;

    const msgToSend = inputValue.trim();
    setInputValue('');
    setSendError(null);

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setSendError('Không thể bắt đầu phiên chat. Vui lòng thử lại.');
          setInputValue(msgToSend);
          return;
        }
        const data = await res.json();
        currentSessionId = data.id;
        setSessionId(currentSessionId);
      } catch {
        setSendError('Không thể kết nối máy chủ chat.');
        setInputValue(msgToSend);
        return;
      }
    }

    try {
      const res = await fetch(`/api/chats/${currentSessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(msgToSend),
      });
      if (!res.ok) {
        setSendError('Không thể gửi tin nhắn. Vui lòng thử lại.');
        setInputValue(msgToSend);
        return;
      }
      await fetchMessages(currentSessionId!, token);
    } catch {
      setSendError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setInputValue(msgToSend);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col w-80 h-96 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-500 text-white p-3 flex justify-between items-center shadow-md">
            <div className="font-semibold flex items-center gap-2">
              <MessageCircle size={18} /> Support Chat
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-emerald-600 p-1 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-slate-800 scrollbar-thin scrollbar-thumb-slate-600">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                Gửi tin nhắn để bắt đầu trò chuyện với hỗ trợ viên.
              </div>
            )}
            {messages.map((msg) => {
              const isMine = normalizeId(msg.senderId) === normalizeId(userId);
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                        : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-slate-900 border-t border-slate-700 flex flex-col gap-1"
          >
            {sendError && (
              <p className="text-xs text-red-400 px-2">{sendError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-slate-800 text-sm text-slate-200 rounded-full px-4 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-emerald-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-bounce"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
