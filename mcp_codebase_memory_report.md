# Báo Cáo Cập Nhật MCP Codebase Memory

## Tổng Quan Dự Án
**CloudServiceStore** là nền tảng thương mại dịch vụ đám mây toàn diện được phát triển với:
- **Backend**: .NET 10.0 (ASP.NET Core) theo kiến trúc Clean Architecture / CQRS / DDD
- **Frontend**: Next.js 14/15 (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Database**: Microsoft SQL Server + Entity Framework Core + Dapper
- **Containerization**: Docker Engine API (Docker.DotNet) cho VPS, Databases, Game Servers, 1-Click Apps, Static Sites
- **Storage**: MinIO S3-Compatible Storage SDK
- **Security / SSL**: ACME Protocol v2 (Let's Encrypt) + HTTP-01 Challenges + RSA-2048
- **Cache**: Redis
- **Realtime**: SignalR Hubs (Resource status notifier, Live chat, VPS Terminal)
- **Jobs/Queue**: Hangfire + IResourceProvisioningQueue Background Workers
- **Auth**: JWT Bearer + BCrypt + TwoFactor Backup Codes + Audit Logging
- **Testing**: xUnit, Testcontainers (MSSQL), Playwright E2E
- **CI/CD & Deployment**: GitHub Actions (4 Parallel Stages) + VPS Docker Compose auto-deploy

## Cấu Trúc Codebase

### Backend (.NET 8 - Clean Architecture)
```
CloudServiceStore/
├── CloudServiceStore.Domain/           # Core business logic
│   ├── Entities/                       # 40+ aggregate roots
│   ├── Enums/                          # Domain enums
│   ├── Events/                         # Domain events (IDomainEvent)
│   ├── Interfaces/                     # Repository interfaces
│   └── Primitives/                     # Entity, AggregateRoot, ValueObject
│
├── CloudServiceStore.Application/      # Use cases & DTOs
│   ├── Features/                       # CQRS commands/queries (50+ folders)
│   ├── DTOs/                           # Data transfer objects
│   ├── Events/                         # Application events
│   ├── Interfaces/                     # Service interfaces
│   ├── Behaviors/                      # MediatR pipeline behaviors
│   ├── Caching/                        # Redis cache implementation
│   └── Configuration/                  # App settings
│
├── CloudServiceStore.Infrastructure/   # External concerns
│   ├── Persistence/                    # EF Core, Dapper, Repositories
│   ├── Services/                       # External service implementations
│   ├── BackgroundServices/             # Hosted services (Hangfire workers)
│   ├── Jobs/                           # Scheduled tasks
│   ├── Security/                       # Auth, hashing, JWT
│   └── Migrations/                     # EF Core migrations (20+ files)
│
├── CloudServiceStore.WebApi/           # API layer
│   ├── Controllers/                    # REST controllers (50+)
│   ├── Hubs/                           # SignalR hubs
│   ├── Middlewares/                    # Exception handling
│   └── Services/                       # Web-specific services
│
└── CloudServiceStore.Tests/            # Testing layer
    ├── E2E/                            # End-to-end tests
    ├── Integration/                    # Integration tests
    ├── Application/                    # Unit tests for application
    └── Infrastructure/                 # Unit tests for infrastructure
```

### Frontend (Next.js 15)
```
frontend/
├── app/                                # App Router pages
│   ├── admin/                          # Admin dashboard (30+ modules)
│   ├── dashboard/                      # Customer dashboard
│   ├── services/                       # Service catalog
│   ├── cart/                           # Shopping cart
│   ├── checkout/                       # Checkout flow
│   ├── support/                        # Support center
│   └── ...                             # Other customer pages
│
├── src/
│   ├── components/                     # React components
│   ├── hooks/                          # Custom React hooks
│   ├── lib/                            # Utilities & API client
│   ├── store/                          # Zustand stores
│   └── types/                          # TypeScript types
│
└── tests/                              # Playwright E2E tests
    ├── e2e/                            # End-to-end test specs (30+)
    └── integration/                    # Integration tests
```

## Các Module Chính

### 1. Quản lý Dịch vụ & Đơn hàng
- **ServicePlan**: Quản lý tất cả dịch vụ hosting/VPS/cloud
- **OrderRequest/OrderItem**: Xử lý đơn hàng
- **Cart/CartItem**: Giỏ hàng
- **Payment/Invoice**: Thanh toán & hóa đơn (Tích hợp thật: Momo Webhook, SePay Webhook qua `PaymentsController` và frontend sandbox)
- **Coupon/GiftCard**: Khuyến mãi & mã quà tặng

### 2. Dịch vụ Đám mây (Provisioning)
- **VpsInstance**: Máy chủ ảo (Docker-based provisioning)
- **GameServerInstance**: Máy chủ game
- **AppInstallation**: Cài đặt ứng dụng sẵn
- **CdnDistribution**: CDN configuration
- **StaticSite**: Hosting website tĩnh
- **ObjectStorageBucket**: Lưu trữ S3-compatible
- **ManagedDatabaseInstance**: Database managed service
- **SslCertificate**: Quản lý SSL certificates
- **DomainRecord**: Quản lý DNS/domains

### 3. Tài khoản & Bảo mật Người dùng (Đã implement thật)
- **AppUser**: Tài khoản khách hàng (Mật khẩu được hash bằng `BCryptPasswordHasher`)
- **Role/Permission**: RBAC system (Xác thực qua JWT - `JwtTokenGenerator`)
- **ApiKey**: API authentication (Tích hợp thực tế qua `ApiKeysController` và `RevokeApiKeyCommand`)
- **TwoFactorBackupCode**: 2FA backup codes (Bảo mật 2 lớp thật với `SetupTwoFactorCommand`, `VerifyTwoFactorLoginCommand`)
- **PasswordResetToken**: Reset password flow
- **LoginHistory**: Audit login attempts

### 4. Cộng đồng & Nội dung
- **NewsArticle/Blog**: Bài viết tin tức
- **KnowledgeBaseArticle**: Tài liệu hướng dẫn
- **FaqItem**: Câu hỏi thường gặp
- **Review/Testimonial**: Đánh giá & testimonial
- **Banner**: Marketing banners
- **ArticleComment**: Bình luận bài viết

### 5. Hỗ trợ & Tương tác
- **SupportTicket/TicketMessage**: Hệ thống ticket hỗ trợ
- **ChatSession/ChatMessage**: Live chat realtime
- **NotificationSetting**: Cài đặt thông báo
- **AuditLog**: Nhật ký hoạt động admin

### 6. Chương trình Khách hàng
- **Wallet/WalletTransaction**: Ví điện tử
- **LoyaltyPoint/LoyaltyTransaction**: Điểm thưởng
- **ReferralCode/ReferralReward**: Chương trình giới thiệu
- **AffiliateApplication**: Chương trình affiliate

### 7. Quản trị Hệ thống
- **SystemSetting**: Cài đặt toàn hệ thống
- **ExchangeRate**: Tỷ giá tiền tệ
- **RenewalJob/BackupJob**: Tự động gia hạn & backup
- **RecentlyViewed**: Lịch sử duyệt web
- **WishlistItem**: Danh sách mong muốn

## Kiến Trúc API

### Pattern RESTful
```
/api/{module}              → GET (list), POST (create)
/api/{module}/{id}         → GET (detail), PUT (update), DELETE
/api/{module}/{id}/action  → POST (action endpoints)
```

### Application Layer (CQRS + MediatR)
- **Commands**: Write operations (Create, Update, Delete) - Sử dụng **Entity Framework Core** qua Repository để đảm bảo toàn vẹn dữ liệu.
- **Queries**: Read operations (List, Get, Search) - Sử dụng **Dapper** (`DapperContext`) để tối ưu tốc độ truy vấn đọc (VD: `GetMyCartQueryHandler`).
- **Pipeline Behaviors**: Validation, Logging, Caching, Performance
- **FluentValidation**: Request validators cho mỗi use case

### Domain Layer (DDD)
- **Aggregates**: Mỗi entity là aggregate root
- **Domain Events**: Events fired khi state changes (Được publish và handle thông qua **Kafka**)
- **Value Objects**: Immutable objects (Money, Address, VpsSpec)
- **Repository Pattern**: `IRepository<T>` + `IUnitOfWork` (Triển khai bằng **EF Core**)

## Service Provisioning Flow

```
1. Customer đặt hàng
   ↓
2. OrderCreatedEvent được publish
   ↓
3. ResourceProvisioningWorker nhận job từ queue
   ↓
4. Specific provisioning service xử lý (Thực tế hiện tại):
   - ✅ DockerVpsProvisioningService      → TẠO CONTAINER THẬT
   - ✅ DockerDatabaseProvisioningService → TẠO DATABASE THẬT
   - ❌ MockStaticSiteProvisioningService → CHỈ DELAY + RETURN FAKE
   - ❌ AcmeProvisioningService           → GENERATE FAKE CERT
   - ❌ MinioProvisioningService          → KHÔNG TẠO BUCKET
   - ❌ CloudflareCdnProvisioningService  → RETURN FAKE URL
   - ❌ DockerGameServerProvisioningService → KHÔNG TẠO CONTAINER
   - ❌ DockerAppInstallerService         → KHÔNG INSTALL APP
   ↓
5. Status update qua SignalR đến customer
   ↓
6. Cleanup jobs xử lý expired/terminated resources
```

## Background Jobs & Workers

### Message Brokers & Event Driven
- **Kafka**: Hệ thống pub/sub xử lý Domain Events (`DomainEventKafkaConsumerWorker`) và Audit Logs (`AuditLogKafkaConsumerWorker`) thông qua `KafkaProducerService`.
- **RabbitMQ**: Xử lý các luồng tác vụ bất đồng bộ như Gửi Email thông báo (`NotificationEmailConsumerWorker`) và Xử lý hết hạn đơn hàng (`OrderExpiryConsumerWorker`).

### Hangfire Jobs
- `SubscriptionMonitorWorker`: Giám sát subscription sắp hết hạn
- `VpsIdleMonitorService`: Tự động stop VPS idle
- `SslRenewalJob`: Tự động gia hạn SSL
- Cleanup jobs cho từng resource type

### Resource Provisioning Queue
- Priority-based job processing
- Idempotency keys để tránh duplicate provisioning
- Real-time status notification qua SignalR

## Frontend Architecture

### Pages & Routes
| Route | Mô tả |
|-------|-------|
| `/` | Homepage (Hero, categories, news) |
| `/services/*` | Service catalog & details |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/dashboard/*` | Customer dashboard |
| `/admin/*` | Admin panel (30+ modules) |
| `/login`, `/register` | Authentication |
| `/support/tickets` | Support center |
| `/marketplace` | Marketplace listings |
| `/gift-cards` | Gift card purchase |
| `/loyalty` | Loyalty program |
| `/wallet` | Wallet management |

### Key Components
- `AuthModal.tsx`: Login/register modal
- `CartDrawer.tsx`: Slide-out shopping cart
- `LiveChatWidget.tsx`: Live chat support widget
- `VpsCalculator.tsx`: VPS pricing calculator
- `VpsTerminalModal.tsx`: Web terminal (WebSocket)
- `NotificationBell.tsx`: Realtime notifications
- `GlobalSearch.tsx`: Full-text search
- `BannerSlider.tsx`: Marketing banner carousel
- `CategoryPricingGrid.tsx`: Service plan comparison

### State Management
- **Zustand**: Global state (useAuthStore, useCartStore)
- **React Query**: Server state caching
- **WebSocket**: Realtime updates (SignalR client)

## Testing Strategy

### Unit Tests
- Domain logic validation
- Value object behavior
- Service layer unit tests

### Integration Tests
- HTTP endpoint testing
- Database operations
- External service mocking

### E2E Tests (Playwright)
- Full user journey flows
- Cross-module integration
- UI state verification
- 30+ test specifications

### Mutation Testing
- Stryker configured for code coverage quality
- Mutation score tracking

## Docker Deployment

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
  
  api:
    build: .
    ports:
      - "5000:80"
    depends_on:
      - postgres
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

## MCP Prompt Context Guidelines

Khi làm việc với codebase này, cần tham khảo:

1. **Module Mapping**: 
   - Module name → Controller → Application Feature → Domain Entity
   - Luôn track relationship giữa các layer

2. **Dependency Injection**:
   - Check `DependencyInjection.cs` trong mỗi project
   - Registration patterns: Transient, Scoped, Singleton

3. **Controller Patterns**:
   - Controllers trong `WebApi/Controllers/` mirror Feature folders
   - Theo dõi naming convention: `{Entity}Controller.cs`

4. **Test Organization**:
   - Tests trong `CloudServiceStore.Tests/` follows same naming
   - E2E, Integration, Unit tests được tổ chức rõ ràng

5. **Frontend-Backend Mapping**:
   - Frontend pages trong `frontend/app/` follow route structure
   - API client trong `src/lib/api.ts`
   - Types generated từ OpenAPI/Swagger

## Recent Updates & Changes

### Backend Updates
- [x] Added `ExportOrders` query (Excel/CSV/PDF) and `GetPlanQrCode` query
- [x] Updated `OrdersController` and `ServicePlansController`
- [x] Fixed `TypeLoadException` in `DockerClientFactory` for Docker Engine API
- [x] Fixed VPS Quota checking bug for existing users with 0 quota
- [x] Fixed email template to include explicit product web link and cache buster

### Frontend Updates
- [x] UI/UX Overhaul: Converted admin dashboard to dark mode/glassmorphism aesthetics
- [x] Implemented mega menu and homepage sections, fixed Next.js 15 bugs
- [x] Redesigned explore and careers pages, added 14 new solution pages
- [x] Optimized mobile layout for Header, Banner, Explore, Careers
- [x] Standardized VPS and Dedicated Server dashboards
- [x] Updated Admin Orders and Service Plans pages to integrate Export and QR Code features

### Infrastructure Updates
- [x] Reverted incorrect backend proxy IP and used correct duckdns domain
- [x] Deleted obsolete memory report v2 to consolidate into v1

## 🔴 Critical Findings - Dịch Vụ Mock

### Vấn Đề Nặng Nhất:
1. **Chỉ 2/9 services provisioning là REAL** (VPS + Database)
2. **7 services còn lại chỉ là MOCK** - không tạo tài nguyên thật
3. **Customer sẽ mua sản phẩm nhưng không nhận được gì** - chỉ là mô phỏng

### Dịch Vụ Cần Implement Thật:

| Priority | Service | Required Integration | Estimated Effort |
|----------|---------|---------------------|------------------|
| P0 | Static Site | Vercel API / Netlify API | 2-3 days |
| P0 | Object Storage | AWS S3 SDK / MinIO SDK | 2 days |
| P1 | CDN | Cloudflare API | 2-3 days |
| P1 | SSL Certificate | Let's Encrypt ACME client | 3 days |
| P2 | Game Server | Docker + game server images | 2 days |
| P2 | App Installer | Docker + app marketplace | 3 days |

## Recommendations

1. **Code Review Process**:
   - Luôn review cả 3 layers: Domain, Application, Infrastructure
   - Check test coverage trước khi merge

2. **Documentation**:
   - Update API docs sau mỗi change
   - Document new entities và relationships

3. **Testing**:
   - Viết tests cho new features
   - Update existing tests khi refactor

4. **Performance**:
   - Monitor Redis cache hit rates
   - Optimize database queries
   - Profile background jobs

---

*Báo cáo được tạo tự động từ codebase analysis*
*Last updated: 2026-08-21*
