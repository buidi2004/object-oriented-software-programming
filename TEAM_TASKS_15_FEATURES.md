# 📋 TÀI LIỆU YÊU CẦU & KẾ HOẠCH PHÁT TRIỂN 15 TÍNH NĂNG MỚI (BACKEND & FRONTEND)
> **Dự án:** CloudServiceStore - Hệ Thống Cung Cấp Dịch Vụ Cloud & Hosting  
> **Dành cho:** Nhóm phát triển 3 thành viên (Member 1, Member 2, Member 3)  
> **Kiến trúc áp dụng:** Clean Architecture (.NET 10 Web API + CQRS MediatR) & Next.js 14+ (App Router + Tailwind CSS)

---

## 🧭 I. QUY TRÌNH PHÁT TRIỂN & CHUẨN MỰC GIT BẮT BUỘC

Để đảm bảo không bị xung đột mã nguồn (merge conflicts) và CI/CD Pipeline luôn **xanh (Pass 100%)**, các thành viên phải tuân thủ nghiêm ngặt quy trình sau:

### 1. Quy tắc rẽ nhánh (Git Branching)
- Luôn checkout từ nhánh `develop` mới nhất trước khi làm việc:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/<ten-thanh-vien>/<ten-tinh-nang>
  ```
  *Ví dụ:* `feature/dev1/billing-address`, `feature/dev2/service-bundles`, `feature/dev3/renewal-calendar`.

### 2. Quy tắc Commit (Conventional Commits)
Thông điệp commit phải ngắn gọn, rõ ràng theo chuẩn:
- `feat(<module>): thêm tính năng mới` (VD: `feat(billing-address): add entity, cqrs and billing address api`)
- `test(<module>): thêm unit test và integration test` (VD: `test(billing-address): add unit test for create command`)
- `ui(<module>): thiết kế giao diện frontend` (VD: `ui(billing-address): create address book tab in profile page`)
- `fix(<module>): sửa lỗi logic hoặc giao diện`

### 3. Cấu trúc chuẩn 1 Module Backend (.NET 10 Web API)
Khi tạo tính năng mới (ví dụ: `BillingAddresses`), thành viên cần tạo các file theo đúng 5 tầng kiến trúc:
1. **Domain Layer:**
   - File: `CloudServiceStore.Domain/Entities/{EntityName}.cs` (Kế thừa `AggregateRoot` hoặc `Entity`).
2. **Infrastructure Layer (Persistence):**
   - File: `CloudServiceStore.Infrastructure/Persistence/Configurations/{EntityName}Configuration.cs` (Kế thừa `IEntityTypeConfiguration<T>`).
   - Thêm `public DbSet<{EntityName}> {EntityNames} { get; set; }` vào `CloudServiceStore.Infrastructure/Persistence/AppDbContext.cs`.
3. **Application Layer (CQRS):**
   - Thư mục: `CloudServiceStore.Application/Features/{ModuleName}/`
     - `Commands/{ActionName}/{ActionName}Command.cs` (Kèm `AbstractValidator<T>` trong cùng file).
     - `Commands/{ActionName}/{ActionName}CommandHandler.cs`.
     - `Queries/{QueryName}/{QueryName}Query.cs`.
     - `Queries/{QueryName}/{QueryName}QueryHandler.cs`.
     - `DTOs/{EntityName}Dto.cs` (nếu cần).
4. **WebApi Layer (REST Controller):**
   - File: `CloudServiceStore.WebApi/Controllers/{ModuleName}Controller.cs` (Kế thừa `ControllerBase`, gắn `[Route("api/[controller]")]`, `[Authorize]`).
5. **Testing Layer (Bắt buộc):**
   - Unit Test: `CloudServiceStore.Tests/Application/Features/{ModuleName}/{ActionName}CommandHandlerTests.cs` (sử dụng `Moq`, `FluentAssertions`).
   - Kiểm tra chạy test tại local: `dotnet test CloudServiceStore/CloudServiceStore.Tests/CloudServiceStore.Tests.csproj` (đảm bảo **Pass 100%** trước khi tạo PR).

### 4. Cấu trúc chuẩn 1 Module Frontend (Next.js 14+ & Tailwind)
1. **API Client:** Sử dụng `api.get`, `api.post`, `api.put`, `api.delete` từ `@/src/lib/api`.
2. **Components:** Đặt tại `@/frontend/components/` hoặc `@/frontend/src/components/`.
3. **Pages:** Đặt tại `@/frontend/app/dashboard/...` hoặc `@/frontend/app/...`.
4. **Trải nghiệm người dùng:** Sử dụng biểu tượng từ `lucide-react`, hiển thị thông báo Toast khi thành công/lỗi, có trạng thái Loading Skeleton.

---

## 👥 II. PHÂN CHIA CÔNG VIỆC CHO 3 THÀNH VIÊN (15 TÍNH NĂNG)

```
                            BẢNG PHÂN BỔ 15 TÍNH NĂNG
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ 👨‍💻 THÀNH VIÊN 1: TÀI KHOẢN, KHÁCH HÀNG & TRẢI NGHIỆM (User Experience & Loyalty)   │
 │ ├─ 01. Sổ địa chỉ thanh toán (Billing Addresses Book)                                │
 │ ├─ 02. Hệ thống Cấp bậc VIP Club & Huy hiệu (VIP Tiers & Badges)                    │
 │ ├─ 03. Ghim dịch vụ yêu thích trên Dashboard (Pinned Quick Access)                   │
 │ ├─ 04. Mở rộng kênh nhận thông báo (SMS / Zalo / Telegram Settings)                 │
 │ └─ 05. Đánh giá chất lượng hỗ trợ CSAT (Support Ticket Feedback)                    │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │ 👨‍💻 THÀNH VIÊN 2: BÁN HÀNG, KHUYẾN MÃI & DÙNG THỬ (Sales, Promotions & Store)       │
 │ ├─ 06. Gói Combo tiết kiệm (Service Bundles / Deals)                                 │
 │ ├─ 07. Đăng ký nhận tin khi có hàng / Flash Sale (Stock & Price Alerts)              │
 │ ├─ 08. Đăng ký dùng thử VPS 3 ngày 0đ (Free Trial Program)                          │
 │ ├─ 09. Lịch sử biến động giá gói cước (Price History Sparkline)                     │
 │ └─ 10. Mục Hỏi & Đáp Q&A dưới từng gói cước (Service Plan Discussion)                │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │ 👨‍💻 THÀNH VIÊN 3: TIỆN ÍCH DỊCH VỤ, BÁO CÁO & CỘNG ĐỒNG (Utilities & Community)     │
 │ ├─ 11. Lịch nhắc hạn thanh toán trực quan (Renewal Calendar)                         │
 │ ├─ 12. Gắn Tag màu & Ghi chú riêng cho VPS/Domain (Service Custom Tags)              │
 │ ├─ 13. Báo cáo phân bổ chi tiêu tháng (Monthly Spending Breakdown PieChart)          │
 │ ├─ 14. Đề xuất tính năng & Bỏ phiếu Upvote (Feature Requests & Roadmap)              │
 │ └─ 15. Thư viện tài liệu & Mẫu cấu hình tải về (Downloadable Resources)              │
 └──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 III. CHI TIẾT YÊU CẦU KỸ THUẬT TỪNG TÍNH NĂNG

