using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Queries.CheckDomain;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Domains;

public class CheckDomainQueryHandlerTests
{
    private readonly Mock<IRepository<DomainRecord>> _repoMock = new();
    private CheckDomainQueryHandler CreateHandler() => new(_repoMock.Object);

    [Fact]
    public async Task Handle_DomainExists_ReturnsFalse()
    {
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<DomainRecord, object>>[]>()))
            .ReturnsAsync(new DomainRecord());

        var result = await CreateHandler().Handle(new CheckDomainQuery("google.com"), CancellationToken.None);
        
        Assert.False(result); // Already registered, so false
    }

    [Fact]
    public async Task Handle_DomainNotExists_ReturnsTrue()
    {
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<DomainRecord, object>>[]>()))
            .ReturnsAsync((DomainRecord?)null);

        var result = await CreateHandler().Handle(new CheckDomainQuery("my-new-domain.com"), CancellationToken.None);
        
        Assert.True(result); // Available, so true
    }
}
