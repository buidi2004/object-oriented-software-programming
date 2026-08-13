using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using Microsoft.Extensions.DependencyInjection;
using CloudServiceStore.Infrastructure.Persistence;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

[Collection("E2ETestCollection")]
public abstract class BaseE2ETest : IAsyncLifetime
{
    protected readonly E2EWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    protected BaseE2ETest(E2EWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected async Task<string> RegisterAndLoginCustomerAsync(string email, string password)
    {
        // 1. Register
        var registerCommand = new RegisterCommand("E2E Test User", email, password, "123456789");
        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerCommand);
        registerResponse.EnsureSuccessStatusCode();

        // 2. Login
        var loginCommand = new LoginCommand(email, password, "127.0.0.1", "E2E Test", "Test Device");
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResultDto>();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult!.AccessToken);

        return authResult.AccessToken;
    }

    protected async Task<string> RegisterAndLoginAdminAsync(string email, string password)
    {
        var token = await RegisterAndLoginCustomerAsync(email, password);
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(db.AppUsers, u => u.Email == email);
        if (user != null)
        {
            var adminRole = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(db.Roles, r => r.Name == "Admin");
            if (adminRole == null)
            {
                adminRole = new CloudServiceStore.Domain.Entities.Role { Name = "Admin" };
                db.Roles.Add(adminRole);
                await db.SaveChangesAsync();
            }
            user.RoleId = adminRole.Id;
            db.AppUsers.Update(user);
            await db.SaveChangesAsync();
        }

        // Login again to get Admin token
        var loginCommand = new LoginCommand(email, password, "127.0.0.1", "E2E Test", "Test Device");
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResultDto>();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult!.AccessToken);
        return authResult.AccessToken;
    }

    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    // A small DTO to read the response of /api/auth/login
    public class AuthResultDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    protected async Task<(string AccessToken, string RefreshToken)> RegisterAndLoginCustomerWithRefreshAsync(string email, string password)
    {
        var registerCommand = new RegisterCommand("E2E Test User", email, password, "123456789");
        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerCommand);
        registerResponse.EnsureSuccessStatusCode();

        var loginCommand = new LoginCommand(email, password, "127.0.0.1", "E2E Test", "Test Device");
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResultDto>();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult!.AccessToken);

        return (authResult.AccessToken, authResult.RefreshToken);
    }

    protected async Task AddEntityAsync<TEntity>(TEntity entity) where TEntity : class
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Set<TEntity>().Add(entity);
        await db.SaveChangesAsync();
    }

    public async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;
}

[CollectionDefinition("E2ETestCollection")]
public class E2ETestCollection : ICollectionFixture<E2EWebApplicationFactory>
{
}
