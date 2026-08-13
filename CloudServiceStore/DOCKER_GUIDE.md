# 🐳 Hướng Dẫn Chạy Docker Backend Trên WSL 2 (Ubuntu)

Tài liệu này hướng dẫn chi tiết cách vận hành, cấu hình và phân tích chuyên sâu kiến trúc Docker cho dự án **CloudServiceStore WebApi** trực tiếp trên môi trường **WSL 2 (Ubuntu)**.

---

## 📌 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống Backend được container hóa bằng **Docker & Docker Compose** trên WSL 2 bao gồm 2 dịch vụ:

```text
       +-----------------------------------------------------------+
       |   Windows Host OS (Browser / Postman / DB Tool)          |
       |   Access via: http://localhost:5053 hoặc localhost:1433   |
       +-----------------------------+-----------------------------+
                                     | (WSL 2 Port Forwarding)
                                     v
       +-----------------------------------------------------------+
       |   WSL 2 (Ubuntu Linux Environment)                        |
       |   Path: /home/object-oriented-software-programming/...  |
       |                                                           |
       |  +--------------------+       +------------------------+  |
       |  | cloudservicestore  |  ===> | cloudservicestore_     |  |
       |  | _api (.NET 10)     |  Net  | sqlserver (MSSQL 2022) |  |
       |  | Port: 5053 -> 8080 |       | Port: 1433 -> 1433     |  |
       |  +--------------------+       +-----------+------------+  |
       |                                           |               |
       |                                     [ Volume:     ]       |
       |                                     [ sqlserver_  ]       |
       |                                     [ data        ]       |
       +-----------------------------------------------------------+
```

### Thông Số Cấu Hình Dịch Vụ:

| Dịch Vụ (Service) | Container Name | Source / Image | Host Port (Windows/WSL) | Container Port |
| :--- | :--- | :--- | :--- | :--- |
| **Web API** | `cloudservicestore_api` | Build từ `./Dockerfile` (.NET 10) | `5053` | `8080` |
| **Database** | `cloudservicestore_sqlserver` | `mcr.microsoft.com/mssql/server:2022-latest` | `1433` | `1433` |

---

## 🐧 2. Cấu Hình Môi Trường WSL 2 & Docker Engine

Để chạy mượt mà trên WSL 2 (Ubuntu):

1. **Docker Desktop trên Windows**:
   - Bật option: **Settings -> General -> Use the WSL 2 based engine**.
   - Bật integration: **Settings -> Resources -> WSL Integration -> Enable integration with Ubuntu**.
2. **Kiểm tra Docker từ Terminal WSL 2 (Ubuntu)**:
   ```bash
   docker --version
   docker compose version
   ```

---

## 🚀 3. Hướng Dẫn Chạy Backend Trong WSL 2

### 🏃 Các bước thực hiện:

#### Bước 1: Mở terminal WSL 2 và di chuyển vào đúng thư mục Backend
```bash
cd /home/object-oriented-software-programming/CloudServiceStore
```
> ⚠️ **LƯU Ý QUAN TRỌNG**: Lệnh `docker compose` bắt buộc phải chạy tại thư mục chứa file `docker-compose.yml` (hoặc phải dùng cờ `-f`). Nếu đứng ở thư mục ngoài (root), lệnh `docker compose ps` sẽ báo lỗi `no configuration file provided`.

#### Bước 2: Build & Khởi chạy container ngầm (Detached Mode)
```bash
docker compose up --build -d
```
*Cờ `--build` giúp Docker tự động Rebuild image khi có thay đổi code C#.*

#### Bước 3: Kiểm tra trạng thái Container

- **Cách 1**: Đứng tại thư mục `CloudServiceStore`:
  ```bash
  docker compose ps
  ```
- **Cách 2**: Đứng ở bất kỳ thư mục nào trong WSL 2:
  ```bash
  docker ps
  ```
  *(Kết quả sẽ hiển thị 2 container `cloudservicestore_api` và `cloudservicestore_sqlserver` ở trạng thái `Up`).*

#### Bước 4: Truy cập ứng dụng từ Windows hoặc WSL 2
Nhờ cơ chế **WSL 2 Auto Port Forwarding**, bạn có thể mở Trình duyệt / Postman ngay trên Windows:
- **API Health / Root**: `http://localhost:5053`
- **SQL Server Connection**: `Server=localhost,1433;Database=CloudServiceStoreDb;User Id=sa;Password=Your_Strong_Password_123!;TrustServerCertificate=True;`

