# Hướng dẫn thực hành 10 chức năng mới

## 1. Chuẩn bị và khởi chạy

Mở PowerShell tại thư mục `object-oriented-software-programming`.

```powershell
cd CloudServiceStore
dotnet ef database update --project CloudServiceStore.Infrastructure/CloudServiceStore.Infrastructure.csproj --startup-project CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj
dotnet run --project CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj --launch-profile http
```

Mở terminal thứ hai:

```powershell
cd frontend
$env:NODE_OPTIONS='--max-old-space-size=4096'
npx.cmd next dev --turbo --port 3000
```

Truy cập `http://localhost:3000`. Swagger backend ở `http://localhost:5053/swagger`.

Tài khoản quản trị demo do seeder tạo:

- Email: `admin@cloudservicestore.com`
- Mật khẩu: `Admin@123`

## 2. Thực hành từng chức năng

1. **Sổ địa chỉ thanh toán:** đăng nhập, thêm sản phẩm vào giỏ, mở `/checkout`, tạo nhiều địa chỉ, đặt địa chỉ mặc định và xóa địa chỉ không còn dùng.
2. **VIP Club:** mở `/dashboard`; widget VIP hiển thị tổng chi tiêu, hạng Đồng/Bạc/Vàng/Kim Cương, mức giảm và tiến trình lên hạng.
3. **Ghim dịch vụ:** mở VPS, Domain hoặc SSL trong Dashboard, bấm biểu tượng ghim; quay lại `/dashboard` để dùng widget Quick Access.
4. **Kênh thông báo:** mở `/dashboard/notifications`, nhập số điện thoại/Zalo ID/Telegram Chat ID, bật từng công tắc SMS, Zalo và Telegram rồi lưu.
5. **CSAT ticket:** tạo ticket, dùng tài khoản staff/admin đóng ticket, mở lại chi tiết ticket bằng tài khoản khách và gửi đánh giá 1-5 sao cùng nhận xét. Mỗi ticket chỉ đánh giá một lần.
6. **Combo dịch vụ:** mở `/bundles`, chọn combo và bấm thêm toàn bộ vào giỏ. Giảm giá combo được lưu trên giỏ và áp dụng lúc checkout; nếu có coupon, hệ thống lấy mức giảm cao hơn.
7. **Cảnh báo tồn kho/giá:** mở một trang `/services/plans/{planId}`, nhập giá mục tiêu và bấm theo dõi. Danh sách đăng ký có API `GET /api/stock-alerts/me`.
8. **Dùng thử VPS:** tại chi tiết gói, bấm bắt đầu dùng thử. Mỗi tài khoản chỉ đăng ký một lần và thời hạn được đặt đúng 3 ngày.
9. **Lịch sử giá:** admin thêm hoặc sửa giá trong quản trị gói. Mỗi thay đổi được ghi tự động và biểu đồ sparkline hiển thị tại chi tiết gói.
10. **Hỏi đáp gói cước:** khách đăng câu hỏi tại chi tiết gói; staff/admin trả lời công khai qua `POST /api/plan-questions/{questionId}/answers`.

## 3. API chính

| Chức năng | Endpoint |
|---|---|
| Billing address | `GET/POST /api/billing-addresses`, `PUT /{id}/default`, `DELETE /{id}` |
| VIP | `GET /api/vip-club/me` |
| Pinned services | `GET /api/pinned-services`, `POST /api/pinned-services/toggle` |
| Notification channels | `GET/PUT /api/notification-settings` |
| Ticket CSAT | `GET/POST /api/tickets/{id}/feedback` |
| Bundles | `GET/POST /api/service-bundles`, `POST /{id}/add-to-cart` |
| Alerts | `GET /api/stock-alerts/me`, `POST /api/stock-alerts`, `DELETE /{id}` |
| Free trial | `GET /api/free-trials/my-status`, `POST /api/free-trials/request` |
| Price history | `GET /api/service-plans/{id}/price-history` |
| Q&A | `GET/POST /api/service-plans/{id}/questions`, `POST /api/plan-questions/{id}/answers` |

## 4. Kiểm tra nhanh

```powershell
cd CloudServiceStore
dotnet build CloudServiceStore.slnx --no-restore
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj --filter FullyQualifiedName~TeamFeatureEntitiesTests
cd ..\frontend
npm.cmd run build
```

Migration của nhóm chức năng là `20260819175829_AddTeamMemberFeatures`.
