using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Affiliates.Commands.CreateApplication;

public record CreateAffiliateApplicationCommand(string CompanyName, decimal CommissionRate) : IRequest<Guid>;

public class CreateAffiliateApplicationCommandValidator : AbstractValidator<CreateAffiliateApplicationCommand>
{
    public CreateAffiliateApplicationCommandValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CommissionRate).GreaterThan(0).LessThanOrEqualTo(100);
    }
}
