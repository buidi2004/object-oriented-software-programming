using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;

public record CreatePromotionCommand(Guid? ServicePlanId, decimal DiscountPercent, DateTime StartDate, DateTime EndDate) : IRequest<Guid>;

public class CreatePromotionCommandValidator : AbstractValidator<CreatePromotionCommand>
{
    public CreatePromotionCommandValidator()
    {
        RuleFor(x => x.DiscountPercent).GreaterThan(0).LessThanOrEqualTo(100);
    }
}
