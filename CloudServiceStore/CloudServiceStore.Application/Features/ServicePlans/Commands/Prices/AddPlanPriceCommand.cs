using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Exceptions;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Prices;

public record AddPlanPriceCommand(
    Guid ServicePlanId,
    BillingCycle BillingCycle,
    decimal Price,
    string Currency,
    DateTime EffectiveFrom) : IRequest<Guid>;

public class AddPlanPriceCommandValidator : AbstractValidator<AddPlanPriceCommand>
{
    public AddPlanPriceCommandValidator()
    {
        RuleFor(x => x.ServicePlanId).NotEmpty();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty();
    }
}

public class AddPlanPriceCommandHandler : IRequestHandler<AddPlanPriceCommand, Guid>
{
    private readonly IRepository<ServicePlan> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AddPlanPriceCommandHandler(IRepository<ServicePlan> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddPlanPriceCommand request, CancellationToken cancellationToken)
    {
        var plan = await _repository.GetByIdAsync(request.ServicePlanId, cancellationToken, p => p.Prices);
        if (plan == null)
            throw new NotFoundException(nameof(ServicePlan), request.ServicePlanId);

        var price = new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = request.ServicePlanId,
            BillingCycle = request.BillingCycle,
            Price = request.Price,
            Currency = request.Currency,
            EffectiveFrom = request.EffectiveFrom
        };

        plan.AddPrice(price);
        _repository.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return price.Id;
    }
}
