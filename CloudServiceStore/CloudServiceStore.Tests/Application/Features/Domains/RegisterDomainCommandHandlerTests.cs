using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Domains;

public class RegisterDomainCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<DomainRecord>> _domainRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    
    private RegisterDomainCommandHandler CreateHandler() => new(_uowMock.Object, _domainRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_DomainAlreadyRegistered_ThrowsConflictException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DomainRecord());

        await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new RegisterDomainCommand("test.com", Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotPaid_ThrowsConflictException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _domainRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DomainRecord)null);

        var order = new OrderRequest { Status = OrderStatus.Pending }; // Not Paid
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new RegisterDomainCommand("test.com", Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_RegistersDomainAndSaves()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _domainRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DomainRecord)null);

        var order = new OrderRequest { Id = Guid.NewGuid(), Status = OrderStatus.Paid, UserId = userId };
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var result = await CreateHandler().Handle(new RegisterDomainCommand("test.com", order.Id), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _domainRepoMock.Verify(r => r.AddAsync(It.Is<DomainRecord>(d => d.Name == "test.com" && d.Status == DomainStatus.Active && d.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
