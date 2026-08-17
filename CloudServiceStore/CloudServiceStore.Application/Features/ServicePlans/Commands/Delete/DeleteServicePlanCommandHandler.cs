using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Delete;

public class DeleteServicePlanCommandHandler : IRequestHandler<DeleteServicePlanCommand>
{
    private readonly IRepository<ServicePlan> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServicePlanCommandHandler(IRepository<ServicePlan> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteServicePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _repository.GetByIdAsync(request.Id);
        if (plan == null)
            throw new NotFoundException(nameof(ServicePlan), request.Id);

        // Soft delete by deactivating
        plan.Deactivate();
        
        _repository.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
