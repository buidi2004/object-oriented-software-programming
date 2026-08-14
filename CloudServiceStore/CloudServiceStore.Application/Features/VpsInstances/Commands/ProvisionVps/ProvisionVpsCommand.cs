using System;
using MediatR;
using CloudServiceStore.Application.DTOs;

using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommand : IRequest<List<VpsInstanceDto>>
{
    public Guid OrderId { get; set; }
}
