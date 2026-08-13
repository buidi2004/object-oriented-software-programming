using System;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;

public class GetVpsInstanceByIdQuery : IRequest<VpsInstance?>
{
    public Guid Id { get; set; }
}
