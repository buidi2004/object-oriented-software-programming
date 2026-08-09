using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;
using CloudServiceStore.Application.Features.Referrals.Queries.GetMyReferral;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Referrals;

public class ReferralCommandHandlerTests
{
    private readonly Mock<IRepository<ReferralCode>> _codeRepoMock = new();
    private readonly Mock<IRepository<ReferralReward>> _rewardRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    // ---- GetMyReferral ----

    [Fact]
    public async Task GetMyReferral_NoCodeExists_CreatesNewCode()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReferralCode?)null);

        var handler = new GetMyReferralQueryHandler(_codeRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyReferralQuery(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.StartsWith("REF-", result.Code);
        _codeRepoMock.Verify(r => r.AddAsync(It.IsAny<ReferralCode>(), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetMyReferral_CodeExists_ReturnsExistingCode()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var existing = new ReferralCode { Id = Guid.NewGuid(), UserId = userId, Code = "REF-12345678" };
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var handler = new GetMyReferralQueryHandler(_codeRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyReferralQuery(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("REF-12345678", result.Code);
        _codeRepoMock.Verify(r => r.AddAsync(It.IsAny<ReferralCode>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ---- ApplyReferralCode ----

    [Fact]
    public async Task ApplyCode_InvalidCode_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReferralCode?)null);

        var handler = new ApplyReferralCodeCommandHandler(_codeRepoMock.Object, _rewardRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new ApplyReferralCodeCommand { Code = "INVALID" }, CancellationToken.None));
    }

    [Fact]
    public async Task ApplyCode_OwnCode_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var code = new ReferralCode { Id = Guid.NewGuid(), UserId = userId, Code = "MY-CODE" };
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(code);

        var handler = new ApplyReferralCodeCommandHandler(_codeRepoMock.Object, _rewardRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(new ApplyReferralCodeCommand { Code = "MY-CODE" }, CancellationToken.None));
        Assert.Contains("own referral code", ex.Message);
    }

    [Fact]
    public async Task ApplyCode_AlreadyApplied_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var code = new ReferralCode { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Code = "OTHER-CODE" };
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(code);
        
        var reward = new ReferralReward();
        _rewardRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralReward, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(reward);

        var handler = new ApplyReferralCodeCommandHandler(_codeRepoMock.Object, _rewardRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(new ApplyReferralCodeCommand { Code = "OTHER-CODE" }, CancellationToken.None));
        Assert.Contains("already applied", ex.Message);
    }

    [Fact]
    public async Task ApplyCode_ValidRequest_CreatesPendingReward()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var code = new ReferralCode { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Code = "OTHER-CODE" };
        _codeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralCode, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(code);
        
        _rewardRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ReferralReward, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReferralReward?)null);

        var handler = new ApplyReferralCodeCommandHandler(_codeRepoMock.Object, _rewardRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new ApplyReferralCodeCommand { Code = "OTHER-CODE" }, CancellationToken.None);

        Assert.True(result);
        _rewardRepoMock.Verify(r => r.AddAsync(It.Is<ReferralReward>(x => x.ReferredUserId == userId && x.Status == "Pending"), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
