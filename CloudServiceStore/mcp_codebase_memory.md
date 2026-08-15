# MCP Codebase Memory - CloudServiceStore

> **[HƯỚNG DẪN DÀNH CHO AI (AGENT INSTRUCTION)]**
> Khi người dùng (@) tham chiếu đến file này, đây là lệnh yêu cầu AI (Agent) phải kích hoạt **MCP (Model Context Protocol / Tools)** để `view_file`, `list_dir` hoặc `grep_search` một cách cẩn thận thay vì đoán mò code.
> Hãy sử dụng bản đồ kiến trúc dưới đây làm kim chỉ nam để biết file nằm ở đâu trước khi gọi Tool đọc file.

---

## 1. Kiến trúc hệ thống (Clean Architecture & CQRS)

Dự án sử dụng **.NET 10.0**, được chia thành **5 project** chính:

### 1.1. `CloudServiceStore.Domain` — Core Logic

| Thư mục | Nội dung |
|---|---|
| `/Primitives/` | Base classes: `Entity.cs`, `AggregateRoot.cs`, `ValueObject.cs` |
| `/Entities/` | **57 Entity files** (xem Phần 2 bên dưới) |
| `/Enums/` | **19 Enums**: `OrderStatus`, `PaymentStatus`, `TicketStatus`, `TicketPriority`, `VpsInstanceStatus`, `CartStatus`, `ArticleStatus`, `AffiliateStatus`, `AuditAction`, `BackupStatus`, `BillingCycle`, `ChatSessionStatus`, `DomainStatus`, `MigrationStatus`, `QrCodeType`, `RefundRequestStatus`, `RefundStatus`, `RenewalStatus`, `TransactionType` |
| `/Interfaces/` | `IRepository<T>`, `IUnitOfWork`, `IRoleRepository`, `IDapperContext` |
| `/Events/` | `IDomainEvent`, `OrderCreatedEvent` |

### 1.2. `CloudServiceStore.Application` — Use Cases (CQRS + MediatR)

| Thư mục | Nội dung |
|---|---|
| `/Features/{ModuleName}/` | **55 Feature modules** — mỗi module chia thành `Commands/` và `Queries/`. Mỗi Command/Query gồm: `*Command.cs` (hoặc `*Query.cs`) + `*Handler.cs`. Validation dùng `FluentValidation.AbstractValidator` viết chung file với Command. |
| `/Behaviors/` | **4 MediatR Pipeline Behaviors**: `ValidationBehavior`, `LoggingBehavior`, `CachingBehavior`, `PerformanceBehavior` |
| `/DTOs/` | **12 DTO files**: `VpsInstanceDto`, `ServicePlanDetailDto`, `ServicePlanPriceDto`, `InvoiceDto`, `BannerDto`, `ExchangeRateDto`, `GiftCardBalanceDto`, `LoyaltyDto`, `ReferralDto`, `SavedPaymentMethodDto`, `TestimonialDto`, `WishlistItemDto` |
| `/Exceptions/` | `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException` |
| `/Interfaces/` | **13 interfaces**: `ICurrentUserService`, `IEmailService`, `IPasswordHasher`, `ITokenGenerator`, `IJobScheduler`, `ITerminateVpsJob`, `IVpsProvisioningService`, `IVpsSpecParser`, `ICacheableQuery`, `ICatalogCache`, `IQrCodeGenerator`, `IQrCodeGeneratorFactory`, `FrontendSettings` |
| `/Configuration/` | `VpsSettings`, `CacheSettings` |
| `/Models/` | `VpsProvisionSpec` |
| `/Events/` | `PaymentConfirmedEvent` |
| `/Common/` | `ResetTokenHasher` |
| `/Security/` | `RefreshTokenHasher` |
| `/Caching/` | Cache-related logic |

### 1.3. `CloudServiceStore.Infrastructure` — Implementation

