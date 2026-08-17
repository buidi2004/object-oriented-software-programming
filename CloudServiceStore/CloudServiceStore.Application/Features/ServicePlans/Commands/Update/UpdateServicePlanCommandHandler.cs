using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Update;

public class UpdateServicePlanCommandHandler : IRequestHandler<UpdateServicePlanCommand>
{
    private readonly IRepository<ServicePlan> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServicePlanCommandHandler(IRepository<ServicePlan> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateServicePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _repository.GetByIdAsync(request.Id);
        if (plan == null)
            throw new NotFoundException(nameof(ServicePlan), request.Id);

        plan.UpdateDetails(request.Name, request.Cpu, request.Ram, request.Ssd, request.Bandwidth, request.ImageUrl);
        
        _repository.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
