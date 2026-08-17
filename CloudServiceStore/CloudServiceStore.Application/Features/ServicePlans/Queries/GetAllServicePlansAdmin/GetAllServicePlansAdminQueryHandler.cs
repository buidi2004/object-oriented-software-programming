using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetAllServicePlansAdmin;

public class GetAllServicePlansAdminQueryHandler : IRequestHandler<GetAllServicePlansAdminQuery, IReadOnlyList<ServicePlanAdminDto>>
{
    private readonly IRepository<ServicePlan> _servicePlanRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;

    public GetAllServicePlansAdminQueryHandler(IRepository<ServicePlan> servicePlanRepo, IRepository<ServiceCategory> categoryRepo)
    {
        _servicePlanRepo = servicePlanRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<IReadOnlyList<ServicePlanAdminDto>> Handle(GetAllServicePlansAdminQuery request, CancellationToken cancellationToken)
    {
        var plans = await _servicePlanRepo.GetAllAsync(cancellationToken);
        var categories = await _categoryRepo.GetAllAsync(cancellationToken);
        var catDict = categories.ToDictionary(c => c.Id, c => c.Name);

        return plans.Select(p => new ServicePlanAdminDto
        {
            ServicePlanId = p.Id,
            ServicePlanName = p.Name,
            CategoryId = p.CategoryId,
            CategoryName = catDict.GetValueOrDefault(p.CategoryId),
            Cpu = p.Cpu,
            Ram = p.Ram,
            Ssd = p.Ssd,
            Bandwidth = p.Bandwidth,
            ImageUrl = p.ImageUrl,
            IsActive = p.IsActive
        }).OrderBy(p => p.ServicePlanName).ToList();
    }
}
