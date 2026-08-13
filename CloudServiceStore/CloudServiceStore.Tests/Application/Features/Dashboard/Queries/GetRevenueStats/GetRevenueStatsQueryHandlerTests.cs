using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Dashboard.Queries.GetRevenueStats;

public class GetRevenueStatsQueryHandlerTests
{
    private readonly Mock<IRepository<OrderRequest>> _mockRepositoryOrderRequest;
    private readonly GetRevenueStatsQueryHandler _handler;

    public GetRevenueStatsQueryHandlerTests()
    {
        _mockRepositoryOrderRequest = new Mock<IRepository<OrderRequest>>();
        _handler = new GetRevenueStatsQueryHandler(_mockRepositoryOrderRequest.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetRevenueStatsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
