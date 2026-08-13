using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace CloudServiceStore.Tests.Integration
{
    public class AutoRenewIntegrationTests : BaseIntegrationTest
    {
        public AutoRenewIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task ToggleAutoRenew_WithRandomGuid_ShouldReturnNotFound()
        {
            // Arrange
            AuthenticateAdmin();
            var client = Factory.CreateClient();
            var command = new { OrderId = Guid.NewGuid() };

            // Act
            var response = await client.PutAsJsonAsync("/api/auto-renew/toggle", command);

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
