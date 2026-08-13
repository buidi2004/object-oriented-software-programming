using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Common;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class ResetPasswordCommandHandlerTests
{
    private readonly Mock<IRepository<PasswordResetToken>> _tokenRepoMock = new();
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IPasswordHasher> _hasherMock = new();

    private ResetPasswordCommandHandler CreateHandler() =>
        new(_tokenRepoMock.Object, _userRepoMock.Object, _uowMock.Object, _hasherMock.Object);

    [Fact]
    public async Task Handle_InvalidToken_ThrowsBadRequestException()
    {
        _tokenRepoMock
            .Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<PasswordResetToken, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken?)null);

        var act = () => CreateHandler().Handle(new ResetPasswordCommand("bad-token", "NewPass123!"), CancellationToken.None);

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task Handle_ExpiredToken_ThrowsBadRequestException()
    {
        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TokenHash = ResetTokenHasher.Hash("expired"),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1),
            IsUsed = false
        };

        _tokenRepoMock
            .Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<PasswordResetToken, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(token);

        var act = () => CreateHandler().Handle(new ResetPasswordCommand("expired", "NewPass123!"), CancellationToken.None);

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task Handle_ValidToken_UpdatesPasswordAndMarksTokenUsed()
    {
        var userId = Guid.NewGuid();
        var user = new AppUser { Id = userId, Email = "user@test.com", PasswordHash = "old-hash" };
        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = ResetTokenHasher.Hash("valid-token"),
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        _hasherMock.Setup(h => h.Hash("NewPass123!")).Returns("new-hash");
        _tokenRepoMock
            .Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<PasswordResetToken, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(token);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        await CreateHandler().Handle(new ResetPasswordCommand("valid-token", "NewPass123!"), CancellationToken.None);

        user.PasswordHash.Should().Be("new-hash");
        token.IsUsed.Should().BeTrue();
        _userRepoMock.Verify(r => r.Update(user), Times.Once);
        _tokenRepoMock.Verify(r => r.Update(token), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
