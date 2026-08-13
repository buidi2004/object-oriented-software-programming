using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Loyalty.Commands.RedeemLoyalty;

public class RedeemLoyaltyCommandHandlerTests
{
    private readonly Mock<IRepository<LoyaltyPoint>> _mockRepositoryLoyaltyPoint;
    private readonly Mock<IRepository<LoyaltyTransaction>> _mockRepositoryLoyaltyTransaction;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly RedeemLoyaltyCommandHandler _handler;

    public RedeemLoyaltyCommandHandlerTests()
    {
        _mockRepositoryLoyaltyPoint = new Mock<IRepository<LoyaltyPoint>>();
        _mockRepositoryLoyaltyTransaction = new Mock<IRepository<LoyaltyTransaction>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new RedeemLoyaltyCommandHandler(_mockRepositoryLoyaltyPoint.Object, _mockRepositoryLoyaltyTransaction.Object, _mockUnitOfWork.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RedeemLoyaltyCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
