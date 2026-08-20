---
name: "Startup and Services Rule"
description: "Instructions for starting and inspecting all CloudServiceStore services including Backend, Frontend, Docker dependencies, and Ngrok tunnel."
---

# 🚀 Quy Tắc Khởi Động & Vận Hành Hệ Thống

Mỗi khi người dùng yêu cầu khởi động hoặc kiểm tra hệ thống, AI PHẢI tuân thủ các thông số chuẩn sau:

1. **Docker Services:**
   - SQL Server (`localhost:1433`) và Redis (`localhost:6379`).
   - Lệnh: `docker compose up -d sqlserver redis`

2. **Backend WebApi (.NET 10):**
   - Port: `http://localhost:5053` (và Swagger tại `/swagger`).
   - Lệnh: `dotnet run --project CloudServiceStore/CloudServiceStore.WebApi`

3. **Frontend Next.js:**
   - Port: `http://localhost:3000`.
   - Lệnh: `cd frontend && npm run dev`

4. **SePay Webhook Ngrok Tunnel:**
   - Cổng trỏ về: `5053`.
   - Lệnh: `ngrok http 5053 --log=stdout`
   - Lấy URL công khai: `curl -s http://localhost:4040/api/tunnels`

5. **Chi tiết cấu hình:**
   - Tham khảo tài liệu đầy đủ tại `PROJECT_STARTUP_GUIDE.md` ở thư mục gốc dự án.
