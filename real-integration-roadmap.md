# Kế Hoạch Triển Khai Tích Hợp Thật — CloudServiceStore

> **Dành cho AI Agent:** Đọc toàn bộ file này trước khi bắt đầu code bất kỳ module nào.
> Mục tiêu không chỉ là "chạy được" mà là **giảm bug tối đa** — nghĩa là mọi module phải theo đúng pattern chuẩn ở Phần 2, không tự sáng tạo cấu trúc riêng.

---

## 1. Nguyên tắc giảm bug (áp dụng xuyên suốt, không được bỏ qua)

1. **Không có module nào được viết tự do** — mọi module mới bắt buộc theo pattern ở Phần 2, kể cả khi "làm khác đi thấy tiện hơn".
2. **Mọi lệnh gọi ra hệ thống ngoài (Docker daemon, MinIO, Cloudflare API) đều phải có retry + timeout** — không bao giờ gọi trực tiếp không bọc.
3. **Mọi resource có vòng đời (VPS, Database, Game Server...) đều phải có state machine rõ ràng** — không dùng string tự do để lưu trạng thái.
4. **Mọi command tạo resource đều phải chống tạo trùng (idempotency)** — user bấm nút 2 lần do mạng chậm không được tạo ra 2 resource.
5. **Không được để resource "mồ côi" (orphaned)** — nếu tạo container thành công nhưng ghi DB thất bại (hoặc ngược lại), phải có cơ chế dọn dẹp tự động.
6. **Mọi exception từ external system phải map rõ ràng**: lỗi do input sai → 400, lỗi do hệ thống ngoài chết/timeout → 500, không bao giờ để leak raw exception message ra response.
7. **Viết test 400 + 500 cho MỖI command mới ngay khi viết xong** — không dồn viết test sau cùng.

---

## 2. Pattern chuẩn dùng cho MỌI module (Domain → Application → Infrastructure → WebApi)

Dùng đúng cấu trúc đã có sẵn trong project (tham khảo `DockerVpsProvisioningService` làm mẫu), lặp lại cho từng module mới:

```
Domain/
  Entities/{Feature}.cs          — thêm state machine (xem mục 2.1)
  Enums/{Feature}Status.cs

Application/
  Features/{Feature}/
    Commands/Create{Feature}Command.cs      — có Validator (FluentValidation)
    Commands/Create{Feature}CommandHandler.cs
  Interfaces/I{Feature}ProvisioningService.cs   — abstraction, KHÔNG gọi trực tiếp Docker/MinIO/Cloudflare SDK trong Handler

Infrastructure/
  Services/{Feature}ProvisioningService.cs      — implement interface trên, chứa toàn bộ logic gọi ra ngoài
  BackgroundServices/{Feature}CleanupService.cs — dọn resource mồ côi (xem mục 2.3)

WebApi/
  Controllers/{Feature}Controller.cs

Tests/
  E2E/{Feature}E2ETests.cs         — bắt buộc có test 400 + 500 (xem mục 4)
```

### 2.1. State machine bắt buộc cho mọi entity có vòng đời
```csharp
// Domain/Entities/GameServerInstance.cs — ví dụ áp dụng
public class GameServerInstance : AggregateRoot
{
    public GameServerStatus Status { get; private set; }

    public void MarkAsRunning()
    {
        if (Status != GameServerStatus.Creating)
            throw new InvalidOperationException($"Không thể chuyển sang Running từ trạng thái {Status}");
        Status = GameServerStatus.Running;
    }

    public void MarkAsFailed(string reason)
    {
        Status = GameServerStatus.Failed;
        FailureReason = reason; // luôn lưu lý do fail để debug sau
    }
}
```

### 2.2. Idempotency cho command tạo resource
**Bắt buộc unique constraint** trên cột `IdempotencyKey` ở DB — không chỉ check ở code.

### 2.3. Background job dọn resource mồ côi
Tìm resource ở trạng thái "Provisioning" quá thời gian → tự động đánh dấu Failed + xóa container/bucket rác.

