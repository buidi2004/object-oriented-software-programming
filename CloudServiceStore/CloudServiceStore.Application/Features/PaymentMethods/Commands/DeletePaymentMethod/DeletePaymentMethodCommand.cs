using System;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;

public class DeletePaymentMethodCommand : IRequest<bool>
{
    public Guid PaymentMethodId { get; set; }
}
