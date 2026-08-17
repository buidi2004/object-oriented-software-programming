-- 0. SCHEMA MIGRATIONS
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DomainRecords') AND name = 'IsPrivacyProtected')
BEGIN
  ALTER TABLE DomainRecords ADD IsPrivacyProtected BIT NOT NULL DEFAULT 0;
END
GO

-- 1. ROLES & PERMISSIONS
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'RestrictedCustomer')
BEGIN
  INSERT INTO Roles (Id, Name) VALUES (NEWID(), 'RestrictedCustomer');
END
GO

UPDATE AppUsers 
SET RoleId = (SELECT TOP 1 Id FROM Roles WHERE Name = 'Admin') 
WHERE Email = 'e2e.admin@test.local';

UPDATE AppUsers 
SET RoleId = (SELECT TOP 1 Id FROM Roles WHERE Name = 'Customer'), IsActive = 1
WHERE Email IN ('e2e.customerA@test.local', 'e2e.customerB@test.local', 'e2e.customerEmpty@test.local');

UPDATE AppUsers 
SET RoleId = (SELECT TOP 1 Id FROM Roles WHERE Name = 'RestrictedCustomer'), IsActive = 1
WHERE Email = 'e2e.noperm.vps@test.local';

UPDATE AppUsers
SET IsActive = 1
WHERE Email LIKE 'e2e.%';
GO

-- 2. COUPONS, GIFTCARDS, PROMOTIONS
DELETE FROM Coupons WHERE Code LIKE 'E2E-%';
DELETE FROM GiftCards WHERE Code LIKE 'E2E-%';

INSERT INTO Coupons (Id, Code, DiscountPercent, MaxUsage, UsedCount, ExpiryDate, IsActive)
VALUES 
  (NEWID(), 'E2E-VALID10', 10.0, 100, 0, DATEADD(day, 30, GETUTCDATE()), 1),
  (NEWID(), 'E2E-EXPIRED', 20.0, 100, 0, DATEADD(day, -5, GETUTCDATE()), 1),
  (NEWID(), 'E2E-USEDUP', 15.0, 5, 5, DATEADD(day, 30, GETUTCDATE()), 1);

INSERT INTO GiftCards (Id, Code, Amount, RemainingAmount, ExpiryDate, IsActive)
VALUES 
  (NEWID(), 'E2E-GIFT-100K', 100000.0, 100000.0, DATEADD(day, 30, GETUTCDATE()), 1);

DELETE FROM Promotions WHERE DiscountPercent IN (55.55, 66.66);
INSERT INTO Promotions (Id, ServicePlanId, DiscountPercent, StartDate, EndDate)
VALUES
  (NEWID(), NULL, 55.55, DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE())),
  (NEWID(), NULL, 66.66, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()));
GO

-- 3. CUSTOMER A
DECLARE @UserAId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.customerA@test.local');
DECLARE @UserBId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.customerB@test.local');
DECLARE @PlanId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ServicePlans WHERE Name LIKE '%VPS%');
IF @PlanId IS NULL SET @PlanId = (SELECT TOP 1 Id FROM ServicePlans);

-- Wallet
IF EXISTS (SELECT 1 FROM Wallets WHERE UserId = @UserAId)
  UPDATE Wallets SET Balance = 500000.0, UpdatedAt = GETUTCDATE() WHERE UserId = @UserAId;
ELSE
  INSERT INTO Wallets (Id, UserId, Balance, UpdatedAt) VALUES (NEWID(), @UserAId, 500000.0, GETUTCDATE());

-- Loyalty
IF EXISTS (SELECT 1 FROM LoyaltyPoints WHERE UserId = @UserAId)
  UPDATE LoyaltyPoints SET Points = 500 WHERE UserId = @UserAId;
ELSE
  INSERT INTO LoyaltyPoints (Id, UserId, Points) VALUES (NEWID(), @UserAId, 500);

-- Referral
IF NOT EXISTS (SELECT 1 FROM ReferralCodes WHERE UserId = @UserAId)
  INSERT INTO ReferralCodes (Id, UserId, Code) VALUES (NEWID(), @UserAId, 'E2E-REFA-123');

DECLARE @UserEmptyId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.customerEmpty@test.local');

