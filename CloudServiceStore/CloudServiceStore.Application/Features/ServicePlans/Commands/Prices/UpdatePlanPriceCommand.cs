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

public record UpdatePlanPriceCommand(
    Guid Id,
    Guid ServicePlanId,
    BillingCycle BillingCycle,
    decimal Price,
    string Currency,
    DateTime EffectiveFrom) : IRequest;

public class UpdatePlanPriceCommandValidator : AbstractValidator<UpdatePlanPriceCommand>
{
    public UpdatePlanPriceCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ServicePlanId).NotEmpty();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty();
    }
}

public class UpdatePlanPriceCommandHandler : IRequestHandler<UpdatePlanPriceCommand>
{
    private readonly IRepository<PlanPrice> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePlanPriceCommandHandler(IRepository<PlanPrice> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdatePlanPriceCommand request, CancellationToken cancellationToken)
    {
        var price = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (price == null || price.ServicePlanId != request.ServicePlanId)
            throw new NotFoundException(nameof(PlanPrice), request.Id);

        price.BillingCycle = request.BillingCycle;
        price.Price = request.Price;
        price.Currency = request.Currency;
        price.EffectiveFrom = request.EffectiveFrom;

        _repository.Update(price);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
