using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Ssl;

public class RequestSslCertificateCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<DomainRecord>> _domainRepoMock = new();
    private readonly Mock<IRepository<SslCertificate>> _sslRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly Mock<IResourceProvisioningQueue> _taskQueueMock = new();

    private RequestSslCertificateCommandHandler CreateHandler() => new(_uowMock.Object, _domainRepoMock.Object, _sslRepoMock.Object, _currentUserMock.Object, _taskQueueMock.Object);

    [Fact]
    public async Task Handle_DomainNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DomainRecord?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new RequestSslCertificateCommand(Guid.NewGuid(), "CSR", Guid.NewGuid().ToString()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DomainNotOwnedByUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { UserId = Guid.NewGuid() }); // Different owner

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new RequestSslCertificateCommand(Guid.NewGuid(), "CSR", Guid.NewGuid().ToString()), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_ValidRequest_RequestsCertificate()
    {
        var userId = Guid.NewGuid();
        var domainId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        _domainRepoMock.Setup(r => r.GetByIdAsync(domainId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { Id = domainId, UserId = userId });

        var result = await CreateHandler().Handle(new RequestSslCertificateCommand(domainId, "MY_CSR", Guid.NewGuid().ToString()), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _sslRepoMock.Verify(r => r.AddAsync(It.Is<SslCertificate>(s => s.DomainId == domainId && s.Csr == "MY_CSR"), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(1));
        _taskQueueMock.Verify(q => q.QueueBackgroundWorkItemAsync(It.IsAny<Func<IServiceProvider, CancellationToken, ValueTask>>()), Times.Once);
    }
}
