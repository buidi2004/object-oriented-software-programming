'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý AI của CloudHost VN. Bạn cần tư vấn về Cloud VPS, Hosting hay Đăng ký Tên miền?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let botReply = 'Cảm ơn bạn! Đội ngũ tư vấn viên CloudHost VN đang kiểm tra cấu hình phù hợp nhất cho bạn. hotline 1900 6888 luông sẵn sàng!';
      if (userText.toLowerCase().includes('vps') || userText.toLowerCase().includes('máy chủ')) {
        botReply = 'Cloud VPS của CloudHost VN sử dụng 100% chip AMD EPYC & ổ cứng NVMe RAID 10. Bạn có thể sử dụng công cụ Tùy chỉnh cấu hình ngay trên trang chủ để xem báo giá chính xác!';
      } else if (userText.toLowerCase().includes('tên miền') || userText.toLowerCase().includes('domain')) {
        botReply = 'Tên miền quốc tế .COM chỉ 290k/năm, tên miền thương hiệu .VN 750k/năm. Bạn thử tra cứu tên miền ở thanh tìm kiếm xem nhé!';
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:scale-105 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center cursor-pointer transition-all relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Top Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-cyan-300 font-bold">
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
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn tư vấn..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
