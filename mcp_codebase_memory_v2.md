# CloudServiceStore - MCP Codebase Memory Report
**Last Updated:** 2026-08-21  
**Status:** Audit Complete - Service Real vs Mock Analysis

---

## Project Overview
CloudServiceStore là nền tảng thương mại dịch vụ đám mây toàn diện:
- **Backend**: .NET 8 (ASP.NET Core) Clean Architecture / DDD
- **Frontend**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL 16 + Dapper ORM
- **Cache**: Redis
- **Realtime**: SignalR
- **Jobs/Queue**: Hangfire
- **Auth**: JWT Bearer + BCrypt
- **Testing**: xUnit, Playwright, Stryker
- **Deployment**: Docker Compose

---

## ⚠️ SERVICE AUDIT RESULTS - REAL vs MOCK

### ✅ REAL SERVICES (Hoạt động thật)

| Service | File | Technology | Status | Notes |
|---------|------|------------|--------|-------|
| **VPS Provisioning** | `DockerVpsProvisioningService.cs` | Docker.DotNet SDK | ✅ REAL | Kết nối trực tiếp Docker daemon qua socket. Tạo container VPS thật với resource limits (CPU, RAM, PIDs). |
| **Database Provisioning** | `DockerDatabaseProvisioningService.cs` | Docker API | ✅ REAL | Sử dụng Docker containers cho database instances |

### ❌ MOCK SERVICES (Không hoạt động thật)

| Service | File | Fake Behavior | Impact |
|---------|------|---------------|--------|
| Static Site | `MockStaticSiteProvisioningService.cs` | `Task.Delay(2000ms)` + random timeout | Không deploy lên Vercel/Netlify |
| SSL Certificate | `AcmeProvisioningService.cs` | Generate fake cert string | Không gọi Let's Encrypt ACME API |
| Object Storage | `MinioProvisioningService.cs` | `Task.Delay(2000ms)` + random fail | Không tạo bucket trên MinIO/S3 |
| CDN | `CloudflareCdnProvisioningService.cs` | Return fake URL `cdn-{guid}.cloudservicestore.net` | Không gọi Cloudflare API |
| Game Server | `DockerGameServerProvisioningService.cs` | Return random port 25565-27015 | Không tạo Docker container |
| App Installer | `DockerAppInstallerService.cs` | Return fake URL | Không install app thực tế |

---

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
│   │   ├── DockerVpsProvisioningService.cs       ✅ REAL
│   │   ├── DockerDatabaseProvisioningService.cs  ✅ REAL
│   │   ├── MockStaticSiteProvisioningService.cs  ❌ MOCK
│   │   ├── AcmeProvisioningService.cs            ❌ MOCK
│   │   ├── MinioProvisioningService.cs           ❌ MOCK
│   │   ├── CloudflareCdnProvisioningService.cs   ❌ MOCK
│   │   ├── DockerGameServerProvisioningService.cs❌ MOCK
│   │   └── DockerAppInstallerService.cs          ❌ MOCK
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

---

## Các Module Chính

### 1. Quản lý Dịch vụ & Đơn hàng
- **ServicePlan**: Quản lý tất cả dịch vụ hosting/VPS/cloud
- **OrderRequest/OrderItem**: Xử lý đơn hàng
- **Cart/CartItem**: Giỏ hàng
- **Payment/Invoice**: Thanh toán & hóa đơn
- **Coupon/GiftCard**: Khuyến mãi & mã quà tặng

### 2. Dịch vụ Đám mây (Provisioning)
| Entity | Table | Status |
|--------|-------|--------|
| VpsInstance | vps_instances | ✅ REAL (Docker) |
| GameServerInstance | game_server_instances | ❌ MOCK |
| AppInstallation | app_installations | ❌ MOCK |
| CdnDistribution | cdn_distributions | ❌ MOCK |
| StaticSite | static_sites | ❌ MOCK |
| ObjectStorageBucket | object_storage_buckets | ❌ MOCK |
| ManagedDatabaseInstance | managed_database_instances | Cần kiểm tra |
| DatabaseInstance | database_instances | ✅ REAL (Docker) |
| HostingAccount | hosting_accounts | Cần kiểm tra |
| DedicatedServer | dedicated_servers | Cần kiểm tra |
| SslCertificate | ssl_certificates | ❌ MOCK |
| DomainRecord | domain_records | Cần kiểm tra |
| EmailHostingAccount | email_hosting_accounts | Cần kiểm tra |

### 3. Tài khoản & Bảo mật Người dùng
- **AppUser**: Tài khoản khách hàng
- **Role/Permission**: RBAC system
- **ApiKey**: API authentication
- **TwoFactorBackupCode**: 2FA backup codes
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

---

## Kiến Trúc API

### Pattern RESTful
```
/api/{module}              → GET (list), POST (create)
/api/{module}/{id}         → GET (detail), PUT (update), DELETE
/api/{module}/{id}/action  → POST (action endpoints)
```

### Application Layer (CQRS + MediatR)
- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (List, Get, Search)
- **Pipeline Behaviors**: Validation, Logging, Caching, Performance
- **FluentValidation**: Request validators cho mỗi use case

### Domain Layer (DDD)
- **Aggregates**: Mỗi entity là aggregate root
- **Domain Events**: Events fired khi state changes
- **Value Objects**: Immutable objects (Money, Address, VpsSpec)
- **Repository Pattern**: `IRepository<T>` + `IUnitOfWork`

---

## Service Provisioning Flow

### Thực tế hiện tại:
```
1. Customer đặt hàng
   ↓
2. OrderCreatedEvent được publish
   ↓
3. ResourceProvisioningWorker nhận job từ queue
   ↓
4. Specific provisioning service xử lý:
   ✅ DockerVpsProvisioningService      → TẠO CONTAINER THẬT
   ✅ DockerDatabaseProvisioningService → TẠO DATABASE THẬT
   ❌ MockStaticSiteProvisioningService → CHỈDELAY + RETURN FAKE
   ❌ AcmeProvisioningService           → GENERATE FAKE CERT
   ❌ MinioProvisioningService          → KHÔNG TẠO BUCKET
   ❌ CloudflareCdnProvisioningService  → RETURN FAKE URL
   ❌ DockerGameServerProvisioningService → KHÔNG TẠO CONTAINER
   ❌ DockerAppInstallerService         → KHÔNG INSTALL APP
   ↓
5. Status update qua SignalR đến customer
   ↓
6. Cleanup jobs xử lý expired/terminated resources
```

---

## Background Jobs & Workers

### Hangfire Jobs
- `SubscriptionMonitorWorker`: Giám sát subscription sắp hết hạn
- `VpsIdleMonitorService`: Tự động stop VPS idle (thật)
- `SslRenewalJob`: Tự động gia hạn SSL (cần implement thật)
- Cleanup jobs cho từng resource type

### Resource Provisioning Queue
- Priority-based job processing
- Idempotency keys để tránh duplicate provisioning
- Real-time status notification qua SignalR

---

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

---

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

---

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

---

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

---

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

---

## Recommendations

1. **Ưu tiên cao nhất**: Implement thật các mock services
2. **Tách environment**: Dùng config để switch giữa mock/real
3. **Feature flags**: Bật/tắt mock tùy production/staging
4. **Documentation**: Cập nhật docs về services nào real, nào mock
5. **Testing**: Thêm integration tests với real providers

---

*Báo cáo được tạo tự động từ codebase analysis*
*Last updated: 2026-08-21*
*Audit performed: Service Real vs Mock verification*
