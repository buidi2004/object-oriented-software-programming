using System;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Commands.SavePaymentMethod;

public class SavePaymentMethodCommand : IRequest<Guid>
{
    public string Gateway { get; set; } = null!;
    public string MaskedInfo { get; set; } = null!;
    public bool IsDefault { get; set; } = false;
}