### 👨‍💻 PHẦN 1: THÀNH VIÊN 1 (USER EXPERIENCE & LOYALTY)

#### Tính năng 1: Sổ địa chỉ thanh toán (`BillingAddresses`)
* **Mục tiêu:** Cho phép khách hàng lưu nhiều địa chỉ thanh toán/xuất hóa đơn và chọn nhanh trong giỏ hàng/checkout.
* **Backend:**
  - **Entity:** `BillingAddress` (`Guid Id`, `Guid UserId`, `string FullName`, `string PhoneNumber`, `string? Company`, `string? TaxCode`, `string AddressLine`, `string City`, `string? PostalCode`, `bool IsDefault`, `DateTime CreatedAt`).
  - **CQRS:**
    - `AddBillingAddressCommand` (Validate SĐT, Tên, Địa chỉ).
    - `GetMyBillingAddressesQuery` $\rightarrow$ `List<BillingAddressDto>`.
    - `SetDefaultBillingAddressCommand`.
    - `DeleteBillingAddressCommand`.
  - **API:** `api/billing-addresses` (`GET`, `POST`, `PUT /{id}/default`, `DELETE /{id}`).
* **Frontend:**
  - Tab "Sổ địa chỉ" trong trang `/dashboard/profile`.
  - Modal danh sách chọn nhanh địa chỉ trong trang `/checkout`.

