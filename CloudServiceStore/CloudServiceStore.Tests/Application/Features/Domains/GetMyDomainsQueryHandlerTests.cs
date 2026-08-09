using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Domains.Queries.GetMyDomains;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Domains;

public class GetMyDomainsQueryHandlerTests
{
    private readonly Mock<IRepository<DomainRecord>> _repoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private GetMyDomainsQueryHandler CreateHandler() => new(_repoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_Unauthenticated_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new GetMyDomainsQuery(), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Authenticated_ReturnsUserDomains()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var domains = new List<DomainRecord> { new() { Id = Guid.NewGuid(), Name = "test.com", UserId = userId } };
        _repoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(domains);

        var result = await CreateHandler().Handle(new GetMyDomainsQuery(), CancellationToken.None);
        Assert.Single(result);
    }
}
