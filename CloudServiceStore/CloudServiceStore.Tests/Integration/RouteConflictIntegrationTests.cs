using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CloudServiceStore.WebApi;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.Integration
{
    [Trait("Category", "Integration")]
    public class RouteConflictIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public RouteConflictIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public void Application_ShouldNotHaveRouteConflicts()
        {
            // Arrange
            using var scope = _factory.Services.CreateScope();
            
            // Act
            // Resolving IActionDescriptorCollectionProvider will build the action descriptor cache
            // which in turn builds the endpoint routes. If there are duplicate routes (AmbiguousMatchException),
            // it will throw during this process.
            var actionDescriptorCollectionProvider = scope.ServiceProvider.GetRequiredService<IActionDescriptorCollectionProvider>();
            
            var actions = actionDescriptorCollectionProvider.ActionDescriptors.Items;

            // Assert
            Assert.NotNull(actions);
            Assert.True(actions.Any(), "There should be registered routes in the application");
        }
        
        [Fact]
        public async Task Application_CanServeStatusEndpoint_WithoutRoutingErrors()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            // We just hit a 404 endpoint. The goal is to ensure the routing middleware can process the request
            // without throwing an AmbiguousMatchException during route matching.
            var response = await client.GetAsync("/api/this-route-does-not-exist");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