| Thư mục | Nội dung |
|---|---|
| `/Persistence/AppDbContext.cs` | EF Core DbContext — **49 entity configurations** |
| `/Persistence/DbSeeder.cs` | Database seeding logic |
| `/Persistence/Repositories/` | `Repository<T>` (generic), `RoleRepository`, `UnitOfWork` |
| `/Persistence/Configurations/` | **49 EF Fluent API config files** (1 per entity) |
| `/Security/` | `BCryptPasswordHasher`, `JwtTokenGenerator`, `JwtSettings` |
| `/Services/` | `DockerVpsProvisioningService`, `VpsSpecParser`, `HangfireJobScheduler`, `LoggingEmailService`, `TerminateVpsJob` |
| `/BackgroundServices/` | `VpsIdleMonitorService` (hosted service) |
| `/Caching/` | `RedisCatalogCache` |
| `/Dapper/` | `DapperContext` |
| `/ExternalServices/QrCode/` | `QrCodeGenerators` |
| `/Migrations/` | EF Core migration files |
| `DependencyInjection.cs` | Infrastructure DI registration |

### 1.4. `CloudServiceStore.WebApi` — Entry Point & API

| Thư mục | Nội dung |
|---|---|
| `/Controllers/` | **56 Controller files** (xem Phần 3 bên dưới) |
| `/Hubs/` | **SignalR Hubs**: `VpsTerminalHub`, `LiveChatHub`, `ChatMessageSentNotificationHandler` |
| `/Middlewares/` | `ExceptionHandlingMiddleware` |
| `/Services/` | `CurrentUserService` (implements `ICurrentUserService`) |
| `Program.cs` | App startup, DI config, middleware pipeline, Hangfire setup |

### 1.5. `CloudServiceStore.Tests` — Testing

| Thư mục | Nội dung |
|---|---|
| `/Application/Features/` | **53 Unit test folders** (1 per feature module) — sử dụng `xUnit`, `Moq`, `FluentAssertions` |
| `/Domain/Entities/` | **54 Entity unit test files** |
| `/Infrastructure/` | `CatalogCacheTests`, `VpsSpecParserTests` |
| `/WebApi/Middlewares/` | `ExceptionHandlingMiddlewareTests` |
| `/Integration/` | **36 Integration test files** — sử dụng `TestContainers` (SQL Server) + `CustomWebApplicationFactory` |
| `/E2E/` | **23 E2E test files** — sử dụng `TestContainers` + `E2EWebApplicationFactory` |
| Configs | `stryker-config.json` (mutation testing), `xunit.runner.json` |

---

## 2. Danh sách Entity (57 files trong `Domain/Entities/`)

