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
                        logger.LogInformation("Attempting to connect to database (attempt {Attempt}/{Max})...", i + 1, maxRetries);
                        await context.Database.EnsureCreatedAsync();
                        logger.LogInformation("Database connection established and schema ensured.");
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

                await context.ServiceCategories.AddRangeAsync(vpsCategory, hostingCategory, domainCategory, dedicatedCategory, emailCategory, sslCategory);

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

                await context.ServicePlans.AddRangeAsync(
                    vpsNano, vpsMicro, basicVpsPlan, customVpsPlan, advancedVpsPlan, proVpsPlan, enterpriseVpsPlan, titaniumVpsPlan,
                    basicHosting, proHosting, businessHosting, ecommerceHosting, wpBasic, wpPro, wpVip, winHosting,
                    vnDomain, comvnDomain, eduvnDomain, comDomain, netDomain, orgDomain, infoDomain, ioDomain, aiDomain, devDomain,
                    dedBasic, dedPro, dedUltra,
                    email10, email50, emailUnl,
                    sslDv, sslWc, sslEv
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
                    new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = sslEv.Id, BillingCycle = BillingCycle.Yearly, Price = 3500000, EffectiveFrom = DateTime.UtcNow }
                };

                await context.PlanPrices.AddRangeAsync(prices);
                await context.SaveChangesAsync();
                
                logger.LogInformation("Seeding Roles and Permissions...");
                if (!context.Roles.Any())
                {
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

                    // Assign all permissions to Admin
                    foreach (var p in permissions)
                    {
                        await context.RolePermissions.AddAsync(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
                    }
                    
                    await context.SaveChangesAsync();
                }

                logger.LogInformation("Database seeding completed.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
