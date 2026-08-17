using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Exceptions;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Prices;

public record DeletePlanPriceCommand(Guid Id, Guid ServicePlanId) : IRequest;

public class DeletePlanPriceCommandValidator : AbstractValidator<DeletePlanPriceCommand>
{
    public DeletePlanPriceCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ServicePlanId).NotEmpty();
    }
}

public class DeletePlanPriceCommandHandler : IRequestHandler<DeletePlanPriceCommand>
{
    private readonly IRepository<PlanPrice> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePlanPriceCommandHandler(IRepository<PlanPrice> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeletePlanPriceCommand request, CancellationToken cancellationToken)
    {
        var price = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (price == null || price.ServicePlanId != request.ServicePlanId)
            throw new NotFoundException(nameof(PlanPrice), request.Id);

        _repository.Delete(price);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
