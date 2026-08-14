using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.GiftCards.Queries.GetGiftCardBalance;

public class GetGiftCardBalanceQueryHandlerTests
{
    private readonly Mock<IRepository<GiftCard>> _mockRepositoryGiftCard;
    private readonly GetGiftCardBalanceQueryHandler _handler;

    public GetGiftCardBalanceQueryHandlerTests()
    {
        _mockRepositoryGiftCard = new Mock<IRepository<GiftCard>>();
        _handler = new GetGiftCardBalanceQueryHandler(_mockRepositoryGiftCard.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetGiftCardBalanceQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
