using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class TwoFactorBackupCodeCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<IRepository<TwoFactorBackupCode>> _backupCodeRepoMock = new();
    private readonly Mock<IRepository<UserSession>> _sessionRepoMock = new();
    private readonly Mock<IRoleRepository> _roleRepoMock = new();
    private readonly Mock<ITokenGenerator> _tokenGenMock = new();

    private LoginWithRecoveryCodeCommandHandler CreateLoginHandler()
    {
        _uowMock.Setup(u => u.Roles).Returns(_roleRepoMock.Object);
        return new LoginWithRecoveryCodeCommandHandler(
            _userRepoMock.Object,
            _backupCodeRepoMock.Object,
            _sessionRepoMock.Object,
            _tokenGenMock.Object,
            _uowMock.Object);
    }

    [Fact]
    public async Task LoginWithRecoveryCode_WhenCodeIsValid_ShouldSucceedAndMarkAsUsed()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();
        var user = new AppUser("Test User", "test@test.com", "hash", roleId);
        user.EnableTwoFactor("JBSWY3DPEHPK3PXP");

        var rawCode = "A1B2-C3D4";
        var codeHash = TwoFactorBackupCodeHelper.HashCode(rawCode);
        var backupCode = new TwoFactorBackupCode(user.Id, codeHash);

        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync(user);

        _backupCodeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<TwoFactorBackupCode, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<TwoFactorBackupCode, object>>[]>()))
            .ReturnsAsync(backupCode);

        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Name = "Customer" });

        _tokenGenMock.Setup(t => t.GenerateAccessToken(user, "Customer")).Returns("valid-access-token");
        _tokenGenMock.Setup(t => t.GenerateRefreshToken()).Returns("valid-refresh-token");

        var handler = CreateLoginHandler();
        var command = new LoginWithRecoveryCodeCommand("test@test.com", rawCode, "TestDevice");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("valid-access-token");
        backupCode.IsUsed.Should().BeTrue();
        backupCode.UsedAt.Should().NotBeNull();
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginWithRecoveryCode_WhenCodeIsInvalidOrUsed_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var user = new AppUser("Test User", "test@test.com", "hash", roleId);
        user.EnableTwoFactor("JBSWY3DPEHPK3PXP");

        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync(user);

        _backupCodeRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<TwoFactorBackupCode, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<TwoFactorBackupCode, object>>[]>()))
            .ReturnsAsync((TwoFactorBackupCode?)null);

        var handler = CreateLoginHandler();
        var command = new LoginWithRecoveryCodeCommand("test@test.com", "INVALID-CODE", "TestDevice");

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