---

#### Tính năng 2: Hệ thống Cấp bậc VIP Club & Huy hiệu (`VipClub`)
* **Mục tiêu:** Tự động xếp hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) theo tổng chi tiêu và áp dụng mức giảm giá đặc quyền.
* **Backend:**
  - **Logic:** Tính tổng `TotalAmount` các `OrderRequests` có trạng thái `Completed`/`Paid`.
    - Dưới 1 triệu: Đồng (0% discount).
    - 1 - 5 triệu: Bạc (Giảm 3%).
    - 5 - 20 triệu: Vàng (Giảm 5%).
    - Trên 20 triệu: Kim Cương (Giảm 10%).
  - **Query:** `GetMyVipTierQuery` trả về `CurrentTier`, `DiscountPercent`, `TotalSpent`, `NextTierName`, `AmountToNextTier`.
  - **API:** `GET api/vip-club/me`.
* **Frontend:**
  - Trang `/dashboard/vip-club` hiển thị Thẻ VIP kim loại lấp lánh, thanh tiến trình thăng hạng (Progress bar), bảng so sánh đặc quyền các hạng.
  - Badge VIP gắn cạnh Avatar trên Header.

---

#### Tính năng 3: Ghim dịch vụ yêu thích trên Dashboard (`PinnedServices`)
* **Mục tiêu:** Người dùng có nhiều VPS/Domain có thể ghim các dịch vụ hay truy cập nhất lên đầu Dashboard.
* **Backend:**
  - **Entity:** `PinnedService` (`Guid Id`, `Guid UserId`, `string ServiceType` [VPS, Domain, SSL], `Guid ServiceId`, `DateTime PinnedAt`).
  - **CQRS:** `TogglePinServiceCommand` (nếu đã ghim thì bỏ ghim, chưa có thì ghim), `GetMyPinnedServicesQuery`.
  - **API:** `POST api/pinned-services/toggle`, `GET api/pinned-services`.
* **Frontend:**
  - Nút biểu tượng Ngôi sao ⭐ trên từng Card VPS / Tên miền.
  - Widget "Dịch vụ đã ghim (Quick Access)" nằm ở vị trí đầu tiên của `/dashboard`.

---

#### Tính năng 4: Mở rộng kênh nhận thông báo (`NotificationChannels`)
* **Mục tiêu:** Bổ sung cấu hình nhận thông báo qua SMS OTP, Zalo hoặc Telegram.
* **Backend:**
  - **Entity:** Cập nhật `NotificationSetting` thêm: `string? PhoneNumber`, `string? ZaloId`, `string? TelegramChatId`, `bool SmsOnOrder`, `bool SmsOnExpiring`, `bool TelegramOnAlert`.
  - **CQRS:** `UpdateNotificationChannelsCommand`, `GetNotificationChannelsQuery`.
  - **API:** `GET api/notification-settings/channels`, `PUT api/notification-settings/channels`.
* **Frontend:**
  - Giao diện dạng Switch (Toggle ON/OFF) và ô nhập SĐT/Telegram Chat ID tại `/dashboard/settings/notifications`.

---

#### Tính năng 5: Đánh giá chất lượng hỗ trợ CSAT (`TicketCsatFeedback`)
* **Mục tiêu:** Sau khi Support Ticket được đóng (Closed), khách hàng có thể chấm điểm 1-5 sao và để lại phản hồi về kỹ thuật viên.
* **Backend:**
  - **Entity:** `TicketFeedback` (`Guid Id`, `Guid TicketId`, `Guid UserId`, `int Rating` [1-5], `string? Comment`, `string? TagsJson`, `DateTime CreatedAt`).
  - **CQRS:** `SubmitTicketFeedbackCommand` (chỉ cho phép đánh giá 1 lần với ticket đã Closed), `GetTicketFeedbackQuery`.
  - **API:** `POST api/tickets/{id}/feedback`, `GET api/tickets/{id}/feedback`.
