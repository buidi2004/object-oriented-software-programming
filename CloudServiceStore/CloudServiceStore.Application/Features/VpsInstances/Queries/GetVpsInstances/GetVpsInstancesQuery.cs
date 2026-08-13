using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;

public class GetVpsInstancesQuery : IRequest<IEnumerable<VpsInstance>>
{
}
