using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Domains;

public class AddDnsRecordCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<DomainRecord>> _domainRepoMock = new();
    private readonly Mock<IRepository<DnsRecord>> _dnsRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private AddDnsRecordCommandHandler CreateHandler() => new(_uowMock.Object, _domainRepoMock.Object, _dnsRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_DomainNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DomainRecord)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new AddDnsRecordCommand(Guid.NewGuid(), "A", "@", "1.1.1.1", 3600), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DomainNotOwnedByUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { UserId = Guid.NewGuid() }); // Different owner

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new AddDnsRecordCommand(Guid.NewGuid(), "A", "@", "1.1.1.1", 3600), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_AddsRecord()
    {
        var userId = Guid.NewGuid();
        var domainId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _domainRepoMock.Setup(r => r.GetByIdAsync(domainId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { Id = domainId, UserId = userId });

        var result = await CreateHandler().Handle(new AddDnsRecordCommand(domainId, "A", "@", "1.1.1.1", 3600), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _dnsRepoMock.Verify(r => r.AddAsync(It.Is<DnsRecord>(d => d.DomainId == domainId && d.Type == "A"), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
