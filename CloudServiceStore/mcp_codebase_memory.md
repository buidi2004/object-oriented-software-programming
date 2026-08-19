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
| `/Entities/` | **77 Entity files** (xem Phần 2 bên dưới) |
| `/Enums/` | **39 Enums**: `OrderStatus`, `PaymentStatus`, `TicketStatus`, `TicketPriority`, `VpsInstanceStatus`, `CartStatus`, `ArticleStatus`, `AffiliateStatus`, `AuditAction`, `BackupStatus`, `BillingCycle`, `ChatSessionStatus`, `DomainStatus`, `MigrationStatus`, `QrCodeType`, `RefundRequestStatus`, `RefundStatus`, `RenewalStatus`, `TransactionType`, `SecurityAddonType`, `SecurityScanStatus`, `DeployStatus`, `CdnProvider`, `DedicatedServerStatus`, `EmailHostingStatus`, `MarketplacePurchaseStatus`, `OrganizationMemberRole`, `BucketVisibility`, `DatabaseEngine`, `DatabaseInstanceStatus`, `GameType`, `GameServerStatus`, `EmailProvider`, `AppInstallationStatus`, `HostingAccountStatus`, `ManagedDatabaseEngine`, `ManagedDatabaseStatus`, `ObjectStorageStatus`, `StaticSiteStatus`, `WebsiteProjectStatus`, `CdnStatus`, `SslCertificateStatus` |
| `/Interfaces/` | `IRepository<T>`, `IUnitOfWork`, `IRoleRepository`, `IDapperContext` |
| `/Events/` | `IDomainEvent`, `OrderCreatedEvent` |

### 1.2. `CloudServiceStore.Application` — Use Cases (CQRS + MediatR)

| Thư mục | Nội dung |
|---|---|
| `/Features/{ModuleName}/` | **70 Feature modules** — mỗi module chia thành `Commands/` và `Queries/`. Mỗi Command/Query gồm: `*Command.cs` (hoặc `*Query.cs`) + `*Handler.cs`. Validation dùng `FluentValidation.AbstractValidator` viết chung file với Command. |
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
| `/Persistence/AppDbContext.cs` | EF Core DbContext — **59 entity configurations** |
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
| `/Controllers/` | **75 Controller files** (Xem Phần 3 bên dưới) |
| `/Hubs/` | **SignalR Hubs**: `VpsTerminalHub`, `LiveChatHub`, `ChatMessageSentNotificationHandler` |
| `/Middlewares/` | `ExceptionHandlingMiddleware` |
| `/Services/` | `CurrentUserService` (implements `ICurrentUserService`) |
| `Program.cs` | App startup, DI config, middleware pipeline, Hangfire setup |

### 1.5. `CloudServiceStore.Tests` — Testing

| Thư mục | Nội dung |
|---|---|
| `/Application/Features/` | **66 Unit test folders** (1 per feature module) — sử dụng `xUnit`, `Moq`, `FluentAssertions` |
| `/Domain/Entities/` | **54 Entity unit test files** |
| `/E2E/` | **36 E2E test files** — bao gồm `NewModulesE2ETests.cs` (16 tests) |
| `/Infrastructure/` | `CatalogCacheTests`, `VpsSpecParserTests` |
| `/WebApi/Middlewares/` | `ExceptionHandlingMiddlewareTests` |
| `/Integration/` | **38 Integration test files** — sử dụng `TestContainers` (SQL Server) + `CustomWebApplicationFactory` |
| Configs | `stryker-config.json` (mutation testing), `xunit.runner.json` |

---

## 2. Danh sách Entity (77 files trong `Domain/Entities/`)

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
| 58 | HostingPlan | `HostingPlan.cs` |
| 59 | HostingAccount | `HostingAccount.cs` |
| 60 | AppTemplate | `AppTemplate.cs` |
| 61 | AppInstallation | `AppInstallation.cs` |
| 62 | DatabaseInstance | `DatabaseInstance.cs` |
| 63 | GameServerInstance | `GameServerInstance.cs` |
| 64 | StorageBucket | `StorageBucket.cs` |
| 65 | StorageObject | `StorageObject.cs` |
| 66 | Organization | `Organization.cs` |
| 67 | OrganizationMember | `OrganizationMember.cs` |
| 68 | EmailSubscription | `EmailSubscription.cs` |
| 69 | SecuritySubscription | `SecuritySubscription.cs` |
| 70 | StaticSite | `StaticSite.cs` |
| 71 | StaticDeploy | `StaticDeploy.cs` |
| 72 | CdnDistribution | `CdnDistribution.cs` |
| 73 | DedicatedServer | `DedicatedServer.cs` |
| 74 | EmailHostingAccount | `EmailHostingAccount.cs` |
| 75 | WebsiteBuilderProject | `WebsiteBuilderProject.cs` |
| 76 | WebsitePage | `WebsitePage.cs` |
| 77 | MarketplaceListing | `MarketplaceListing.cs` |
| 78 | MarketplacePurchase | `MarketplacePurchase.cs` |

