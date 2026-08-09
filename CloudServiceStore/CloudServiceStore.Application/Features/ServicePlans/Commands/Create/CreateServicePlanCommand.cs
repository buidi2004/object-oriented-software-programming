using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Create;

public record CreateServicePlanCommand(
    Guid CategoryId, 
    string Name, 
    string? Cpu, 
    string? Ram, 
    string? Ssd, 
    string? Bandwidth, 
    bool IsActive) : IRequest<Guid>;

public class CreateServicePlanCommandValidator : AbstractValidator<CreateServicePlanCommand>
{
    public CreateServicePlanCommandValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
