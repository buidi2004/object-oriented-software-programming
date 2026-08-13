using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Users.Queries.GetUsers;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class UserIntegrationTests : BaseIntegrationTest
{
    public UserIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAllUsers_And_LockUser_ShouldSucceed()
    {
        // 1. Arrange: Create a user via Register endpoint
        var registerCommand = new RegisterCommand("Lock User Test", "lock@example.com", "Password123!", null);
        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerCommand);
        registerResponse.EnsureSuccessStatusCode();

        AuthenticateAdmin(); // For /api/users endpoints

        // 2. Act: Get All Users
        var getUsersResponse = await Client.GetAsync("/api/users");
        getUsersResponse.EnsureSuccessStatusCode();
        var users = await getUsersResponse.Content.ReadFromJsonAsync<List<UserDto>>();

        users.Should().NotBeNull();
        users.Should().Contain(u => u.Email == "lock@example.com");

        var testUser = users!.First(u => u.Email == "lock@example.com");

        // 3. Act: Lock User
        var lockResponse = await Client.PatchAsync($"/api/users/{testUser.Id}/lock", null);
        lockResponse.EnsureSuccessStatusCode();

        // 4. Verify User is locked
        var getUsersResponseAfterLock = await Client.GetAsync("/api/users");
        var usersAfterLock = await getUsersResponseAfterLock.Content.ReadFromJsonAsync<List<UserDto>>();
        
        var lockedUser = usersAfterLock!.First(u => u.Id == testUser.Id);
        lockedUser.IsActive.Should().BeFalse();
    }
}