| # | Entity | File |
|---|---|---|
| 1 | AppUser | `AppUser.cs` |
| 2 | Role | `Role.cs` |
| 3 | Permission | `Permission.cs` |
| 4 | RolePermission | `RolePermission.cs` |
| 5 | ServiceCategory | `ServiceCategory.cs` |
| 6 | ServicePlan | `ServicePlan.cs` |
| 7 | PlanPrice | `PlanPrice.cs` |
| 8 | Promotion | `Promotion.cs` |
| 9 | Review | `Review.cs` |
| 10 | NewsArticle | `NewsArticle.cs` |
| 11 | ArticleComment | `ArticleComment.cs` |
| 12 | Cart | `Cart.cs` |
| 13 | CartItem | `CartItem.cs` |
| 14 | CartReminder | `CartReminder.cs` |
| 15 | OrderRequest | `OrderRequest.cs` |
| 16 | OrderItem | `OrderItem.cs` |
| 17 | Payment | `Payment.cs` |
| 18 | Invoice | `Invoice.cs` |
| 19 | Coupon | `Coupon.cs` |
| 20 | SupportTicket | `SupportTicket.cs` |
| 21 | TicketMessage | `TicketMessage.cs` |
| 22 | AffiliateApplication | `AffiliateApplication.cs` |
| 23 | AuditLog | `AuditLog.cs` |
| 24 | ApiKey | `ApiKey.cs` |
| 25 | UserSession | `UserSession.cs` |
| 26 | LoginHistory | `LoginHistory.cs` |
| 27 | PasswordResetToken | `PasswordResetToken.cs` |
| 28 | NotificationSetting | `NotificationSetting.cs` |
| 29 | DomainRecord | `DomainRecord.cs` |
| 30 | DnsRecord | `DnsRecord.cs` |
| 31 | SslCertificate | `SslCertificate.cs` |
| 32 | BackupJob | `BackupJob.cs` |
| 33 | VpsInstance | `VpsInstance.cs` |
| 34 | ServiceStatusLog | `ServiceStatusLog.cs` |
| 35 | MigrationRequest | `MigrationRequest.cs` |
| 36 | Wallet | `Wallet.cs` |
| 37 | WalletTransaction | `WalletTransaction.cs` |
| 38 | RenewalJob | `RenewalJob.cs` |
| 39 | RefundRequest | `RefundRequest.cs` |
| 40 | ExchangeRate | `ExchangeRate.cs` |
| 41 | SavedPaymentMethod | `SavedPaymentMethod.cs` |
| 42 | ReferralCode | `ReferralCode.cs` |
| 43 | ReferralReward | `ReferralReward.cs` |
| 44 | WishlistItem | `WishlistItem.cs` |
| 45 | LoyaltyPoint | `LoyaltyPoint.cs` |
| 46 | LoyaltyTransaction | `LoyaltyTransaction.cs` |
| 47 | GiftCard | `GiftCard.cs` |
| 48 | NewsletterSubscriber | `NewsletterSubscriber.cs` |
| 49 | Banner | `Banner.cs` |
| 50 | FaqItem | `FaqItem.cs` |
| 51 | KnowledgeBaseArticle | `KnowledgeBaseArticle.cs` |
| 52 | ChatSession | `ChatSession.cs` |
| 53 | ChatMessage | `ChatMessage.cs` |
| 54 | ControlPanelCredential | `ControlPanelCredential.cs` |
| 55 | RecentlyViewed | `RecentlyViewed.cs` |
| 56 | RecentlyViewedItem | `RecentlyViewedItem.cs` |
| 57 | SystemSetting | `SystemSetting.cs` |

---

## 3. Bản đồ Module đầy đủ (Feature → Controller → Route)

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ ROUTE TRÙNG LẶP:**
> Một số module có **2 controller** phục vụ các API khác nhau (Tickets/SupportTickets, Ssl/SslCertificates, Settings/SystemSettings, LiveChat/LiveChats, Search/GlobalSearch, News/NewsArticles). Khi sửa code phải xác định đúng controller đích.

### Nhóm B — 18 Module Core

| # | Module | Feature Folder | Controller | Route |
|---|---|---|---|---|
| 1 | Auth | `Auth` | `AuthController` | `api/auth` |
| 2 | Users & Roles | `Users`, `Roles` | `UsersController`, `RolesController` | `api/users`, `api/roles` |
| 3 | Categories | `Categories` | `CategoriesController` | `api/categories` |
| 4 | Service Plans | `ServicePlans` | `ServicePlansController` | `api/service-plans` |
| 5 | Promotions | `Promotions` | `PromotionsController` | `api/promotions` |
| 6 | News | `News`, `NewsArticles` | `NewsController` | `api/news` |
| 7 | Cart | `Carts` | `CartsController` | `api/carts` |
| 8 | Orders | `Orders` | `OrdersController` | `api/orders` |
| 9 | Payments | `Payments` | `PaymentsController` | `api/payments` |
| 10 | Coupons | `Coupons` | `CouponsController` | `api/coupons` |
| 11 | Reviews | `Reviews`, `Testimonials` | `ReviewsController`, `TestimonialsController` | `api/reviews`, `api/testimonials` |
| 12 | Tickets | `Tickets`, `SupportTickets` | `TicketsController` ⚠️, `SupportTicketsController` ⚠️ | `api/tickets`, `api/support-tickets` |
| 13 | Affiliates | `Affiliates` | `AffiliateApplicationsController` | `api/affiliate-applications` |
| 14 | Audit Logs | `AuditLogs` | `AuditLogsController` | `api/audit-logs` |
| 15 | Security (ApiKeys + Sessions) | `Security`, `ApiKeys` | `SecurityController`, `ApiKeysController` | `api/security`, `api/api-keys` |
| 16 | Notifications | `NotificationSettings` | `NotificationSettingsController` | `api/notification-settings` |
| 17 | Dashboard | `Dashboard` | `DashboardController` | `api/dashboard` |
| 18 | Permissions | `Permissions` | `PermissionsController` | `api` (sub-routes: `permissions`, `roles/{id}/permissions`) |

