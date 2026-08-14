using System;
using MediatR;
using CloudServiceStore.Application.DTOs;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;

public class GetVpsInstanceByIdQuery : IRequest<VpsInstanceDto?>
{
    public Guid Id { get; set; }
}
