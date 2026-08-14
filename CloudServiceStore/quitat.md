# Kế hoạch triển khai TDD — Bổ sung 9 Module Nhóm B còn thiếu

## Tổng quan

Bổ sung **9 module Nhóm B** chưa có hoặc chưa đầy đủ Feature + Controller, theo phương pháp **TDD (Test-Driven Development)**: viết test trước → chạy test fail (Red) → implement code (Green) → refactor.

> [!IMPORTANT]
> Chỉ tập trung vào **Nhóm B (cần code thật)**. Các module Nhóm C đã triển khai đủ rồi, phần còn thiếu của Nhóm C chỉ cần viết trong báo cáo "hướng phát triển".

## Convention đã có trong codebase

| Thành phần | Pattern |
|---|---|
| Command | `record XxxCommand(...) : IRequest<T>` + `AbstractValidator<T>` cùng file |
| Query | `record XxxQuery(...) : IRequest<T>` |
| Handler | `class XxxCommandHandler : IRequestHandler<TCmd, TResult>` |
| Controller | `[ApiController] [Route("api/xxx")]` + inject `IMediator` |
| Test | xUnit + Moq + FluentAssertions, mock `IRepository<T>`, `IUnitOfWork`, `ICurrentUserService` |
| Entity | Kế thừa `AggregateRoot` (ghi) hoặc `Entity` (child) |
| Exception | `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException` |

---

## Phase 1: SupportTicket + TicketMessage (Module 12)

> 7 endpoint: POST ticket, POST message, PATCH close, GET /me, GET /queue, PATCH assign, GET ticket detail

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Tickets/CreateTicketCommandHandlerTests.cs
- `Handle_ValidRequest_CreatesTicketWithOpenStatus` — tạo ticket thành công, status = Open
- `Handle_UserNotLoggedIn_ThrowsUnauthorizedException`

#### [NEW] Tests/Application/Features/Tickets/AddTicketMessageCommandHandlerTests.cs  
- `Handle_ValidMessage_AddsMessageToTicket` — thêm tin nhắn vào ticket đang mở
- `Handle_TicketClosed_ThrowsInvalidOperationException` — không được trả lời ticket đã đóng

#### [NEW] Tests/Application/Features/Tickets/CloseTicketCommandHandlerTests.cs
- `Handle_OpenTicket_ClosesSuccessfully`
- `Handle_AlreadyClosed_NoOp` — ticket đã đóng thì bỏ qua (idempotent)

#### [NEW] Tests/Application/Features/Tickets/AssignTicketCommandHandlerTests.cs
- `Handle_ValidStaff_AssignsAndSetsInProgress`

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Tickets/Commands/CreateTicket/CreateTicketCommand.cs
#### [NEW] Application/Features/Tickets/Commands/CreateTicket/CreateTicketCommandHandler.cs
#### [NEW] Application/Features/Tickets/Commands/AddMessage/AddTicketMessageCommand.cs
#### [NEW] Application/Features/Tickets/Commands/AddMessage/AddTicketMessageCommandHandler.cs
#### [NEW] Application/Features/Tickets/Commands/CloseTicket/CloseTicketCommand.cs
#### [NEW] Application/Features/Tickets/Commands/CloseTicket/CloseTicketCommandHandler.cs
#### [NEW] Application/Features/Tickets/Commands/AssignTicket/AssignTicketCommand.cs
#### [NEW] Application/Features/Tickets/Commands/AssignTicket/AssignTicketCommandHandler.cs
#### [NEW] Application/Features/Tickets/Queries/GetMyTickets/GetMyTicketsQuery.cs
#### [NEW] Application/Features/Tickets/Queries/GetMyTickets/GetMyTicketsQueryHandler.cs
#### [NEW] Application/Features/Tickets/Queries/GetTicketQueue/GetTicketQueueQuery.cs
#### [NEW] Application/Features/Tickets/Queries/GetTicketQueue/GetTicketQueueQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/TicketsController.cs
- `POST /api/tickets` → CreateTicketCommand
- `POST /api/tickets/{id}/messages` → AddTicketMessageCommand
- `PATCH /api/tickets/{id}/close` → CloseTicketCommand
- `PATCH /api/tickets/{id}/assign` → AssignTicketCommand (Admin)
- `GET /api/tickets/me` → GetMyTicketsQuery (Customer)
- `GET /api/tickets/queue` → GetTicketQueueQuery (Admin)

---

## Phase 2: AffiliateApplication (Module 13)

> 4 endpoint: POST apply, GET all (Admin), PATCH approve, PATCH reject

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Affiliates/CreateAffiliateApplicationCommandHandlerTests.cs
- `Handle_ValidRequest_CreatesWithPendingStatus`
- `Handle_AlreadyHasPendingApplication_ThrowsConflictException`
- `Handle_UserNotLoggedIn_ThrowsUnauthorizedException`

