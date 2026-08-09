using System;

namespace CloudServiceStore.Domain.Events;

public class OrderCreatedEvent : IDomainEvent
{
    public Guid OrderId { get; }
    
    public OrderCreatedEvent(Guid orderId)
    {
        OrderId = orderId;
    }
}
