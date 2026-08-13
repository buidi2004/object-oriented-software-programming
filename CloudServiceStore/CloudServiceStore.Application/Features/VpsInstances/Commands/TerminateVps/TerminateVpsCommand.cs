using System;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;

public class TerminateVpsCommand : IRequest<bool>
{
    public string ContainerId { get; set; } = string.Empty;
}
