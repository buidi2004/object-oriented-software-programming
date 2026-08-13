using System;
using MediatR;
using CloudServiceStore.Application.DTOs;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommand : IRequest<VpsInstanceDto>
{
    public Guid OrderId { get; set; }
}
