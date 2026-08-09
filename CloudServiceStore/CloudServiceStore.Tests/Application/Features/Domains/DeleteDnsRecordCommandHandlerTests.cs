using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Domains.Commands.DeleteDnsRecord;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Domains;

public class DeleteDnsRecordCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<DomainRecord>> _domainRepoMock = new();
    private readonly Mock<IRepository<DnsRecord>> _dnsRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private DeleteDnsRecordCommandHandler CreateHandler() => new(_uowMock.Object, _domainRepoMock.Object, _dnsRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_DomainNotOwnedByUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { UserId = Guid.NewGuid() }); // Different owner

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new DeleteDnsRecordCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_RecordNotFound_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _domainRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { UserId = userId }); // Owned by user
        
        _dnsRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DnsRecord)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new DeleteDnsRecordCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_DeletesRecord()
    {
        var userId = Guid.NewGuid();
        var domainId = Guid.NewGuid();
        var recordId = Guid.NewGuid();
        
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _domainRepoMock.Setup(r => r.GetByIdAsync(domainId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord { Id = domainId, UserId = userId });
            
        var record = new DnsRecord { Id = recordId, DomainId = domainId };
        _dnsRepoMock.Setup(r => r.GetByIdAsync(recordId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(record);

        await CreateHandler().Handle(new DeleteDnsRecordCommand(domainId, recordId), CancellationToken.None);

        _dnsRepoMock.Verify(r => r.Delete(record), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