* **Frontend:**
  - Modal tự động mở hoặc nút "Đánh giá hỗ trợ" khi xem Ticket đã đóng: Chọn ⭐ 1-5 sao, chọn tag nhanh ("Hỗ trợ nhiệt tình", "Phản hồi nhanh", "Giải quyết triệt để").

---

### 👨‍💻 PHẦN 2: THÀNH VIÊN 2 (SALES, PROMOTIONS & STORE)

#### Tính năng 6: Gói Combo tiết kiệm (`ServiceBundles`)
* **Mục tiêu:** Tạo các gói mua chung siêu tiết kiệm (ví dụ: *Combo Web Khởi Nghiệp: VPS 2 Core + Domain .COM + SSL 1 năm $\rightarrow$ Giảm 25%*).
* **Backend:**
  - **Entity:** `ServiceBundle` (`Guid Id`, `string Name`, `string Description`, `string? ImageUrl`, `decimal DiscountPercent`, `string IncludedPlanIdsJson`, `bool IsActive`, `DateTime CreatedAt`).
  - **CQRS:** `GetActiveBundlesQuery`, `GetBundleByIdQuery`, `AddBundleToCartCommand` (tự động thêm tất cả các món trong bundle vào Cart kèm mã giảm giá).
  - **API:** `GET api/service-bundles`, `GET api/service-bundles/{id}`, `POST api/service-bundles/{id}/add-to-cart`.
* **Frontend:**
  - Trang `/bundles` giao diện thẻ gói Combo hiện đại, hiển thị giá gốc gạch ngang và giá sau giảm, nút 1-Click "Thêm cả combo vào giỏ".

---

#### Tính năng 7: Đăng ký nhận tin khi có hàng / Flash Sale (`StockAlerts`)
* **Mục tiêu:** Khi một gói VPS bị hết hàng hoặc giá cao, khách hàng bấm chuông đăng ký nhận email khi có hàng hoặc khi giảm giá.
* **Backend:**
  - **Entity:** `StockAlertSubscription` (`Guid Id`, `Guid UserId`, `Guid ServicePlanId`, `decimal? TargetPrice`, `bool IsNotified`, `DateTime CreatedAt`).
  - **CQRS:** `SubscribeStockAlertCommand`, `GetMyStockAlertsQuery`, `CancelStockAlertCommand`.
  - **API:** `POST api/stock-alerts`, `GET api/stock-alerts/me`, `DELETE api/stock-alerts/{id}`.
* **Frontend:**
  - Nút 🔔 "Báo khi có hàng" hiển thị thay thế nút Mua khi sản phẩm hết hàng.
  - Quản lý danh sách theo dõi giá tại `/dashboard/stock-alerts`.

---

#### Tính năng 8: Đăng ký dùng thử VPS 3 ngày miễn phí (`FreeTrialRequests`)
* **Mục tiêu:** Thu hút khách hàng mới bằng chương trình trải nghiệm VPS Pro miễn phí trong 3 ngày (tự động hết hạn và xóa container).
* **Backend:**
  - **Entity:** `FreeTrialRequest` (`Guid Id`, `Guid UserId`, `Guid ServicePlanId`, `DateTime StartsAt`, `DateTime ExpiresAt`, `string Status` [Active, Expired], `Guid? VpsInstanceId`).
  - **Logic:** Mỗi UserId chỉ được đăng ký dùng thử 1 lần duy nhất trong toàn hệ thống.
  - **CQRS:** `RequestFreeTrialCommand`, `GetMyFreeTrialStatusQuery`.
  - **API:** `POST api/free-trials/request`, `GET api/free-trials/my-status`.
* **Frontend:**
  - Banner "Trải nghiệm VPS Cloud 3 ngày 0đ" tại trang chủ và trang chi tiết VPS.
  - Đồng hồ đếm ngược thời gian dùng thử còn lại trên card VPS.

---

#### Tính năng 9: Lịch sử biến động giá dịch vụ (`PriceHistory`)
* **Mục tiêu:** Minh bạch bảng giá cho khách hàng theo dõi sự thay đổi giá của từng gói cước theo thời gian.
* **Backend:**
  - **Entity:** `PlanPriceHistory` (`Guid Id`, `Guid ServicePlanId`, `decimal OldPrice`, `decimal NewPrice`, `string? Reason`, `DateTime ChangedAt`).
  - **CQRS:** `GetPlanPriceHistoryQuery` (trả về danh sách biến động giá 6-12 tháng gần nhất).
  - **API:** `GET api/service-plans/{id}/price-history`.
