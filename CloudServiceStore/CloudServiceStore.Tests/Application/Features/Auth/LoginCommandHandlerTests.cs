using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class LoginCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<IRepository<UserSession>> _sessionRepoMock = new();
    private readonly Mock<IRepository<LoginHistory>> _historyRepoMock = new();
    private readonly Mock<IRoleRepository> _roleRepoMock = new();
    private readonly Mock<IPasswordHasher> _hasherMock = new();
    private readonly Mock<ITokenGenerator> _tokenGenMock = new();

    private LoginCommandHandler CreateHandler()
    {
        _uowMock.Setup(u => u.Roles).Returns(_roleRepoMock.Object);
        return new LoginCommandHandler(
            _uowMock.Object, _userRepoMock.Object, _sessionRepoMock.Object, 
            _historyRepoMock.Object, _hasherMock.Object, _tokenGenMock.Object);
    }

    [Fact]
    public async Task Handle_UserNotFound_ThrowsUnauthorizedException()
    {
        var command = new LoginCommand("nonexistent@test.com", "pass", "1.1.1.1", "Agent", "Device");
        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), default, It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync((AppUser?)null);

        var handler = CreateHandler();
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_InvalidPassword_LogsHistoryAndThrows()
    {
        var user = new AppUser { Id = Guid.NewGuid(), Email = "a@test.com", PasswordHash = "hash" };
        var command = new LoginCommand("a@test.com", "wrong", "1.1.1.1", "Agent", "Device");
        
        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), default, It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync(user);
        _hasherMock.Setup(h => h.Verify("wrong", "hash")).Returns(false);

        var handler = CreateHandler();
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(command, CancellationToken.None));

        _historyRepoMock.Verify(h => h.AddAsync(It.Is<LoginHistory>(x => !x.IsSuccess), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsTokensAndLogsHistory()
    {
        var roleId = Guid.NewGuid();
        var user = new AppUser { Id = Guid.NewGuid(), Email = "a@test.com", PasswordHash = "hash", IsActive = true, RoleId = roleId };
        var command = new LoginCommand("a@test.com", "correct", "1.1.1.1", "Agent", "Device");
        
        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), default, It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync(user);
        _hasherMock.Setup(h => h.Verify("correct", "hash")).Returns(true);
        _hasherMock.Setup(h => h.Hash("refresh-token-123")).Returns("hashed-refresh-token");

        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, default))
            .ReturnsAsync(new Role { Id = roleId, Name = "Admin" });

        _tokenGenMock.Setup(t => t.GenerateAccessToken(user, "Admin")).Returns("access-token-123");
        _tokenGenMock.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token-123");

        var handler = CreateHandler();
        var result = await handler.Handle(command, CancellationToken.None);

        result.AccessToken.Should().Be("access-token-123");
        result.RefreshToken.Should().Be("refresh-token-123");

        _sessionRepoMock.Verify(s => s.AddAsync(It.Is<UserSession>(x => x.RefreshTokenHash == "hashed-refresh-token" && x.UserId == user.Id), It.IsAny<CancellationToken>()), Times.Once);
        _historyRepoMock.Verify(h => h.AddAsync(It.Is<LoginHistory>(x => x.IsSuccess), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
