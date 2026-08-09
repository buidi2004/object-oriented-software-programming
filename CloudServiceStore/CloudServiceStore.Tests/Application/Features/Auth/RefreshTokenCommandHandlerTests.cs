using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.RefreshToken;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Security;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class RefreshTokenCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<UserSession>> _sessionRepoMock = new();
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<ITokenGenerator> _tokenGenMock = new();
    private readonly Mock<IRoleRepository> _roleRepoMock = new();

    private RefreshTokenCommandHandler CreateHandler()
    {
        _uowMock.Setup(u => u.Roles).Returns(_roleRepoMock.Object);
        return new RefreshTokenCommandHandler(_uowMock.Object, _sessionRepoMock.Object, _userRepoMock.Object, _tokenGenMock.Object);
    }

    [Fact]
    public async Task Handle_ValidToken_RotatesTokenAndReturnsNewPair()
    {
        var userId = Guid.NewGuid();
        var session = new UserSession
        {
            Id = Guid.NewGuid(), UserId = userId,
            RefreshTokenHash = RefreshTokenHasher.Hash("old-token"),
            IsRevoked = false, ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        var roleId = Guid.NewGuid();
        var user = new AppUser { Id = userId, Email = "a@test.com", RoleId = roleId };

        _sessionRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<UserSession, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        
        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = roleId, Name = "Customer" });
            
        _tokenGenMock.Setup(t => t.GenerateAccessToken(user, "Customer")).Returns("new-access");
        _tokenGenMock.Setup(t => t.GenerateRefreshToken()).Returns("new-refresh");

        var result = await CreateHandler().Handle(new RefreshTokenCommand("old-token"), CancellationToken.None);

        result.AccessToken.Should().Be("new-access");
        session.IsRevoked.Should().BeTrue();
        _sessionRepoMock.Verify(r => r.AddAsync(
            It.Is<UserSession>(s => s.UserId == userId && !s.IsRevoked), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RevokedTokenReused_RevokesAllSessions_TheftDetection()
    {
        var userId = Guid.NewGuid();
        var revokedSession = new UserSession { UserId = userId, RefreshTokenHash = RefreshTokenHasher.Hash("stolen-token"), IsRevoked = true };
        var otherActiveSession = new UserSession { UserId = userId, IsRevoked = false };

        _sessionRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<UserSession, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(revokedSession);
        _sessionRepoMock.Setup(r => r.WhereAsync(
                It.IsAny<Expression<Func<UserSession, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserSession> { otherActiveSession });

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => CreateHandler().Handle(new RefreshTokenCommand("stolen-token"), CancellationToken.None));

        otherActiveSession.IsRevoked.Should().BeTrue();
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task Handle_TokenNotFound_ThrowsUnauthorized()
    {
        _sessionRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<UserSession, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSession?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => CreateHandler().Handle(new RefreshTokenCommand("unknown"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ExpiredToken_ThrowsUnauthorized()
    {
        var session = new UserSession { UserId = Guid.NewGuid(), RefreshTokenHash = RefreshTokenHasher.Hash("expired"), IsRevoked = false, ExpiresAt = DateTime.UtcNow.AddDays(-1) };
        _sessionRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<UserSession, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => CreateHandler().Handle(new RefreshTokenCommand("expired"), CancellationToken.None));
    }
}
