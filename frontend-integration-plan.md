# Kế Hoạch Triển Khai Frontend — Map Với Backend Thật

> **Dành cho AI Agent:** Đọc file này CÙNG với `real-integration-roadmap.md` trước khi động vào bất kỳ file `.tsx`/`.ts` nào trong `frontend/`.
> Nguyên tắc số 1: **2 FE (Customer Portal + Admin Portal) đã hoàn chỉnh, build pass 100% — mọi thay đổi phải là bổ sung (additive), không phải sửa lại (refactor).**

---

## 1. Ranh giới rõ ràng: thế nào là "thêm", thế nào là "sửa"

| Được làm (THÊM) | Không được làm (SỬA) |
|---|---|
| Tạo file component/hook mới hoàn toàn | Đổi tên biến, props, hàm đã có |
| Thêm function mới vào **cuối** file cũ (VD: thêm method mới trong `api.ts`) | Sửa nội dung bên trong function cũ đã chạy đúng |
| Thêm nhánh UI mới cho trạng thái chưa từng tồn tại (VD: thêm `if (status === 'Provisioning') return <Spinner />`) | Xóa/đổi nhánh UI cũ đang hiển thị đúng cho case đồng bộ |
| Thêm cột mới vào bảng admin đã có | Đổi layout, đổi cấu trúc bảng hiện tại |
| Thêm trang mới hoàn toàn (route mới) | Đổi route/URL của trang đã có |
| Import thêm component mới vào page cũ (chỉ thêm dòng, không xóa dòng nào) | Refactor lại cấu trúc component cũ "cho gọn hơn" |

**Quy tắc kiểm tra cuối cùng:** chạy `git diff` — nếu thấy bất kỳ dòng nào bắt đầu bằng `-` (bị xóa) trong file KHÔNG phải file mới tạo, phải dừng lại và giải trình rõ lý do, không tự ý merge.

---

## 2. Vì sao cần "thêm" chứ không thể giữ nguyên 100%

Trước đây: bấm "Tạo Database" → backend ghi DB giả → trả về "thành công" ngay lập tức → FE chỉ có 1 trạng thái: **Success**.

Bây giờ: bấm "Tạo Database" → backend thật spin Docker container → mất 5-30 giây → FE cần thêm trạng thái: **Provisioning (đang chờ) → Running (xong) / Failed (lỗi)**.

→ Đây là **case mới chưa từng tồn tại trong code cũ**, nên thêm nhánh xử lý là hợp lệ theo nguyên tắc "chỉ thêm". Code cũ xử lý case Success vẫn giữ nguyên y hệt.

---

## 3. Kiến trúc dùng chung — tạo hoàn toàn mới, an toàn tuyệt đối

Tạo các file này trước, dùng chung cho tất cả 8 module, **không cần đụng file cũ nào** ở bước này:

```
frontend/src/
  hooks/
    useResourceProvisioning.ts     ← MỚI: hook theo dõi trạng thái real-time
  components/shared/
    ProvisioningStatusBadge.tsx    ← MỚI: badge hiển thị Provisioning/Running/Failed
    ResourceActionMenu.tsx         ← MỚI: menu Suspend/Resume/Terminate dùng chung
  lib/
    realtimeClient.ts              ← MỚI: kết nối SignalR hub trạng thái (tách riêng khỏi api.ts)
```

### 3.1. Backend cần thêm 1 SignalR Hub mới (không đụng Hub cũ)

Dự án đã có `VpsTerminalHub`, `LiveChatHub` — thêm 1 hub mới cùng pattern, KHÔNG sửa 2 hub cũ:

```csharp
// WebApi/Hubs/ResourceStatusHub.cs — FILE MỚI HOÀN TOÀN
public class ResourceStatusHub : Hub
{
    public async Task SubscribeToResource(string resourceType, string resourceId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"{resourceType}:{resourceId}");
}
```

Khi `ProvisioningService` chuyển trạng thái resource (Running/Failed), gọi push qua hub này — chỉ thêm 1 dòng gọi ở cuối method có sẵn trong Infrastructure, không sửa logic cũ.

### 3.2. Hook dùng chung ở FE

```typescript
// hooks/useResourceProvisioning.ts — FILE MỚI
export function useResourceProvisioning(resourceType: string, resourceId: string) {
  const [status, setStatus] = useState<'Provisioning' | 'Running' | 'Failed'>('Provisioning');

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/resource-status')
      .build();

    connection.on('StatusChanged', (id: string, newStatus: string) => {
      if (id === resourceId) setStatus(newStatus as any);
    });

    connection.start().then(() =>
      connection.invoke('SubscribeToResource', resourceType, resourceId)
    );

    return () => { connection.stop(); };
  }, [resourceType, resourceId]);

  return status;
}
```

Component nào cần dùng chỉ cần **import và gọi hook này**, không cần viết lại logic polling ở từng trang.

---

## 4. Customer Portal — việc cần thêm cho từng trang (điểm chạm tối thiểu)