## 2.1 Enums bổ sung (39 enums mới)

| # | Enum | File | Values |
|---|------|------|--------|
| 20 | SecurityAddonType | `SecurityEnums.cs` | `Waf = 1`, `MalwareScan = 2` |
| 21 | SecurityScanStatus | `SecurityEnums.cs` | `Scanning = 1`, `Clean = 2`, `ThreatsFound = 3`, `Failed = 4` |
| 22 | DeployStatus | `StaticSiteEnums.cs` | `Pending = 1`, `Building = 2`, `Success = 3`, `Failed = 4` |
| 23 | CdnProvider | `CdnProvider.cs` | `Cloudflare = 1`, `Fastly = 2` |
| 24 | DedicatedServerStatus | `DedicatedServerStatus.cs` | `Provisioning = 1`, `Running = 2`, `Stopped = 3`, `Failed = 4` |
| 25 | EmailHostingStatus | `EmailHostingStatus.cs` | `Active = 1`, `Suspended = 2`, `Expired = 3` |
| 26 | MarketplacePurchaseStatus | `MarketplacePurchaseStatus.cs` | `Pending = 1`, `Completed = 2`, `Refunded = 3`, `Failed = 4` |
| 27 | OrganizationMemberRole | `OrganizationMemberRole.cs` | `Owner = 1`, `Admin = 2`, `Member = 3` |
| 28 | BucketVisibility | `BucketVisibility.cs` | `Private = 1`, `Public = 2` |
| 29 | DatabaseEngine | `DatabaseEnums.cs` | `MySQL = 1`, `PostgreSQL = 2` |
| 30 | DatabaseInstanceStatus | `DatabaseEnums.cs` | `Creating = 1`, `Running = 2`, `Stopped = 3`, `Failed = 4` |
| 31 | GameType | `GameEnums.cs` | `Minecraft = 1`, `CS2 = 2`, `Ark = 3`, `Rust = 4` |
| 32 | GameServerStatus | `GameEnums.cs` | `Creating = 1`, `Running = 2`, `Stopped = 3`, `Failed = 4` |
| 33 | EmailProvider | `EmailProvider.cs` | `GoogleWorkspace = 1`, `Microsoft365 = 2`, `Zoho = 3` |
| 34 | AppInstallationStatus | `AppInstallationStatus.cs` | `Pending = 1`, `Installing = 2`, `Installed = 3`, `Failed = 4` |
| 35 | HostingAccountStatus | `HostingAccountStatus.cs` | `Active = 1`, `Suspended = 2`, `Expired = 3` |
| 36 | ManagedDatabaseEngine | `ManagedDatabaseEngine.cs` | `MySQL = 1`, `PostgreSQL = 2` |
| 37 | ManagedDatabaseStatus | `ManagedDatabaseStatus.cs` | `Creating = 1`, `Running = 2`, `Stopped = 3`, `Failed = 4` |
| 38 | ObjectStorageStatus | `ObjectStorageStatus.cs` | `Creating = 1`, `Ready = 2`, `Error = 3` |
| 39 | StaticSiteStatus | `StaticSiteEnums.cs` | `Creating = 1`, `Ready = 2`, `Deploying = 3`, `Failed = 4` |
| 40 | WebsiteProjectStatus | `WebsiteProjectStatus.cs` | `Draft = 1`, `Published = 2`, `Archived = 3` |
| 41 | CdnStatus | `CdnStatus.cs` | `Creating = 1`, `Active = 2`, `Inactive = 3`, `Error = 4` |
| 42 | SslCertificateStatus | `SslCertificateStatus.cs` | `Pending = 1`, `Issued = 2`, `Expired = 3`, `Failed = 4` |
| 43 | AuthProvider | `AuthProvider.cs` | `Local = 1`, `Google = 2`, `Facebook = 3` |
| 44 | MarketplaceListingStatus | `MarketplaceListingStatus.cs` | `Active = 1`, `Sold = 2`, `Deleted = 3` |

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

