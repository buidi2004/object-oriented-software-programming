using System;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ChangeVpsState;

public class ChangeVpsStateCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    // Action can be: "Start", "Stop", "Restart"
    public string Action { get; set; } = string.Empty;
}
