using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Delete;

public record DeleteServicePlanCommand(Guid Id) : IRequest;

public class DeleteServicePlanCommandValidator : AbstractValidator<DeleteServicePlanCommand>
{
    public DeleteServicePlanCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
