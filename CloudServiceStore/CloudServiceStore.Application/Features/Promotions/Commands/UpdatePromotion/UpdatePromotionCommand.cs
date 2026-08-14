using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.UpdatePromotion;

public record UpdatePromotionCommand(Guid Id, Guid? ServicePlanId, decimal DiscountPercent, DateTime StartDate, DateTime EndDate) : IRequest;

public class UpdatePromotionCommandValidator : AbstractValidator<UpdatePromotionCommand>
{
    public UpdatePromotionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.DiscountPercent).GreaterThan(0).LessThanOrEqualTo(100);
    }
}
