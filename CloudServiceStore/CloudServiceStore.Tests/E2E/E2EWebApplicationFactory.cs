using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using Testcontainers.MsSql;
using Xunit;
using Moq;

namespace CloudServiceStore.Tests.E2E;

public class E2EWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _dbContainer;
    private DbConnection _dbConnection = default!;
    private Respawner _respawner = default!;

    public E2EWebApplicationFactory()
    {
        _dbContainer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
            .WithPassword("Password123!")
            .Build();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new System.Collections.Generic.Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", _dbContainer.GetConnectionString() },
                { "Cache:Enabled", "false" }
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(_dbContainer.GetConnectionString())
                       .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });

            var vpsDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(CloudServiceStore.Application.Interfaces.IVpsProvisioningService));
            if (vpsDescriptor != null)
            {
                services.Remove(vpsDescriptor);
            }
            var mockVps = new Moq.Mock<CloudServiceStore.Application.Interfaces.IVpsProvisioningService>();
            mockVps.Setup(x => x.IsAvailableAsync(Moq.It.IsAny<System.Threading.CancellationToken>())).ReturnsAsync(true);
            mockVps.Setup(x => x.ProvisionAsync(Moq.It.IsAny<CloudServiceStore.Application.Models.VpsProvisionSpec>(), Moq.It.IsAny<System.Threading.CancellationToken>()))
                   .ReturnsAsync(new CloudServiceStore.Application.Models.ProvisionResult(true, "mock-container-id", "mock-container-name", null));
            services.AddSingleton(mockVps.Object);

            // We do NOT add the TestAuthHandler here because E2E tests need real JWT auth.
        });
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (!await db.Roles.AnyAsync())
        {
            var adminRole = new CloudServiceStore.Domain.Entities.Role { Id = System.Guid.NewGuid(), Name = "Admin" };
            var customerRole = new CloudServiceStore.Domain.Entities.Role { Id = System.Guid.NewGuid(), Name = "Customer" };
            db.Roles.Add(customerRole);
            db.Roles.Add(adminRole);
            
            var permission = new CloudServiceStore.Domain.Entities.Permission { Id = System.Guid.NewGuid(), Code = "manage_users", Name = "Quản lý Người dùng" };
            db.Permissions.Add(permission);
            db.RolePermissions.Add(new CloudServiceStore.Domain.Entities.RolePermission { RoleId = adminRole.Id, PermissionId = permission.Id });
            
            await db.SaveChangesAsync();
        }

        _dbConnection = new SqlConnection(_dbContainer.GetConnectionString());
        await _dbConnection.OpenAsync();
        
        _respawner = await Respawner.CreateAsync(_dbConnection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.SqlServer,
            SchemasToInclude = new[] { "dbo" },
            TablesToIgnore = new Respawn.Graph.Table[] { "Roles", "Permissions", "RolePermissions", "__EFMigrationsHistory" }
        });
    }

    public async Task ResetDatabaseAsync()
    {
        await _respawner.ResetAsync(_dbConnection);
    }

    public new async Task DisposeAsync()
    {
        await _dbConnection.CloseAsync();
        await _dbContainer.StopAsync();
    }
}
