using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.RefundRequests.Commands.ApproveRefundRequest;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.RefundRequests;

public class ApproveRefundRequestCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<RefundRequest>> _refundRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IRepository<Domain.Entities.Wallet>> _walletRepoMock = new();

    private ApproveRefundRequestCommandHandler CreateHandler() => new(_uowMock.Object, _refundRepoMock.Object, _orderRepoMock.Object, _walletRepoMock.Object);

    [Fact]
    public async Task Handle_RefundNotFound_ThrowsNotFoundException()
    {
        _refundRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<RefundRequest, object>>[]>())).ReturnsAsync((RefundRequest?)null);
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new ApproveRefundRequestCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_ApprovesRefundAndCancelsOrder()
    {
        var refundId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var refund = new RefundRequest { Id = refundId, OrderId = orderId, UserId = userId, Status = RefundStatus.Pending, Amount = 50 };
        var order = new OrderRequest { Id = orderId, UserId = userId, Status = OrderStatus.Paid, TotalAmount = 50 };
        var wallet = new Domain.Entities.Wallet(userId);
        wallet.Deposit(100);

        _refundRepoMock.Setup(r => r.GetByIdAsync(refundId, It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<RefundRequest, object>>[]>())).ReturnsAsync(refund);
        _orderRepoMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<OrderRequest, object>>[]>())).ReturnsAsync(order);
        _walletRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Domain.Entities.Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Wallet> { wallet });

        var result = await CreateHandler().Handle(new ApproveRefundRequestCommand(refundId), CancellationToken.None);

        Assert.True(result);
        Assert.Equal(RefundStatus.Approved, refund.Status);
        Assert.Equal(OrderStatus.Refunded, order.Status);
        Assert.Equal(150, wallet.Balance); // 100 + 50

        _refundRepoMock.Verify(r => r.Update(refund), Times.Once);
        _orderRepoMock.Verify(r => r.Update(order), Times.Once);
        _walletRepoMock.Verify(r => r.Update(wallet), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
