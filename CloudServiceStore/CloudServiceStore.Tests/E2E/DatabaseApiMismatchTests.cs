using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class DatabaseApiMismatchTests : BaseE2ETest
{
    public DatabaseApiMismatchTests(E2EWebApplicationFactory factory) : base(factory) { }

    private async Task<string> GetCustomerTokenAsync()
    {
        return await RegisterAndLoginCustomerAsync("e2e_customer_api_test@test.com", "Password123!");
    }

    [Fact]
    public async Task DatabasesController_GetMyDatabases_ShouldReturnOk()
    {
        var token = await GetCustomerTokenAsync();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await Client.GetAsync("/api/databases");
        
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    // Test create database với đúng payload (engine là số - enum value)
    [Fact]
    public async Task DatabasesController_CreateDatabase_WithCorrectPayload_ShouldReturnOk()
    {
        var token = await GetCustomerTokenAsync();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        // CreateDatabaseInstanceCommand requires: Name (string), Engine (DatabaseEngine enum)
        // Engine values: MySQL = 1, PostgreSQL = 2
        var createDb = new { name = "test-db", engine = 2 }; // 2 = PostgreSQL
        var httpContent = new StringContent(System.Text.Json.JsonSerializer.Serialize(createDb), 
            System.Text.Encoding.UTF8, "application/json");
        
        var response = await Client.PostAsync("/api/databases", httpContent);
        
        // Should return OK (200) or Created (201)
        Assert.True(response.StatusCode == System.Net.HttpStatusCode.OK || 
                    response.StatusCode == System.Net.HttpStatusCode.Created,
                    $"Expected OK or Created, but got {response.StatusCode}");
    }

    // BUG: Actions này KHÔNG TỒN TẠI trong DatabasesController - FE gọi nhưng BE không có
    [Fact]
    public async Task DatabasesController_Suspend_ShouldReturnNotFound()
    {
        var token = await GetCustomerTokenAsync();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var guid = Guid.NewGuid().ToString("N");
        var response = await Client.PutAsync($"/api/databases/{guid}/suspend", null);
        
        // Action này KHÔNG TỒN TẠI → trả về 404
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DatabasesController_Resume_ShouldReturnNotFound()
    {
        var token = await GetCustomerTokenAsync();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var guid = Guid.NewGuid().ToString("N");
        var response = await Client.PutAsync($"/api/databases/{guid}/resume", null);
        
        // Action này KHÔNG TỒN TẠI → trả về 404
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DatabasesController_Delete_ShouldReturnNotFound()
    {
        var token = await GetCustomerTokenAsync();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var guid = Guid.NewGuid().ToString("N");
        var response = await Client.DeleteAsync($"/api/databases/{guid}");
        
        // Action này KHÔNG TỒN TẠI → trả về 404
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }
}