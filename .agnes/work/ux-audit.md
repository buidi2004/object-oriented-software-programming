# UX Audit - Báo cáo lỗi UX trên trang người dùng

## 1. [CRITICAL] Không có Layout Chung cho Dashboard

### Vấn đề
Mỗi trang con trong `/dashboard/*` là standalone page hoàn toàn độc lập với header riêng biệt. Trang `dashboard/page.tsx` có header đẹp với sidebar nav, nhưng khi vào `invoices`, `payments`, `auto-renew`,... thì mất hẳn sidebar và chỉ có nội dung trần trụi.

### File ảnh hưởng
- `app/dashboard/page.tsx` ← Có full header + content
- `app/dashboard/invoices/page.tsx` ← Chỉ có content, không header/sidebar
- `app/dashboard/payments/page.tsx` ← Chỉ có content
- `app/dashboard/auto-renew/page.tsx` ← Chỉ có content
- `app/dashboard/control-panel/page.tsx` ← Chỉ có content + nút back đơn giản
- `app/dashboard/vps-backups/page.tsx` ← Chỉ có content + nút back
- `app/dashboard/uptime/page.tsx` ← Chỉ có content + nút back
- `app/dashboard/recently-viewed/page.tsx` ← Chỉ có content
- `app/dashboard/profile/page.tsx` ← Chỉ có content
- `app/dashboard/security/page.tsx` ← Chưa đọc
- `app/dashboard/api-keys/page.tsx` ← Chưa đọc
- `app/dashboard/migrations/page.tsx` ← Chưa đọc
- `app/dashboard/notifications/page.tsx` ← Chưa đọc
- `app/dashboard/affiliates/page.tsx` ← Chưa đọc
- `app/dashboard/ssl-certificates/page.tsx` ← Chưa đọc
- `app/dashboard/vps-instances/page.tsx` ← Chưa đọc

### Sửa như thế nào
Tạo `app/dashboard/layout.tsx` làm wrapper chung bao gồm:
- Header cố định (logo, user info, logout)
- Sidebar/navigation menu
- Loading state chung
- Redirect nếu chưa login
→ Các child pages chỉ cần trả về content chính

---

## 2. [HIGH] authCheck Mỗi Page Gọi Fetch Lặp Lại

### Vấn đề
Mỗi trang dashboard đều gọi fetch('/api/users/me') → fetch dữ liệu riêng. Kết quả:
- Redundant API calls mỗi lần navigate
- Flash của spinner trước khi show dữ liệu (layout shift)
- Nếu token expire giữa chừng, không có xử lý graceful

### Fix
auth guard nên đặt ở `dashboard/layout.tsx` level, chỉ gọi 1 lần duy nhất và share context cho children.

---

## 3. [HIGH] Dynamic Tailwind Classes Không Được Compile

### Vấn đề
Tailwind chỉ scan static strings để build CSS. Code sau sẽ HOẠT ĐỘNG SAI vì class name động không được compile:

```tsx
// dashboard/page.tsx - line ~140
<stat.icon className={`w-6 h-6 text-${stat.color}-500 mb-2`} />
// stat.color = 'blue' | 'emerald' | 'amber'... 
// => className thành "text-blue-500" nhưng Tailwind không biết cần include nó
```

Cùng vấn đề ở:
- `dashboard/page.tsx`: Quick Actions cards `text-${action.color}-500`
- `control-panel/page.tsx`: Password display hardcode `'Password123!'` thay vì dùng biến

### Fix
Dùng object mapping hoặc explicit union types:
```tsx
const colors: Record<string, string> = {
  blue: 'text-blue-500',
  emerald: 'text-emerald-500',
  // ...
};
```

Hoặc dùng `safelist` trong tailwind config.

---

## 4. [HIGH] No Error State / Silent Failures

### Vấn đề
Hầu hết pages:
- Set `isLoading = false` trong finally block
- Nhưng KHÔNG set error state nếu fetch thất bại
- User thấy spinner mãi mãi HOẶC trang trắng trơn (empty data)

