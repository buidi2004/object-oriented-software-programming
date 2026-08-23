'use client';

import React, { useState } from 'react';
import { Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description?: string;
  expiryDate?: string;
  minOrderAmount?: number;
}

interface CouponInputProps {
  onApply?: (coupon: Coupon) => void;
  onRemove?: () => void;
  orderTotal?: number;
}

export const CouponInput: React.FC<CouponInputProps> = ({ 
  onApply, 
  onRemove, 
  orderTotal = 0 
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const handleCheckCoupon = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // First check if coupon exists and is active
      const response = await api.get(`/coupons/active`);
      const activeCoupons: Coupon[] = response.data || [];
      
      const foundCoupon = activeCoupons.find(
        c => c.code.toLowerCase() === code.trim().toLowerCase()
      );

      if (!foundCoupon) {
        setError('Mã giảm giá không tồn tại hoặc đã hết hạn');
        return;
      }

      // Check minimum order amount
      if (foundCoupon.minOrderAmount && orderTotal < foundCoupon.minOrderAmount) {
        setError(`Đơn hàng cần tối thiểu ${foundCoupon.minOrderAmount.toLocaleString('vi-VN')}đ`);
        return;
      }

      setAppliedCoupon(foundCoupon);
      onApply?.(foundCoupon);
      setCode('');
    } catch (err: any) {
      console.error('Failed to check coupon:', err);
      setError(err.response?.data?.message || 'Không thể kiểm tra mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    onRemove?.();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-black">Mã giảm giá</h3>
      
      {appliedCoupon ? (
        <div className="flex items-center gap-3 p-3 bg-zinc-100 border border-zinc-300 rounded-xl">
          <CheckCircle className="w-5 h-5 text-black shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-black">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-zinc-600 font-medium">
              {appliedCoupon.discountType === 'percentage' 
                ? `Giảm ${appliedCoupon.discountValue}%` 
                : `Giảm ${appliedCoupon.discountValue.toLocaleString('vi-VN')}đ`}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
            title="Xóa mã giảm giá"
          >
            <XCircle className="w-4 h-4 text-black" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="NHẬP MÃ GIẢM GIÁ"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-mono text-black bg-zinc-50"
              onKeyDown={(e) => e.key === 'Enter' && handleCheckCoupon()}
            />
          </div>
          <button
            onClick={handleCheckCoupon}
            disabled={isLoading || !code.trim()}
            className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl font-bold transition-all disabled:opacity-40 text-sm cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Áp dụng'
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {!appliedCoupon && !error && (
        <p className="text-xs text-zinc-500">
          Chưa có mã giảm giá? Liên hệ chúng tôi để nhận ưu đãi!
        </p>
      )}
    </div>
  );
};

// Hook for coupon management
export function useCoupon() {
  const [discount, setDiscount] = useState<number>(0);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const applyCoupon = (appliedCoupon: Coupon) => {
    setCoupon(appliedCoupon);
    
    // Calculate discount
    if (appliedCoupon.discountType === 'percentage') {
      setDiscount(appliedCoupon.discountValue);
    } else {
      setDiscount(appliedCoupon.discountValue);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
  };

  const getFinalTotal = (total: number) => {
    return total - (total * discount / 100);
  };

  return {
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    getFinalTotal
  };
}