### Nhóm C — 32+ Module Mở Rộng

| # | Module | Feature Folder | Controller | Route |
|---|---|---|---|---|
| 19 | Domains | `Domains` | `DomainsController` | `api/domains` |
| 20 | SSL | `Ssl` | `SslController` ⚠️, `SslCertificatesController` ⚠️ | `api/ssl`, `api/ssl-certificates` |
| 21 | Backups | `Backups` | `BackupsController` | `api/backups` |
| 22 | VPS Instances | `VpsInstances` | `VpsInstancesController` | `api/vpsinstances` |
| 23 | Uptime | `Uptime` | `UptimeController` | `api/uptime` |
| 24 | Migrations | `Migrations` | `MigrationRequestsController` | `api/migration-requests` |
| 25 | Wallet | `Wallet` | `WalletController` | `api/wallet` |
| 26 | Auto Renew | `AutoRenew` | `AutoRenewController` | `api/auto-renew` |
| 27 | Refund Requests | `RefundRequests` | `RefundRequestsController` | `api` (sub-routes: `refund-requests`, `orders/{id}/refund`) |
| 28 | Exchange Rates | `ExchangeRates` | `ExchangeRatesController` | `api/exchange-rates` |
| 29 | Payment Methods | `PaymentMethods` | `PaymentMethodsController` | `api/payment-methods` |
| 30 | Referrals | `Referrals` | `ReferralsController` | `api/referrals` |
| 31 | Wishlists | `Wishlists` | `WishlistsController` | `api/wishlist` |
| 32 | Loyalty | `Loyalty` | `LoyaltyController` | `api/loyalty` |
| 33 | Gift Cards | `GiftCards` | `GiftCardsController` | `api/gift-cards` |
| 34 | Newsletters | `Newsletters` | `NewsletterController` | `api/newsletter` |
| 35 | Banners | `Banners` | `BannersController` | `api/banners` |
| 36 | FAQs | `Faqs` | `FaqsController` | `api/faqs` |
| 37 | Knowledge Base | `KnowledgeBase` | `KnowledgeBaseController` | `api/knowledgebase` |
| 38 | Invoices | `Invoices` | *(logic in OrdersController)* | `api/orders/{id}/invoice` |
| 39 | Blog Comments | `BlogComments` | `BlogCommentsController` | `api` (sub-routes: `news/{id}/comments`) |
| 40 | System Settings | `SystemSettings`, `Settings` | `SystemSettingsController` ⚠️, `SettingsController` ⚠️ | `api/system-settings`, `api/settings` |
| 41 | Live Chat | `LiveChat`, `LiveChats` | `LiveChatController` ⚠️, `LiveChatsController` ⚠️ | `api/livechat`, `api/chats` |
| 42 | Recently Viewed | `RecentlyViewed` | `RecentlyViewedController` | `api/recently-viewed` |
| 43 | Abandoned Carts | `AbandonedCarts` | `AbandonedCartsController` | `api/abandoned-carts` |
| 44 | Global Search | `GlobalSearch`, `Search` | `GlobalSearchController` ⚠️, `SearchController` ⚠️ | `api/global-search`, `api/search` |
| 45 | Control Panel | `ControlPanels` | `ControlPanelController` | `api/orders/{orderId}/control-panel` |
| 46 | Exports | `Exports` | `ExportController` | `api/exports` |
| 47 | SEO & Sitemap | `SEO` | `SitemapController` | `sitemap.xml` |
| 48 | Status (Health Check) | — | `StatusController` | `api/status` |
| 49 | Jobs (Hangfire) | — | `JobsController` | `api/jobs` |

