using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.GiftCards;

public class GiftCardCommandHandlerTests
{
    private readonly Mock<IRepository<GiftCard>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    [Fact]
    public async Task GetBalance_NotFound_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((GiftCard?)null);

        var handler = new GetGiftCardBalanceQueryHandler(_repoMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new GetGiftCardBalanceQuery { Code = "INVALID" }, CancellationToken.None));
    }

    [Fact]
    public async Task GetBalance_Valid_ReturnsDto()
    {
        var card = new GiftCard { Code = "VALID", RemainingAmount = 100, IsActive = true };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new GetGiftCardBalanceQueryHandler(_repoMock.Object);
        var result = await handler.Handle(new GetGiftCardBalanceQuery { Code = "VALID" }, CancellationToken.None);

        Assert.Equal(100, result.RemainingAmount);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task Redeem_Inactive_ThrowsBadRequestException()
    {
        var card = new GiftCard { Code = "INACTIVE", IsActive = false };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new RedeemGiftCardCommandHandler(_repoMock.Object, _uowMock.Object);
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => handler.Handle(new RedeemGiftCardCommand { Code = "INACTIVE", AmountToRedeem = 50 }, CancellationToken.None));
        Assert.Contains("inactive", ex.Message);
    }

    [Fact]
    public async Task Redeem_Expired_ThrowsBadRequestException()
    {
        var card = new GiftCard { Code = "EXPIRED", IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(-1) };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new RedeemGiftCardCommandHandler(_repoMock.Object, _uowMock.Object);
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => handler.Handle(new RedeemGiftCardCommand { Code = "EXPIRED", AmountToRedeem = 50 }, CancellationToken.None));
        Assert.Contains("expired", ex.Message);
    }

    [Fact]
    public async Task Redeem_InsufficientBalance_ThrowsBadRequestException()
    {
        var card = new GiftCard { Code = "VALID", IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(1), RemainingAmount = 40 };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new RedeemGiftCardCommandHandler(_repoMock.Object, _uowMock.Object);
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => handler.Handle(new RedeemGiftCardCommand { Code = "VALID", AmountToRedeem = 50 }, CancellationToken.None));
        Assert.Contains("Insufficient", ex.Message);
    }

    [Fact]
    public async Task Redeem_Valid_UpdatesBalance()
    {
        var card = new GiftCard { Code = "VALID", IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(1), RemainingAmount = 100 };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new RedeemGiftCardCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new RedeemGiftCardCommand { Code = "VALID", AmountToRedeem = 50 }, CancellationToken.None);

        Assert.Equal(50, result);
        Assert.Equal(50, card.RemainingAmount);
        Assert.True(card.IsActive);
        _repoMock.Verify(r => r.Update(card), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Redeem_ValidZeroRemaining_SetsInactive()
    {
        var card = new GiftCard { Code = "VALID", IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(1), RemainingAmount = 50 };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<GiftCard, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(card);

        var handler = new RedeemGiftCardCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new RedeemGiftCardCommand { Code = "VALID", AmountToRedeem = 50 }, CancellationToken.None);

        Assert.Equal(0, result);
        Assert.Equal(0, card.RemainingAmount);
        Assert.False(card.IsActive);
        _repoMock.Verify(r => r.Update(card), Times.Once);
    }
}
