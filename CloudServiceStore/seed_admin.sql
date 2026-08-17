DECLARE @AdminRoleId UNIQUEIDENTIFIER;
SELECT @AdminRoleId = Id FROM Roles WHERE Name = 'Admin';

DECLARE @CustomerRoleId UNIQUEIDENTIFIER;
SELECT @CustomerRoleId = Id FROM Roles WHERE Name = 'Customer';

IF NOT EXISTS (SELECT 1 FROM AppUsers WHERE Email = 'admin@cloudservicestore.com')
BEGIN
    INSERT INTO AppUsers (Id, FullName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (NEWID(), 'System Admin', 'admin@cloudservicestore.com', '$2b$12$TJEo/Zd0oDMeD08tk/aQEegtyXoiVFubdLNSrbcP7mvzUdWSdD0ga', @AdminRoleId, 1, GETUTCDATE());
END

IF NOT EXISTS (SELECT 1 FROM AppUsers WHERE Email = 'e2e.customerA@test.local')
BEGIN
    INSERT INTO AppUsers (Id, FullName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (NEWID(), 'E2E Customer A', 'e2e.customerA@test.local', '$2b$12$TJEo/Zd0oDMeD08tk/aQEegtyXoiVFubdLNSrbcP7mvzUdWSdD0ga', @CustomerRoleId, 1, GETUTCDATE());
END

IF NOT EXISTS (SELECT 1 FROM AppUsers WHERE Email = 'e2e.customerB@test.local')
BEGIN
    INSERT INTO AppUsers (Id, FullName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (NEWID(), 'E2E Customer B', 'e2e.customerB@test.local', '$2b$12$TJEo/Zd0oDMeD08tk/aQEegtyXoiVFubdLNSrbcP7mvzUdWSdD0ga', @CustomerRoleId, 1, GETUTCDATE());
END

IF NOT EXISTS (SELECT 1 FROM AppUsers WHERE Email = 'e2e.noperm.vps@test.local')
BEGIN
    INSERT INTO AppUsers (Id, FullName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (NEWID(), 'E2E NoPerm VPS', 'e2e.noperm.vps@test.local', '$2b$12$TJEo/Zd0oDMeD08tk/aQEegtyXoiVFubdLNSrbcP7mvzUdWSdD0ga', @CustomerRoleId, 1, GETUTCDATE());
END

IF NOT EXISTS (SELECT 1 FROM AppUsers WHERE Email = 'e2e.customerEmpty@test.local')
BEGIN
    INSERT INTO AppUsers (Id, FullName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (NEWID(), 'E2E Customer Empty', 'e2e.customerEmpty@test.local', '$2b$12$TJEo/Zd0oDMeD08tk/aQEegtyXoiVFubdLNSrbcP7mvzUdWSdD0ga', @CustomerRoleId, 1, GETUTCDATE());
END
