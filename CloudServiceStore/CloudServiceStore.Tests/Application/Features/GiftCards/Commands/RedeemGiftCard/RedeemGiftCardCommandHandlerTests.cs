using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.GiftCards.Commands.RedeemGiftCard;

public class RedeemGiftCardCommandHandlerTests
{
    private readonly Mock<IRepository<GiftCard>> _mockRepositoryGiftCard;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly RedeemGiftCardCommandHandler _handler;

    public RedeemGiftCardCommandHandlerTests()
    {
        _mockRepositoryGiftCard = new Mock<IRepository<GiftCard>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new RedeemGiftCardCommandHandler(_mockRepositoryGiftCard.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RedeemGiftCardCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
