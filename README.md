# ☁️ CloudServiceStore — Enterprise Cloud Hosting & VPS Platform

CloudServiceStore là nền tảng quản lý và kinh doanh dịch vụ điện toán đám mây (Cloud VPS, Web Hosting, Domain, SSL Certificates, Database as a Service) với hệ thống thanh toán tự động VietQR (SePay), MoMo, VNPAY và tự động kích hoạt máy chủ bằng Docker Engine.

---

## ⚡ Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Xem chi tiết đầy đủ tại file: **[PROJECT_STARTUP_GUIDE.md](file:///home/object-oriented-software-programming/PROJECT_STARTUP_GUIDE.md)**

```bash
# 1. Khởi động SQL Server & Redis (Docker)
docker compose up -d sqlserver redis

# 2. Khởi chạy Backend WebApi (.NET 10)
dotnet run --project CloudServiceStore/CloudServiceStore.WebApi

# 3. Khởi chạy Frontend (Next.js)
cd frontend && npm run dev

# 4. Mở tunnel nhận Webhook ngân hàng SePay (Ngrok)
ngrok http 5053 --log=stdout
```

---

## 🌐 Các Cổng Dịch Vụ & Trang Quản Trị
- 💻 **Frontend Web App:** `http://localhost:3000`
- ⚙️ **Backend WebApi / Swagger:** `http://localhost:5053/swagger`
- 📊 **Ngrok Webhook Inspector:** `http://localhost:4040`
- 📦 **Database:** `localhost:1433` (`CloudServiceStoreDb`)
- ⚡ **Redis Cache:** `localhost:6379`