#### [NEW] Tests/Application/Features/Affiliates/ApproveAffiliateCommandHandlerTests.cs
- `Handle_PendingApplication_ApprovesSuccessfully`
- `Handle_NotFound_ThrowsNotFoundException`

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Affiliates/Commands/CreateApplication/CreateAffiliateApplicationCommand.cs
#### [NEW] Application/Features/Affiliates/Commands/CreateApplication/CreateAffiliateApplicationCommandHandler.cs
#### [NEW] Application/Features/Affiliates/Commands/Approve/ApproveAffiliateCommand.cs
#### [NEW] Application/Features/Affiliates/Commands/Approve/ApproveAffiliateCommandHandler.cs
#### [NEW] Application/Features/Affiliates/Commands/Reject/RejectAffiliateCommand.cs
#### [NEW] Application/Features/Affiliates/Commands/Reject/RejectAffiliateCommandHandler.cs
#### [NEW] Application/Features/Affiliates/Queries/GetAllApplications/GetAllAffiliateApplicationsQuery.cs
#### [NEW] Application/Features/Affiliates/Queries/GetAllApplications/GetAllAffiliateApplicationsQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/AffiliateApplicationsController.cs
- `POST /api/affiliate-applications` → CreateAffiliateApplicationCommand (Customer)
- `GET /api/affiliate-applications` → GetAllAffiliateApplicationsQuery (Admin)
- `PATCH /api/affiliate-applications/{id}/approve` → ApproveAffiliateCommand (Admin)
- `PATCH /api/affiliate-applications/{id}/reject` → RejectAffiliateCommand (Admin)

---

## Phase 3: AuditLog (Module 14)

> 1 endpoint: GET /api/audit-logs (Admin, lọc theo entity/thời gian)

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/AuditLogs/GetAuditLogsQueryHandlerTests.cs
- `Handle_ReturnsFilteredLogs` — trả danh sách log đúng theo bộ lọc
- `Handle_NoFilter_ReturnsAll` — không truyền filter thì trả tất cả

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/AuditLogs/Queries/GetAuditLogs/GetAuditLogsQuery.cs
#### [NEW] Application/Features/AuditLogs/Queries/GetAuditLogs/GetAuditLogsQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/AuditLogsController.cs
- `GET /api/audit-logs` → GetAuditLogsQuery (Admin)

---

## Phase 4: Security — LoginHistory + UserSession (Module 15 + 16)

> 4 endpoint: GET login-history, GET sessions, DELETE session/{id}, (LoginHistory ghi tự động trong Auth flow)

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Security/GetLoginHistoryQueryHandlerTests.cs
- `Handle_ReturnsUserLoginHistory` — trả lịch sử đăng nhập của user hiện tại
- `Handle_UserNotLoggedIn_ThrowsUnauthorizedException`

#### [NEW] Tests/Application/Features/Security/RevokeSessionCommandHandlerTests.cs
- `Handle_ValidSession_RevokesSuccessfully` — thu hồi session thành công
- `Handle_SessionNotFound_ThrowsNotFoundException`
- `Handle_SessionBelongsToAnotherUser_ThrowsUnauthorizedException`

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Security/Queries/GetLoginHistory/GetLoginHistoryQuery.cs
#### [NEW] Application/Features/Security/Queries/GetLoginHistory/GetLoginHistoryQueryHandler.cs
#### [NEW] Application/Features/Security/Queries/GetMySessions/GetMySessionsQuery.cs
#### [NEW] Application/Features/Security/Queries/GetMySessions/GetMySessionsQueryHandler.cs
#### [NEW] Application/Features/Security/Commands/RevokeSession/RevokeSessionCommand.cs
#### [NEW] Application/Features/Security/Commands/RevokeSession/RevokeSessionCommandHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/SecurityController.cs
- `GET /api/security/login-history` → GetLoginHistoryQuery (Customer)
- `GET /api/security/sessions` → GetMySessionsQuery (Customer)
- `DELETE /api/security/sessions/{id}` → RevokeSessionCommand (Customer)

---

## Phase 5: NotificationSetting (Module 17)

> 2 endpoint: GET /me, PUT /me

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/NotificationSettings/UpdateNotificationSettingCommandHandlerTests.cs
- `Handle_ExistingSetting_UpdatesSuccessfully`
- `Handle_NoSetting_CreatesNewSetting` — chưa có thì tạo mới (upsert)

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/NotificationSettings/Queries/GetMyNotificationSetting/GetMyNotificationSettingQuery.cs
#### [NEW] Application/Features/NotificationSettings/Queries/GetMyNotificationSetting/GetMyNotificationSettingQueryHandler.cs
#### [NEW] Application/Features/NotificationSettings/Commands/UpdateNotificationSetting/UpdateNotificationSettingCommand.cs
#### [NEW] Application/Features/NotificationSettings/Commands/UpdateNotificationSetting/UpdateNotificationSettingCommandHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/NotificationSettingsController.cs
- `GET /api/notification-settings/me` → GetMyNotificationSettingQuery (Customer)
- `PUT /api/notification-settings/me` → UpdateNotificationSettingCommand (Customer)

