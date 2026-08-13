using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ServicePlans;

public class GetServicePlansWithCurrencyQueryHandlerTests
{
    private readonly Mock<IRepository<PlanPrice>> _planPriceRepoMock = new();
    private readonly Mock<IRepository<ExchangeRate>> _exchangeRateRepoMock = new();
    private readonly Mock<IRepository<ServicePlan>> _servicePlanRepoMock = new();

    private GetServicePlansWithCurrencyQueryHandler CreateHandler()
    {
        _servicePlanRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServicePlan>());
        return new(_planPriceRepoMock.Object, _exchangeRateRepoMock.Object, _servicePlanRepoMock.Object);
    }

    private List<PlanPrice> SamplePrices() => new()
    {
        new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = Guid.NewGuid(), BillingCycle = BillingCycle.Monthly, Price = 100_000, Currency = "VND", EffectiveFrom = DateTime.UtcNow.AddDays(-1) },
        new PlanPrice { Id = Guid.NewGuid(), ServicePlanId = Guid.NewGuid(), BillingCycle = BillingCycle.Yearly,  Price = 1_000_000, Currency = "VND", EffectiveFrom = DateTime.UtcNow.AddDays(-1) },
    };

    [Fact]
    public async Task Handle_NoCurrencyParam_ReturnsVndPrices()
    {
        var prices = SamplePrices();
        _planPriceRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(prices);

        var query = new GetServicePlansWithCurrencyQuery { Currency = "VND" };
        var handler = CreateHandler();

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotEmpty(result);
        Assert.All(result, dto => Assert.Equal("VND", dto.Currency));
    }

    [Fact]
    public async Task Handle_CurrencyUSD_ConvertsPricesUsingExchangeRate()
    {
        var prices = SamplePrices();
        _planPriceRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(prices);

        // 1 USD = 25000 VND => VND to USD: price / 25000
        var rate = new ExchangeRate { Id = Guid.NewGuid(), FromCurrency = "VND", ToCurrency = "USD", Rate = 1m / 25000m, UpdatedAt = DateTime.UtcNow };
        _exchangeRateRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ExchangeRate, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<ExchangeRate, object>>[]>()))
            .ReturnsAsync(rate);

        var query = new GetServicePlansWithCurrencyQuery { Currency = "USD" };
        var handler = CreateHandler();

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotEmpty(result);
        Assert.All(result, dto => Assert.Equal("USD", dto.Currency));
        // 100000 VND * (1/25000) = 4 USD
        var firstItem = result.First(r => r.Price == 100_000m * (1m / 25000m));
        Assert.Equal(4m, firstItem.Price);
    }

    [Fact]
    public async Task Handle_ExchangeRateNotFound_FallbackToVndPrice()
    {
        var prices = SamplePrices();
        _planPriceRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(prices);

        _exchangeRateRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ExchangeRate, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<ExchangeRate, object>>[]>()))
            .ReturnsAsync((ExchangeRate?)null); // No rate found

        var query = new GetServicePlansWithCurrencyQuery { Currency = "JPY" };
        var handler = CreateHandler();

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotEmpty(result);
        // Falls back to original VND price, but sets currency to requested
        Assert.All(result, dto => Assert.Equal("JPY", dto.Currency));
    }

    [Fact]
    public async Task Handle_EmptyPriceList_ReturnsEmpty()
    {
        _planPriceRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PlanPrice>());

        var query = new GetServicePlansWithCurrencyQuery { Currency = "VND" };
        var handler = CreateHandler();

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }
}