* **Frontend:**
  - Biểu đồ đường mini (Sparkline Chart) hiển thị biến động giá trong trang chi tiết gói dịch vụ `/services/plans/[id]`.

---

#### Tính năng 10: Mục Hỏi & Đáp Q&A dưới từng gói cước (`ServicePlanQnA`)
* **Mục tiêu:** Khách hàng có thể đặt câu hỏi thắc mắc ngay dưới thông số gói cước; Admin/Staff có thể trả lời công khai.
* **Backend:**
  - **Entity:** `PlanQuestion` (`Guid Id`, `Guid ServicePlanId`, `Guid UserId`, `string Content`, `bool IsApproved`, `DateTime CreatedAt`), `PlanAnswer` (`Guid Id`, `Guid QuestionId`, `Guid UserId`, `string Content`, `bool IsStaffAnswer`, `DateTime CreatedAt`).
  - **CQRS:** `AskPlanQuestionCommand`, `AnswerPlanQuestionCommand`, `GetPlanQuestionsQuery`.
  - **API:** `GET api/service-plans/{id}/questions`, `POST api/service-plans/{id}/questions`, `POST api/plan-questions/{questionId}/answers`.
* **Frontend:**
  - Tab "Hỏi & Đáp (Q&A)" dưới bảng giá gói cước; Form gửi câu hỏi và danh sách câu hỏi dạng Accordion kèm nhãn "Đại diện CSKH" cho câu trả lời của nhân viên.

---

### 👨‍💻 PHẦN 3: THÀNH VIÊN 3 (UTILITIES, ANALYTICS & COMMUNITY)

#### Tính năng 11: Lịch nhắc hạn thanh toán trực quan (`RenewalCalendar`)
* **Mục tiêu:** Giúp khách hàng xem toàn bộ các mốc hết hạn của VPS, Tên miền, SSL trong tháng dưới dạng lịch biểu để chủ động nạp tiền.
* **Backend:**
  - **Query:** `GetRenewalCalendarQuery?month={m}&year={y}` (Truy vấn ngày hết hạn từ `VpsInstances`, `DomainRecords`, `SslCertificates` của user).
  - **DTO:** `RenewalEventDto` (`string ServiceType`, `string ServiceName`, `DateTime ExpiryDate`, `decimal EstimatedRenewalCost`, `bool AutoRenewActive`).
  - **API:** `GET api/renewals/calendar`.
* **Frontend:**
  - Trang `/dashboard/calendar` dạng Lịch tháng (Month Grid). Những ngày có dịch vụ hết hạn sẽ hiển thị chấm màu đỏ/cam; click vào ngày để xem danh sách dịch vụ và nút "Gia hạn ngay".

---

#### Tính năng 12: Gắn Tag màu & Ghi chú riêng cho VPS/Domain (`ServiceTagNotes`)
* **Mục tiêu:** Khách hàng có thể tự đặt nhãn màu (`Production 🔴`, `Staging 🟡`, `Dự án A 🟢`) và ghi chú ngắn cho từng con VPS để dễ phân loại.
* **Backend:**
  - **Entity:** `ServiceTagNote` (`Guid Id`, `Guid UserId`, `string ServiceType` [VPS, Domain], `Guid ServiceId`, `string? TagsJson`, `string? ColorHex`, `string? Note`, `DateTime UpdatedAt`).
  - **CQRS:** `UpdateServiceTagNoteCommand`, `GetServiceTagNotesQuery`.
  - **API:** `PUT api/services/{serviceType}/{serviceId}/tag-note`, `GET api/services/{serviceType}/{serviceId}/tag-note`.
* **Frontend:**
  - Hiển thị các Badge màu tag trực tiếp trên danh sách VPS/Domain; Modal chỉnh sửa Tag và ghi chú siêu nhanh.

---

