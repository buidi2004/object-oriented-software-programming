using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ServicePlanIntegrationTests : BaseIntegrationTest
{
    public ServicePlanIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateServicePlan_And_GetWithCurrency_ShouldSucceed()
    {
        AuthenticateAdmin();

        // 1. Arrange: Create a category first
        var categoryCommand = new CreateCategoryCommand("VPS NVMe", "vps-nvme");
        var categoryResponse = await Client.PostAsJsonAsync("/api/categories", categoryCommand);
        categoryResponse.EnsureSuccessStatusCode();

        var categoriesResponse = await Client.GetAsync("/api/categories");
        var categories = await categoriesResponse.Content.ReadFromJsonAsync<List<CloudServiceStore.Application.Features.Categories.Queries.GetCategories.CategoryDto>>();
        var categoryId = categories!.First(c => c.Name == "VPS NVMe").Id;

        // 2. Act: Create Service Plan
        var planCommand = new CreateServicePlanCommand(categoryId, "VPS Basic", null, null, null, null, true);
        var createPlanResponse = await Client.PostAsJsonAsync("/api/service-plans", planCommand);
        createPlanResponse.EnsureSuccessStatusCode();
        var createPlanContent = await createPlanResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var planId = createPlanContent.GetProperty("id").GetGuid();

        // 3. Act: Add Price
        await AddEntityAsync(new PlanPrice
        {
            ServicePlanId = planId,
            BillingCycle = CloudServiceStore.Domain.Enums.BillingCycle.Monthly,
            Price = 50000m,
            Currency = "VND",
            EffectiveFrom = System.DateTime.UtcNow
        });

        // 4. Act: Get Service Plans
        var getPlansResponse = await Client.GetAsync("/api/service-plans?currency=VND");
        getPlansResponse.EnsureSuccessStatusCode();
        var plans = await getPlansResponse.Content.ReadFromJsonAsync<List<ServicePlanPriceDto>>();

        // 5. Assert
        plans.Should().NotBeNull();
        plans.Should().Contain(p => p.ServicePlanName == "VPS Basic");
    }
}
