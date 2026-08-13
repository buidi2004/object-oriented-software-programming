# ☁️ CloudServiceStore Backend (.NET 10 Web API)

Hệ thống Backend cho dự án CloudServiceStore xây dựng bằng **.NET 10 Web API**, **Entity Framework Core**, **Clean Architecture** & **CQRS (MediatR)**.

---

## 📂 Cấu Trúc Dự Án

- `CloudServiceStore.Domain`: Chứa Domain Entities, Enums, Interfaces core.
- `CloudServiceStore.Application`: Chứa CQRS Commands, Queries, DTOs, Handlers và Interfaces.
- `CloudServiceStore.Infrastructure`: Chứa EF Core DbContext, Repositories, Migrations và tích hợp dịch vụ bên ngoài.
- `CloudServiceStore.WebApi`: RESTful API Endpoints, Middlewares và DI Configuration.
- `CloudServiceStore.Tests`: Unit Tests & Integration Tests.

---

## 🐳 Khởi Chạy Bằng Docker

Hệ thống hỗ trợ chạy toàn bộ Backend (Web API + SQL Server 2022) bằng **Docker Compose**:

```bash
cd CloudServiceStore
docker compose up --build -d
```

- **Web API**: `http://localhost:5053`
- **SQL Server**: `localhost:1433`

📖 Xem chi tiết tài liệu hướng dẫn và phân tích chuyên sâu tại: **[DOCKER_GUIDE.md](file:///home/object-oriented-software-programming/CloudServiceStore/DOCKER_GUIDE.md)**.

---

## 💻 Khởi Chạy Local (Không dùng Docker)

1. Đảm bảo đã có SQL Server đang chạy tại local.
2. Cấu hình chuỗi kết nối trong `CloudServiceStore.WebApi/appsettings.Development.json`.
3. Chạy lệnh:
   ```bash
   dotnet restore
   dotnet run --project CloudServiceStore.WebApi
   ```