#### Tính năng 13: Báo cáo phân bổ chi tiêu tháng (`SpendingBreakdown`)
* **Mục tiêu:** Báo cáo chi tiêu cá nhân trực quan theo danh mục (VPS chiếm bao nhiêu %, Domain bao nhiêu %, SSL bao nhiêu %).
* **Backend:**
  - **Query:** `GetSpendingBreakdownQuery?months=6` (Thống kê từ `OrderRequests` & `WalletTransactions` đã hoàn tất, nhóm theo Category).
  - **DTO:** `SpendingCategoryDto` (`string CategoryName`, `decimal TotalAmount`, `double Percentage`, `string MonthYear`).
  - **API:** `GET api/reports/spending-breakdown`.
* **Frontend:**
  - Trang `/dashboard/wallet/analytics`: Biểu đồ tròn (Pie Chart) phân bổ chi phí theo danh mục và Biểu đồ cột (Bar Chart) chi tiêu theo từng tháng (dùng Recharts).

---

#### Tính năng 14: Đề xuất tính năng & Bỏ phiếu cộng đồng (`FeatureRequests`)
* **Mục tiêu:** Khách hàng đăng ý tưởng mong muốn Store phát triển; cộng đồng bấm Upvote 👍; Admin cập nhật tiến độ (Đang xem xét, Đang làm, Đã xong).
* **Backend:**
  - **Entity:** `FeatureRequest` (`Guid Id`, `Guid UserId`, `string Title`, `string Description`, `string Category`, `int UpvoteCount`, `string Status` [UnderReview, Planned, InProgress, Completed], `DateTime CreatedAt`), `FeatureUpvote` (`Guid FeatureRequestId`, `Guid UserId`).
  - **CQRS:** `CreateFeatureRequestCommand`, `ToggleUpvoteFeatureCommand`, `GetFeatureRequestsQuery`.
  - **API:** `GET api/feature-requests`, `POST api/feature-requests`, `POST api/feature-requests/{id}/upvote`.
* **Frontend:**
  - Trang `/feedback` hoặc `/roadmap` hiển thị danh sách ý tưởng kèm nút Upvote to rõ, tab lọc theo trạng thái và form gửi đề xuất mới.

---

#### Tính năng 15: Thư viện tài liệu & Mẫu cấu hình tải về (`DownloadableResources`)
* **Mục tiêu:** Kho tài nguyên chia sẻ miễn phí file mẫu cấu hình Nginx, script backup database, tài liệu hướng dẫn PDF.
* **Backend:**
  - **Entity:** `DownloadableResource` (`Guid Id`, `string Title`, `string Description`, `string Category` [Linux, Nginx, Docker, Security], `string FileUrl`, `string FileExtension`, `long SizeBytes`, `int DownloadCount`, `DateTime CreatedAt`).
  - **CQRS:** `GetDownloadableResourcesQuery`, `TrackResourceDownloadCommand` (tăng biến đếm `DownloadCount`).
  - **API:** `GET api/resources`, `POST api/resources/{id}/download`.
* **Frontend:**
  - Trang `/resources` dạng thẻ tài liệu có nút "Tải về (Download)" hiển thị dung lượng file và số lượt tải, kèm ô tìm kiếm theo từ khóa.

---

## 🚀 IV. CHECKLIST NGHIỆM THU CHO MỖI THÀNH VIÊN KHI TẠO PULL REQUEST (PR)

Trước khi gửi Pull Request vào nhánh `develop`, mỗi thành viên **PHẢI** kiểm tra đầy đủ các tiêu chí sau:

- [ ] **1. Clean Build:** Chạy lệnh `dotnet build CloudServiceStore/CloudServiceStore.slnx` thành công 0 lỗi.
- [ ] **2. 100% Tests Pass:** Chạy `dotnet test CloudServiceStore/CloudServiceStore.Tests/CloudServiceStore.Tests.csproj` - tất cả bài test Unit/Integration đều xanh.
- [ ] **3. Viết Unit Test:** Đã viết đầy đủ Unit Test cho các Handler mới tạo trong thư mục `CloudServiceStore.Tests/Application/Features/...`.
- [ ] **4. Giao diện Frontend:** Giao diện Next.js hiển thị đẹp, chuẩn responsive (Mobile/Desktop), có xử lý trạng thái Loading và Báo lỗi rõ ràng.
- [ ] **5. Không có Merge Conflicts:** Đã kéo code mới nhất từ `develop` về nhánh của mình (`git merge develop`) và giải quyết conflict trước khi tạo PR.