---

## Phase 6: Dashboard (Module 18)

> 3 endpoint: GET /me (customer), GET /revenue-stats (Admin), GET /order-trend (Admin)

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Dashboard/GetRevenueStatsQueryHandlerTests.cs
- `Handle_ReturnsRevenueStats` — trả tổng doanh thu + số đơn theo khoảng thời gian
- `Handle_NoOrders_ReturnsZero`

#### [NEW] Tests/Application/Features/Dashboard/GetMyDashboardQueryHandlerTests.cs
- `Handle_ReturnsCustomerDashboard` — trả tổng đơn, tổng chi, gói đang dùng

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Dashboard/Queries/GetMyDashboard/GetMyDashboardQuery.cs
#### [NEW] Application/Features/Dashboard/Queries/GetMyDashboard/GetMyDashboardQueryHandler.cs
#### [NEW] Application/Features/Dashboard/Queries/GetRevenueStats/GetRevenueStatsQuery.cs
#### [NEW] Application/Features/Dashboard/Queries/GetRevenueStats/GetRevenueStatsQueryHandler.cs
#### [NEW] Application/Features/Dashboard/Queries/GetOrderTrend/GetOrderTrendQuery.cs
#### [NEW] Application/Features/Dashboard/Queries/GetOrderTrend/GetOrderTrendQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/DashboardController.cs
- `GET /api/dashboard/me` → GetMyDashboardQuery (Customer)
- `GET /api/dashboard/revenue-stats` → GetRevenueStatsQuery (Admin)
- `GET /api/dashboard/order-trend` → GetOrderTrendQuery (Admin)

---

## Phase 7: Promotion (Module 5 — bổ sung Feature/Controller)

> 5 endpoint: GET all, POST, PUT, DELETE (Admin), Promotion entity đã có sẵn

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Promotions/CreatePromotionCommandHandlerTests.cs
- `Handle_ValidRequest_CreatesPromotion`
- `Handle_EndDateBeforeStartDate_ThrowsBadRequestException`

#### [NEW] Tests/Application/Features/Promotions/DeletePromotionCommandHandlerTests.cs
- `Handle_ExistingPromotion_DeletesSuccessfully`
- `Handle_NotFound_ThrowsNotFoundException`

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Promotions/Commands/CreatePromotion/CreatePromotionCommand.cs
#### [NEW] Application/Features/Promotions/Commands/CreatePromotion/CreatePromotionCommandHandler.cs
#### [NEW] Application/Features/Promotions/Commands/UpdatePromotion/UpdatePromotionCommand.cs
#### [NEW] Application/Features/Promotions/Commands/UpdatePromotion/UpdatePromotionCommandHandler.cs
#### [NEW] Application/Features/Promotions/Commands/DeletePromotion/DeletePromotionCommand.cs
#### [NEW] Application/Features/Promotions/Commands/DeletePromotion/DeletePromotionCommandHandler.cs
#### [NEW] Application/Features/Promotions/Queries/GetPromotions/GetPromotionsQuery.cs
#### [NEW] Application/Features/Promotions/Queries/GetPromotions/GetPromotionsQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/PromotionsController.cs
- `GET /api/promotions` → GetPromotionsQuery (Admin)
- `POST /api/promotions` → CreatePromotionCommand (Admin)
- `PUT /api/promotions/{id}` → UpdatePromotionCommand (Admin)
- `DELETE /api/promotions/{id}` → DeletePromotionCommand (Admin)

---

## Phase 8: NewsArticle (Module 6 — bổ sung Feature/Controller)

> 6 endpoint: GET public, GET by slug, POST, PUT, PATCH publish, DELETE

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/News/CreateNewsArticleCommandHandlerTests.cs
- `Handle_ValidRequest_CreatesArticleWithDraftStatus`
- `Handle_DuplicateSlug_ThrowsConflictException`

