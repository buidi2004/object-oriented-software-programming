using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo;

public class UpdateSeoCommandHandler : IRequestHandler<UpdateSeoCommand>
{
    private readonly IRepository<ServicePlan> _servicePlanRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICatalogCache _catalogCache;

    public UpdateSeoCommandHandler(
        IRepository<ServicePlan> servicePlanRepo,
        IUnitOfWork unitOfWork,
        ICatalogCache catalogCache)
    {
        _servicePlanRepo = servicePlanRepo;
        _unitOfWork = unitOfWork;
        _catalogCache = catalogCache;
    }

    public async Task Handle(UpdateSeoCommand command, CancellationToken cancellationToken)
    {
        var plan = await _servicePlanRepo.GetByIdAsync(command.Id, cancellationToken);
        if (plan == null)
            throw new CloudServiceStore.Application.Exceptions.NotFoundException(nameof(ServicePlan), command.Id);

        plan.UpdateSeo(command.MetaTitle, command.MetaDescription, command.Keywords, command.OpenGraphImage);
        _servicePlanRepo.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _catalogCache.InvalidateCatalogAsync(cancellationToken);
    }
}
