# Bug Report: Trang web tự động redirect sang login khi mở

## 🐛 Mô Tả Vấn Đề

Khi truy cập trang web (ví dụ: `http://localhost:3000`), trang tự động chuyển hướng sang `/login` ngay cả khi chưa bấm gì cả.

## 🔍 Nguyên Nhân Có Thể

### 1. Middleware Redirect (Khả năng cao)

File `next.middleware.ts` đang tồn tại nhưng content hiện tại không có redirect logic. Cần kiểm tra kỹ hơn.

### 2. Client-side Auth Check

Có thể một trong các component đang gọi:
```tsx
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    router.push('/login'); // ← Đây là nguyên nhân!
  }
}, []);
```

### 3. Page-level Redirect

```tsx
// Server component
export default function Page() {
  return redirect('/login'); // ← Hoặc client redirect
}
```

## 🧪 Steps để Debug

```bash
# 1. Kiểm tra middleware
cat /home/object-oriented-software-programming/frontend/next.middleware.ts

# 2. Tìm tất cả router.push('/login')
grep -r "router.push.*'\\/login'" /home/object-oriented-software-programming/frontend/app --include="*.tsx"

# 3. Tìm redirect từ next/navigation
grep -r "from 'next/navigation'" /home/object-oriented-software-programming/frontend/app --include="*.tsx" | grep redirect

# 4. Kiểm tra trang chủ (page.tsx)
cat /home/object-oriented-software-programming/frontend/app/page.tsx
```

## ✅ Fix Đề Xuất

### Option 1: Sửa Middleware (nếu đang redirect)

```typescript
// next.middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // KHÔNG tự động redirect sang login
  // Chỉ redirect nếu user vào trang protected và chưa auth
  
  const { pathname } = request.nextUrl;
  
  // Allow public pages
  const publicPages = ['/', '/login', '/register', '/services', '/blog'];
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.next();
  }
  
  // Check auth for protected routes
  const token = request.cookies.get('token')?.value;
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Option 2: Sửa Client-side Auth Check

Thay vì redirect ngay lập tức, chỉ hiển thị message:

```tsx
// Dashboard page
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // KHÔNG redirect ngay
    // Show message hoặc redirect sau delay
    setTimeout(() => router.push('/login?message=please-login'), 500);
  }
}, []);
```

### Option 3: Kiểm Tra Homepage

```tsx
// app/page.tsx - Đảm bảo KHÔNG có redirect
export default function HomePage() {
  // Hiển thị content thay vì redirect
  return <HomePageContent />;
}
```

## 📋 Checklist Debug

- [ ] Check `next.middleware.ts` có redirect không
- [ ] Check `app/page.tsx` có redirect không  
- [ ] Check `app/dashboard/layout.tsx` đang xử lý auth đúng chưa
- [ ] Test với browser devtools → Network tab → Xem redirect chain
- [ ] Kiểm tra localStorage có tồn tại token không

## 🎯 Priority: HIGH

Bug này严重影响用户体验 - người dùng không thể truy cập nội dung công khai.
