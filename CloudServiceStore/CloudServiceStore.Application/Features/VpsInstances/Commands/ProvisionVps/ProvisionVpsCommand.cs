using System;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommand : IRequest<string>
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
}
