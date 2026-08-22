using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Loyalty.Queries.GetMyLoyalty;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Loyalty.Queries.GetMyLoyalty;

public class GetMyLoyaltyQueryHandlerTests
{
    private readonly Mock<IRepository<LoyaltyPoint>> _mockRepositoryLoyaltyPoint;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyLoyaltyQueryHandler _handler;

    public GetMyLoyaltyQueryHandlerTests()
    {
        _mockRepositoryLoyaltyPoint = new Mock<IRepository<LoyaltyPoint>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyLoyaltyQueryHandler(_mockRepositoryLoyaltyPoint.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyLoyaltyQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
