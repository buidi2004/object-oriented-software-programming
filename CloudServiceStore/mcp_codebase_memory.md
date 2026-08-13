# MCP Codebase Memory - CloudServiceStore

> **[HƯỚNG DẪN DÀNH CHO AI (AGENT INSTRUCTION)]**
> Khi người dùng (@) tham chiếu đến file này, đây là lệnh yêu cầu AI (Agent) phải kích hoạt **MCP (Model Context Protocol / Tools)** để `view_file`, `list_dir` hoặc `grep_search` một cách cẩn thận thay vì đoán mò code.
> Hãy sử dụng bản đồ kiến trúc dưới đây làm kim chỉ nam để biết file nằm ở đâu trước khi gọi Tool đọc file.

---

## 1. Kiến trúc hệ thống (Clean Architecture & CQRS)

Dự án sử dụng .NET 10.0, được chia thành 4 layer chính:

1. **`CloudServiceStore.Domain`**: Chứa Core Logic.
   - `/Entities/`: Tất cả AggregateRoot, Entity (AppUser, OrderRequest, SupportTicket,...).
   - `/Enums/`: Các enum (OrderStatus, ArticleStatus,...).
   - `/Interfaces/`: `IRepository<T>`, `IUnitOfWork`.

2. **`CloudServiceStore.Application`**: Chứa Use Cases (CQRS).
   - `/Exceptions/`: Chứa `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`.
   - `/Interfaces/`: Các interface nội bộ (`ICurrentUserService`,...).
   - `/Features/{ModuleName}/`: Mỗi module chia thành `Commands`, `Queries`.
     - *Ví dụ:* `Features/Tickets/Commands/CreateTicket/CreateTicketCommand.cs` và `CreateTicketCommandHandler.cs`.
     - *Validation:* `AbstractValidator` thường được viết chung file với `Command`.

3. **`CloudServiceStore.Infrastructure`**: Chứa Implementation chi tiết (Database, Identity).
   - Truy cập database qua EF Core (DbContext).

4. **`CloudServiceStore.WebApi`**: Chứa Entry point & API.
   - `/Controllers/`: Các REST API endpoints (`[ApiController]`). Inject `IMediator` để send Request.
   - Thường sử dụng attributes `[Authorize(Roles = "...")]`.

5. **`CloudServiceStore.Tests`**: Unit Tests cho toàn bộ hệ thống.
   - Sử dụng: `xUnit`, `Moq`, `FluentAssertions`.
   - Thư mục test chia theo logic của `Application`: `/Application/Features/{ModuleName}/...Tests.cs`.

---

## 2. Bản đồ 50 Module (Sơ đồ Mapping)

Dưới đây là nơi tìm kiếm mã nguồn của 50 module (tập trung 18 module Nhóm B đã hoàn thiện code):

### Nhóm B (Core - Đã Code 100%)
*   **Module 1 (Auth):** `Domain/Entities/AppUser.cs` | `Application/Features/Auth` | `WebApi/Controllers/AuthController.cs`
*   **Module 2 (User/Role):** `Application/Features/Users` | `WebApi/Controllers/UsersController.cs`
*   **Module 3 (Category):** `Application/Features/Categories` | `WebApi/Controllers/CategoriesController.cs`
*   **Module 4 (ServicePlan):** `Application/Features/ServicePlans` | `WebApi/Controllers/ServicePlansController.cs`
*   **Module 5 (Promotion):** `Application/Features/Promotions` | `WebApi/Controllers/PromotionsController.cs`
*   **Module 6 (NewsArticle):** `Application/Features/News` | `WebApi/Controllers/NewsController.cs`
*   **Module 7 (Cart):** `Application/Features/Carts` | `WebApi/Controllers/CartsController.cs`
*   **Module 8 (Order):** `Application/Features/Orders` | `WebApi/Controllers/OrdersController.cs`
*   **Module 9 (Payment):** `Application/Features/Payments` | `WebApi/Controllers/PaymentsController.cs`
*   **Module 10 (Coupon):** `Application/Features/Coupons` | `WebApi/Controllers/CouponsController.cs`
*   **Module 11 (Review):** `Application/Features/Testimonials` | `WebApi/Controllers/ReviewsController.cs`
*   **Module 12 (Ticket):** `Application/Features/Tickets` | `WebApi/Controllers/TicketsController.cs`
*   **Module 13 (Affiliate):** `Application/Features/Affiliates` | `WebApi/Controllers/AffiliateApplicationsController.cs`
*   **Module 14 (AuditLog):** `Application/Features/AuditLogs` | `WebApi/Controllers/AuditLogsController.cs`
*   **Module 15 & 16 (Security):** `Application/Features/Security` | `WebApi/Controllers/SecurityController.cs`
*   **Module 17 (Notification):** `Application/Features/NotificationSettings` | `WebApi/Controllers/NotificationSettingsController.cs`
*   **Module 18 (Dashboard):** `Application/Features/Dashboard` | `WebApi/Controllers/DashboardController.cs`

### Nhóm C (Extensions - Đã Code 100%)
*   **Mã nguồn đã có đủ 32 Modules bổ sung:** Domains, Ssl, Backups, Uptime, ApiKeys, Migrations, Wallet, AutoRenew, RefundRequests, ExchangeRates, PaymentMethods, Referrals, Wishlists, Loyalty, GiftCards, Newsletters, Testimonials, Banners, Faqs, KnowledgeBase. (Đều nằm trong thư mục `Features` tương ứng).
*   **10 Modules cuối cùng vừa được code hoàn tất (Phase 1-10):** BlogComments (Blog Comments), SystemSettings (System Settings), LiveChats (Live Chat), RecentlyViewed (Recently Viewed), Permissions (Permission), AbandonedCarts (Abandoned Cart), GlobalSearch (Global Search), ControlPanels (Control Panel), Exports (Export Excel/PDF), SEO (SEO & Sitemap).
*   **Tổng cộng:** Toàn bộ 50 modules đã có mã nguồn đầy đủ trong `Domain/Entities`, `Application/Features/` và `WebApi/Controllers/`. Hỗ trợ 100% TDD.

---

## 3. Quy trình Đọc & Viết Code bằng MCP

Nếu người dùng yêu cầu sửa đổi hoặc lấy thông tin:

1. **Tra cứu Map:** Nhìn vào `Phần 2` để biết Component nằm ở đâu.
2. **Liệt kê (list_dir):** Gọi tool `list_dir` vào thư mục của Feature/Entity để tìm file đích xác.
3. **Đọc mã (view_file):** Dùng `view_file` đọc nội dung trước khi thực hiện viết code. KHÔNG đoán tham số hàm hay fields của Entity.
4. **Sửa code (replace_file_content):** Nếu cần sửa, dùng các tool replace hoặc multi-replace.
5. **Chạy Test (run_command):** Mỗi lần sửa code xong luôn chạy:
   ```bash
   cd CloudServiceStore && dotnet build && dotnet test
   ```
