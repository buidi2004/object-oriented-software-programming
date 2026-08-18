import React, { useState } from 'react';
import { Star, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface ReviewFormProps {
  orderId: string;
}

export default function ReviewForm({ orderId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        servicePlanId: orderId,
        rating,
        comment: content || 'Dịch vụ rất tốt.'
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit review', error);
      alert('Đã có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-emerald-900 font-bold text-lg mb-2">Cảm ơn bạn đã đánh giá!</h3>
        <p className="text-emerald-700 text-sm">Phản hồi của bạn giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn mỗi ngày.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Đánh giá dịch vụ
      </h3>
      <p className="text-sm text-slate-500 mb-6">Bạn cảm thấy dịch vụ này như thế nào? Xin hãy chia sẻ cảm nhận của bạn.</p>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating) 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-slate-200'
                }`} 
              />
            </button>
          ))}
          <span className="ml-3 text-sm font-medium text-slate-600">
            {rating === 0 ? 'Chưa chọn' : rating === 5 ? 'Tuyệt vời' : rating >= 3 ? 'Khá tốt' : 'Cần cải thiện'}
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ thêm trải nghiệm của bạn (không bắt buộc)..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-4 text-sm text-slate-900 transition-all outline-none resize-none mb-4"
        />

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
}
