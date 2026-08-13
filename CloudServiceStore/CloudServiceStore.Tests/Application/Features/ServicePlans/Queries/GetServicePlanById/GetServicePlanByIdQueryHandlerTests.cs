using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanById;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ServicePlans.Queries.GetServicePlanById;

public class GetServicePlanByIdQueryHandlerTests
{
    private readonly Mock<IRepository<ServicePlan>> _planRepo = new();
    private readonly Mock<IRepository<PlanPrice>> _priceRepo = new();
    private readonly Mock<IRepository<Promotion>> _promotionRepo = new();
    private readonly Mock<IRepository<ExchangeRate>> _exchangeRateRepo = new();

    private GetServicePlanByIdQueryHandler CreateHandler() =>
        new(_planRepo.Object, _priceRepo.Object, _promotionRepo.Object, _exchangeRateRepo.Object);

    [Fact]
    public async Task Handle_PlanNotFound_ThrowsNotFoundException()
    {
        var planId = Guid.NewGuid();
        _planRepo.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<ServicePlan, bool>>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<Expression<Func<ServicePlan, object>>[]>()))
            .ReturnsAsync((ServicePlan?)null);

        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new GetServicePlanByIdQuery(planId), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidPlan_ReturnsDetailWithPricesAndPromotions()
    {
        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId, Name = "Cloud VPS", Slug = "cloud-vps" };
        var plan = new ServicePlan(categoryId, "Cloud VPS Pro", "8 Core", "16GB", "150GB NVMe", "Unlimited", null);
        plan.Id = planId;
        typeof(ServicePlan).GetProperty(nameof(ServicePlan.Category))!.SetValue(plan, category);

        _planRepo.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<ServicePlan, bool>>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<Expression<Func<ServicePlan, object>>[]>()))
            .ReturnsAsync(plan);

        _priceRepo.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<PlanPrice, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PlanPrice>
            {
                new() { Id = Guid.NewGuid(), ServicePlanId = planId, BillingCycle = BillingCycle.Monthly, Price = 650_000, Currency = "VND", EffectiveFrom = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ServicePlanId = planId, BillingCycle = BillingCycle.Yearly, Price = 6_240_000, Currency = "VND", EffectiveFrom = DateTime.UtcNow },
            });

        _promotionRepo.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<Promotion, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Promotion>
            {
                new() { Id = Guid.NewGuid(), ServicePlanId = planId, DiscountPercent = 10, StartDate = DateTime.UtcNow.AddDays(-1), EndDate = DateTime.UtcNow.AddDays(1) }
            });

        var handler = CreateHandler();
        var result = await handler.Handle(new GetServicePlanByIdQuery(planId), CancellationToken.None);

        Assert.Equal(planId, result.Id);
        Assert.Equal("Cloud VPS Pro", result.Name);
        Assert.Equal("cloud-vps", result.CategorySlug);
        Assert.Equal(2, result.Prices.Count);
        Assert.Single(result.ActivePromotions);
        Assert.Equal(10, result.ActivePromotions[0].DiscountPercent);
    }
}