#### [NEW] Tests/Application/Features/News/PublishNewsArticleCommandHandlerTests.cs
- `Handle_DraftArticle_PublishesSuccessfully`
- `Handle_NotFound_ThrowsNotFoundException`

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/News/Commands/CreateArticle/CreateNewsArticleCommand.cs
#### [NEW] Application/Features/News/Commands/CreateArticle/CreateNewsArticleCommandHandler.cs
#### [NEW] Application/Features/News/Commands/UpdateArticle/UpdateNewsArticleCommand.cs
#### [NEW] Application/Features/News/Commands/UpdateArticle/UpdateNewsArticleCommandHandler.cs
#### [NEW] Application/Features/News/Commands/PublishArticle/PublishNewsArticleCommand.cs
#### [NEW] Application/Features/News/Commands/PublishArticle/PublishNewsArticleCommandHandler.cs
#### [NEW] Application/Features/News/Commands/DeleteArticle/DeleteNewsArticleCommand.cs
#### [NEW] Application/Features/News/Commands/DeleteArticle/DeleteNewsArticleCommandHandler.cs
#### [NEW] Application/Features/News/Queries/GetNewsList/GetNewsListQuery.cs
#### [NEW] Application/Features/News/Queries/GetNewsList/GetNewsListQueryHandler.cs
#### [NEW] Application/Features/News/Queries/GetNewsBySlug/GetNewsBySlugQuery.cs
#### [NEW] Application/Features/News/Queries/GetNewsBySlug/GetNewsBySlugQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/NewsController.cs
- `GET /api/news` → GetNewsListQuery (Public: chỉ Published / Admin: mọi status)
- `GET /api/news/{slug}` → GetNewsBySlugQuery (Public)
- `POST /api/news` → CreateNewsArticleCommand (Admin, Editor)
- `PUT /api/news/{id}` → UpdateNewsArticleCommand (Admin, Editor)
- `PATCH /api/news/{id}/publish` → PublishNewsArticleCommand (Admin, Editor)
- `DELETE /api/news/{id}` → DeleteNewsArticleCommand (Admin)

---

## Phase 9: Quản lý User (bổ sung từ Module 2 — Role + User management)

> 3 endpoint: GET /users, PATCH lock, PATCH role (tất cả Admin)

### Bước 1 — Viết Test (Red)

#### [NEW] Tests/Application/Features/Users/LockUserCommandHandlerTests.cs
- `Handle_ExistingUser_LocksSuccessfully` — set IsActive = false
- `Handle_NotFound_ThrowsNotFoundException`
- `Handle_LockSelf_ThrowsBadRequestException` — không được tự khoá mình

### Bước 2 — Implement (Green)

#### [NEW] Application/Features/Users/Commands/LockUser/LockUserCommand.cs
#### [NEW] Application/Features/Users/Commands/LockUser/LockUserCommandHandler.cs
#### [NEW] Application/Features/Users/Commands/ChangeRole/ChangeUserRoleCommand.cs
#### [NEW] Application/Features/Users/Commands/ChangeRole/ChangeUserRoleCommandHandler.cs
#### [NEW] Application/Features/Users/Queries/GetUsers/GetUsersQuery.cs
#### [NEW] Application/Features/Users/Queries/GetUsers/GetUsersQueryHandler.cs

### Bước 3 — Controller

#### [NEW] WebApi/Controllers/UsersController.cs
- `GET /api/users` → GetUsersQuery (Admin)
- `PATCH /api/users/{id}/lock` → LockUserCommand (Admin)
- `PATCH /api/users/{id}/role` → ChangeUserRoleCommand (Admin)

---

## Tổng kết

| Phase | Module | Files mới | Test cases |
|-------|--------|-----------|------------|
| 1 | SupportTicket | ~14 | 7 |
| 2 | AffiliateApplication | ~10 | 5 |
| 3 | AuditLog | ~4 | 2 |
| 4 | Security (LoginHistory + Session) | ~8 | 5 |
| 5 | NotificationSetting | ~6 | 2 |
| 6 | Dashboard | ~8 | 3 |
| 7 | Promotion | ~10 | 4 |
| 8 | NewsArticle | ~14 | 4 |
| 9 | User Management | ~8 | 3 |
| **Tổng** | **9 module** | **~82 files** | **35 tests** |

## Thứ tự thực hiện

Làm **từng phase một**, mỗi phase xong chạy `dotnet test` đảm bảo tất cả test pass trước khi sang phase tiếp:

```
Phase 1 (SupportTicket) → Phase 2 (Affiliate) → Phase 3 (AuditLog) →
Phase 4 (Security) → Phase 5 (NotificationSetting) → Phase 6 (Dashboard) →
Phase 7 (Promotion) → Phase 8 (News) → Phase 9 (Users)
```

## Verification Plan

### Automated Tests
```bash
dotnet test CloudServiceStore/CloudServiceStore.Tests/ --verbosity normal
```

### Manual Verification
- Chạy `dotnet build` sau mỗi phase đảm bảo không lỗi compile
- Chạy `dotnet test` sau mỗi phase đảm bảo tất cả test pass
- Sau khi hoàn thành tất cả: `docker compose up` test trên máy sạch