### SignalR Real-time Hubs

| Hub | File | Endpoint |
|---|---|---|
| VPS Terminal | `Hubs/VpsTerminalHub.cs` | `hubs/vps-terminal` |
| Live Chat | `Hubs/LiveChatHub.cs` | `hubs/live-chat` |
| Chat Notification | `Hubs/ChatMessageSentNotificationHandler.cs` | *(MediatR notification handler)* |

---

## 4. Cross-cutting Concerns

### MediatR Pipeline Behaviors (thứ tự thực thi)
1. `ValidationBehavior` — FluentValidation tự động
2. `LoggingBehavior` — Log request/response
3. `CachingBehavior` — Cache nếu implement `ICacheableQuery`
4. `PerformanceBehavior` — Cảnh báo nếu request chậm

### Middleware
- `ExceptionHandlingMiddleware` — Bắt exception toàn cục, map sang HTTP status code

### Background Services
- `VpsIdleMonitorService` — Hosted service theo dõi VPS idle

### Caching
- `RedisCatalogCache` (Infrastructure) — Cache catalog data qua Redis
- `CacheSettings` (Application) — Cấu hình cache TTL

### External Services
- `DockerVpsProvisioningService` — Tạo VPS container qua Docker API
- `LoggingEmailService` — Mock email service (log only)
- `QrCodeGenerators` — Tạo QR code

---

## 5. Quy trình Đọc & Viết Code bằng MCP

Nếu người dùng yêu cầu sửa đổi hoặc lấy thông tin:

1. **Tra cứu Map:** Nhìn vào `Phần 3` để biết Feature folder, Controller và Route.
2. **Liệt kê (list_dir):** Gọi tool `list_dir` vào thư mục của Feature/Entity để tìm file đích.
3. **Đọc mã (view_file):** Dùng `view_file` đọc nội dung trước khi viết code. **KHÔNG đoán** tham số hàm hay fields của Entity.
4. **Sửa code (replace_file_content):** Nếu cần sửa, dùng các tool replace hoặc multi-replace.
5. **Chạy Test (run_command):** Mỗi lần sửa code xong luôn chạy:
   ```bash
   cd /home/object-oriented-software-programming && dotnet test CloudServiceStore/CloudServiceStore.Tests/CloudServiceStore.Tests.csproj
   ```

### ⚠️ Lưu ý khi sửa code:
- **Route trùng lặp:** Nhiều module có 2 controller (xem ⚠️ trong bảng). Khi thêm route mới cần kiểm tra `AmbiguousMatchException`.
- **Moq params:** `IRepository<T>.GetByIdAsync` có tham số `params Expression<Func<T, object>>[]` — khi mock cần dùng `It.IsAny<Expression<Func<T, object>>[]>()`.
- **API trả về List:** Một số endpoint trả về `List<T>` (ví dụ: `ProvisionVps` trả `List<VpsInstanceDto>`). Khi parse JSON trong E2E test cần `ReadFromJsonAsync<List<T>>()`.
- **JSON camelCase:** API mặc định serialize JSON theo camelCase. Khi đọc property dùng `GetProperty("certificateId")` chứ không phải `GetProperty("CertificateId")`.
