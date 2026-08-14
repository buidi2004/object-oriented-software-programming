using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Users.Commands.UpdateProfile;
using CloudServiceStore.Application.Features.Security.Commands.ChangePassword;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ProfileAndSecurityE2ETests : BaseE2ETest
{
    public ProfileAndSecurityE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Profile_And_Security_Workflow_ShouldWorkCorrectly()
    {
        // 1. Customer Logs in
        var currentPassword = "Cust@123_Profile!";
        var customerToken = await RegisterAndLoginCustomerAsync("cust_profile@test.com", currentPassword);
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);

        // 2. Get Initial Profile
        var getProfileRes = await Client.GetAsync("/api/users/me");
        getProfileRes.EnsureSuccessStatusCode();
        var profileStr = await getProfileRes.Content.ReadAsStringAsync();
        profileStr.Should().Contain("E2E Test User");

        // 3. Update Profile
        var updateProfileCmd = new UpdateProfileCommand(
            FullName: "Updated Name",
            PhoneNumber: "0987654321",
            FirstName: "Updated",
            LastName: "Name",
            Country: "VN",
            City: "Hanoi",
            Ward: "Cau Giay",
            AddressLine: "123 Xuan Thuy",
            CompanyName: "Test Company",
            TaxCode: "0101234567"
        );
        var updateRes = await Client.PutAsJsonAsync("/api/users/me", updateProfileCmd);
        updateRes.EnsureSuccessStatusCode();

        // 4. Get Profile Again to Verify
        var getProfileAgainRes = await Client.GetAsync("/api/users/me");
        getProfileAgainRes.EnsureSuccessStatusCode();
        var profileAgainStr = await getProfileAgainRes.Content.ReadAsStringAsync();
        profileAgainStr.Should().Contain("Updated Name");
        profileAgainStr.Should().Contain("0987654321");
        profileAgainStr.Should().Contain("Test Company");

        // 5. Change Password
        var newPassword = "NewPassword@123!";
        var changePasswordCmd = new ChangePasswordCommand(currentPassword, newPassword);
        var changePasswordRes = await Client.PostAsJsonAsync("/api/security/change-password", changePasswordCmd);
        if (!changePasswordRes.IsSuccessStatusCode)
        {
            var err = await changePasswordRes.Content.ReadAsStringAsync();
            throw new System.Exception($"Change password failed: {changePasswordRes.StatusCode}, {err}");
        }

        // 6. Test Change Password with wrong current password
        var wrongChangePasswordCmd = new ChangePasswordCommand("WrongPassword!", "AnotherOne@123!");
        var wrongChangePasswordRes = await Client.PostAsJsonAsync("/api/security/change-password", wrongChangePasswordCmd);
        wrongChangePasswordRes.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);

        // 7. Verify new password works by logging in again
        var loginCmd = new CloudServiceStore.Application.Features.Auth.Commands.Login.LoginCommand("cust_profile@test.com", newPassword, "127.0.0.1", "TestAgent", "TestDevice");
        var loginRes = await Client.PostAsJsonAsync("/api/auth/login", loginCmd);
        loginRes.EnsureSuccessStatusCode();
    }
}
