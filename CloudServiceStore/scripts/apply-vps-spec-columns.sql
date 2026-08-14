-- Apply VpsInstance spec columns when EF migration history is out of sync.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('VpsInstances') AND name = 'CpuCores')
BEGIN
    ALTER TABLE VpsInstances ADD CpuCores int NOT NULL CONSTRAINT DF_VpsInstances_CpuCores DEFAULT 1;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('VpsInstances') AND name = 'RamMb')
BEGIN
    ALTER TABLE VpsInstances ADD RamMb int NOT NULL CONSTRAINT DF_VpsInstances_RamMb DEFAULT 512;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('VpsInstances') AND name = 'DiskGb')
BEGIN
    ALTER TABLE VpsInstances ADD DiskGb int NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('VpsInstances') AND name = 'PlanId')
BEGIN
    ALTER TABLE VpsInstances ADD PlanId uniqueidentifier NOT NULL CONSTRAINT DF_VpsInstances_PlanId DEFAULT '00000000-0000-0000-0000-000000000000';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('VpsInstances') AND name = 'PlanName')
BEGIN
    ALTER TABLE VpsInstances ADD PlanName nvarchar(max) NOT NULL CONSTRAINT DF_VpsInstances_PlanName DEFAULT '';
END

IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = '20260813153000_AddVpsInstanceSpecFields')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20260813153000_AddVpsInstanceSpecFields', '10.0.10');
END
