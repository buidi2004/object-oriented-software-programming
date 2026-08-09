using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Carts.Commands.AddToCart;

public record AddToCartCommand(Guid ServicePlanId, CloudServiceStore.Domain.Enums.BillingCycle BillingCycle, int Quantity) : IRequest<Guid>;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.ServicePlanId).NotEmpty();
        RuleFor(x => x.BillingCycle).NotEmpty().IsInEnum();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
