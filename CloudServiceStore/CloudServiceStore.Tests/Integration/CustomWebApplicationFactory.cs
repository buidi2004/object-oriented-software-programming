using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CloudServiceStore.Infrastructure.Persistence;
using System.Threading.Tasks;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using Testcontainers.MsSql;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _dbContainer;
    private DbConnection _dbConnection = default!;
    private Respawner _respawner = default!;

    public CustomWebApplicationFactory()
    {
        _dbContainer = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
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

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "TestScheme";
                options.DefaultChallengeScheme = "TestScheme";
            }).AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthHandler>("TestScheme", options => { });
        });
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();

        if (!await db.Roles.AnyAsync())
        {
            var customerRole = new CloudServiceStore.Domain.Entities.Role { Id = System.Guid.NewGuid(), Name = "Customer" };
            var adminRole = new CloudServiceStore.Domain.Entities.Role { Id = System.Guid.NewGuid(), Name = "Admin" };
            db.Roles.Add(customerRole);
            db.Roles.Add(adminRole);

            // Also seed the mock user for TestAuthHandler
            var mockUserId = System.Guid.Parse("11111111-1111-1111-1111-111111111111");
            var mockUser = new CloudServiceStore.Domain.Entities.AppUser("Test User", "mock_test@example.com", "Hash", customerRole.Id)
            {
                Id = mockUserId
            };
            db.AppUsers.Add(mockUser);
            
            await db.SaveChangesAsync();
        }

        _dbConnection = new SqlConnection(_dbContainer.GetConnectionString());
        await _dbConnection.OpenAsync();
        
        _respawner = await Respawner.CreateAsync(_dbConnection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.SqlServer,
            SchemasToInclude = new[] { "dbo" },
            TablesToIgnore = new Respawn.Graph.Table[] { "Roles" }
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
