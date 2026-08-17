using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Update;

public record UpdateServicePlanCommand(
    Guid Id,
    string Name,
    string? Cpu,
    string? Ram,
    string? Ssd,
    string? Bandwidth,
    string? ImageUrl) : IRequest;

public class UpdateServicePlanCommandValidator : AbstractValidator<UpdateServicePlanCommand>
{
    public UpdateServicePlanCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