#### Bước 5: Xem Logs trực tiếp (Real-time Logs)
> ⚠️ **Lưu ý**: Lệnh `docker compose` bắt buộc phải chạy trong thư mục chứa file `docker-compose.yml`.
```bash
cd /home/object-oriented-software-programming/CloudServiceStore

# Xem log tất cả các container
docker compose logs -f

# Xem log riêng Web API
docker compose logs -f webapi

# Xem log riêng SQL Server
docker compose logs -f sqlserver
```

#### Bước 6: Dừng dịch vụ
```bash
cd /home/object-oriented-software-programming/CloudServiceStore

# Dừng container (Giữ lại dữ liệu database)
docker compose down

# Dừng container & XÓA dữ liệu database (Re-init từ đầu)
docker compose down -v
```

---

## 🔬 4. Phân Tích Chuyên Sâu (Deep-Dive Analysis)

### 4.1. Tối Ưu Tốc Độ Build Với Linux Multi-stage Dockerfile

Trên môi trường WSL 2 Linux, Docker tận dụng triệt để cơ chế **Layer Caching** của Linux kernel:

```dockerfile
# STAGE 1: Base Runtime (Môi trường chạy sản phẩm - Siêu nhẹ)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# STAGE 2: SDK Build (Môi trường biên dịch code)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Tận dụng Docker Layer Cache: Chỉ restore khi file .csproj thay đổi
COPY ["CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj", "CloudServiceStore.WebApi/"]
COPY ["CloudServiceStore.Application/CloudServiceStore.Application.csproj", "CloudServiceStore.Application/"]
COPY ["CloudServiceStore.Domain/CloudServiceStore.Domain.csproj", "CloudServiceStore.Domain/"]
COPY ["CloudServiceStore.Infrastructure/CloudServiceStore.Infrastructure.csproj", "CloudServiceStore.Infrastructure/"]
RUN dotnet restore "CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj"

# Build ứng dụng
COPY . .
WORKDIR "/src/CloudServiceStore.WebApi"
RUN dotnet build "CloudServiceStore.WebApi.csproj" -c Release -o /app/build

# STAGE 3: Publish Output
FROM build AS publish
RUN dotnet publish "CloudServiceStore.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# STAGE 4: Output Image cuối cùng
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CloudServiceStore.WebApi.dll"]
```

### 4.2. Quản Lý File System & Hiệu Năng Trên WSL 2
- **Lưu file ở đâu?**: Luôn lưu dự án trong đường dẫn Linux của WSL 2 (ví dụ `/home/...` hoặc `~/...`). **Không nên** đặt trong đường dẫn Windows (`/mnt/c/...`) vì hiệu năng I/O của Docker trên `/mnt/c/` chậm hơn đến 10 lần so với ext4 gốc của WSL 2.
- **SQL Server Storage**: Volume `sqlserver_data` được lưu trực tiếp trong hệ thống tệp ext4 của WSL 2 giúp tốc độ ghi đĩa của SQL Server đạt mức tối đa.

### 4.3. Biến Môi Trường Kết Nối Database
Trong `docker-compose.yml`:
```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Development
  - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=CloudServiceStoreDb;User Id=sa;Password=Your_Strong_Password_123!;TrustServerCertificate=True;
```
- Khi chạy bằng Docker, Container Web API tự động gọi container Database thông qua Hostname nội bộ `Server=sqlserver`.
- Ngược lại, nếu bạn chạy Web API trực tiếp bằng `dotnet run` trên WSL terminal (không dùng container API), chuỗi kết nối sẽ đổi thành `Server=localhost;...`.

---

## 🛠️ 5. Bảng Tra Cứu Lệnh Docker WSL 2 (Cheat Sheet)

| Thao Tác | Lệnh Thực Thi (Chạy trên Terminal WSL 2) |
| :--- | :--- |
| **Build & Khởi chạy** | `cd CloudServiceStore && docker compose up --build -d` |
| **Kiểm tra container đang chạy (Toàn cục)** | `docker ps` |
| **Kiểm tra dịch vụ compose (Tại thư mục BE)** | `cd CloudServiceStore && docker compose ps` |
| **Xem log live của Web API** | `cd CloudServiceStore && docker compose logs -f webapi` |
| **Vào terminal bên trong container API** | `docker exec -it cloudservicestore_api sh` |
| **Vào SQLCmd bên trong container SQL Server** | `docker exec -it cloudservicestore_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Your_Strong_Password_123!' -C` |
| **Giải phóng RAM / Cache Docker** | `docker system prune -f` |

---

*Tài liệu dành riêng cho môi trường phát triển WSL 2 (Ubuntu Linux).*
