using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Carts.Commands.AddToCart;

public record AddToCartCommand(Guid ServicePlanId, string BillingCycle, int Quantity) : IRequest<Guid>;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.ServicePlanId).NotEmpty();
        RuleFor(x => x.BillingCycle).NotEmpty().Must(x => x == "Monthly" || x == "Yearly");
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
