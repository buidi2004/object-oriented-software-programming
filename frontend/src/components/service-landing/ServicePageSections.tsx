'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, Star, ArrowRight, CheckCircle2,
  Gift, Shield, Zap, Server, Globe, Quote,
} from 'lucide-react';
import type { ServicePageContent, ServicePageVariant } from '@/src/data/servicePages';

const THEMES: Record<ServicePageVariant, {
  accentText: string;
  gradient: string;
  badge: string;
  highlightBg: string;
  highlightText: string;
  iconBg: string;
}> = {
  vps: {
    accentText: 'text-blue-600',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    highlightBg: 'bg-blue-50/50',
    highlightText: 'text-blue-700',
    iconBg: 'bg-blue-50',
  },
  hosting: {
    accentText: 'text-indigo-600',
    gradient: 'from-purple-500 to-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    highlightBg: 'bg-indigo-50/50',
    highlightText: 'text-indigo-700',
    iconBg: 'bg-indigo-50',
  },
  domain: {
    accentText: 'text-cyan-600',
    gradient: 'from-cyan-500 to-emerald-500',
    badge: 'bg-cyan-100 text-cyan-700',
    highlightBg: 'bg-cyan-50/50',
    highlightText: 'text-cyan-700',
    iconBg: 'bg-cyan-50',
  },
};

interface ServicePageSectionsProps {
  content: ServicePageContent;
  /** pre = trước bảng giá, post = sau bảng giá, all = toàn bộ */
  group?: 'pre' | 'post' | 'all';
  skipFaqs?: boolean;
}

export default function ServicePageSections({ content, group = 'all', skipFaqs = false }: ServicePageSectionsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const theme = THEMES[content.variant];
  const showPre = group === 'pre' || group === 'all';
  const showPost = group === 'post' || group === 'all';

  return (
    <>
      {showPre && (
        <>
      {/* Stats Bar */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {content.stats.map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className={`text-3xl lg:text-4xl font-black ${theme.accentText} mb-1`}>{stat.value}</div>
                <div className="font-bold text-slate-900 text-sm mb-1">{stat.label}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badge} text-xs font-bold uppercase mb-3`}>
              <Gift className="w-3.5 h-3.5" />
              Ưu đãi & Khuyến mãi
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Chương Trình Ưu Đãi Hiện Tại</h2>
            <p className="text-slate-600">Tiết kiệm chi phí khi đăng ký dịch vụ ngay hôm nay</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.promotions.map((promo, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all relative overflow-hidden">
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-xs font-black`}>
                  {promo.discount}
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full ${theme.badge} text-[10px] font-bold uppercase mb-3`}>
                  {promo.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2 pr-16">{promo.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{promo.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {promo.code && (
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono font-bold text-slate-700">
                      Mã: {promo.code}
                    </span>
                  )}
                  {promo.validUntil && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">
                      HSD: {promo.validUntil}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Tính Năng Chi Tiết</h2>
            <p className="text-slate-600">Khám phá toàn bộ công nghệ và tính năng đằng sau dịch vụ của chúng tôi</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {content.deepFeatures.map((feat, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{feat.description}</p>
                <ul className="space-y-2">
                  {feat.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className={`w-4 h-4 ${theme.accentText} shrink-0 mt-0.5`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Phù Hợp Cho Ai?</h2>
            <p className="text-slate-400">Giải pháp tối ưu cho mọi nhu cầu và quy mô</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.useCases.map((uc, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                <p className="text-base text-slate-300 mb-4 leading-relaxed">{uc.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {uc.tags.map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-medium text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {showPost && (
        <>
      {/* Spec Comparison Table */}
      {content.specTable && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{content.specTable.title}</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    {content.specTable.columns.map((col, i) => (
                      <th
                        key={i}
                        className={`py-4 px-4 text-sm font-bold ${i === 0 ? 'text-left text-slate-600 w-1/4' : 'text-center text-slate-900'} ${i === 2 ? theme.highlightBg : ''}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.specTable.rows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 even:bg-slate-50 hover:bg-slate-100/50">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-700">{row.label}</td>
                      {row.values.map((val, j) => (
                        <td
                          key={j}
                          className={`py-3 px-4 text-sm text-center ${
                            j === (row.highlightIndex ?? 1) ? `${theme.highlightBg} font-semibold ${theme.highlightText}` : 'text-slate-600'
                          }`}
                        >
                          {val === 'Có' || val === 'Được hỗ trợ' ? (
                            <div className="flex justify-center">
                              <CheckCircle2 className={`w-5 h-5 ${theme.accentText}`} />
                            </div>
                          ) : (
                            val
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Infrastructure */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{content.infrastructure.title}</h2>
            <p className="text-slate-600">{content.infrastructure.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.infrastructure.items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}>
                    <Server className={`w-5 h-5 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLA */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badge} text-xs font-bold uppercase mb-3`}>
              <Shield className="w-3.5 h-3.5" />
              SLA
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{content.sla.title}</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Chỉ số</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-slate-900">Cam kết</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Bồi thường</th>
                </tr>
              </thead>
              <tbody>
                {content.sla.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800">{item.metric}</td>
                    <td className={`py-3 px-4 text-sm text-center font-bold ${theme.accentText}`}>{item.commitment}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{item.compensation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Dịch Vụ Bổ Sung (Add-ons)</h2>
            <p className="text-slate-600">Tùy chỉnh và mở rộng dịch vụ theo nhu cầu</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.addons.map((addon, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{addon.name}</h3>
                  <span className={`text-sm font-black ${theme.accentText} whitespace-nowrap`}>{addon.price}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Migration */}
      <section className={`py-16 bg-gradient-to-r ${theme.gradient} text-white`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3">{content.migration.title}</h2>
            <p className="text-white/80 max-w-2xl mx-auto leading-relaxed">{content.migration.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {content.migration.steps.map((step, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center">
                <div className="w-8 h-8 rounded-full bg-white/20 text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Khách Hàng Nói Gì?</h2>
            <p className="text-slate-600">Hàng nghìn doanh nghiệp tin tưởng CloudHost VN</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                <Quote className={`w-8 h-8 ${theme.accentText} opacity-30 absolute top-4 right-4`} />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} — {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tích Hợp & Tương Thích</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {content.integrations.map((name, i) => (
              <span key={i} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Dịch Vụ Liên Quan</h2>
            <p className="text-slate-600 text-sm">Hoàn thiện hạ tầng Cloud của bạn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.relatedServices.map((svc, i) => (
              <Link
                key={i}
                href={svc.href}
                className="group p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{svc.label}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs text-slate-600">{svc.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Extended FAQ */}
      {!skipFaqs && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Câu Hỏi Thường Gặp</h2>
              <p className="text-slate-600">Giải đáp chi tiết mọi thắc mắc</p>
            </div>
            <div className="space-y-3">
              {content.extendedFaqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <span className="font-bold text-slate-900 pr-4 text-sm">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className={`w-5 h-5 ${theme.accentText} shrink-0`} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-slate-600 border-t border-slate-200 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
        </>
      )}
    </>
  );
}
