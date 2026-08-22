using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.ApiKeys.Commands.RevokeApiKey;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ApiKeys;

public class RevokeApiKeyCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<ApiKey>> _apiKeyRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private RevokeApiKeyCommandHandler CreateHandler() => new(_uowMock.Object, _apiKeyRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_KeyNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _apiKeyRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((ApiKey?)null);
        
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new RevokeApiKeyCommand(Guid.NewGuid()), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_KeyNotOwned_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _apiKeyRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new ApiKey { UserId = Guid.NewGuid() });
        
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new RevokeApiKeyCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_RevokesKey()
    {
        var userId = Guid.NewGuid();
        var key = new ApiKey { UserId = userId };
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _apiKeyRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(key);
        
        var result = await CreateHandler().Handle(new RevokeApiKeyCommand(Guid.NewGuid()), CancellationToken.None);
        
        Assert.True(result);
        Assert.NotNull(key.RevokedAt);
        _apiKeyRepoMock.Verify(r => r.Update(key), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