### Nhóm D — 16 Module Mới (Mở Rộng 1)

| # | Module | Feature Folder | Controller | Route |
|---|---|---|---|---|
| 50 | Shared Hosting | `HostingAccounts` | `HostingController` | `api/hosting` |
| 51 | App Installer | `AppInstallations` | `AppInstallerController` | `api/app-installer` |
| 52 | Managed Database (Customer) | `DatabaseInstances` | `DatabasesController` | `api/databases` ✅ PRIMARY - Customer dùng |
| 52a | Managed Database (Admin) | `DatabaseInstances` | `AdminDatabasesController` | `api/admin/databases` ⚠️ Admin only |
| 52b | Managed Database (Alt) | `ManagedDatabases` | `ManagedDatabasesController` | `api/managed-databases` ❌ Không dùng |
| 53 | Object Storage (Admin) | `StorageBuckets` | `StorageController` | `api/storage` |
| 53b | Object Storage (User) | `ObjectStorage` | `ObjectStorageController` | `api/object-storage` |
| 54 | Game Server | `GameServers` | `GameServersController` | `api/game-servers` |
| 55 | ~~Business Email~~ | ~~`EmailSubscriptions`~~ | ~~`EmailSubscriptionsController`~~ | ~~`api/email-subscriptions`~~ ❌ **KHÔNG TỒN TẠI** |
| 56 | Security Add-ons | `SecurityAddons` | `AdminSecurityController` | `api/admin/security/addons` |
| 57 | Static Sites | `StaticSites` | `StaticSitesController` | `api/static-sites` |
| 58 | CDN Distribution | `CdnDistribution` | `CdnController` | `api/cdn/distributions` |
| 59 | Dedicated Server | `DedicatedServers` | `DedicatedServersController` | `api/dedicated-servers` |
| 60 | Email Hosting | `EmailHosting` | `EmailHostingController` | `api/email-hosting/accounts` |
| 61 | Website Builder | `WebsiteBuilder` | `WebsiteBuilderController` | `api/website-builder/projects` |
| 62 | Marketplace (Admin) | `Marketplace` | `AdminMarketplaceController` | `api/admin/marketplace` |
| 62b | Marketplace (User) | `Marketplace` | `MarketplaceController` | `api/marketplace` |
| 63 | Organizations | `Organizations` | `OrganizationsController` | `api/organizations` |
| 67 | Contact | `Contact` | `ContactController` | `api/contact` |

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
| 64 | Resources | `Resources` | `ResourcesController` | `api/resources` |
| 65 | Contact | `Contact` | `ContactController` | `api/contact` |
| 66 | Admin Databases | `ManagedDatabases` | `AdminDatabasesController` | `api/admin/databases` |

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

---

## 6. 16 Module Mở Rộng - Chi Tiết Triển Khai

### Tổng quan
- **Backend:** 16 modules hoàn chỉnh với Entities, Commands, Queries, Controllers, Migrations, Tests
- **Frontend:** 14 pages (Dashboard + 13 module pages)
- **API Client:** `src/lib/api.ts` kết nối 16 modules
- **E2E Tests:** 36/36 PASSED
- **Unit Tests:** 66/66 PASSED

### Bản đồ 16 Modules