-- Clean old data
DELETE FROM VpsInstances WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId);
DELETE FROM TicketMessages WHERE TicketId IN (SELECT Id FROM SupportTickets WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId)) OR SenderId IN (@UserAId, @UserBId, @UserEmptyId);
DELETE FROM SupportTickets WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId);
DELETE FROM BackupJobs WHERE OrderRequestId IN (SELECT Id FROM OrderRequests WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId));
DELETE FROM SslCertificates WHERE DomainId IN (SELECT Id FROM DomainRecords WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId));
DELETE FROM DomainRecords WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId);
DELETE FROM ControlPanelCredentials WHERE OrderId IN (SELECT Id FROM OrderRequests WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId));
DELETE FROM WishlistItems WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId);
DELETE FROM OrderRequests WHERE UserId IN (@UserAId, @UserBId, @UserEmptyId);

-- Orders for Customer A (15 orders for pagination testing)
DECLARE @Order1 UNIQUEIDENTIFIER = '11111111-aaaa-1111-1111-111111111111';
DECLARE @Order2 UNIQUEIDENTIFIER = '22222222-aaaa-2222-2222-222222222222';
DECLARE @Order3 UNIQUEIDENTIFIER = '33333333-aaaa-3333-3333-333333333333';
DECLARE @Order4 UNIQUEIDENTIFIER = '44444444-aaaa-4444-4444-444444444444';

