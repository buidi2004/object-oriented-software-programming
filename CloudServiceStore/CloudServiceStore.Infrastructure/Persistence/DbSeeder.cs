using System;
using System.Linq;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        try
        {
            if (context.Database.IsRelational())
            {
                // Retry logic: wait for SQL Server to be ready (up to 60 seconds)
                const int maxRetries = 30;
                for (int i = 0; i < maxRetries; i++)
                {
                    try
                    {
                        logger.LogInformation("Attempting to migrate database (attempt {Attempt}/{Max})...", i + 1, maxRetries);
                        await context.Database.MigrateAsync();
                        logger.LogInformation("Database connection established and migrations applied.");
                        break;
                    }
                    catch (Exception ex) when (i < maxRetries - 1)
                    {
                        logger.LogWarning("Database not ready yet: {Message}. Retrying in 2 seconds...", ex.Message);
                        await Task.Delay(2000);
                    }
                }
            }

            if (!context.ServiceCategories.Any())
            {
                logger.LogInformation("Seeding Service Categories and Plans...");

                // 1. Create Categories
                var vpsCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Cloud VPS", Slug = "cloud-vps" };
                var hostingCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Web Hosting", Slug = "web-hosting" };
                var domainCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Tên miền", Slug = "ten-mien" };
                var dedicatedCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Dedicated Server", Slug = "dedicated-server" };
                var emailCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Email Doanh Nghiệp", Slug = "email-server" };
                var sslCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Chứng chỉ SSL", Slug = "ssl-certificate" };
                var databaseCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Managed Databases", Slug = "managed-database" };
                var gameCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Game Servers", Slug = "game-server" };
                var appCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "1-Click Apps", Slug = "1click-apps" };
                var staticCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Static Sites", Slug = "static-sites" };
                var storageCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Object Storage", Slug = "object-storage" };
                var securityCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Bảo mật & WAF", Slug = "security-waf" };
                var migrationCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Chuyển đổi dữ liệu", Slug = "cloud-migration" };

                await context.ServiceCategories.AddRangeAsync(
                    vpsCategory, hostingCategory, domainCategory, dedicatedCategory, emailCategory, sslCategory,
                    databaseCategory, gameCategory, appCategory, staticCategory, storageCategory, securityCategory, migrationCategory
                );

                // 2. Create Service Plans
                // --- VPS ---
                var vpsNano = new ServicePlan(vpsCategory.Id, "Cloud VPS Nano", "1 Core", "1GB", "20GB SSD", "Unlimited", null);
                var vpsMicro = new ServicePlan(vpsCategory.Id, "Cloud VPS Micro", "1 Core", "2GB", "30GB SSD", "Unlimited", null);
                var basicVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Basic", "2 Core", "4GB", "40GB NVMe", "Unlimited", null);
                var customVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Standard", "4 Core", "8GB", "80GB NVMe", "Unlimited", null);
                var advancedVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Advanced", "6 Core", "12GB", "100GB NVMe", "Unlimited", null);
                var proVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Pro", "8 Core", "16GB", "150GB NVMe", "Unlimited", null);
                var enterpriseVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Enterprise", "12 Core", "32GB", "250GB NVMe", "Unlimited", null);
                var titaniumVpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Titanium", "16 Core", "64GB", "500GB NVMe", "Unlimited", null);
                
                // --- HOSTING ---
                var basicHosting = new ServicePlan(hostingCategory.Id, "NVMe Starter", "1 Core", "1GB", "10GB NVMe", "Unlimited", null);
                var proHosting = new ServicePlan(hostingCategory.Id, "NVMe Pro", "2 Core", "2GB", "20GB NVMe", "Unlimited", null);
                var businessHosting = new ServicePlan(hostingCategory.Id, "NVMe Business", "4 Core", "4GB", "50GB NVMe", "Unlimited", null);
                var ecommerceHosting = new ServicePlan(hostingCategory.Id, "NVMe E-commerce", "6 Core", "8GB", "100GB NVMe", "Unlimited", null);
                var wpBasic = new ServicePlan(hostingCategory.Id, "WordPress Starter", "2 Core", "2GB", "25GB NVMe", "Unlimited", null);
                var wpPro = new ServicePlan(hostingCategory.Id, "WordPress Pro", "4 Core", "4GB", "60GB NVMe", "Unlimited", null);
                var wpVip = new ServicePlan(hostingCategory.Id, "WordPress VIP", "8 Core", "8GB", "120GB NVMe", "Unlimited", null);
                var winHosting = new ServicePlan(hostingCategory.Id, "Windows ASP.NET", "2 Core", "4GB", "50GB SSD", "Unlimited", null);
                
                // --- DOMAINS ---
                var vnDomain = new ServicePlan(domainCategory.Id, "Tên miền .VN", null, null, null, null, null);
                var comvnDomain = new ServicePlan(domainCategory.Id, "Tên miền .COM.VN", null, null, null, null, null);
                var eduvnDomain = new ServicePlan(domainCategory.Id, "Tên miền .EDU.VN", null, null, null, null, null);
                var comDomain = new ServicePlan(domainCategory.Id, "Tên miền .COM", null, null, null, null, null);
                var netDomain = new ServicePlan(domainCategory.Id, "Tên miền .NET", null, null, null, null, null);
                var orgDomain = new ServicePlan(domainCategory.Id, "Tên miền .ORG", null, null, null, null, null);
                var infoDomain = new ServicePlan(domainCategory.Id, "Tên miền .INFO", null, null, null, null, null);
                var ioDomain = new ServicePlan(domainCategory.Id, "Tên miền .IO", null, null, null, null, null);
                var aiDomain = new ServicePlan(domainCategory.Id, "Tên miền .AI", null, null, null, null, null);
                var devDomain = new ServicePlan(domainCategory.Id, "Tên miền .DEV", null, null, null, null, null);

                // --- DEDICATED SERVERS ---
                var dedBasic = new ServicePlan(dedicatedCategory.Id, "Dedicated Dual E5-2670", "16 Core / 32 Thread", "64GB", "2x 500GB SSD", "1Gbps / 10TB", null);
                var dedPro = new ServicePlan(dedicatedCategory.Id, "Dedicated Dual E5-2680v4", "28 Core / 56 Thread", "128GB", "2x 1TB NVMe", "1Gbps / 20TB", null);
                var dedUltra = new ServicePlan(dedicatedCategory.Id, "Dedicated AMD EPYC 7502", "32 Core / 64 Thread", "256GB", "4x 2TB NVMe", "10Gbps / Unmetered", null);

                // --- EMAIL SERVER ---
                var email10 = new ServicePlan(emailCategory.Id, "Email Doanh Nghiệp 10 User", null, "10 Accounts", "10GB Storage", null, null);
                var email50 = new ServicePlan(emailCategory.Id, "Email Doanh Nghiệp 50 User", null, "50 Accounts", "50GB Storage", null, null);
                var emailUnl = new ServicePlan(emailCategory.Id, "Email Doanh Nghiệp Unlimited", null, "Unlimited Accounts", "200GB Storage", null, null);

                // --- SSL ---
                var sslDv = new ServicePlan(sslCategory.Id, "PositiveSSL (DV)", null, null, null, null, null);
                var sslWc = new ServicePlan(sslCategory.Id, "Wildcard SSL", null, null, null, null, null);
                var sslEv = new ServicePlan(sslCategory.Id, "EV SSL (Green Bar)", null, null, null, null, null);

                // --- MANAGED DATABASES ---
                var dbMicro = new ServicePlan(databaseCategory.Id, "DB Micro (Dev/Test)", "0.5 vCPU", "256MB", "2GB NVMe", "Unlimited", null);
                var dbStandard = new ServicePlan(databaseCategory.Id, "DB Standard (Production)", "0.5 vCPU", "256MB", "5GB NVMe", "Unlimited", null);
                var dbPro = new ServicePlan(databaseCategory.Id, "DB Pro (High Availability)", "0.5 vCPU", "256MB", "10GB NVMe", "Unlimited", null);

                // --- GAME SERVERS ---
                var gameMinecraft = new ServicePlan(gameCategory.Id, "Minecraft Dedicated", "1 Core", "1GB", "10GB NVMe", "Unlimited", null);
                var gameCs2 = new ServicePlan(gameCategory.Id, "CS2 Match Server", "1 Core", "1GB", "15GB NVMe", "Unlimited", null);
                var gameRust = new ServicePlan(gameCategory.Id, "Rust Dedicated", "1 Core", "1GB", "20GB NVMe", "Unlimited", null);

                // --- 1-CLICK APPS ---
                var appWp = new ServicePlan(appCategory.Id, "WordPress Cloud App", "0.5 vCPU", "256MB", "5GB NVMe", "Unlimited", null);
                var appGhost = new ServicePlan(appCategory.Id, "Ghost Blog Cloud", "0.5 vCPU", "256MB", "5GB NVMe", "Unlimited", null);
                var appNextcloud = new ServicePlan(appCategory.Id, "Nextcloud Storage App", "0.5 vCPU", "256MB", "10GB NVMe", "Unlimited", null);

                // --- STATIC SITES ---
                var staticStarter = new ServicePlan(staticCategory.Id, "Static Site Starter", "0.2 vCPU", "64MB", "1GB NVMe", "Unlimited", null);
                var staticPro = new ServicePlan(staticCategory.Id, "Static Site Pro (Custom Domain)", "0.5 vCPU", "128MB", "5GB NVMe", "Unlimited", null);

                // --- OBJECT STORAGE ---
                var storage50 = new ServicePlan(storageCategory.Id, "S3 Storage Starter (50GB)", null, null, "50GB NVMe", "1TB Bandwidth", null);
                var storage250 = new ServicePlan(storageCategory.Id, "S3 Storage Pro (250GB)", null, null, "250GB NVMe", "5TB Bandwidth", null);
                var storage1000 = new ServicePlan(storageCategory.Id, "S3 Storage Enterprise (1TB)", null, null, "1TB NVMe", "Unlimited", null);

                // --- SECURITY & WAF ---
                var secWafBasic = new ServicePlan(securityCategory.Id, "WAF Shield Basic", null, null, null, "Lọc SQLi, XSS", null);
                var secMalwarePro = new ServicePlan(securityCategory.Id, "Malware Scanner & Shield Pro", null, null, null, "Quét mã độc Realtime", null);

                // --- CLOUD MIGRATION ---
                var migStandard = new ServicePlan(migrationCategory.Id, "Chuyển Đổi Web Chuẩn", null, null, null, "rsync + DB Dump", null);
                var migVip = new ServicePlan(migrationCategory.Id, "Chuyển Đổi Hệ Thống VIP 24/7", null, null, null, "Zero-downtime VIP", null);

                await context.ServicePlans.AddRangeAsync(
                    vpsNano, vpsMicro, basicVpsPlan, customVpsPlan, advancedVpsPlan, proVpsPlan, enterpriseVpsPlan, titaniumVpsPlan,
                    basicHosting, proHosting, businessHosting, ecommerceHosting, wpBasic, wpPro, wpVip, winHosting,
                    vnDomain, comvnDomain, eduvnDomain, comDomain, netDomain, orgDomain, infoDomain, ioDomain, aiDomain, devDomain,
                    dedBasic, dedPro, dedUltra,
                    email10, email50, emailUnl,
                    sslDv, sslWc, sslEv,
                    dbMicro, dbStandard, dbPro,
                    gameMinecraft, gameCs2, gameRust,
                    appWp, appGhost, appNextcloud,
                    staticStarter, staticPro,
                    storage50, storage250, storage1000,
                    secWafBasic, secMalwarePro,
                    migStandard, migVip
                );

                // 3. Create Plan Prices (Mock data for 1 month and 12 months)
                var prices = new[]
                {
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = vpsNano.Id, BillingCycle = BillingCycle.Monthly, Price = 49000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = vpsNano.Id, BillingCycle = BillingCycle.Yearly, Price = 49000 * 12 * 0.85m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = vpsMicro.Id, BillingCycle = BillingCycle.Monthly, Price = 89000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = vpsMicro.Id, BillingCycle = BillingCycle.Yearly, Price = 89000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = basicVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 150000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = basicVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 150000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = customVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 280000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = customVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 280000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = advancedVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 450000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = advancedVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 450000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = proVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 650000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = proVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 650000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = enterpriseVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 1200000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = enterpriseVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 1200000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = titaniumVpsPlan.Id, BillingCycle = BillingCycle.Monthly, Price = 2500000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = titaniumVpsPlan.Id, BillingCycle = BillingCycle.Yearly, Price = 2500000 * 12 * 0.75m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = basicHosting.Id, BillingCycle = BillingCycle.Monthly, Price = 39000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = basicHosting.Id, BillingCycle = BillingCycle.Yearly, Price = 39000 * 12 * 0.75m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = proHosting.Id, BillingCycle = BillingCycle.Monthly, Price = 89000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = proHosting.Id, BillingCycle = BillingCycle.Yearly, Price = 89000 * 12 * 0.75m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = businessHosting.Id, BillingCycle = BillingCycle.Monthly, Price = 159000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = businessHosting.Id, BillingCycle = BillingCycle.Yearly, Price = 159000 * 12 * 0.75m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = ecommerceHosting.Id, BillingCycle = BillingCycle.Monthly, Price = 299000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = ecommerceHosting.Id, BillingCycle = BillingCycle.Yearly, Price = 299000 * 12 * 0.75m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpBasic.Id, BillingCycle = BillingCycle.Monthly, Price = 99000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpBasic.Id, BillingCycle = BillingCycle.Yearly, Price = 99000 * 12 * 0.7m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpPro.Id, BillingCycle = BillingCycle.Monthly, Price = 199000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpPro.Id, BillingCycle = BillingCycle.Yearly, Price = 199000 * 12 * 0.7m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpVip.Id, BillingCycle = BillingCycle.Monthly, Price = 399000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = wpVip.Id, BillingCycle = BillingCycle.Yearly, Price = 399000 * 12 * 0.7m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = winHosting.Id, BillingCycle = BillingCycle.Monthly, Price = 149000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = winHosting.Id, BillingCycle = BillingCycle.Yearly, Price = 149000 * 12 * 0.7m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = vnDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 750000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = comvnDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 650000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = eduvnDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 350000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = comDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 250000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = netDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 350000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = orgDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 380000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = infoDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 400000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = ioDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 1200000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = aiDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 2500000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = devDomain.Id, BillingCycle = BillingCycle.Yearly, Price = 450000, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedBasic.Id, BillingCycle = BillingCycle.Monthly, Price = 2800000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedBasic.Id, BillingCycle = BillingCycle.Yearly, Price = 2800000 * 12 * 0.9m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedPro.Id, BillingCycle = BillingCycle.Monthly, Price = 5500000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedPro.Id, BillingCycle = BillingCycle.Yearly, Price = 5500000 * 12 * 0.9m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedUltra.Id, BillingCycle = BillingCycle.Monthly, Price = 12500000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dedUltra.Id, BillingCycle = BillingCycle.Yearly, Price = 12500000 * 12 * 0.85m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = email10.Id, BillingCycle = BillingCycle.Monthly, Price = 120000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = email10.Id, BillingCycle = BillingCycle.Yearly, Price = 120000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = email50.Id, BillingCycle = BillingCycle.Monthly, Price = 450000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = email50.Id, BillingCycle = BillingCycle.Yearly, Price = 450000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = emailUnl.Id, BillingCycle = BillingCycle.Monthly, Price = 1500000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = emailUnl.Id, BillingCycle = BillingCycle.Yearly, Price = 1500000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = sslDv.Id, BillingCycle = BillingCycle.Yearly, Price = 250000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = sslWc.Id, BillingCycle = BillingCycle.Yearly, Price = 1800000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = sslEv.Id, BillingCycle = BillingCycle.Yearly, Price = 3500000, EffectiveFrom = DateTime.UtcNow },

                    // Managed Databases
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbMicro.Id, BillingCycle = BillingCycle.Monthly, Price = 199000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbMicro.Id, BillingCycle = BillingCycle.Yearly, Price = 199000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbStandard.Id, BillingCycle = BillingCycle.Monthly, Price = 599000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbStandard.Id, BillingCycle = BillingCycle.Yearly, Price = 599000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbPro.Id, BillingCycle = BillingCycle.Monthly, Price = 1590000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = dbPro.Id, BillingCycle = BillingCycle.Yearly, Price = 1590000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // Game Servers
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameMinecraft.Id, BillingCycle = BillingCycle.Monthly, Price = 149000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameMinecraft.Id, BillingCycle = BillingCycle.Yearly, Price = 149000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameCs2.Id, BillingCycle = BillingCycle.Monthly, Price = 199000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameCs2.Id, BillingCycle = BillingCycle.Yearly, Price = 199000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameRust.Id, BillingCycle = BillingCycle.Monthly, Price = 249000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = gameRust.Id, BillingCycle = BillingCycle.Yearly, Price = 249000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // 1-Click Apps
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appWp.Id, BillingCycle = BillingCycle.Monthly, Price = 99000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appWp.Id, BillingCycle = BillingCycle.Yearly, Price = 99000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appGhost.Id, BillingCycle = BillingCycle.Monthly, Price = 129000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appGhost.Id, BillingCycle = BillingCycle.Yearly, Price = 129000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appNextcloud.Id, BillingCycle = BillingCycle.Monthly, Price = 179000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = appNextcloud.Id, BillingCycle = BillingCycle.Yearly, Price = 179000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // Static Sites
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = staticStarter.Id, BillingCycle = BillingCycle.Monthly, Price = 0, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = staticPro.Id, BillingCycle = BillingCycle.Monthly, Price = 49000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = staticPro.Id, BillingCycle = BillingCycle.Yearly, Price = 49000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // Object Storage
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage50.Id, BillingCycle = BillingCycle.Monthly, Price = 50000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage50.Id, BillingCycle = BillingCycle.Yearly, Price = 50000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage250.Id, BillingCycle = BillingCycle.Monthly, Price = 200000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage250.Id, BillingCycle = BillingCycle.Yearly, Price = 200000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage1000.Id, BillingCycle = BillingCycle.Monthly, Price = 690000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = storage1000.Id, BillingCycle = BillingCycle.Yearly, Price = 690000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // Security & WAF
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = secWafBasic.Id, BillingCycle = BillingCycle.Monthly, Price = 99000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = secWafBasic.Id, BillingCycle = BillingCycle.Yearly, Price = 99000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = secMalwarePro.Id, BillingCycle = BillingCycle.Monthly, Price = 199000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = secMalwarePro.Id, BillingCycle = BillingCycle.Yearly, Price = 199000 * 12 * 0.8m, EffectiveFrom = DateTime.UtcNow },

                    // Cloud Migration
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = migStandard.Id, BillingCycle = BillingCycle.Monthly, Price = 200000, EffectiveFrom = DateTime.UtcNow },
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = migVip.Id, BillingCycle = BillingCycle.Monthly, Price = 500000, EffectiveFrom = DateTime.UtcNow }
                };

                await context.PlanPrices.AddRangeAsync(prices);
                await context.SaveChangesAsync();
            }

            if (!context.Roles.Any())
            {
                logger.LogInformation("Seeding Roles and Permissions...");
                var adminRole = new Role { Id = Guid.NewGuid(), Name = "Admin" };
                var editorRole = new Role { Id = Guid.NewGuid(), Name = "Editor" };
                var customerRole = new Role { Id = Guid.NewGuid(), Name = "Customer" };
                await context.Roles.AddRangeAsync(adminRole, editorRole, customerRole);

                var permissions = new[]
                {
                    new Permission { Id = Guid.NewGuid(), Code = "manage_users", Name = "Quản lý Người dùng" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_roles", Name = "Quản lý Phân quyền" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_orders", Name = "Quản lý Đơn hàng" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_services", Name = "Quản lý Dịch vụ" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_billing", Name = "Quản lý Thanh toán" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_tickets", Name = "Hỗ trợ (Tickets)" },
                    new Permission { Id = Guid.NewGuid(), Code = "manage_content", Name = "Quản lý Nội dung (Blog/FAQ)" }
                };
                await context.Permissions.AddRangeAsync(permissions);

                foreach (var p in permissions)
                {
                    await context.RolePermissions.AddAsync(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
                }
                
                await context.SaveChangesAsync();
            }

            if (!context.AppUsers.Any(u => u.Email == "admin@system.local"))
            {
                logger.LogInformation("Seeding default Administrator user...");
                var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole != null)
                {
                    var passwordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123!");
                    var adminUser = new AppUser(
                        "System Administrator",
                        "admin@system.local",
                        passwordHash,
                        adminRole.Id,
                        "0901234567"
                    );
                    await context.AppUsers.AddAsync(adminUser);
                    await context.SaveChangesAsync();
                }
            }

            if (!context.AppUsers.Any(u => u.Email == "admin@cloudservicestore.com"))
            {
                var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole != null)
                {
                    var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
                    var adminUser = new AppUser(
                        "Cloud Administrator",
                        "admin@cloudservicestore.com",
                        passwordHash,
                        adminRole.Id,
                        "0901234567"
                    );
                    await context.AppUsers.AddAsync(adminUser);
                    await context.SaveChangesAsync();
                }
            }

            if (!context.Banners.Any())
            {
                logger.LogInformation("Seeding default 5 Hero Banners...");
                var banners = new[]
                {
                    new Banner
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
                        LinkUrl = "/partners",
                        DisplayOrder = 1,
                        IsActive = true
                    },
                    new Banner
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
                        LinkUrl = "/services/cloud-vps",
                        DisplayOrder = 2,
                        IsActive = true
                    },
                    new Banner
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop",
                        LinkUrl = "/services/web-hosting",
                        DisplayOrder = 3,
                        IsActive = true
                    },
                    new Banner
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
                        LinkUrl = "/about",
                        DisplayOrder = 4,
                        IsActive = true
                    },
                    new Banner
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
                        LinkUrl = "/services/dedicated-server",
                        DisplayOrder = 5,
                        IsActive = true
                    }
                };
                await context.Banners.AddRangeAsync(banners);
                await context.SaveChangesAsync();
            }

            if (!context.SystemSettings.Any(s => s.Key == "homepage_about"))
            {
                logger.LogInformation("Seeding default homepage_about setting...");
                var aboutJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    title = "Về CloudHost VN",
                    description = "CloudHost VN là nhà cung cấp dịch vụ Điện toán đám mây (Cloud) và Trung tâm dữ liệu (Data Center) hàng đầu tại Việt Nam, mang đến hệ sinh thái dịch vụ toàn diện cho doanh nghiệp.",
                    imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
                    moreLink = "/about",
                    stats = new[]
                    {
                        new { title = "Số 1", desc = "Nhà cung cấp dịch vụ Cloud và Data Center lớn nhất tại Việt Nam" },
                        new { title = "26.000+", desc = "Khách hàng doanh nghiệp trong nước và quốc tế đã tin dùng" },
                        new { title = "Toàn cầu", desc = "Mạng lưới đối tác công nghệ hàng đầu thế giới: Microsoft, AWS, VMware" },
                        new { title = "67.250 m²", desc = "Diện tích phòng máy thiết kế theo tiêu chuẩn quốc tế Rated 3" }
                    }
                });

                await context.SystemSettings.AddAsync(new SystemSetting
                {
                    Id = Guid.NewGuid(),
                    Key = "homepage_about",
                    Value = aboutJson,
                    Description = "Cấu hình mục Về CloudHost VN trên trang chủ"
                });
                await context.SaveChangesAsync();
            }

            if (!context.SystemSettings.Any(s => s.Key == "homepage_solutions"))
            {
                logger.LogInformation("Seeding default homepage_solutions setting...");
                var solutionsJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    sectionTitle = "Giải pháp của CloudHost VN",
                    tabs = new[]
                    {
                        new { id = "chinh-phu", label = "Chính phủ" },
                        new { id = "tai-chinh", label = "Tài chính - Ngân hàng" },
                        new { id = "y-te", label = "Y tế" },
                        new { id = "giao-duc", label = "Giáo dục" },
                        new { id = "thuong-mai", label = "Thương mại điện tử" },
                        new { id = "san-xuat", label = "Sản xuất" }
                    },
                    solutions = new System.Collections.Generic.Dictionary<string, object[]>
                    {
                        ["chinh-phu"] = new object[]
                        {
                            new { title = "Chính quyền điện tử", desc = "Nền tảng hạ tầng số vững chắc cho các Bộ Ban Ngành.", img = "https://images.unsplash.com/photo-1574682782337-0cbdb3d548b2?q=80&w=2070&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Lưu trữ quốc gia", desc = "Bảo mật tuyệt đối dữ liệu dân cư và hồ sơ hành chính.", img = "https://images.unsplash.com/photo-1541888001633-94c6530664f3?q=80&w=2070&auto=format&fit=crop", link = "/services/object-storage" },
                            new { title = "An toàn thông tin mạng", desc = "Giám sát và phòng thủ không gian mạng quốc gia.", img = "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop", link = "/services/security-addons" }
                        },
                        ["tai-chinh"] = new object[]
                        {
                            new { title = "Ngân hàng số", desc = "Hạ tầng máy chủ tốc độ cao phục vụ giao dịch tài chính.", img = "https://images.unsplash.com/photo-1616803140344-6682afb13cda?q=80&w=2070&auto=format&fit=crop", link = "/services/dedicated-server" },
                            new { title = "DR cho Core Banking", desc = "Trung tâm dữ liệu dự phòng chuẩn Tier III quốc tế.", img = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Bảo mật PCI DSS", desc = "Hệ thống đạt chuẩn an toàn thanh toán thẻ quốc tế.", img = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop", link = "/services/ssl-certificate" }
                        },
                        ["y-te"] = new object[]
                        {
                            new { title = "Bệnh án điện tử", desc = "Lưu trữ và truy xuất hồ sơ bệnh án mọi lúc mọi nơi.", img = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop", link = "/services/database" },
                            new { title = "Telemedicine", desc = "Hạ tầng truyền tải ổn định cho khám chữa bệnh từ xa.", img = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Xử lý hình ảnh y tế", desc = "Hệ thống GPU Cloud phân tích ảnh chụp MRI, X-Quang.", img = "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop", link = "/services/dedicated-server" }
                        },
                        ["giao-duc"] = new object[]
                        {
                            new { title = "E-Learning Cloud", desc = "Hạ tầng lưu trữ và truyền phát video bài giảng trực tuyến.", img = "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop", link = "/services/cdn" },
                            new { title = "Tuyển sinh trực tuyến", desc = "Hệ thống chịu tải cao trong các đợt thi và tuyển sinh.", img = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Thư viện số", desc = "Số hóa và lưu trữ không giới hạn tài liệu học thuật.", img = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop", link = "/services/object-storage" }
                        },
                        ["thuong-mai"] = new object[]
                        {
                            new { title = "E-Commerce High Traffic", desc = "Tự động co giãn (Auto-scaling) chịu tải triệu lượt truy cập dịp Mega Sale.", img = "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=2070&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Tăng tốc Web CDN", desc = "Tối ưu tốc độ tải trang dưới 1 giây, giữ chân khách mua hàng.", img = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop", link = "/services/cdn" },
                            new { title = "Bảo mật chống gian lận", desc = "Tường lửa WAF chống DDOS và rà quét lỗ hổng thanh toán.", img = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop", link = "/services/security-addons" }
                        },
                        ["san-xuat"] = new object[]
                        {
                            new { title = "Smart Factory IoT", desc = "Thu thập và phân tích dữ liệu cảm biến dây chuyền sản xuất theo thời gian thực.", img = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop", link = "/services/dedicated-server" },
                            new { title = "Hệ thống ERP Cloud", desc = "Quản trị tổng thể nguồn lực doanh nghiệp sản xuất trên hạ tầng đám mây.", img = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", link = "/services/cloud-vps" },
                            new { title = "Quản lý chuỗi cung ứng", desc = "Theo dõi xuất nhập tồn kho và logistics minh bạch, liên tục 24/7.", img = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop", link = "/services/database" }
                        }
                    }
                });

                await context.SystemSettings.AddAsync(new SystemSetting
                {
                    Id = Guid.NewGuid(),
                    Key = "homepage_solutions",
                    Value = solutionsJson,
                    Description = "Cấu hình các danh mục giải pháp ngành nghề trên trang chủ"
                });
                await context.SaveChangesAsync();
            }

            // Seed company info and legal footer settings if missing
            var companySettings = new[]
            {
                new { Key = "company_name", Value = "Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam.", Desc = "Tên cơ quan chủ quản / Doanh nghiệp" },
                new { Key = "business_license", Value = "0500589150 do Ban Quản lý các Khu công nghệ cao và Khu công nghiệp - UBND thành phố Hà Nội cấp lần đầu ngày 11/04/2008, sửa đổi lần thứ 13 ngày 10/06/2026.", Desc = "Mã số doanh nghiệp và giấy phép thành lập" },
                new { Key = "content_responsible", Value = "Ông Lê Bá Tân.", Desc = "Người chịu trách nhiệm nội dung" },
                new { Key = "hotline", Value = "1900 6888", Desc = "Hotline chăm sóc khách hàng 24/7" },
                new { Key = "support_email", Value = "support@cloudhost.vn", Desc = "Email hỗ trợ CSKH" }
            };

            foreach (var cs in companySettings)
            {
                if (!context.SystemSettings.Any(s => s.Key == cs.Key))
                {
                    await context.SystemSettings.AddAsync(new SystemSetting
                    {
                        Id = Guid.NewGuid(),
                        Key = cs.Key,
                        Value = cs.Value,
                        Description = cs.Desc
                    });
                }
            }
            await context.SaveChangesAsync();

            logger.LogInformation("Database seeding completed.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
