using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace CloudServiceStore.Tests.Integration
{
    [Trait("Category", "Integration")]
    public class CorsIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public CorsIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Api_ShouldAllowCors_FromFrontendOrigin()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Options, "/api/status");
            request.Headers.Add("Origin", "http://localhost:3000");
            request.Headers.Add("Access-Control-Request-Method", "GET");
            request.Headers.Add("Access-Control-Request-Headers", "Content-Type, Authorization");

            // Act
            var response = await client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode); // Preflight returns 204 No Content
            
            var corsHeader = response.Headers.FirstOrDefault(h => h.Key == "Access-Control-Allow-Origin");
            Assert.NotNull(corsHeader.Value);
            Assert.Contains("http://localhost:3000", corsHeader.Value.FirstOrDefault());
            
            var allowMethodsHeader = response.Headers.FirstOrDefault(h => h.Key == "Access-Control-Allow-Methods");
            Assert.NotNull(allowMethodsHeader.Value);
        }
    }
}
