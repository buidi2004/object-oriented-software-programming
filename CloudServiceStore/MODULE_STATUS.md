# Kế Hoạch Triển Khai Tích Hợp Thật — CloudServiceStore

> **Dành cho AI Agent (Claude Code):** Đọc toàn bộ file này trước khi bắt đầu code bất kỳ module nào.
> Mục tiêu không chỉ là "chạy được" mà là **giảm bug tối đa** — nghĩa là mọi module phải theo đúng pattern chuẩn ở Phần 2, không tự sáng tạo cấu trúc riêng.

---

## 1. Nguyên tắc giảm bug (áp dụng xuyên suốt, không được bỏ qua)

1. **Không có module nào được viết tự do** — mọi module mới bắt buộc theo pattern ở Phần 2, kể cả khi "làm khác đi thấy tiện hơn".
2. **Mọi lệnh gọi ra hệ thống ngoài (Docker daemon, MinIO, Cloudflare API) đều phải có retry + timeout** — không bao giờ gọi trực tiếp không bọc.
3. **Mọi resource có vòng đời (VPS, Database, Game Server...) đều phải có state machine rõ ràng** — không dùng string tự do để lưu trạng thái.
4. **Mọi command tạo resource đều phải chống tạo trùng (idempotency)** — user bấm nút 2 lần do mạng chậm không được tạo ra 2 resource.
5. **Không được để resource "mồ côi" (orphaned)** — nếu tạo container thành công nhưng ghi DB thất bại (hoặc ngược lại), phải có cơ chế dọn dẹp tự động.
6. **Mọi exception từ external system phải map rõ ràng**: lỗi do input sai → 400, lỗi do hệ thống ngoài chết/timeout → 500, không bao giờ để leak raw exception message ra response.
7. **Viết test 400 + 500 cho MỖI command mới ngay khi viết xong** — không dồn viết test sau cùng (xem lại quy trình test đã thống nhất ở phần trước).

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

**Lý do tách `I{Feature}ProvisioningService`:** để Handler (Application layer) không phụ thuộc trực tiếp Docker.DotNet/MinIO SDK/Cloudflare SDK — dễ mock khi test, và khi đổi hạ tầng sau này (VD từ Docker sang Kubernetes) chỉ sửa Infrastructure, không đụng Application.

### 2.1. State machine bắt buộc cho mọi entity có vòng đời

Không dùng enum tùy tiện — mọi entity provisioning phải theo đúng luồng:

```
Pending → Provisioning → Running
                ↓
              Failed
Running → Suspending → Suspended → Resuming → Running
Running/Suspended → Terminating → Terminated
```

```csharp
// Domain/Entities/GameServerInstance.cs — ví dụ áp dụng
public class GameServerInstance : AggregateRoot
{
    public GameServerStatus Status { get; private set; }

    // Method transition thay vì set trực tiếp — chặn chuyển trạng thái sai luồng
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

**Bug thường gặp nếu bỏ qua bước này:** race condition khi 2 request xử lý cùng lúc đẩy entity vào trạng thái không hợp lệ (VD: vừa Terminating vừa Resuming). Method transition có validate sẽ tự chặn.

### 2.2. Idempotency cho command tạo resource

```csharp
public class CreateDatabaseInstanceCommand : IRequest<DatabaseInstanceDto>
{
    public required string IdempotencyKey { get; init; } // client tự sinh GUID, gửi lại y hệt nếu retry
    public required string Name { get; init; }
    public required DatabaseEngine Engine { get; init; }
}

public class CreateDatabaseInstanceCommandHandler : IRequestHandler<CreateDatabaseInstanceCommand, DatabaseInstanceDto>
{
    public async Task<DatabaseInstanceDto> Handle(CreateDatabaseInstanceCommand request, CancellationToken ct)
    {
        // Check trước: nếu key này đã xử lý rồi, trả lại kết quả cũ, KHÔNG tạo mới
        var existing = await _repository.FindByIdempotencyKeyAsync(request.IdempotencyKey);
        if (existing is not null) return _mapper.Map<DatabaseInstanceDto>(existing);

        // ... logic tạo mới, lưu kèm IdempotencyKey
    }
}
```

**Bắt buộc unique constraint** trên cột `IdempotencyKey` ở DB — không chỉ check ở code (tránh race condition khi 2 request đến gần như đồng thời).

### 2.3. Background job dọn resource mồ côi

Mẫu có sẵn `VpsIdleMonitorService` — nhân bản pattern này cho từng loại resource:

```csharp
public class OrphanedResourceCleanupService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Tìm resource ở trạng thái "Provisioning" quá 5 phút mà chưa chuyển Running/Failed
            // → coi như treo, tự động đánh dấu Failed + xóa container/bucket rác nếu có
            var stuck = await _repository.FindStuckInProvisioningAsync(TimeSpan.FromMinutes(5));
            foreach (var resource in stuck)
            {
                await _provisioningService.ForceCleanupAsync(resource.ExternalId);
                resource.MarkAsFailed("Provisioning timeout — tự động dọn dẹp");
            }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

### 2.4. Retry + Circuit Breaker cho mọi lệnh gọi hạ tầng ngoài

Dùng `Polly` (đã phổ biến trong .NET, dễ cài) — áp dụng cho MỌI service gọi Docker/MinIO/Cloudflare:

```bash
dotnet add package Microsoft.Extensions.Http.Polly
```

```csharp
// Infrastructure/DependencyInjection.cs
services.AddHttpClient<ICloudflareApiClient, CloudflareApiClient>()
    .AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(
        3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))) // 2s, 4s, 8s
    .AddTransientHttpErrorPolicy(policy => policy.CircuitBreakerAsync(
        5, TimeSpan.FromSeconds(30))); // sau 5 lỗi liên tiếp, ngắt 30s không gọi nữa
```

**Bug thường gặp nếu bỏ qua:** Docker daemon hoặc Cloudflare API chậm 1 lần → toàn bộ request user bị treo hàng chục giây không có phản hồi, gây trải nghiệm tệ và có thể sập connection pool nếu nhiều user cùng lúc.

---

## 3. Thứ tự triển khai (từ dễ/ít rủi ro → khó/nhiều rủi ro)

Làm theo đúng thứ tự này — module sau tái dùng pattern đã ổn định từ module trước, giảm bug lặp lại:

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

Nối tiếp quy trình E2E 400/500 đã thống nhất trước đó. Với module có gọi hạ tầng ngoài, thêm các case sau:

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
| Website Builder | ☐ | ☐ | — | ☐ | — | ☐ | Chưa bắt đầu |
| SSL (Let's Encrypt) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| Object Storage (MinIO) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| Managed Database | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| Game Server | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| 1-Click Apps | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| CDN (Cloudflare) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |
| Static Sites | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Chưa bắt đầu |

---

## 6. Lưu ý khi giao việc từng phần cho AI Agent

Vì làm từng module riêng lẻ trong nhiều phiên làm việc, mỗi lần giao task mới cho agent nên nhắc lại:

> "Đọc file `real-integration-roadmap.md` trước. Làm module **[tên module]** theo đúng Phần 2 (pattern chuẩn), đảm bảo đủ Phần 4 (checklist test) trước khi báo hoàn thành. Sau khi xong, tick trạng thái ở bảng Phần 5."

Điều này giúp agent không "quên" pattern đã thống nhất giữa các phiên làm việc khác nhau — nguyên nhân phổ biến nhất gây bug không nhất quán khi để AI code từng phần rời rạc.