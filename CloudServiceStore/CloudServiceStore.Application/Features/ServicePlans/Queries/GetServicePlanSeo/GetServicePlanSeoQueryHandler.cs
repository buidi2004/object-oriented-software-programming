using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanSeo;

public class GetServicePlanSeoQueryHandler : IRequestHandler<GetServicePlanSeoQuery, ServicePlanSeoDto>
{
    private readonly IRepository<ServicePlan> _servicePlanRepo;

    public GetServicePlanSeoQueryHandler(IRepository<ServicePlan> servicePlanRepo)
    {
        _servicePlanRepo = servicePlanRepo;
    }

    public async Task<ServicePlanSeoDto> Handle(GetServicePlanSeoQuery request, CancellationToken cancellationToken)
    {
        var plan = await _servicePlanRepo.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null)
            return new ServicePlanSeoDto();

        return new ServicePlanSeoDto
        {
            Id = plan.Id,
            MetaTitle = plan.MetaTitle,
            MetaDescription = plan.MetaDescription,
            Keywords = plan.Keywords,
            OpenGraphImage = plan.OpenGraphImage
        };
    }
}
