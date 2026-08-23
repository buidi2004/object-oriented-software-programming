using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Common;
using CloudServiceStore.Application.Features.Auth.Commands.ForgotPassword;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class ForgotPasswordCommandHandlerTests
{
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<IRepository<PasswordResetToken>> _tokenRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ITokenGenerator> _tokenGenMock = new();
    private readonly Mock<IEmailService> _emailMock = new();
    private readonly Mock<IPasswordHasher> _hasherMock = new();

    private ForgotPasswordCommandHandler CreateHandler() =>
        new(_userRepoMock.Object, _tokenRepoMock.Object, _uowMock.Object,
            _tokenGenMock.Object, _emailMock.Object, _hasherMock.Object,
            Options.Create(new FrontendSettings { BaseUrl = "https://app.test" }));

    [Fact]
    public async Task Handle_UnknownEmail_ReturnsNotFoundWithoutSendingEmail()
    {
        _userRepoMock
            .Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync((AppUser?)null);

        var result = await CreateHandler().Handle(new ForgotPasswordCommand("missing@test.com"), CancellationToken.None);

        result.Success.Should().BeFalse();
        result.UserFound.Should().BeFalse();
        result.Message.Should().Contain("Không tìm thấy");
        _emailMock.Verify(e => e.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()), Times.Never);
        _tokenRepoMock.Verify(r => r.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_KnownEmail_CreatesTokenAndSendsEmail()
    {
        var user = new AppUser { Id = Guid.NewGuid(), Email = "user@test.com", FullName = "User" };
        _userRepoMock
            .Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync(user);
        _tokenGenMock.Setup(t => t.GenerateRefreshToken()).Returns("plain-reset-token");
        _hasherMock.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed-pass");

        var result = await CreateHandler().Handle(new ForgotPasswordCommand("user@test.com"), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.UserFound.Should().BeTrue();
        _tokenRepoMock.Verify(r => r.AddAsync(It.Is<PasswordResetToken>(t =>
            t.UserId == user.Id && t.TokenHash == ResetTokenHasher.Hash("plain-reset-token") && !t.IsUsed), It.IsAny<CancellationToken>()), Times.Once);
        _emailMock.Verify(e => e.SendPasswordResetEmailAsync(
            "user@test.com",
            "https://app.test/reset-password?token=plain-reset-token",
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