Ví dụ cụ thể:
```tsx
// invoices/page.tsx
if (!response.ok) { router.push('/login'); return; }
// → Nếu response 500, push về login là sai logic
//   User đã login rồi, nhưng API gặp lỗi khác thôi
```

Cùng vấn đề ở: payments, auto-renew, vps-backups, recently-viewed, uptime

### Fix
Thêm `error` state và hiển thị "Thử lại" button:
```tsx
<div className="text-center py-12">
  <AlertCircle className="w-12 mx-auto mb-3 text-red-400" />
  <p className="font-medium text-slate-500">Không thể tải dữ liệu</p>
  <button onClick={() => fetchData()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
    Thử lại
  </button>
</div>
```

---

## 5. [MEDIUM] Alert Natives Thay Vì Toast UI

### Vấn đề
```tsx
// invoices/page.tsx
alert(`Đang tải hóa đơn #${id}`);

// control-panel/page.tsx
confirm('Bạn có chắc chắn muốn xóa backup này?');
```

Native alert/confirm blocking UI, không matching design system, poor UX.

### Fix
Dùng custom toast/snackbar notification component.

---

## 6. [MEDIUM] Copy Button Không Làm Gì

### Vấn đề
control-panel/page.tsx có `<Download>` icon button ở dòng URL nhưng:
- Không có hàm `onClick` handler thực sự
- Icon sai nghĩa (Download ≠ Copy)
- Không có feedback khi copy thành công

### Fix
Dùng `navigator.clipboard.writeText()` + toast "Đã sao chép!" 

---

## 7. [MEDIUM] Modal Keyboard/Backdrop Accessibility

### Vấn đề
vps-backups tạo backup modal:
- Không đóng khi click backdrop (outside)
- Không đóng khi nhấn Escape key
- Focus không trap inside modal
- Không có `role="dialog"` hay `aria-modal`

### Fix
```tsx
{showCreateModal && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
    role="dialog"
    aria-modal="true"
  >
```

Và thêm useEffect cho Escape key.

---

## 8. [MEDIUM] Search Page Not Within Main Layout

### Vấn đề
`/search/page.tsx` là standalone full-page (`min-h-screen`) tách rời khỏi header/nav chính. Nếu site có shared Navbar + Footer, search page không hiển thị chúng.

### Fix
Integrate search vào shared layout hoặc dùng search modal/dropdown từ navbar thay vì full page.

---

## 9. [LOW] Hardcoded Mock Data In Production Paths

### Vấn đề
Nhiều pages mock data trực tiếp:
```tsx
// control-panel/page.tsx - hardcode password
cpanelPassword: '••••••••'
// show/hide reveal 'Password123!'

// recently-viewed/page.tsx
setItems([...mock data...]);

// uptime/page.tsx
setIncidents([...mock incidents...]);
```

Nếu API bắt đầu hoạt động thật, mock data vẫn hiện ra làm confused.

### Fix
Clear separation: API-first với optional demo mode flag.

---

## 10. [LOW] Back Navigation Links Go To Wrong Place

### Vấn đề
```tsx
// control-panel, uptime → Link href="/dashboard" ✓ đúng
// vps-backups → Link href="/dashboard/vps-instances" 
//   → nhưng trang này nằm trong /dashboard/ không phải /dashboard/vps-instances
//   → người dùng không hiểu tại sao back đi chỗ lạ
```

### Fix
Consistent back links. Trong shared layout thì không cần nút back (sidebar đã có nav).

---

## Tổng kết ưu tiên fix

| Ưu tiên | Số lượng | Tác động |
|---------|----------|----------|
| CRITICAL | 1 (#1) | Toàn bộ UX dashboard broken |
| HIGH     | 3 (#2,#3,#4) | Crash, blank pages, wrong styles |
| MEDIUM   | 4 (#5,#6,#7,#8) | Poor interaction quality |
| LOW      | 2 (#9,#10) | Confusion, inconsistency |

Tổng cộng: **10 issues**, ảnh hưởng **16+ trang người dùng**.
