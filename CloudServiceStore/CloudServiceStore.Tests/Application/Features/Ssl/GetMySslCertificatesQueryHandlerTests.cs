using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Ssl.Queries.GetMySslCertificates;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Ssl;

public class GetMySslCertificatesQueryHandlerTests
{
    private readonly Mock<IRepository<SslCertificate>> _sslRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private GetMySslCertificatesQueryHandler CreateHandler() => new(_sslRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_Unauthenticated_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new GetMySslCertificatesQuery(), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_Authenticated_ReturnsCertificates()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        _sslRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<SslCertificate, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<SslCertificate> { new SslCertificate() });

        var result = await CreateHandler().Handle(new GetMySslCertificatesQuery(), CancellationToken.None);
        Assert.Single(result);
    }
}