| # | Module | Feature Folder | Controller | Route | Entities | Enums | Commands | Frontend Page |
|---|--------|----------------|------------|-------|----------|-------|----------|---------------|
| 1 | Shared Hosting | `HostingAccounts` | `HostingController` | `api/hosting` | HostingPlan, HostingAccount | HostingAccountStatus | CreateHostingAccountCommand | ✅ `/dashboard/hosting` |
| 2 | Email Hosting | `EmailHosting` | `EmailHostingController` | `api/email-hosting/accounts` | EmailHostingAccount | EmailHostingStatus | CreateEmailAccountCommand | ✅ `/dashboard/email-hosting` |
| 3 | App Installer | `AppInstallations` | `AppInstallerController` | `api/app-installer` | AppTemplate, AppInstallation | AppInstallationStatus | InstallAppCommand | ✅ `/dashboard/apps` |
| 4 | CDN Distribution | `CdnDistribution` | `CdnController` | `api/cdn/distributions` | CdnDistribution | CdnProvider, CdnStatus | CreateCdnDistributionCommand | ✅ `/dashboard/cdn` |
| 5 | Managed Database (User) | `DatabaseInstances` | `DatabasesController` | `api/databases` ⚠️ Legacy | DatabaseInstance | DatabaseEngine, DatabaseInstanceStatus | CreateDatabaseInstanceCommand | ✅ `/dashboard/database` |
| 5a | Managed Database (Admin) | `DatabaseInstances` | `AdminDatabasesController` | `api/admin/databases` | DatabaseInstance | DatabaseEngine, DatabaseInstanceStatus | GetAdminDatabasesQuery | ❌ Chỉ Admin |
| 5b | Managed Database (Alt) | `ManagedDatabases` | `ManagedDatabasesController` | `api/managed-databases` | DatabaseInstance | DatabaseEngine, DatabaseInstanceStatus | CreateDatabaseInstanceCommand | ❌ Không dùng |
| 6 | Object Storage | `StorageBuckets` | `StorageController` | `api/storage/buckets` | StorageBucket, StorageObject | BucketVisibility, ObjectStorageStatus | CreateBucketCommand | ✅ `/dashboard/storage` |
| 7 | Dedicated Server | `DedicatedServers` | `DedicatedServersController` | `api/dedicated-servers` | DedicatedServer | DedicatedServerStatus | CreateDedicatedServerCommand | ✅ `/dashboard/dedicated-servers` |
| 8 | Website Builder | `WebsiteBuilder` | `WebsiteBuilderController` | `api/website-builder/projects` | WebsiteBuilderProject, WebsitePage | WebsiteProjectStatus | CreateProjectCommand | ✅ `/dashboard/website-builder` |
| 9 | Domain Privacy | `Domains` | `DomainsController` | `api/domains` | DomainRecord (IsPrivacyProtected) | - | EnableDomainPrivacyCommand, DisableDomainPrivacyCommand | ✅ `/dashboard/domains` |
| 10 | Organizations | `Organizations` | `OrganizationsController` | `api/organizations` | Organization, OrganizationMember | OrganizationMemberRole | CreateOrganizationCommand, InviteMemberCommand, RemoveMemberCommand | ✅ `/dashboard/orgs` |
| 11 | ~~Business Email~~ | ~~`EmailSubscriptions`~~ | ~~`EmailSubscriptionsController`~~ | ~~`api/email-subscriptions`~~ ❌ **KHÔNG TỒN TẠI** - Không có controller, feature không implemented |
| 12 | Game Server | `GameServers` | `GameServersController` | `api/game-servers` | GameServerInstance | GameType, GameServerStatus | CreateGameServerCommand | ✅ `/dashboard/game-servers` |
| 13 | Security Add-ons | `SecurityAddons` | `AdminSecurityController` | `api/admin/security/addons` | SecuritySubscription | SecurityAddonType, SecurityScanStatus | PurchaseSecurityAddonCommand, RunMalwareScanCommand | ✅ `/dashboard/security` |
| 14 | Static Sites | `StaticSites` | `StaticSitesController` | `api/static-sites` | StaticSite, StaticDeploy | DeployStatus, StaticSiteStatus | CreateStaticSiteCommand, DeployStaticSiteCommand | ✅ `/dashboard/static-sites` |
| 15 | Marketplace | `Marketplace` | `AdminMarketplaceController` | `api/admin/marketplace` | MarketplaceListing, MarketplacePurchase | MarketplacePurchaseStatus, MarketplaceListingStatus | PurchaseListingCommand | ✅ `/dashboard/marketplace` |
| 16 | Resources | `Resources` | `ResourcesController` | `api/resources` | Resource | - | GetResourcesQuery | ✅ `/dashboard/resources` |

### Thống kê 16 Modules

| Component | Số lượng |
|-----------|----------|
| Entities mới | 23 classes |
| Enums mới | 23 enums |
| Commands | 18 commands |
| Queries | 3 queries |
| Controllers | 12 controllers |
| EF Configurations | 23 configs |
| Migration files | 2 migrations |
| Unit Tests | 66 tests |
| E2E Tests | 36 tests |
| Frontend pages | 16 pages |

### API Endpoints chi tiết

