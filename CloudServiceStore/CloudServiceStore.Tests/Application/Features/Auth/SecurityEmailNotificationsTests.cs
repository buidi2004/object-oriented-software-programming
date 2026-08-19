using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class SecurityEmailNotificationsTests
{
    [Fact]
    public async Task ResetPassword_WhenSuccessful_MustDispatchSecurityAlertEmail()
    {
        // Arrange
        var tokenRepoMock = new Mock<IRepository<PasswordResetToken>>();
        var userRepoMock = new Mock<IRepository<AppUser>>();
        var uowMock = new Mock<IUnitOfWork>();
        var hasherMock = new Mock<IPasswordHasher>();
        var emailServiceMock = new Mock<IEmailService>();

        var rawToken = "my-valid-reset-token-string";
        var tokenHash = CloudServiceStore.Application.Common.ResetTokenHasher.Hash(rawToken);
        var userId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var user = new AppUser("Nguyễn Văn A", "customer@example.com", "old_hash", Guid.NewGuid());

        tokenRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PasswordResetToken, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);
        userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        hasherMock.Setup(h => h.Hash("NewPassword123")).Returns("new_hash");

        var handler = new ResetPasswordCommandHandler(
            tokenRepoMock.Object,
            userRepoMock.Object,
            uowMock.Object,
            hasherMock.Object,
            emailServiceMock.Object);

        // Act
        var result = await handler.Handle(new ResetPasswordCommand(rawToken, "NewPassword123"), CancellationToken.None);

        // Assert
        result.Should().Be(MediatR.Unit.Value);
        emailServiceMock.Verify(e => e.SendPasswordChangedSecurityAlertAsync(
            "customer@example.com", 
            "Nguyễn Văn A", 
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterUser_WhenSuccessful_MustDispatchWelcomeEmail()
    {
        // Arrange
        var uowMock = new Mock<IUnitOfWork>();
        var userRepoMock = new Mock<IRepository<AppUser>>();
        var newsletterRepoMock = new Mock<IRepository<NewsletterSubscriber>>();
        var roleRepoMock = new Mock<IRoleRepository>();
        var hasherMock = new Mock<IPasswordHasher>();
        var emailServiceMock = new Mock<IEmailService>();

        uowMock.Setup(u => u.Roles).Returns(roleRepoMock.Object);
        roleRepoMock.Setup(r => r.GetIdByNameAsync("Customer", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());
        hasherMock.Setup(h => h.Hash("Password123")).Returns("hashed_pwd");

        var handler = new RegisterCommandHandler(
            uowMock.Object,
            userRepoMock.Object,
            newsletterRepoMock.Object,
            hasherMock.Object,
            emailServiceMock.Object);

        // Act
        var result = await handler.Handle(new RegisterCommand("Trần Thị B", "b@example.com", "Password123", null), CancellationToken.None);

        // Assert
        result.Email.Should().Be("b@example.com");
        emailServiceMock.Verify(e => e.SendWelcomeEmailAsync(
            "b@example.com", 
            "Trần Thị B", 
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
