# 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG CLOUDSERVICE STORE (FULLSTACK)

> **Tài liệu hướng dẫn khởi động và cấu hình toàn bộ hệ thống CloudServiceStore dành cho Developer & AI Assistant.**

---

## 🏗️ 1. Kiến Trúc Hệ Thống & Cổng Dịch Vụ (Ports)

| Thành phần | Công nghệ | Cổng (Port) / URL | Mô tả |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router, TailwindCSS) | `http://localhost:3000` | Giao diện khách hàng & Admin portal |
| **Backend WebApi** | .NET 10 (Clean Architecture, MediatR, EF Core) | `http://localhost:5053` | REST API, SignalR Hubs, Swagger |
| **Database** | Microsoft SQL Server 2022 | `localhost:1433` (Docker) | Lưu trữ dữ liệu chính (`CloudServiceStoreDb`) |
| **Cache** | Redis 7 Alpine | `localhost:6379` (Docker) | Cache danh mục, phân trang, token blacklist |
| **VPS Provisioning** | Docker Engine API | `unix:///var/run/docker.sock` | Tự động khởi tạo & quản lý container VPS |
| **SePay Webhook (Production)** | Nginx Reverse Proxy | `https://buivandihhhh.duckdns.org` -> `5053` | Nhận Webhook chuyển khoản thật từ MB Bank (Production) |
| **Email SMTP** | Gmail SMTP (MailKit) | `smtp.gmail.com:587` | Gửi email kích hoạt, bàn giao VPS, bảo mật |

---

## ⚙️ 2. Lệnh Khởi Chạy Toàn Bộ Hệ Thống (Startup Commands)

### Bước 1: Khởi động Database & Cache (Docker)
```bash
# Khởi chạy SQL Server và Redis
docker compose up -d sqlserver redis

# (Tùy chọn) Kiểm tra container đang chạy:
docker ps
```

### Bước 2: Khởi chạy Backend WebApi (.NET 10)
```bash
# Tại thư mục gốc dự án:
dotnet run --project CloudServiceStore/CloudServiceStore.WebApi
```
- API Endpoint: `http://localhost:5053`
- Swagger UI: `http://localhost:5053/swagger`

### Bước 3: Khởi chạy Frontend (Next.js)
```bash
# Chuyển vào thư mục frontend và khởi động dev server:
cd frontend
npm install # (Nếu chưa cài dependencies)
npm run dev
```
- Web App URL: `http://localhost:3000`

### Bước 4: Chạy Môi Trường Production (VPS)
```text
Khi hệ thống chạy trên VPS thật, không cần dùng Ngrok để nhận Webhook.
Tên miền HTTPS (DuckDNS) sẽ trực tiếp nhận tín hiệu từ SePay và chuyển cho Backend!
```

---

## 💳 3. Cấu Hình Thanh Toán VietQR & SePay Webhook

### Thông tin ngân hàng nhận tiền thật:
- **Ngân hàng:** MB Bank (Quân Đội)
- **Số tài khoản (STK):** `0923158725`
- **Chủ tài khoản:** `BUI VAN DI`
- **Cú pháp chuyển khoản:** `PAY<Mã_đơn>` (Ví dụ: `PAY18C4AC13`)

### Cấu hình SePay Webhook:
- **API Key SePay:** `HIJJSQ245A0AONRTKFRAG4G1HWWXIEUJFMW2OEHCZZXUPV5ZTWU3JQF6PPYMBE6Q`
- **Webhook Endpoint:** `/api/payments/webhook/sepay`
- **Cấu hình trên my.sepay.vn:**
  ```text
  URL Webhook: https://buivandihhhh.duckdns.org/api/payments/webhook/sepay
  Header: Authorization: Apikey HIJJSQ245A0AONRTKFRAG4G1HWWXIEUJFMW2OEHCZZXUPV5ZTWU3JQF6PPYMBE6Q
  ```

---

## 📧 4. Cấu Hình Gửi Email Gmail Thật (SMTP)

Đã được cấu hình trong `CloudServiceStore/CloudServiceStore.WebApi/appsettings.json`:
```json
"EmailSettings": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "buidi7170@gmail.com",
  "SenderPassword": "acmbfwjvytdzwnys",
  "SenderName": "CloudHost VN"
}
```

### Các sự kiện hệ thống tự động gửi email:
1. **Xác nhận thanh toán thành công:** Gửi ngay khi nhận webhook SePay/Momo/VNPAY.
2. **Bàn giao thông số VPS:** Gửi IP, SSH Port, User `root`, Mật khẩu khởi tạo khi container tạo xong.
3. **Cảnh báo đổi mật khẩu / 2FA:** Gửi cảnh báo bảo mật tới hòm thư khi mật khẩu bị thay đổi.
4. **Chào mừng thành viên mới:** Gửi ngay sau khi khách hàng đăng ký tài khoản.
5. **Cảnh báo dịch vụ sắp hết hạn:** Worker tự động gửi nhắc nhở trước 3 ngày.
6. **Nhắc nhở giỏ hàng bỏ quên:** Tự động gửi mail nhắc sau 24h giỏ hàng chưa thanh toán.

---

## 🧪 5. Kiểm Thử Tự Động (Run Tests)

```bash
# Chạy toàn bộ 590+ Unit & Integration Tests:
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj

# Chạy riêng nhóm test Email & Bảo mật:
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj --filter "FullyQualifiedName~SecurityEmailNotificationsTests"
```

---

## 🛠️ 6. Lệnh Tắt Nhanh Các Tiến Trình (Kill Processes)

```bash
# Tắt Backend port 5053 và 7064:
fuser -k 5053/tcp 7064/tcp 2>/dev/null || true

# Tắt Frontend port 3000:
fuser -k 3000/tcp 2>/dev/null || true

```