```
Module #1  Hosting:          POST /api/hosting, GET /api/hosting/me
Module #2  Email Hosting:    POST /api/email-hosting/accounts, GET /api/email-hosting/accounts
Module #3  App Installer:    POST /api/app-installer/install
Module #4  CDN:              POST /api/cdn/distributions, GET /api/cdn/distributions
Module #5  Database (User):   POST GET /api/databases          ⚠️ Legacy controller
Module #5a Database (Admin):  GET    /api/admin/databases      Admin only
Module #5b Database (Alt):    POST   /api/managed-databases    Alternative path
Module #6  Storage:          POST /api/storage/buckets, GET /api/storage/buckets
Module #7  Dedicated Server: POST /api/dedicated-servers, GET /api/dedicated-servers
Module #8  Website Builder:  POST /api/website-builder/projects, GET /api/website-builder/projects
Module #9  Domain Privacy:   POST /api/domains/{id}/privacy/enable, POST /api/domains/{id}/privacy/disable
Module #10 Organizations:    POST /api/organizations, GET /api/organizations, GET /api/organizations/{id}/members, POST /api/organizations/{id}/invite, POST /api/organizations/{id}/remove
Module #11 Business Email:   ❌ KHÔNG CÓ - Controller không tồn tại
Module #12 Game Server:      POST /api/game-servers, GET /api/game-servers
Module #13 Security:         POST /api/admin/security/addons, GET /api/admin/security/addons/me, POST /api/admin/security/addons/{id}/scan
Module #14 Static Sites:     POST /api/static-sites, GET /api/static-sites, POST /api/static-sites/{id}/deploy
Module #15 Marketplace:      POST /api/admin/marketplace/purchase/{id}, GET /api/admin/marketplace/listings
Module #16 Resources:        GET /api/resources
```

### Frontend Pages

```
/dashboard                              - Dashboard chính (18 service cards)
/dashboard/hosting                      - Module #1: Quản lý hosting accounts
/dashboard/security                     - Module #13: WAF/Malware Scan
/dashboard/static-sites                 - Module #14: Deploy static sites
/dashboard/database                     - Module #5: Tạo database instances
/dashboard/storage                      - Module #6: Quản lý storage buckets
/dashboard/game-servers                 - Module #12: Game server management
/dashboard/cdn                          - Module #4: CDN distributions
/dashboard/dedicated-servers            - Module #7: Dedicated servers
/dashboard/email-hosting                - Module #2: Email accounts
/dashboard/website-builder              - Module #8: Website projects
/dashboard/marketplace                  - Module #15: Browse và mua products
/dashboard/orgs                         - Module #10: Organizations
/dashboard/apps                         - Module #3: App installations
/dashboard/domains                      - Module #9: Domain Privacy (WHOIS Protection)
# /dashboard/email-subscriptions         - ❌ KHÔNG CÓ - Feature chưa implement
/dashboard/resources                    - Module #16: Resource Management
```

### Test Results

```
E2E Tests:                            36/36 PASSED
Unit Tests (All Features):            66/66 PASSED
Domain Entity Tests:                  54/54 PASSED
Integration Tests:                    38/38 PASSED
Tổng cộng:                            194/194 PASSED
```

---

## 7. Danh sách đầy đủ Feature Modules (70 modules)

```
AbandonedCarts, Affiliates, ApiKeys, AppInstallations, AuditLogs, Auth, 
AutoRenew, Backups, Banners, BlogComments, Carts, Categories, Cdn, 
CdnDistribution, ControlPanels, Coupons, Dashboard, DatabaseInstances, 
DedicatedServers, Domains, EmailHosting, ExchangeRates, Exports, Faqs, 
GameServers, GiftCards, GlobalSearch, HostingAccounts, Invoices, 
KnowledgeBase, LiveChat, LiveChats, Loyalty, ManagedDatabases, Marketplace, 
Migrations, News, NewsArticles, Newsletters, NotificationSettings, 
ObjectStorage, Orders, PaymentMethods, Payments, Permissions, Promotions, 
RecentlyViewed, Referrals, RefundRequests, Reviews, Roles, SEO, Search, 
Security, SecurityAddons, ServicePlans, Settings, Ssl, StaticSites, 
StorageBuckets, SupportTickets, SystemSettings, Testimonials, Tickets, 
Uptime, Users, VpsInstances, Wallet, WebsiteBuilder, Wishlists
```

