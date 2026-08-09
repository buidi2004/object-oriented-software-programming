using System;

namespace CloudServiceStore.Domain.Events;

public class PaymentConfirmedEvent : IDomainEvent
{
    public Guid PaymentId { get; }
    public Guid OrderId { get; }
    
    public PaymentConfirmedEvent(Guid paymentId, Guid orderId)
    {
        PaymentId = paymentId;
        OrderId = orderId;
    }
}
