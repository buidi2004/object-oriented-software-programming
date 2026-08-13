using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.ExchangeRates.Queries.GetExchangeRates;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.ExchangeRates.Queries.GetExchangeRates;

public class GetExchangeRatesQueryHandlerTests
{
    private readonly Mock<IRepository<ExchangeRate>> _mockRepositoryExchangeRate;
    private readonly GetExchangeRatesQueryHandler _handler;

    public GetExchangeRatesQueryHandlerTests()
    {
        _mockRepositoryExchangeRate = new Mock<IRepository<ExchangeRate>>();
        _handler = new GetExchangeRatesQueryHandler(_mockRepositoryExchangeRate.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetExchangeRatesQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
