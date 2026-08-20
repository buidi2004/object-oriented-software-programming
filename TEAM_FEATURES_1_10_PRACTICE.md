# LỆNH: Bổ sung & Map đúng module Admin FE theo toàn bộ dịch vụ Backend

## Bối cảnh
`frontend/app/dashboard/*` (Customer Portal) đã có đủ module cho tất cả dịch vụ. `frontend/app/admin/*` (Admin Portal) đang **thiếu module** cho một số dịch vụ (trong đó có 6 dịch vụ vừa chuyển từ mock sang real: SSL, Object Storage, Managed Database, Game Server, Static Site, App Installer) — hậu quả: khách mua dịch vụ xong, Admin không có màn hình nào để xem/quản lý.

## Bước 0 — Audit thật, không đoán
Trước khi code, liệt kê chính xác:
1. Toàn bộ route/module hiện có trong `frontend/app/dashboard/*`.
2. Toàn bộ route/module hiện có trong `frontend/app/admin/*`.
3. Diff ra danh sách chính xác các dịch vụ **có ở Dashboard nhưng thiếu ở Admin**.
4. Với từng dịch vụ thiếu, xác định Controller/Feature tương ứng ở Backend (`WebApi/Controllers/{Entity}Controller.cs`) để biết chính xác endpoint nào cần gọi.

Không tự bịa danh sách — output bước này phải là bảng liệt kê thật từ codebase.

## Yêu cầu bắt buộc cho MỖI module Admin bổ sung

1. **Map 1-1 với Backend**: mỗi entity/service ở Backend phải có đúng 1 module Admin tương ứng, gọi đúng endpoint thật (không hardcode dữ liệu giả, không để trống mảng rỗng).
2. **List page**: bảng danh sách toàn bộ instance của dịch vụ đó (mọi khách hàng), có filter theo trạng thái (`Provisioning/Active/Failed/Suspended...`), search theo khách hàng/tên resource, phân trang server-side (không load hết rồi filter client-side nếu dữ liệu lớn).
3. **Detail page**: xem chi tiết 1 instance — thông số kỹ thuật, chủ sở hữu, lịch sử job provisioning, log lỗi nếu có (đặc biệt quan trọng với các dịch vụ vừa chuyển real, vì giờ sẽ có case fail thật).
4. **Action buttons đúng theo loại dịch vụ** (không copy nguyên si nút của VPS cho dịch vụ khác nếu không hợp lý):
   - SSL: Renew ngay, Revoke, xem ngày hết hạn.
   - Object Storage: Xem dung lượng đã dùng/quota, reset access key, xoá bucket.
   - Database: Start/Stop/Restart container, xem connection string (ẩn password, có nút "hiện"), backup thủ công.
   - Game Server: Start/Stop/Restart, xem console log real-time, đổi resource limit.
   - Static Site: Redeploy, xem domain gán, purge cache.
   - App Installer: Xem app đã cài, gỡ cài đặt, xem log container.
   - Với dịch vụ nào Admin cần **can thiệp khẩn cấp** (VD: instance kẹt ở `Provisioning` quá lâu do lỗi backend) → thêm nút "Force Retry Provisioning" / "Mark as Failed" thủ công.
5. **Trạng thái realtime qua SignalR**: dùng đúng hub client đã có (đừng tạo hub riêng), để khi backend chuyển trạng thái container tự động, Admin thấy cập nhật ngay không cần F5.
6. **Error handling ở UI**: mọi lỗi từ API (400/409/500 mới được xử lý đúng ở Backend theo lệnh trước) phải hiển thị message rõ ràng cho admin qua toast/banner — không được để page trắng, không được nuốt lỗi im lặng trong console.
7. **Sidebar/menu Admin**: thêm mục điều hướng cho từng module mới, đặt đúng nhóm (VD nhóm "Provisioning" hoặc "Services" hiện có), có badge số lượng resource đang ở trạng thái `Failed`/cần chú ý nếu sidebar hiện tại đã hỗ trợ badge.
8. **Type-safe**: dùng type generate từ OpenAPI/Swagger có sẵn trong `src/types/`, không tự định nghĩa interface trùng lặp lệch với backend.
9. **Tái dùng component/style hiện có**: dùng đúng design system, table component, modal component đang dùng cho các module Admin khác (VD VPS Admin) — không tạo UI kit mới, không tự ý đổi màu/style khác biệt.
10. **Responsive**: đảm bảo dùng được trên tablet, không chỉ desktop.

## Definition of Done
- Chạy diff lại bước 0: 0 dịch vụ nào có ở Dashboard mà thiếu ở Admin.
- Mỗi module mới có đủ: List + Detail + Action buttons đúng nghiệp vụ + realtime update + error handling tử tế.
- Test thử tạo 1 order thật cho mỗi dịch vụ (SSL/Storage/Database/Game Server/Static Site/App) → xác nhận Admin thấy resource xuất hiện, thao tác action không bị lỗi 400/500 không rõ nguyên nhân.
- `npm run build` ở frontend vẫn pass 100%, không phát sinh route lỗi.