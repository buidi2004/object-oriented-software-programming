using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Payments.Commands.ConfirmPaymentWebhook;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;
using MediatR;

namespace CloudServiceStore.Tests.Application.Features.Payments;

public class ConfirmPaymentWebhookCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Payment>> _paymentRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();

    private ConfirmPaymentWebhookCommandHandler CreateHandler() =>
        new(_uowMock.Object, _paymentRepoMock.Object, _orderRepoMock.Object, _mediatorMock.Object);

    [Fact]
    public async Task Handle_IdempotencyKeyValid_UpdatesPaymentAndPublishesEvent()
    {
        var payment = new Payment { Id = Guid.NewGuid(), OrderId = Guid.NewGuid(), IdempotencyKey = "KEY", Status = PaymentStatus.Pending };
        var order = new OrderRequest { Id = payment.OrderId, Status = OrderStatus.Pending };

        _paymentRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Payment, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Payment, object>>[]>()))
            .ReturnsAsync(payment);
        _orderRepoMock.Setup(r => r.GetByIdAsync(payment.OrderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        await CreateHandler().Handle(new ConfirmPaymentWebhookCommand("KEY"), CancellationToken.None);

        Assert.Equal(PaymentStatus.Confirmed, payment.Status);
        Assert.Equal(OrderStatus.Paid, order.Status);
        _paymentRepoMock.Verify(r => r.Update(payment), Times.Once);
        _orderRepoMock.Verify(r => r.Update(order), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mediatorMock.Verify(m => m.Publish(It.IsAny<PaymentConfirmedEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PaymentAlreadyConfirmed_DoesNothing_Idempotent()
    {
        var payment = new Payment { Id = Guid.NewGuid(), OrderId = Guid.NewGuid(), IdempotencyKey = "KEY", Status = PaymentStatus.Confirmed };

        _paymentRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Payment, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Payment, object>>[]>()))
            .ReturnsAsync(payment);

        await CreateHandler().Handle(new ConfirmPaymentWebhookCommand("KEY"), CancellationToken.None);

        _paymentRepoMock.Verify(r => r.Update(It.IsAny<Payment>()), Times.Never);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        _mediatorMock.Verify(m => m.Publish(It.IsAny<PaymentConfirmedEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
