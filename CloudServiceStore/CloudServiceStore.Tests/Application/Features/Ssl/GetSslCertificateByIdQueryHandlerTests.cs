using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificateById;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Ssl;

public class GetSslCertificateByIdQueryHandlerTests
{
    private readonly Mock<IRepository<SslCertificate>> _sslRepoMock = new();
    private readonly Mock<IRepository<DomainRecord>> _domainRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private GetSslCertificateByIdQueryHandler CreateHandler() => new(_sslRepoMock.Object, _domainRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_CertificateNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _sslRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SslCertificate?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new GetSslCertificateByIdQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DomainNotOwnedByUser_ThrowsUnauthorizedException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var sslId = Guid.NewGuid();
        var domainId = Guid.NewGuid();
        
        _sslRepoMock.Setup(r => r.GetByIdAsync(sslId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SslCertificate { Id = sslId, DomainId = domainId });
            
        _domainRepoMock.Setup(r => r.GetByIdAsync(domainId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { Id = domainId, UserId = Guid.NewGuid() }); // Owned by someone else

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new GetSslCertificateByIdQuery(sslId), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_ValidRequest_ReturnsCertificate()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var sslId = Guid.NewGuid();
        var domainId = Guid.NewGuid();
        var cert = new SslCertificate { Id = sslId, DomainId = domainId };
        
        _sslRepoMock.Setup(r => r.GetByIdAsync(sslId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cert);
            
        _domainRepoMock.Setup(r => r.GetByIdAsync(domainId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { Id = domainId, UserId = userId }); // Owned by current user

        var result = await CreateHandler().Handle(new GetSslCertificateByIdQuery(sslId), CancellationToken.None);
        
        Assert.NotNull(result);
        Assert.Equal(sslId, result.Id);
    }
}
