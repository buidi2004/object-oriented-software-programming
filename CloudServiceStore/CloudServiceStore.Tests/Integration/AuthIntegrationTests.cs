using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class AuthIntegrationTests : BaseIntegrationTest
{
    public AuthIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_And_Login_ShouldSucceed()
    {
        // 1. Arrange
        var registerCommand = new RegisterCommand("Test User", "test@example.com", "Password123!", null);

        // 2. Act - Register
        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerCommand);
        if (!registerResponse.IsSuccessStatusCode)
        {
            var err = await registerResponse.Content.ReadAsStringAsync();
            throw new System.Exception($"Register failed: {err}");
        }

        // 3. Act - Login
        var loginCommand = new LoginCommand("test@example.com", "Password123!", "127.0.0.1", "TestAgent", "TestDevice");
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        // 4. Assert
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        loginResult.GetProperty("accessToken").GetString().Should().NotBeNullOrEmpty();
    }
}
