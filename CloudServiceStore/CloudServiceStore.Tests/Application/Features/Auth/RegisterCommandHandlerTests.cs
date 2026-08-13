using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<AppUser>> _userRepoMock = new();
    private readonly Mock<IRepository<NewsletterSubscriber>> _newsletterRepoMock = new();
    private readonly Mock<IRoleRepository> _roleRepoMock = new();
    private readonly Mock<IPasswordHasher> _hasherMock = new();

    private RegisterCommandHandler CreateHandler()
    {
        _uowMock.Setup(u => u.Roles).Returns(_roleRepoMock.Object);
        return new RegisterCommandHandler(_uowMock.Object, _userRepoMock.Object, _newsletterRepoMock.Object, _hasherMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesUserWithHashedPassword()
    {
        var command = new RegisterCommand("Nguyễn Văn A", "a@test.com", "Password123", null);
        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AppUser?)null);
            
        _roleRepoMock.Setup(r => r.GetIdByNameAsync("Customer", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());
            
        _hasherMock.Setup(h => h.Hash("Password123")).Returns("hashed_password");

        var handler = CreateHandler();
        var result = await handler.Handle(command, CancellationToken.None);

        result.Email.Should().Be("a@test.com");
        _userRepoMock.Verify(r => r.AddAsync(
            It.Is<AppUser>(u => u.PasswordHash == "hashed_password"), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EmailAlreadyExists_ThrowsConflictException()
    {
        var command = new RegisterCommand("Nguyễn Văn A", "a@test.com", "Password123", null);
        _userRepoMock.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AppUser { Email = "a@test.com" });

        var handler = CreateHandler();

        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, CancellationToken.None));
    }
}
