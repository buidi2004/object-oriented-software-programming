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

            logger.LogInformation("Ensuring all 11 Service Categories and Plans exist in database...");

            // 1. Categories
            var categoriesToEnsure = new (string Name, string Slug)[]
            {
                ("Cloud VPS", "cloud-vps"),
                ("Web Hosting", "web-hosting"),
                ("Tên miền", "ten-mien"),
                ("Dedicated Server", "dedicated-server"),
                ("Email Doanh Nghiệp", "email-server"),
                ("Chứng chỉ SSL", "ssl-certificate"),
                ("Managed Databases", "managed-database"),
                ("Game Servers", "game-server"),
                ("1-Click Apps", "1click-apps"),
                ("Static Sites", "static-sites"),
                ("Object Storage", "object-storage"),
                ("Bảo mật & WAF", "security-waf"),
                ("Chuyển đổi dữ liệu", "cloud-migration")
            };

            var existingCategories = await context.ServiceCategories.ToListAsync();
            var categoryMap = new Dictionary<string, ServiceCategory>();

            foreach (var cat in categoriesToEnsure)
            {
                var existing = existingCategories.FirstOrDefault(c => c.Slug == cat.Slug || c.Name == cat.Name);
                if (existing == null)
                {
                    existing = new ServiceCategory { Id = Guid.NewGuid(), Name = cat.Name, Slug = cat.Slug };
                    await context.ServiceCategories.AddAsync(existing);
                    await context.SaveChangesAsync();
                }
                categoryMap[cat.Slug] = existing;
            }

            var existingPlans = await context.ServicePlans.ToListAsync();
            var newPlans = new List<ServicePlan>();
            var newPrices = new List<PlanPrice>();

            void EnsurePlan(string slug, string name, string? cpu, string? ram, string? ssd, string? bw, decimal monthlyPrice, decimal? yearlyPrice = null)
            {
                if (!categoryMap.TryGetValue(slug, out var cat)) return;
                var plan = existingPlans.FirstOrDefault(p => p.Name == name && p.CategoryId == cat.Id);
                if (plan == null)
                {
                    plan = new ServicePlan(cat.Id, name, cpu, ram, ssd, bw, null);
                    newPlans.Add(plan);

                    newPrices.Add(new PlanPrice
                    {
                        Id = Guid.NewGuid(),
                        ServicePlanId = plan.Id,
                        BillingCycle = BillingCycle.Monthly,
                        Price = monthlyPrice,
                        Currency = "VND",
                        EffectiveFrom = DateTime.UtcNow
                    });

                    if (yearlyPrice.HasValue)
                    {
                        newPrices.Add(new PlanPrice
                        {
                            Id = Guid.NewGuid(),
                            ServicePlanId = plan.Id,
                            BillingCycle = BillingCycle.Yearly,
                            Price = yearlyPrice.Value,
                            Currency = "VND",
                            EffectiveFrom = DateTime.UtcNow
                        });
                    }
                }
            }

            // --- VPS ---
            EnsurePlan("cloud-vps", "Cloud VPS Nano", "1 Core", "1GB", "20GB SSD", "Unlimited", 49000, 49000 * 12 * 0.85m);
            EnsurePlan("cloud-vps", "Cloud VPS Micro", "1 Core", "2GB", "30GB SSD", "Unlimited", 89000, 89000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Basic", "2 Core", "4GB", "40GB NVMe", "Unlimited", 150000, 150000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Standard", "4 Core", "8GB", "80GB NVMe", "Unlimited", 280000, 280000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Advanced", "6 Core", "12GB", "100GB NVMe", "Unlimited", 450000, 450000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Pro", "8 Core", "16GB", "150GB NVMe", "Unlimited", 650000, 650000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Enterprise", "12 Core", "32GB", "250GB NVMe", "Unlimited", 1200000, 1200000 * 12 * 0.8m);
            EnsurePlan("cloud-vps", "Cloud VPS Titanium", "16 Core", "64GB", "500GB NVMe", "Unlimited", 2500000, 2500000 * 12 * 0.75m);

            // --- HOSTING ---
            EnsurePlan("web-hosting", "NVMe Starter", "1 Core", "1GB", "10GB NVMe", "Unlimited", 39000, 39000 * 12 * 0.75m);
            EnsurePlan("web-hosting", "NVMe Pro", "2 Core", "2GB", "20GB NVMe", "Unlimited", 89000, 89000 * 12 * 0.75m);
            EnsurePlan("web-hosting", "NVMe Business", "4 Core", "4GB", "50GB NVMe", "Unlimited", 159000, 159000 * 12 * 0.75m);
            EnsurePlan("web-hosting", "NVMe E-commerce", "6 Core", "8GB", "100GB NVMe", "Unlimited", 299000, 299000 * 12 * 0.75m);
            EnsurePlan("web-hosting", "WordPress Starter", "2 Core", "2GB", "25GB NVMe", "Unlimited", 99000, 99000 * 12 * 0.7m);
            EnsurePlan("web-hosting", "WordPress Pro", "4 Core", "4GB", "60GB NVMe", "Unlimited", 199000, 199000 * 12 * 0.7m);
            EnsurePlan("web-hosting", "WordPress VIP", "8 Core", "8GB", "120GB NVMe", "Unlimited", 399000, 399000 * 12 * 0.7m);
            EnsurePlan("web-hosting", "Windows ASP.NET", "2 Core", "4GB", "50GB SSD", "Unlimited", 149000, 149000 * 12 * 0.7m);

            // --- DOMAINS ---
            EnsurePlan("ten-mien", "Tên miền .VN", null, null, null, null, 750000);
            EnsurePlan("ten-mien", "Tên miền .COM.VN", null, null, null, null, 650000);
            EnsurePlan("ten-mien", "Tên miền .EDU.VN", null, null, null, null, 350000);
            EnsurePlan("ten-mien", "Tên miền .COM", null, null, null, null, 250000);
            EnsurePlan("ten-mien", "Tên miền .NET", null, null, null, null, 350000);
            EnsurePlan("ten-mien", "Tên miền .ORG", null, null, null, null, 380000);
            EnsurePlan("ten-mien", "Tên miền .INFO", null, null, null, null, 400000);
            EnsurePlan("ten-mien", "Tên miền .IO", null, null, null, null, 1200000);
            EnsurePlan("ten-mien", "Tên miền .AI", null, null, null, null, 2500000);
            EnsurePlan("ten-mien", "Tên miền .DEV", null, null, null, null, 450000);

            // --- DEDICATED SERVERS ---
            EnsurePlan("dedicated-server", "Dedicated Dual E5-2670", "16 Core / 32 Thread", "64GB", "2x 500GB SSD", "1Gbps / 10TB", 2800000, 2800000 * 12 * 0.9m);
            EnsurePlan("dedicated-server", "Dedicated Dual E5-2680v4", "28 Core / 56 Thread", "128GB", "2x 1TB NVMe", "1Gbps / 20TB", 5500000, 5500000 * 12 * 0.9m);
            EnsurePlan("dedicated-server", "Dedicated AMD EPYC 7502", "32 Core / 64 Thread", "256GB", "4x 2TB NVMe", "10Gbps / Unmetered", 9900000, 9900000 * 12 * 0.9m);

            // --- EMAIL SERVER ---
            EnsurePlan("email-server", "Email Doanh Nghiệp 10 User", null, "10 Accounts", "10GB Storage", null, 99000, 99000 * 12 * 0.8m);
            EnsurePlan("email-server", "Email Doanh Nghiệp 50 User", null, "50 Accounts", "50GB Storage", null, 390000, 39000 * 12 * 0.8m);
            EnsurePlan("email-server", "Email Doanh Nghiệp Unlimited", null, "Unlimited Accounts", "200GB Storage", null, 890000, 890000 * 12 * 0.8m);

            // --- SSL ---
            EnsurePlan("ssl-certificate", "PositiveSSL (DV)", null, null, null, null, 150000);
            EnsurePlan("ssl-certificate", "Wildcard SSL", null, null, null, null, 1200000);
            EnsurePlan("ssl-certificate", "EV SSL (Green Bar)", null, null, null, null, 3500000);

            // --- MANAGED DATABASES ---
            EnsurePlan("managed-database", "DB Micro (Dev/Test)", "0.5 vCPU", "256MB", "2GB NVMe", "Unlimited", 99000, 99000 * 12 * 0.85m);
            EnsurePlan("managed-database", "DB Standard (Production)", "1.0 vCPU", "1GB", "10GB NVMe", "Unlimited", 299000, 299000 * 12 * 0.8m);
            EnsurePlan("managed-database", "DB Pro (High Availability)", "2.0 vCPU", "4GB", "50GB NVMe", "Unlimited", 699000, 699000 * 12 * 0.8m);

            // --- GAME SERVERS ---
            EnsurePlan("game-server", "Minecraft Dedicated", "2 Core", "4GB", "25GB NVMe", "Anti-DDoS Game", 199000, 199000 * 12 * 0.8m);
            EnsurePlan("game-server", "CS2 Match Server", "4 Core", "8GB", "50GB NVMe", "128 Tickrate / 1Gbps", 399000, 399000 * 12 * 0.8m);
            EnsurePlan("game-server", "Rust Dedicated", "6 Core", "16GB", "100GB NVMe", "High Performance", 699000, 699000 * 12 * 0.8m);

            // --- 1-CLICK APPS ---
            EnsurePlan("1click-apps", "WordPress Cloud App", "1 Core", "2GB", "15GB NVMe", "Auto-Install & SSL", 89000, 89000 * 12 * 0.8m);
            EnsurePlan("1click-apps", "Ghost Blog Cloud", "1 Core", "1GB", "10GB NVMe", "Fast Node.js Engine", 79000, 79000 * 12 * 0.8m);
            EnsurePlan("1click-apps", "Nextcloud Storage App", "2 Core", "4GB", "50GB NVMe", "Private Cloud Storage", 159000, 159000 * 12 * 0.8m);

            // --- STATIC SITES ---
            EnsurePlan("static-sites", "Static Site Starter", "0.2 vCPU", "64MB", "1GB NVMe", "Global CDN", 0, 0);
            EnsurePlan("static-sites", "Static Site Pro (Custom Domain)", "0.5 vCPU", "128MB", "5GB NVMe", "Custom SSL & Unlimited BW", 49000, 49000 * 12 * 0.8m);

            // --- OBJECT STORAGE ---
            EnsurePlan("object-storage", "S3 Storage Starter (50GB)", null, null, "50GB NVMe", "1TB Bandwidth", 50000, 50000 * 12 * 0.8m);
            EnsurePlan("object-storage", "S3 Storage Pro (250GB)", null, null, "250GB NVMe", "5TB Bandwidth", 200000, 200000 * 12 * 0.8m);
            EnsurePlan("object-storage", "S3 Storage Enterprise (1TB)", null, null, "1TB NVMe", "Unlimited Bandwidth", 690000, 690000 * 12 * 0.8m);

            // --- SECURITY & WAF ---
            EnsurePlan("security-waf", "WAF Shield Basic", null, null, null, "Lọc SQLi, XSS", 99000, 99000 * 12 * 0.8m);
            EnsurePlan("security-waf", "Malware Scanner & Shield Pro", null, null, null, "Quét mã độc Realtime", 199000, 199000 * 12 * 0.8m);

            // --- CLOUD MIGRATION ---
            EnsurePlan("cloud-migration", "Chuyển Đổi Web Chuẩn", null, null, null, "rsync + DB Dump", 200000);
            EnsurePlan("cloud-migration", "Chuyển Đổi Hệ Thống VIP 24/7", null, null, null, "Zero-downtime VIP", 500000);

            if (newPlans.Any())
            {
                await context.ServicePlans.AddRangeAsync(newPlans);
                await context.PlanPrices.AddRangeAsync(newPrices);
                await context.SaveChangesAsync();
                logger.LogInformation("Successfully seeded {Count} new service plans and prices!", newPlans.Count);
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
