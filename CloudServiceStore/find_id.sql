DECLARE @TargetId UNIQUEIDENTIFIER = '5919acc6-de4f-4d64-80ad-fe6dbb2a9911';

IF EXISTS (SELECT 1 FROM ServicePlans WHERE Id = @TargetId) PRINT 'ServicePlans';
IF EXISTS (SELECT 1 FROM AppUsers WHERE Id = @TargetId) PRINT 'AppUsers';
IF EXISTS (SELECT 1 FROM ServiceCategories WHERE Id = @TargetId) PRINT 'ServiceCategories';
IF EXISTS (SELECT 1 FROM PlanPrices WHERE Id = @TargetId) PRINT 'PlanPrices';
IF EXISTS (SELECT 1 FROM Banners WHERE Id = @TargetId) PRINT 'Banners';
