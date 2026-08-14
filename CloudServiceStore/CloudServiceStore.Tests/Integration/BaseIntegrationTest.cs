using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using CloudServiceStore.Infrastructure.Persistence;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

[Collection("IntegrationTestCollection")]
public abstract class BaseIntegrationTest : IAsyncLifetime
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    protected BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected void AuthenticateAdmin()
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "mock-admin-jwt-token");
    }

    protected void AuthenticateCustomer()
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "mock-customer-jwt-token");
    }

    protected async Task AddEntityAsync<TEntity>(TEntity entity) where TEntity : class
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Set<TEntity>().Add(entity);
        await db.SaveChangesAsync();
    }

    protected async Task SeedUserAsync(Guid userId)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        if (!await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(db.AppUsers, u => u.Id == userId))
        {
            var customerRole = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(db.Roles, r => r.Name == "Customer");
            var user = new CloudServiceStore.Domain.Entities.AppUser("Test User", $"test_{userId}@test.com", "hash", customerRole!.Id)
            {
                Id = userId
            };
            db.AppUsers.Add(user);
            await db.SaveChangesAsync();
        }
    }

    public async Task InitializeAsync()
    {
        // Reset DB before each test
        await Factory.ResetDatabaseAsync();
        await SeedUserAsync(Guid.Parse("11111111-1111-1111-1111-111111111111"));
    }

    public Task DisposeAsync() => Task.CompletedTask;
}

[CollectionDefinition("IntegrationTestCollection")]
public class IntegrationTestCollection : ICollectionFixture<CustomWebApplicationFactory>
{
    // This class has no code, and is never created. Its purpose is simply
    // to be the place to apply [CollectionDefinition] and all the
    // ICollectionFixture<> interfaces.
}
