# Design Tokens: Typography on Colored Backgrounds

Tài liệu này định nghĩa các quy tắc sử dụng class màu chữ trên các bề mặt (backgrounds) khác nhau để đảm bảo độ tương phản (Contrast Ratio) đạt chuẩn **WCAG AA**.

> [!WARNING]
> Mọi component đặt trên nền màu (gradient, primary, brand, slate tối) đều phải tra bảng token này trước khi code. Không sử dụng class chữ mặc định (`text-slate-900` hoặc `text-muted`) nếu chưa kiểm tra.

## 1. Nền Tối (Dark Navy / Black)
- **Backgrounds**: `bg-slate-900`, `bg-[#090d16]`, gradient tối (vd: `from-[#0d182e] via-[#091122]`).
- **Chữ chính (Headings / Khổ lớn)**: `text-white` (Trắng tinh, 100% opacity)
- **Chữ phụ (Đoạn văn / Phụ đề)**: `text-slate-300` hoặc `text-slate-200`
- **Chống chỉ định**: Tuyệt đối không dùng `text-slate-900`, `text-slate-700`, `text-white/40` trên nền tối.

## 2. Nền Brand (Terracotta / Orange-Amber)
- **Backgrounds**: `bg-gradient-to-r from-orange-400 to-amber-500` hoặc các biến thể màu nâu đồng.
- **Chữ chính trên nền brand**: `text-slate-950` hoặc `text-slate-900` (Vì nền Terracotta khá sáng, chữ đen/xám rất đậm sẽ có độ tương phản tốt nhất).
- **Chữ phụ trên nền brand**: `text-slate-800` hoặc `text-slate-900/80`.
- **Chống chỉ định**: Không dùng `text-white` (trắng trên nền cam/nâu có thể không đủ tương phản), không dùng `text-white/50`.

## 3. Nền Sáng (White / Light Blue / Light Gray)
- **Backgrounds**: `bg-white`, `bg-slate-50`, `bg-blue-50/100`.
- **Chữ chính (Headings)**: `text-slate-900`.
- **Chữ phụ (Đoạn văn)**: `text-slate-600` hoặc `text-slate-700`.
- **Chống chỉ định**: Không dùng xám quá nhạt (`text-slate-400` hoặc `text-slate-300`).

---
*(Bảng token này sẽ tiếp tục được mở rộng khi có các gam màu nền mới được thêm vào).*
