using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetAllServicePlansAdmin;

public class GetAllServicePlansAdminQuery : IRequest<IReadOnlyList<ServicePlanAdminDto>>
{
}
