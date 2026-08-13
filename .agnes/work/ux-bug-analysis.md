# Bug Analysis: Tự động chuyển hướng đến trang Login

## 🔍 Vấn Đề
Khi mở web, người dùng bị chuyển hướng sang trang `/login` mà chưa tương tác gì.

## ✅ Kết Quả Kiểm Tra

### 1. Middleware
- File: `next.middleware.ts`
- **Hiện tại**: KHÔNG có redirect logic, chỉ cho phép tất cả request đi qua
- **Kết luận**: Không phải nguyên nhân

### 2. Root Layout
- File: `app/layout.tsx`
- **Hiện tại**: Chỉ render children + LiveChatWidget
- **Kết luận**: Không có auth check

### 3. Homepage
- File: `app/page.tsx`
- **Hiện tại**: Static page, không có redirect
- **Kết luận**: Không phải nguyên nhân

### 4. Dashboard Layout (MỚI)
- File: `app/dashboard/layout.tsx`
- **Hiện tại**: Có auth check - nếu không có token → redirect đến `/login`
- **Kết luận**: Đây là NGUỒN GỐC của vấn đề (nếu user truy cập `/dashboard`)

## 🎯 Nguyên Nhân Chính

**Dashboard Layout mới** đang redirect người dùng chưa đăng nhập về `/login`:

```typescript
// Trong app/dashboard/layout.tsx
const checkAuth = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    router.push('/login'); // ← Tại sao nó chạy khi user chưa bấm gì?
    return;
  }
  // ...
};
```

## 💡 Cách Kiểm Tra

Để xác nhận chính xác, cần biết:
1. **URL nào đang gây ra redirect?**
   - `http://localhost:3000/` → homepage
   - `http://localhost:3000/dashboard` → dashboard
   - `http://localhost:3000/login` → login page

2. **Browser Console có lỗi gì không?**

## 🔧 Fix Đề Xuất

### Option 1: Giữ nguyên hành vi hiện tại (ĐÚNG)
Nếu user truy cập `/dashboard` khi chưa login → redirect sang `/login` là ĐÚNG UX.
Đây là standard behavior cho protected routes.

### Option 2: Hiển thị thông báo trước khi redirect
Thêm loading state và message để user hiểu tại sao bị redirect:

```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-slate-500">Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
  );
}
```

### Option 3: Allow public access cho một số trang dashboard
Nếu muốn user thấy dashboard khi chưa login (chỉ xem, không tương tác):

```typescript
// Bỏ auth guard, hoặc chỉ check để ẩn một số features
const checkAuth = async () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Fetch user data
  } else {
    // Show limited view
    setUser(null);
  }
  setIsLoading(false);
};
```

## 📝 Question for User
Vui lòng xác nhận:
1. Bạn đang truy cập URL nào? (`/`, `/dashboard`, hay URL khác?)
2. Bạn có đang logout (clear localStorage) trước khi test không?
3. Browser console có lỗi gì không?

## 🎨 Recommendation
Nếu đây là vấn đề thực sự (user không mong muốn bị redirect), tôi sẽ:
1. Thêm loading state rõ ràng
2. Thêm message explaining why redirect
3. Hoặc bỏ redirect ở dashboard layout, thay bằng "Vui lòng đăng nhập" banner

---
*Tạo bởi AgnesCode*