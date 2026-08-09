using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;
using CloudServiceStore.Application.Features.Loyalty.Queries.GetMyLoyalty;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Loyalty;

public class LoyaltyCommandHandlerTests
{
    private readonly Mock<IRepository<LoyaltyPoint>> _pointRepoMock = new();
    private readonly Mock<IRepository<LoyaltyTransaction>> _transactionRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    [Fact]
    public async Task GetMyLoyalty_NotExists_ReturnsZero()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _pointRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<LoyaltyPoint, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LoyaltyPoint?)null);

        var handler = new GetMyLoyaltyQueryHandler(_pointRepoMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyLoyaltyQuery(), CancellationToken.None);

        Assert.Equal(0, result.Points);
        Assert.Equal(userId, result.UserId);
    }

    [Fact]
    public async Task GetMyLoyalty_Exists_ReturnsPoints()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var point = new LoyaltyPoint { UserId = userId, Points = 150 };
        _pointRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<LoyaltyPoint, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(point);

        var handler = new GetMyLoyaltyQueryHandler(_pointRepoMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyLoyaltyQuery(), CancellationToken.None);

        Assert.Equal(150, result.Points);
    }

    [Fact]
    public async Task RedeemLoyalty_NotEnoughPoints_ThrowsBadRequestException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var point = new LoyaltyPoint { UserId = userId, Points = 50 };
        _pointRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<LoyaltyPoint, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(point);

        var handler = new RedeemLoyaltyCommandHandler(_pointRepoMock.Object, _transactionRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<BadRequestException>(() => handler.Handle(new RedeemLoyaltyCommand { PointsToRedeem = 100 }, CancellationToken.None));
    }

    [Fact]
    public async Task RedeemLoyalty_ValidRequest_DeductsPointsAndCreatesTransaction()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var point = new LoyaltyPoint { UserId = userId, Points = 150 };
        _pointRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<LoyaltyPoint, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(point);

        var handler = new RedeemLoyaltyCommandHandler(_pointRepoMock.Object, _transactionRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new RedeemLoyaltyCommand { PointsToRedeem = 50 }, CancellationToken.None);

        Assert.True(result);
        Assert.Equal(100, point.Points);
        _pointRepoMock.Verify(r => r.Update(point), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.Is<LoyaltyTransaction>(x => x.Points == -50), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
