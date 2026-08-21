"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Send, User, MessageCircle, Clock, CheckCircle } from 'lucide-react';

interface ChatSession {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export default function AdminLiveChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      setToken(t);
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        setAdminId(payload.nameid || payload.sub || payload.UserId || payload.id);
      } catch (err) {}
    }
  }, []);

  // Fetch active sessions
  useEffect(() => {
    if (token) {
      fetchSessions();
      // Optional: Poll for new sessions every 10 seconds
      const interval = setInterval(fetchSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const getChatHubUrl = () =>
    process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/chat`
      : '/hubs/chat';

  const normalizeId = (id: string) => id.toLowerCase();

  const fetchMessages = async (sid: string) => {
    const res = await fetch(`/api/chats/${sid}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chats/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  // SignalR & Messages for selected session
  useEffect(() => {
    if (selectedSession && token) {
      // Fetch history
      fetchMessages(selectedSession.id).catch((err) => console.error(err));

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(getChatHubUrl(), {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      newConnection.on("ReceiveMessage", (msg: ChatMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      newConnection.start()
        .then(() => {
          newConnection.invoke("JoinChat", selectedSession.id);
        })
        .catch(err => console.error("SignalR Connection Error: ", err));

      setConnection(newConnection);

      return () => {
        newConnection.invoke("LeaveChat", selectedSession.id).finally(() => newConnection.stop());
      };
    }
  }, [selectedSession, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !token || !selectedSession) return;

    const msgToSend = inputValue;
    setInputValue('');

    try {
      const res = await fetch(`/api/chats/${selectedSession.id}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(msgToSend)
      });
      if (res.ok) {
        await fetchMessages(selectedSession.id);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/chats/${sessionId}/close`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã đóng phiên chat thành công');
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  if (!adminId) return <div>Đang tải...</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Sidebar: Active Sessions */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="text-emerald-500" />
            Phiên hỗ trợ đang mở
            <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-xs ml-2">
              {sessions.length}
            </span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Không có yêu cầu hỗ trợ nào.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map(s => (
                <li key={s.id}>
                  <button 
                    onClick={() => setSelectedSession(s)}
                    className={`w-full text-left p-4 hover:bg-emerald-50 transition-colors flex items-start gap-3 ${selectedSession?.id === s.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full mt-1">
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{s.userFullName || s.userEmail || 'Khách hàng'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{selectedSession.userFullName || selectedSession.userEmail || 'Khách hàng'}</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleCloseSession(selectedSession.id)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle size={16} />
                Đóng phiên
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-600 mt-10">Chưa có tin nhắn nào.</div>
              ) : (
                messages.map((msg) => {
                  const isMine = adminId ? normalizeId(msg.senderId) === normalizeId(adminId) : false;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[15px] ${isMine ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[11px] text-slate-600 mt-1.5 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-50 text-slate-800 rounded-xl px-5 py-3 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Nhập câu trả lời..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim()}
                  className="bg-emerald-500 text-white px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
                >
                  <Send size={18} />
                  Gửi
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <MessageCircle size={48} className="mb-4 text-slate-700 opacity-50" />
            <p>Chọn một phiên hỗ trợ bên trái để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}