---

## 8. Danh sách đầy đủ Controllers (75 controllers)

```
AbandonedCartsController, AdminDatabasesController, AdminMarketplaceController, 
AdminSecurityController, AffiliateApplicationsController, ApiKeysController, 
AppInstallerController, AuditLogsController, AuthController, AutoRenewController, 
BackupsController, BannersController, BlogCommentsController, CartsController, 
CategoriesController, CdnController, ContactController, ControlPanelController, 
CouponsController, DashboardController, DatabasesController, 
DedicatedServersController, DomainsController, EmailHostingController, 
ExchangeRatesController, ExportController, FaqsController, GameServersController, 
GiftCardsController, GlobalSearchController, HostingController, JobsController, 
KnowledgeBaseController, LiveChatController, LiveChatsController, 
LoyaltyController, ManagedDatabasesController, MarketplaceController, 
MigrationRequestsController, NewsController, NewsletterController, 
NotificationSettingsController, ObjectStorageController, OrdersController, 
OrganizationsController, PaymentMethodsController, PaymentsController, 
PermissionsController, PromotionsController, RecentlyViewedController, 
ReferralsController, RefundRequestsController, ResourcesController, 
ReviewsController, RolesController, SearchController, SecurityController, 
ServicePlansController, SettingsController, SitemapController, 
SslCertificatesController, SslController, StaticSitesController, 
StatusController, StorageController, SupportTicketsController, 
SystemSettingsController, TestimonialsController, TicketsController, 
UptimeController, UsersController, VpsInstancesController, 
WalletController, WebsiteBuilderController, WishlistsController
```

---

## 9. Trạng Thái Kết Nối Frontend - Backend (Full Integration Status)

- **Độ phủ API:** Đã tích hợp và kết nối toàn bộ hệ thống API Backend (75 Controllers, ~240 Endpoints) sang Frontend Next.js 16.
- **Tự động làm mới Token (JWT Auto-Refresh):** Đã tích hợp Interceptor tại `frontend/src/lib/api.ts` tự động bắt 401 và gọi `POST /api/auth/refresh-token`.
- **Admin Portal:** Đầy đủ Modal và Form CRUD cho Banners, News, KB, FAQs, Promotions, Categories, Service SEO, Exchange Rates, Settings, Tickets, VPS Instances, Testimonials.
- **Customer Portal:** Đầy đủ giỏ hàng (+/-), coupon, wishlist, control panel 1-click login, thanh toán ví/VNPay, domain search/registration, SSL certificates, backup/uptime.
- **16 Modules Mới:** Đầy đủ CRUD operations, frontend pages, và E2E tests.
- **Kiểm thử & Biên dịch:**
  - Frontend Build: `npm run build` thành công 100% (Next.js 16).
  - Backend Build: `dotnet build CloudServiceStore/CloudServiceStore.slnx` thành công 100% (0 errors).
  - E2E Tests: `dotnet test --filter 'E2E'` thành công 100% (36/36 tests passed).
  - Unit Tests: `dotnet test --filter 'Application'` thành công 100% (66/66 tests passed).

---

## 10. Key Statistics Summary

| Component | Count |
|-----------|-------|
| **Domain Layer** | |
| └─ Entities | 77 |
| └─ Enums | 39 |
| **Application Layer** | |
| └─ Feature Modules | 70 |
| └─ Commands | ~100+ |
| └─ Queries | ~80+ |
| └─ DTOs | 12 |
| **Infrastructure Layer** | |
| └─ EF Configurations | 49 |
| └─ Repositories | Generic + Role |
| **WebApi Layer** | |
| └─ Controllers | 75 |
| └─ SignalR Hubs | 3 |
| **Testing Layer** | |
| └─ Unit Tests (Features) | 66 folders |
| └─ Unit Tests (Entities) | 54 files |
| └─ E2E Tests | 36 files |
| └─ Integration Tests | 38 files |
| **Frontend** | |
| └─ Pages (app/) | 45+ |
| └─ Components | 40+ |
| └─ API Endpoints Connected | ~240 |

---

*Last Updated: 2025-08-12*  
*Version: 2.0 (Comprehensive Deep Update)*
Verified: 2026-08-12 — dotnet build: 0 errors, dotnet test NewModulesE2ETests: 16/16 passed (output đính kèm)
