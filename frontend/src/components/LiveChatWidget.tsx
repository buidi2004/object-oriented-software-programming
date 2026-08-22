'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import * as signalR from '@microsoft/signalr';

function parseUserIdFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.nameid || payload.UserId || payload.id || null;
  } catch (e) {
    console.error("JWT parse error:", e);
    return null;
  }
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! CloudHost VN có thể hỗ trợ gì cho Quý khách?' },
    { sender: 'bot', text: 'Quý khách vui lòng chọn đúng thông tin cần hỗ trợ để CloudHost VN hỗ trợ nhanh nhất!' }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const suggestions = [
    "Tư vấn dịch vụ",
    "Thông tin Ưu đãi",
    "Gia hạn dịch vụ",
    "Hỗ trợ kỹ thuật",
    "Khác"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) {
      setUserId(parseUserIdFromToken(t));
    }
  }, []);

  useEffect(() => {
    if (isOpen && !sessionId) {
      api.get('/chats/my-active')
        .then(res => setSessionId(res.data.id))
        .catch(err => {
          if (err.response?.status === 404) {
            api.post('/chats').then(res => setSessionId(res.data.id)).catch(e => {
              if (e.response?.status === 401) {
                setMessages([{ sender: 'bot', text: 'Vui lòng đăng nhập để sử dụng tính năng Chat!' }]);
              }
            });
          } else if (err.response?.status === 401) {
            setMessages([{ sender: 'bot', text: 'Vui lòng đăng nhập để sử dụng tính năng Chat!' }]);
          }
        });
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (!sessionId || !userId) return;

    // Load history
    api.get(`/chats/${sessionId}/messages`)
      .then(res => {
        if (res.data && res.data.length > 0) {
           const history = res.data.map((m: any) => ({
             sender: m.senderId?.toLowerCase() !== userId?.toLowerCase() ? 'bot' : 'user',
             text: m.message
           }));
           // Prepend the welcome messages if they aren't in history
           setMessages(history);
        }
      })
      .catch(console.error);

    // Setup SignalR
    const token = localStorage.getItem('accessToken');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (data: any) => {
      if (data.senderId?.toLowerCase() !== userId?.toLowerCase()) {
         setMessages(prev => {
            // Ignore duplicates
            if (prev.some(m => m.text === data.message && m.sender === 'bot')) return prev;
            return [...prev, { sender: 'bot', text: data.message }];
         });
      }
    });

    connection.start()
      .then(() => {
        connection.invoke('JoinChat', sessionId);
      })
      .catch(console.error);

    return () => {
      connection.stop();
    };
  }, [sessionId, userId]);

  const handleSend = async (e: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const userText = (textOverride || input).trim();
    if (!userText) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setShowSuggestions(false);

    if (sessionId) {
      setLoading(true);
      try {
        await api.post(`/chats/${sessionId}/messages`, `"${userText}"`, {
          headers: { 'Content-Type': 'application/json' }
        });
        // Real-time reply will come through SignalR
      } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-[#1F1F1F] hover:scale-105 text-white shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer transition-all relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Top Bar */}
          <div className="p-4 bg-white text-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1F1F1F] flex items-center justify-center text-white font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm">Hỗ Trợ Khách Hàng 24/7</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang trực tuyến
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const isFirstBotMessageInGroup = !isUser && (idx === 0 || messages[idx - 1].sender === 'user');
              
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className={`w-8 h-8 shrink-0 rounded-full bg-[#1F1F1F] flex items-center justify-center text-white ${!isFirstBotMessageInGroup && 'opacity-0'}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] p-3 text-[13px] font-medium leading-relaxed ${
                    isUser
                      ? 'bg-[#1F1F1F] text-white rounded-md rounded-tr-sm'
                      : 'bg-[#f4f4f5] text-slate-800 rounded-md rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            
            {showSuggestions && messages.length <= 2 && (
              <div className="pl-10 pr-4 flex flex-wrap gap-2 mt-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleSend(e, s)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => handleSend(e)} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-full px-4 py-2 focus-within:border-[#1F1F1F] focus-within:ring-1 focus-within:ring-[#1F1F1F] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent text-sm text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="ml-2 text-slate-400 hover:text-[#1F1F1F] transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

        </div>
      )}
    </div>
  );
};
