using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Application.DTOs;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;

public class GetVpsInstancesQuery : IRequest<IEnumerable<VpsInstanceDto>>
{
    public bool AdminAll { get; set; }
}
