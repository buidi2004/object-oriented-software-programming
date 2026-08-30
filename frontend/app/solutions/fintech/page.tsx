'use client';
import React from 'react';
import Link from 'next/link';
import { Shield, Target, LayoutDashboard, Fingerprint, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion } from 'framer-motion';

export default function FintechSolutionPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* HERO */}
      <section className="pt-24 pb-32 text-center max-w-4xl mx-auto px-4">
        <ScrollReveal animation="fade">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-8 border border-slate-100">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
            Giải pháp chuyên sâu <br/>
            <span className="text-blue-600">
              <TypewriterText text="Fintech & Ngân hàng" speed={50} delay={0.2} />
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10">Thiết kế kể chuyện (Storytelling Zig-Zag Layout) giúp bạn dễ dàng theo dõi từng tính năng siêu việt của hệ thống.</p>
        </ScrollReveal>
      </section>

      {/* ZIG ZAG 1 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-right">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="zigzag1"/>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-left">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">Độ Chính Xác Tuyệt Đối</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Mỗi thao tác xử lý trong <span className="font-bold">Fintech & Ngân hàng</span> đều được ghi nhận với độ trễ bằng 0. Hoàn hảo cho các tác vụ mang tính chất thời gian thực.
              </p>
              <div className="font-mono text-blue-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <TypewriterText text="> Processing data stream... OK!" speed={30} delay={1} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ZIG ZAG 2 */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-right" className="order-2 md:order-1">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-black mb-4">Bảo Mật Kép (Dual-layer)</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Được bảo vệ bởi 2 lớp mã hóa vật lý và phần mềm. Dữ liệu của hệ thống <span className="font-bold">Fintech & Ngân hàng</span> được an toàn trước mọi rủi ro xâm nhập.
              </p>
              <ul className="space-y-4 font-mono text-sm text-slate-300">
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> Encryption at Rest</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> TLS 1.3 Transport</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> WAF L7 Protection</li>
              </ul>
            </ScrollReveal>
            <ScrollReveal animation="slide-left" className="order-1 md:order-2">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group border border-slate-700">
                <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="zigzag2"/>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ZIG ZAG 3 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-up">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="zigzag3"/>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-up" delay={0.2}>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">Giao Diện Quản Trị Trực Quan</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Tất cả thông số được thống kê realtime trên một Dashboard duy nhất.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                Đăng ký trải nghiệm <ArrowRight className="w-5 h-5"/>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
          <Phase5Extensions themeColor="blue" />

    </div>
  );
}