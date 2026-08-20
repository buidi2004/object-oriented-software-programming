# LỆNH: Chuyển đổi Mock Provisioning Services → Real Implementation (100% Free Tier)

## Bối cảnh
Dự án `CloudServiceStore` (.NET Clean Architecture: Domain/Application/Infrastructure/WebApi/Tests, CQRS+MediatR, Docker Compose, đã có `VpsInstance` provisioning thật qua `Docker.DotNet`).

Các service sau đang **mock/giả lập** (chỉ delay giả rồi trả về success), cần chuyển thành **provisioning thật, chạy trên chính hạ tầng Docker sẵn có, không tốn phí license/API key trả phí**:

- `AcmeProvisioningService` (SSL)
- `MinioProvisioningService` (Object Storage)
- `ManagedDatabaseInstance` provisioning (hiện chưa có service thật)
- `GameServerInstance` provisioning
- `StaticSite` provisioning
- `AppInstallation` provisioning

## Yêu cầu bắt buộc (áp dụng cho MỌI service bên dưới)

1. **Không dùng mock/delay giả** — mọi thao tác phải gọi API/Docker daemon thật.
2. **Không dùng dịch vụ trả phí** — chỉ dùng: Let's Encrypt, MinIO (self-host), Docker container tự quản lý (Postgres/MySQL/Redis chính thức image), image open-source cho game server, Nginx/Caddy cho static site, Docker Compose template cho app installer.
3. **Idempotency**: dùng `IdempotencyKey` đã có sẵn trong `ResourceProvisioningWorker` — nếu job retry, không được tạo trùng resource (check tồn tại trước khi tạo).
4. **Validate trước khi thực thi** (qua FluentValidation pipeline behavior sẵn có):
   - Check port trống trước khi bind container (tránh `port already allocated` → lỗi 500).
   - Check tên container/bucket/database không trùng (tránh conflict → lỗi 400/409).
   - Check tài nguyên server còn đủ (RAM/disk) trước khi spin container mới — nếu không đủ, trả về lỗi nghiệp vụ rõ ràng (400 với message cụ thể), KHÔNG để Docker daemon throw exception văng thẳng lên tới API (500).
5. **Try/catch + rollback**: nếu bước nào trong provisioning fail giữa chừng (VD: container tạo được nhưng gán network fail), phải cleanup resource đã tạo dở, set trạng thái entity về `Failed` kèm lý do, KHÔNG để entity kẹt ở trạng thái `Provisioning` mãi mãi.
6. **Timeout**: mọi lệnh gọi Docker/ACME phải có timeout (VD: 60s), không block worker vô thời hạn.
7. **Retry với backoff**: dùng Hangfire's `AutomaticRetry` (giới hạn 3 lần) cho các lỗi tạm thời (network, Docker daemon busy), KHÔNG retry cho lỗi nghiệp vụ (VD: tên trùng).
8. **Middleware exception handling sẵn có** (`Middlewares/ExceptionHandlingMiddleware`) phải bắt được toàn bộ exception mới phát sinh từ các service này và map đúng status code (400 cho lỗi input/nghiệp vụ, 409 cho conflict, 500 CHỈ khi thật sự là lỗi hệ thống không lường trước).
9. **Log đầy đủ** ở mỗi bước provisioning (structured logging, có `CorrelationId`/`OrderId`) để debug khi có lỗi.
10. **Cập nhật trạng thái real-time qua SignalR** đúng như pattern `VpsInstance` đã làm — không được giữ nguyên format cũ mà bỏ qua bước notify.
11. **Viết unit test + integration test** cho mỗi service mới (theo cấu trúc `CloudServiceStore.Tests/`), bao gồm test case lỗi (port trùng, tài nguyên không đủ, Docker daemon down) để đảm bảo trả về đúng status code, không bao giờ để lộ raw exception ra response.

## Chi tiết từng service

