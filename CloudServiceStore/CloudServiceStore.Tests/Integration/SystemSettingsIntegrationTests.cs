using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class SystemSettingsIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public SystemSettingsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAndManage_SystemSettings_ShouldSucceed()
    {
        // 1. Seed data
        var setting = new SystemSetting { Id = Guid.NewGuid(), Key = "SiteName", Value = "My Store", Description = "Name of the site" };
        await AddEntityAsync(setting);

        // 2. Unauthenticated GetByKey
        var getByKeyResponse = await Client.GetAsync($"/api/system-settings/SiteName");
        getByKeyResponse.EnsureSuccessStatusCode();
        var content = await getByKeyResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        content.GetProperty("value").GetString().Should().Be("My Store");

        // 3. Unauthenticated GetAll (Should Fail - Unauthorized/Forbidden)
        var getAllResponse = await Client.GetAsync("/api/system-settings");
        getAllResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);

        // 4. Authenticate as Admin
        AuthenticateAdmin();

        // 5. Admin GetAll
        var adminGetAllResponse = await Client.GetAsync("/api/system-settings");
        adminGetAllResponse.EnsureSuccessStatusCode();

        // 6. Admin Update
        var updateCommand = new UpdateSettingCommand("SiteName", "New Store Name", null);
        var updateResponse = await Client.PutAsJsonAsync("/api/system-settings/SiteName", updateCommand);
        updateResponse.EnsureSuccessStatusCode();

        // 7. Verify Update
        var verifyResponse = await Client.GetAsync($"/api/system-settings/SiteName");
        var verifyContent = await verifyResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        verifyContent.GetProperty("value").GetString().Should().Be("New Store Name");
    }
}