| Trang đã có | Cần thêm gì | Điểm chạm vào file cũ |
|---|---|---|
| `/dashboard/database` | Sau khi submit form tạo → thêm `<ProvisioningStatusBadge />` cạnh tên instance, dùng `useResourceProvisioning` | Chỉ thêm 1 dòng JSX + 1 import, không đổi form/logic submit cũ |
| `/dashboard/storage` | Thêm nút "Copy Endpoint" hiện endpoint MinIO thật sau khi Running | Thêm 1 conditional render mới trong khu vực đã có, không đổi cấu trúc list bucket |
| `/dashboard/game-servers` | Thêm hiển thị IP:Port thật để user connect khi status = Running | Thêm field mới vào card hiện có |
| `/dashboard/cdn` | Thêm bước xác thực domain (hiện DNS record cần thêm) khi tạo custom hostname | Thêm 1 step mới trong flow tạo, các step cũ giữ nguyên |
| `/dashboard/static-sites` | Thêm log deploy real-time (nếu dùng SignalR để stream build log) | Trang mới hoàn toàn cho phần xem log, chỉ thêm link "Xem log" ở trang cũ |
| SSL (trang nào đang quản lý, VD trong `/dashboard/domains`) | Thêm hiển thị ngày hết hạn cert thật + trạng thái renew tự động | Thêm badge mới, không đổi layout domain list |

**Nguyên tắc chung cho mọi trang:** action **Suspend/Resume/Terminate** trước đây có thể chưa hoạt động thật (chỉ đổi status DB) — giờ cần gọi API thật. Đây LÀ sửa hành vi của nút bấm cũ (không phải thêm mới) → **báo trước cho user biết** đây là 1 trong số ít chỗ buộc phải "sửa" (đổi hàm xử lý onClick để gọi API thật thay vì API giả), cần review kỹ.

---

## 5. Admin Portal — việc cần thêm

### 5.1. Trang hoàn toàn mới (an toàn 100%, không đụng trang cũ)

```
/admin/resource-health          ← MỚI: dashboard giám sát tất cả resource thật
                                    (container nào đang chạy, dung lượng Docker host còn bao nhiêu,
                                     resource nào bị stuck ở Provisioning quá lâu)
```

Trang này cực kỳ tốt để demo trước hội đồng — cho thấy bạn hiểu vận hành hệ thống thật, không chỉ CRUD.

### 5.2. Bổ sung vào bảng quản lý đã có (chỉ thêm cột)

Ví dụ bảng `VPS Instances` trong Admin Portal đã hoàn chỉnh — chỉ thêm cột mới ở cuối bảng, không đổi cột cũ:

```tsx
// Trước (giữ nguyên):
<TableHead>ID</TableHead>
<TableHead>User</TableHead>
<TableHead>Status</TableHead>

// Thêm mới (append vào cuối):
<TableHead>Docker Container ID</TableHead>  {/* MỚI */}
<TableHead>Resource Usage</TableHead>        {/* MỚI */}
```

---

## 6. Quy trình Git bắt buộc để đảm bảo an toàn tuyệt đối

1. Agent làm việc trên nhánh riêng: `feature/fe-realtime-{module}`, không bao giờ làm thẳng trên `main`.
2. Trước khi báo "xong", chạy:
   ```bash
   git diff --stat main..feature/fe-realtime-database
   ```
   Kiểm tra: file nào có cả `+` và `-` (không phải file mới 100%) → mở diff chi tiết xem có dòng nào bị XÓA không hợp lý.
3. Chạy `npm run build` — bắt buộc pass 100%, không được có warning mới phát sinh từ file cũ.
4. Nếu có bất kỳ file nào trong "danh sách khóa" bên dưới bị sửa cấu trúc → dừng lại, báo cáo lý do trước khi tiếp tục.

### Danh sách file/khu vực "khóa" — agent không được đổi cấu trúc

```
frontend/src/lib/api.ts           — chỉ được APPEND method mới ở cuối file
frontend/src/app/dashboard/layout.tsx   — không đổi layout tổng
frontend/src/app/admin/layout.tsx       — không đổi layout tổng
Tất cả file page.tsx đã có         — chỉ thêm JSX/import, không xóa/đổi thứ tự component cũ
```

---

## 7. Checklist hoàn thành cho mỗi module (FE)

- [ ] Component/hook mới đã tạo, không đụng file cũ ngoài phạm vi cho phép
- [ ] `git diff` không có dòng xóa nào ngoài dự kiến
- [ ] `npm run build` pass 100%
- [ ] Trạng thái Provisioning/Running/Failed hiển thị đúng qua SignalR (test bằng cách tạo resource thật, quan sát UI chuyển trạng thái)
- [ ] Nút Suspend/Resume/Terminate (nếu có sửa) đã test gọi đúng API thật, có xác nhận (confirm dialog) trước khi thực thi tránh bấm nhầm
- [ ] Đã cập nhật bảng theo dõi tiến độ trong `real-integration-roadmap.md`

---

## 8. Lưu ý khi giao task cho agent

> "Đọc `frontend-integration-plan.md` trước. Chỉ làm phần FE cho module **[tên module]**. Tuyệt đối không sửa cấu trúc file đã liệt kê trong 'danh sách khóa' ở Phần 6. Sau khi xong, chạy `git diff --stat` và dán kết quả vào báo cáo để tôi review trước khi merge."