### 1. SSL — `AcmeProvisioningService`
- Dùng thư viện `Certes` (NuGet, free, MIT license).
- Hỗ trợ HTTP-01 challenge (đơn giản hơn) và DNS-01 (nếu domain dùng Cloudflare, có thể tự động hoá qua Cloudflare free API).
- Lưu private key + cert vào secure storage (VD: mount volume riêng hoặc DB encrypted field), KHÔNG log ra plaintext.
- Xử lý lỗi: domain chưa trỏ đúng DNS (trả 400 "domain chưa point về server"), rate limit của Let's Encrypt (retry sau, không throw 500).
- Thêm job renew tự động trước khi hết hạn 30 ngày (đã có `SslRenewalJob`, chỉ cần nối vào logic thật).

### 2. Object Storage — `MinioProvisioningService`
- MinIO server chạy sẵn 1 lần (không phải tạo container mới mỗi order) — dùng MinIO Admin API (`Minio.AdminApi` hoặc gọi `mc` CLI qua process) để tạo bucket + user + policy riêng cho từng khách trong 1 instance MinIO chung.
- Set quota per-bucket theo gói dịch vụ khách mua.
- Xử lý lỗi: bucket name trùng (S3 naming rules) → trả 400 kèm gợi ý tên khác.

### 3. Managed Database — cần tạo mới `DockerDatabaseProvisioningService`
- Mỗi order = 1 container Postgres/MySQL/Redis riêng, dùng `Docker.DotNet` (tái sử dụng pattern từ VPS).
- Random port trong range cấu hình sẵn, kiểm tra port trống trước khi bind.
- Tạo user/password riêng, không dùng chung root credentials.
- Set resource limit cho container (`--memory`, `--cpus`) theo gói dịch vụ, tránh 1 khách chiếm hết tài nguyên server làm sập các container khác.
- Healthcheck sau khi tạo (ping DB thật trước khi set status = `Active`), nếu healthcheck fail → rollback + status `Failed`.

### 4. Game Server — cần tạo mới `DockerGameServerProvisioningService`
- Dùng image community chuẩn theo game (VD: `itzg/minecraft-server`, `lloesche/valheim-server`).
- Map port riêng, set env vars theo config khách chọn (RAM, version, mod...).
- Volume riêng cho save data mỗi khách (persist qua restart).
- Healthcheck: chờ log container báo "server started" (parse log) trước khi set Active.

### 5. Static Site — cần tạo mới `StaticSiteProvisioningService`
- Container Nginx/Caddy nhẹ, mount thư mục static đã upload/build của khách (read-only volume).
- Tự động cấp domain phụ (subdomain) trỏ về container qua reverse proxy chung (Traefik hoặc Nginx reverse proxy đã có sẵn ở tầng ingress).
- Auto SSL cho subdomain qua chính `AcmeProvisioningService` ở mục 1.

### 6. App Installer — cần tạo mới `DockerAppInstallerService`
- Chuẩn bị sẵn thư mục template Docker Compose cho từng app phổ biến (WordPress, Ghost, n8n...), mỗi app 1 file `docker-compose.{app}.yml`.
- Khi khách cài: generate file compose từ template + env riêng (DB credentials, domain), chạy `docker compose -p {orderId} up -d`.
- Lưu lại `docker-compose` đã generate để có thể `down`/cleanup khi khách huỷ dịch vụ.

## Định nghĩa "Xong" (Definition of Done)
- Không còn `Task.Delay` giả lập ở bất kỳ provisioning service nào trong danh sách trên.
- Toàn bộ endpoint liên quan trả đúng status code theo tình huống thật (400/409/500 đúng nghĩa, không còn 500 do exception chưa bắt).
- Có test case giả lập lỗi (port trùng, tài nguyên hết, Docker daemon lỗi) và assert response đúng, không server crash.
- Entity không bao giờ kẹt ở trạng thái `Provisioning` quá timeout đã định — phải tự động chuyển `Failed` kèm message rõ ràng.