using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ApiKeys;

public class GenerateApiKeyCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<ApiKey>> _apiKeyRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private GenerateApiKeyCommandHandler CreateHandler() => new(_uowMock.Object, _apiKeyRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_NotLoggedIn_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new GenerateApiKeyCommand("read"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsPlaintextKey_SavesHash()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        var result = await CreateHandler().Handle(new GenerateApiKeyCommand("read"), CancellationToken.None);
        
        Assert.NotNull(result);
        Assert.True(result.Length > 20); // Expecting a long key
        
        _apiKeyRepoMock.Verify(r => r.AddAsync(It.IsAny<ApiKey>(), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
