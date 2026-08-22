using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Uptime;

public class GetOrderUptimeQueryHandlerTests
{
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IRepository<ServiceStatusLog>> _statusRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private GetOrderUptimeQueryHandler CreateHandler() => new(_orderRepoMock.Object, _statusRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderRequest?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new GetOrderUptimeQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotOwnedByUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OrderRequest { UserId = Guid.NewGuid() }); // Owned by different user

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new GetOrderUptimeQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsOrderUptimeLogs()
    {
        var userId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OrderRequest { Id = orderId, UserId = userId }); // Correct owner
            
        _statusRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<ServiceStatusLog, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceStatusLog> { new ServiceStatusLog { OrderRequestId = orderId } });

        var result = await CreateHandler().Handle(new GetOrderUptimeQuery(orderId), CancellationToken.None);
        
        Assert.Single(result);
    }
}
