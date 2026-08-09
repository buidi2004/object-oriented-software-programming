using System;
using MediatR;

namespace CloudServiceStore.Application.Events;

public record PaymentConfirmedEvent(Guid PaymentId, Guid OrderRequestId) : INotification;