### 2.4. Retry + Circuit Breaker cho mọi lệnh gọi hạ tầng ngoài
Dùng `Polly` (đã phổ biến trong .NET, dễ cài) — áp dụng cho MỌI service gọi Docker/MinIO/Cloudflare.

---

## 3. Thứ tự triển khai (từ dễ/ít rủi ro → khó/nhiều rủi ro)

| Thứ tự | Module | Vì sao làm trước/sau |
|---|---|---|
| 1 | **Website Builder / Marketplace** | Không phụ thuộc hệ thống ngoài, dùng để hoàn thiện pattern CQRS+validation trước |
| 2 | **SSL (Let's Encrypt)** | Chỉ 1 lệnh gọi ra ngoài (ACME), state machine đơn giản (Pending→Issued→Expired) |
| 3 | **Object Storage (MinIO)** | Cần học idempotency + retry, nhưng MinIO chạy local nên dễ debug |
| 4 | **Managed Database (Docker)** | Bắt đầu cần cleanup job (container có thể bị treo khi tạo) |
| 5 | **Game Server (Docker)** | Giống Database nhưng thêm networking (port mapping) — dễ lộ bug port trùng |
| 6 | **1-Click Apps (Docker)** | Tái dùng gần như 100% pattern từ Database + Game Server |
| 7 | **CDN (Cloudflare)** | Bắt đầu phụ thuộc API bên thứ 3 thật, cần retry/circuit breaker chắc chắn |
| 8 | **Static Sites** | Kết hợp cả Docker (Nginx) lẫn CDN — làm sau cùng vì phụ thuộc cả 2 module trước |

---

## 4. Checklist kiểm thử bắt buộc — MỖI module phải có đủ trước khi coi là "xong"

- [ ] Test 400: thiếu field bắt buộc, sai enum, vượt giới hạn (quota)
- [ ] Test 400: gửi trùng `IdempotencyKey` với payload khác → phải trả lỗi rõ ràng, không tạo resource mới
- [ ] Test 500: mock service hạ tầng ném exception → response 500, không leak message nội bộ
- [ ] Test riêng: mock service hạ tầng **timeout** (không throw, chỉ treo) → xác nhận có timeout ở tầng gọi, không đợi vô hạn
- [ ] Test cleanup job: tạo resource giả ở trạng thái "Provisioning" quá hạn → chạy cleanup job → xác nhận resource chuyển "Failed" và external resource bị xóa
- [ ] Test state machine: gọi transition method ở trạng thái không hợp lệ → phải throw, không âm thầm bỏ qua

---

## 5. Bảng theo dõi tiến độ (AI agent tick từng dòng khi hoàn thành)

| Module | Domain+Enum | Command+Validator | Provisioning Service | Controller | Cleanup Job | Test 400/500 | Trạng thái |
|---|---|---|---|---|---|---|---|
| Website Builder | [x] | [x] | — | [x] | — | [x] | Hoàn thành |
| SSL (Let's Encrypt) | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| Object Storage (MinIO) | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| Managed Database | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| Game Server | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| 1-Click Apps | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| CDN (Cloudflare) | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |
| Static Sites | [x] | [x] | [x] | [x] | [x] | [x] | Hoàn thành |

---

## 6. Bảng theo dõi tiến độ Frontend Real-time (FE Map Với BE Thật)

| Module | Route | Hook / Real-time UI | Git Branch | Trạng thái |
|---|---|---|---|---|
| Database | `/dashboard/databases` | [x] | `feature/fe-realtime-database` | Hoàn thành |
| Storage | `/dashboard/storage` | [x] | `feature/fe-realtime-storage` | Hoàn thành |
| Game Servers | `/dashboard/game-servers` | [x] | `feature/fe-realtime-game-servers` | Hoàn thành |
| CDN | `/dashboard/cdn` | [x] | `feature/fe-realtime-cdn` | Hoàn thành |
| Static Sites | `/dashboard/static-sites` | [x] | `feature/fe-realtime-static-sites` | Hoàn thành |
| SSL | `/dashboard/ssl-certificates` | [x] | `feature/fe-realtime-ssl` | Hoàn thành |
