'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Gift, TrendingUp, Award, Circle, Heart } from 'lucide-react';

interface LoyaltyData {
  points: number;
  tier: string;
  pointsToNextTier: number;
  totalSpent: number;
  membersSince: string;
  rewards: Reward[];
}

interface Reward {
  id: string;
  name: string;
  cost: number;
  description: string;
  claimed: boolean;
}

export default function LoyaltyPage() {
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLoyalty(token);
  }, [router]);

  const fetchLoyalty = async (token: string) => {
    try {
      const response = await fetch('/api/loyalty/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLoyalty(data);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: string, cost: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rewardId, cost }),
      });
      if (response.ok) {
        fetchLoyalty(token!);
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: 'from-amber-700 to-amber-900' },
    { name: 'Silver', minPoints: 1000, color: 'from-slate-400 to-slate-600' },
    { name: 'Gold', minPoints: 5000, color: 'from-yellow-400 to-yellow-600' },
    { name: 'Platinum', minPoints: 10000, color: 'from-blue-400 to-blue-600' },
  ];

  const currentTierIndex = tiers.findIndex((_, i) => i === tiers.length - 1 || tiers[i + 1].minPoints > (loyalty?.points || 0));
  const nextTier = tiers[currentTierIndex + 1];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-slate-900">
              <Star className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900">
              CloudHost<span className="text-[#1F1F1F]"> VN</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-lg p-8 text-slate-900 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-amber-400" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chương trình thành viên</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-slate-700 text-sm mb-1">Điểm thưởng hiện tại</p>
                <p className="text-5xl font-black text-slate-900">{loyalty?.points.toLocaleString() || 0}</p>
                <p className="text-sm text-slate-600 mt-1">điểm</p>
              </div>
              
              <div>
                <p className="text-slate-700 text-sm mb-1">Cấp độ hiện tại</p>
                <p className="text-3xl font-black text-slate-900">{loyalty?.tier || 'Bronze'}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {nextTier ? `Còn ${nextTier.minPoints - (loyalty?.points || 0)} điểm để lên ${nextTier.name}` : 'Đã đạt cấp cao nhất!'}
                </p>
              </div>
              
              <div>
                <p className="text-slate-700 text-sm mb-1">Tổng chi tiêu</p>
                <p className="text-3xl font-black text-slate-900">
                  {(loyalty?.totalSpent || 0).toLocaleString()}đ
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Kể từ {loyalty?.membersSince || '2024'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {nextTier && (
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                  <span>{loyalty?.tier}</span>
                  <span>{nextTier.name} - {nextTier.minPoints.toLocaleString()} điểm</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((loyalty?.points || 0) / nextTier.minPoints) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: TrendingUp, title: 'Mua dịch vụ', desc: 'Mỗi 10,000đ = 1 điểm', color: 'blue' },
            { icon: Heart, title: 'Giới thiệu bạn bè', desc: '100 điểm/giới thiệu thành công', color: 'rose' },
            { icon: Star, title: 'Viết đánh giá', desc: '20 điểm/bài đánh giá', color: 'amber' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-md p-6 border border-slate-200">
              <item.icon className={`w-8 h-8 text-${item.color}-500 mb-3`} />
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#1F1F1F]" />
              Đổi quà thưởng
            </h2>
          </div>
          
          <div className="p-6">
            {loyalty?.rewards && loyalty.rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loyalty.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-4 rounded border-2 ${
                      reward.claimed
                        ? 'border-slate-200 opacity-50'
                        : 'border-slate-200 hover:border-blue-300 transition-colors'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900">{reward.name}</h4>
                      {reward.claimed && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          Đã đổi
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F1F1F]">{reward.cost} điểm</span>
                      <button
                        onClick={() => !reward.claimed && redeemReward(reward.id, reward.cost)}
                        disabled={reward.claimed || (loyalty?.points || 0) < reward.cost}
                        className="px-4 py-2 rounded-sm bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reward.claimed ? 'Đã đổi' : 'Đổi quà'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                <Gift className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p className="font-medium">Chưa có quà thưởng nào</p>
                <p className="text-sm mt-1">Mua dịch vụ để tích điểm và đổi quà!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
