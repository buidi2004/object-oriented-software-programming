using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.RefundRequests.Commands.CreateRefundRequest;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.RefundRequests;

public class CreateRefundRequestCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<RefundRequest>> _refundRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private CreateRefundRequestCommandHandler CreateHandler() => new(_uowMock.Object, _refundRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((OrderRequest?)null);
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new CreateRefundRequestCommand(Guid.NewGuid(), "Bad service", 10), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_OrderNotPaid_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Pending };
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        var ex = await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new CreateRefundRequestCommand(order.Id, "Bad service", 10), CancellationToken.None));
        Assert.Contains("Paid", ex.Message);
    }
    
    [Fact]
    public async Task Handle_AlreadyPending_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Paid };
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        
        _refundRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<RefundRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RefundRequest> { new RefundRequest() });
            
        var ex = await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new CreateRefundRequestCommand(order.Id, "Bad service", 10), CancellationToken.None));
        Assert.Contains("đang chờ xử lý", ex.Message);
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesRequest()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Paid };
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        
        _refundRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<RefundRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RefundRequest>());

        var result = await CreateHandler().Handle(new CreateRefundRequestCommand(order.Id, "Bad service", 10), CancellationToken.None);
        
        Assert.NotEqual(Guid.Empty, result);
        _refundRepoMock.Verify(r => r.AddAsync(It.IsAny<RefundRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