INSERT INTO OrderRequests (Id, UserId, Status, DiscountAmount, SubTotal, TotalAmount, AutoRenew, CreatedAt)
VALUES
  (@Order1, @UserAId, 2, 0, 150000.0, 150000.0, 1, DATEADD(day, -5, GETUTCDATE())),
  (@Order2, @UserAId, 1, 0, 280000.0, 280000.0, 0, DATEADD(day, -2, GETUTCDATE())),
  (@Order3, @UserAId, 1, 0, 450000.0, 450000.0, 0, GETUTCDATE()),
  (@Order4, @UserAId, 3, 0, 650000.0, 650000.0, 0, DATEADD(day, -10, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 100000.0, 100000.0, 0, DATEADD(day, -11, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 200000.0, 200000.0, 0, DATEADD(day, -12, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 300000.0, 300000.0, 0, DATEADD(day, -13, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 400000.0, 400000.0, 0, DATEADD(day, -14, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 500000.0, 500000.0, 0, DATEADD(day, -15, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 600000.0, 600000.0, 0, DATEADD(day, -16, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 700000.0, 700000.0, 0, DATEADD(day, -17, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 800000.0, 800000.0, 0, DATEADD(day, -18, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 900000.0, 900000.0, 0, DATEADD(day, -19, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 150000.0, 150000.0, 0, DATEADD(day, -20, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 250000.0, 250000.0, 0, DATEADD(day, -21, GETUTCDATE())),
  (NEWID(), @UserAId, 2, 0, 350000.0, 350000.0, 0, DATEADD(day, -22, GETUTCDATE()));

-- 5 VPS Instances for Customer A
INSERT INTO VpsInstances (Id, OrderId, UserId, PlanId, ContainerId, ContainerName, PlanName, CpuCores, RamMb, DiskGb, Status, CreatedAt, ExpiresAt, LastActiveAt)
VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', @Order1, @UserAId, @PlanId, 'cont-run-001', 'vps-e2e-running', 'Cloud VPS Basic', 2, 4096, 40, 2, GETUTCDATE(), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE()),
  ('aaaaaaaa-2222-2222-2222-222222222222', @Order1, @UserAId, @PlanId, 'cont-stop-002', 'vps-e2e-stopped', 'Cloud VPS Pro', 4, 8192, 80, 5, GETUTCDATE(), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE()),
  ('aaaaaaaa-3333-3333-3333-333333333333', @Order2, @UserAId, @PlanId, 'cont-prov-003', 'vps-e2e-prov', 'Cloud VPS Standard', 2, 2048, 20, 1, GETUTCDATE(), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE()),
  ('aaaaaaaa-4444-4444-4444-444444444444', @Order1, @UserAId, @PlanId, 'cont-fail-004', 'vps-e2e-failed', 'Cloud VPS Nano', 1, 1024, 10, 4, GETUTCDATE(), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE()),
  ('aaaaaaaa-5555-5555-5555-555555555555', @Order4, @UserAId, @PlanId, 'cont-term-005', 'vps-e2e-term', 'Cloud VPS Micro', 1, 2048, 20, 3, GETUTCDATE(), DATEADD(day, -5, GETUTCDATE()), GETUTCDATE());

-- Domain Records
DECLARE @Dom1 UNIQUEIDENTIFIER = 'dddddddd-1111-1111-1111-111111111111';
DECLARE @Dom2 UNIQUEIDENTIFIER = 'dddddddd-2222-2222-2222-222222222222';
DECLARE @Dom3 UNIQUEIDENTIFIER = 'dddddddd-3333-3333-3333-333333333333';

INSERT INTO DomainRecords (Id, UserId, Name, OrderRequestId, ExpiryDate, AutoRenew, Status)
VALUES
  (@Dom1, @UserAId, 'e2e-active-domain.vn', @Order1, DATEADD(day, 300, GETUTCDATE()), 1, 1),
  (@Dom2, @UserAId, 'e2e-expiring-domain.vn', @Order1, DATEADD(day, 3, GETUTCDATE()), 0, 1),
  (@Dom3, @UserAId, 'e2e-expired-domain.vn', @Order1, DATEADD(day, -10, GETUTCDATE()), 0, 2);

-- SSL
INSERT INTO SslCertificates (Id, DomainId, Csr, Certificate, PrivateKey, ExpiryDate)
VALUES
  (NEWID(), @Dom1, 'CSR-ACTIVE-TEST', 'CERT-ACTIVE-TEST', 'KEY-ACTIVE-TEST', DATEADD(day, 180, GETUTCDATE())),
  (NEWID(), @Dom2, 'CSR-EXPIRING-TEST', 'CERT-EXPIRING-TEST', 'KEY-EXPIRING-TEST', DATEADD(day, 5, GETUTCDATE()));

-- Backup Jobs
INSERT INTO BackupJobs (Id, OrderRequestId, ScheduledAt, Status, SizeMb, BackupUrl)
VALUES
  (NEWID(), @Order1, DATEADD(day, -1, GETUTCDATE()), 2, 2048, 'https://backup.cloudservicestore.local/b1.tar.gz'),
  (NEWID(), @Order1, DATEADD(day, -2, GETUTCDATE()), 3, NULL, NULL);

-- Support Tickets
DECLARE @T1 UNIQUEIDENTIFIER = 'eeeeeeee-1111-1111-1111-111111111111';
DECLARE @T2 UNIQUEIDENTIFIER = 'eeeeeeee-2222-2222-2222-222222222222';
DECLARE @T3 UNIQUEIDENTIFIER = 'eeeeeeee-3333-3333-3333-333333333333';

INSERT INTO SupportTickets (Id, UserId, Subject, Priority, Status)
VALUES
  (@T1, @UserAId, 'E2E Ticket Open Subject', 2, 1),
  (@T2, @UserAId, 'E2E Ticket InProgress Subject', 3, 2),
  (@T3, @UserAId, 'E2E Ticket Resolved Subject', 1, 3);

INSERT INTO TicketMessages (Id, TicketId, SenderId, Message, CreatedAt)
VALUES
  (NEWID(), @T2, @UserAId, 'Help me with VPS configuration please', DATEADD(hour, -2, GETUTCDATE())),
  (NEWID(), @T2, (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.admin@test.local'), 'Sure, we are looking into it right now.', DATEADD(hour, -1, GETUTCDATE()));

-- Wishlist
DELETE FROM WishlistItems WHERE UserId = @UserAId;
INSERT INTO WishlistItems (Id, UserId, ServicePlanId, AddedAt)
VALUES (NEWID(), @UserAId, @PlanId, GETUTCDATE());
GO

-- 4. CUSTOMER B
DECLARE @UserBId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.customerB@test.local');
DECLARE @PlanId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ServicePlans WHERE Name LIKE '%VPS%');
IF @PlanId IS NULL SET @PlanId = (SELECT TOP 1 Id FROM ServicePlans);

DECLARE @OrderBId UNIQUEIDENTIFIER = 'bbbbbbbb-1111-1111-1111-111111111111';

DELETE FROM VpsInstances WHERE Id = 'bbbbbbbb-2222-2222-2222-222222222222' OR UserId = @UserBId;
DELETE FROM SupportTickets WHERE Id = 'bbbbbbbb-3333-3333-3333-333333333333' OR UserId = @UserBId;
DELETE FROM DomainRecords WHERE Id = 'bbbbbbbb-4444-4444-4444-444444444444' OR UserId = @UserBId;
DELETE FROM ControlPanelCredentials WHERE OrderId = @OrderBId;
DELETE FROM OrderRequests WHERE Id = @OrderBId OR UserId = @UserBId;

INSERT INTO OrderRequests (Id, UserId, Status, DiscountAmount, SubTotal, TotalAmount, AutoRenew, CreatedAt)
VALUES (@OrderBId, @UserBId, 2, 0, 990000.0, 990000.0, 0, GETUTCDATE());

INSERT INTO VpsInstances (Id, OrderId, UserId, PlanId, ContainerId, ContainerName, PlanName, CpuCores, RamMb, DiskGb, Status, CreatedAt, ExpiresAt, LastActiveAt)
VALUES ('bbbbbbbb-2222-2222-2222-222222222222', @OrderBId, @UserBId, @PlanId, 'cont-b-secret', 'vps-customer-b-secret', 'Customer B Secret VPS', 8, 16384, 200, 2, GETUTCDATE(), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE());

INSERT INTO SupportTickets (Id, UserId, Subject, Priority, Status)
VALUES ('bbbbbbbb-3333-3333-3333-333333333333', @UserBId, 'Customer B Confidential Ticket', 3, 1);

INSERT INTO DomainRecords (Id, UserId, Name, OrderRequestId, ExpiryDate, AutoRenew, Status)
VALUES ('bbbbbbbb-4444-4444-4444-444444444444', @UserBId, 'customer-b-confidential.com', @OrderBId, DATEADD(day, 365, GETUTCDATE()), 1, 1);

INSERT INTO ControlPanelCredentials (Id, OrderId, PanelType, Url, Username, Password)
VALUES ('bbbbbbbb-5555-5555-5555-555555555555', @OrderBId, 'cPanel', 'https://cpanel.customer-b.local:2083', 'admin_b', 'Secret_B_Password_999');
GO

-- 5. CONTENT
DECLARE @AdminId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.admin@test.local');

DELETE FROM Banners WHERE ImageUrl LIKE '%e2e-%';
INSERT INTO Banners (Id, ImageUrl, LinkUrl, DisplayOrder, IsActive, StartDate, EndDate)
VALUES
  (NEWID(), '/banners/e2e-published.jpg', '/services/cloud-vps', 1, 1, DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE())),
  (NEWID(), '/banners/e2e-draft.jpg', '/services/web-hosting', 2, 0, DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE()));

DELETE FROM NewsArticles WHERE Slug LIKE 'e2e-%';
INSERT INTO NewsArticles (Id, Title, Slug, Content, AuthorId, Status, ViewCount, PublishedAt)
VALUES
  (NEWID(), 'E2E Published News Article', 'e2e-published-news', 'Content of published news for E2E testing.', @AdminId, 2, 10, GETUTCDATE()),
  (NEWID(), 'E2E Draft News Article', 'e2e-draft-news', 'Content of draft news should NOT appear publicly.', @AdminId, 1, 0, NULL);

DELETE FROM Faqs WHERE Question LIKE 'E2E %';
INSERT INTO Faqs (Id, Question, Answer, CategoryTag, DisplayOrder)
VALUES
  (NEWID(), 'E2E FAQ Question 1 Published', 'E2E FAQ Answer 1', 'General', 1),
  (NEWID(), 'E2E FAQ Question 2 Published', 'E2E FAQ Answer 2', 'VPS', 2);

DELETE FROM KnowledgeBaseArticles WHERE Slug LIKE 'e2e-%';
INSERT INTO KnowledgeBaseArticles (Id, Title, Slug, Content, CategoryTag, IsPublished, ViewCount, AuthorId)
VALUES
  (NEWID(), 'E2E KB Article Published', 'e2e-kb-published', 'Content of published knowledgebase article.', 'Hosting', 1, 15, @AdminId),
  (NEWID(), 'E2E KB Article Draft', 'e2e-kb-draft', 'Content of draft KB article should NOT appear publicly.', 'Hosting', 0, 0, @AdminId);

DELETE FROM ExchangeRates WHERE FromCurrency IN ('USD', 'EUR');
INSERT INTO ExchangeRates (Id, FromCurrency, ToCurrency, Rate, UpdatedAt)
VALUES
  (NEWID(), 'USD', 'VND', 25400.0, GETUTCDATE()),
  (NEWID(), 'EUR', 'VND', 27500.0, GETUTCDATE());
GO

-- 6. ADMIN-SPECIFIC SEEDS
DECLARE @UserAId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AppUsers WHERE Email = 'e2e.customerA@test.local');
DECLARE @OrderAId UNIQUEIDENTIFIER = '11111111-aaaa-1111-1111-111111111111';
DECLARE @PlanId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ServicePlans);

-- Newsletter Subscribers (>= 5)
DELETE FROM NewsletterSubscribers WHERE Email LIKE 'subscriber%@test.local';
INSERT INTO NewsletterSubscribers (Id, Email, IsActive, SubscribedAt)
VALUES
  (NEWID(), 'subscriber1@test.local', 1, GETUTCDATE()),
  (NEWID(), 'subscriber2@test.local', 1, GETUTCDATE()),
  (NEWID(), 'subscriber3@test.local', 1, GETUTCDATE()),
  (NEWID(), 'subscriber4@test.local', 1, GETUTCDATE()),
  (NEWID(), 'subscriber5@test.local', 1, GETUTCDATE());

-- Migration Request (Pending)
DELETE FROM MigrationRequests WHERE UserId = @UserAId;
INSERT INTO MigrationRequests (Id, UserId, OrderRequestId, FromProvider, Note, Status, CreatedAt)
VALUES
  (NEWID(), @UserAId, @OrderAId, 'OldHostProvider', 'E2E Pending Migration Note', 0, GETUTCDATE());

-- Affiliate Application (Pending)
DELETE FROM AffiliateApplications WHERE UserId = @UserAId;
INSERT INTO AffiliateApplications (Id, UserId, CompanyName, CommissionRate, Status)
VALUES
  (NEWID(), @UserAId, 'E2E CustomerA Tech Ltd', 15.0, 0);

-- Review (Pending Approval)
DELETE FROM Reviews WHERE UserId = @UserAId;
INSERT INTO Reviews (Id, UserId, ServicePlanId, Rating, Comment, IsApproved, IsFeatured, CreatedAt)
VALUES
  (NEWID(), @UserAId, @PlanId, 5, 'E2E Pending Review Comment', 0, 0, GETUTCDATE());

-- Refund Request (Pending)
DELETE FROM RefundRequests WHERE UserId = @UserAId;
INSERT INTO RefundRequests (Id, OrderId, UserId, Amount, Reason, Status, CreatedAt, ProcessedAt)
VALUES
  (NEWID(), @OrderAId, @UserAId, 990000.0, 'E2E Test Refund Request Reason', 0, GETUTCDATE(), GETUTCDATE());

-- System Settings
DELETE FROM SystemSettings WHERE [Key] IN ('SiteName', 'SupportEmail', 'MaintenanceMode');
INSERT INTO SystemSettings (Id, [Key], Value, Description)
VALUES
  (NEWID(), 'SiteName', 'CloudServiceStore', 'System Site Name'),
  (NEWID(), 'SupportEmail', 'support@cloudservicestore.com', 'System Support Email'),
  (NEWID(), 'MaintenanceMode', 'false', 'Global Maintenance Mode');

-- API Key for Customer A
DELETE FROM ApiKeys WHERE UserId = @UserAId;
INSERT INTO ApiKeys (Id, UserId, KeyHash, Scopes, CreatedAt, RevokedAt)
VALUES
  (NEWID(), @UserAId, 'e2e-api-key-hash-customer-a', 'read,write', GETUTCDATE(), NULL);
GO

