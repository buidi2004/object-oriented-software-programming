using System;
using MediatR;

namespace CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew;

public record ToggleAutoRenewCommand(Guid OrderId) : IRequest<bool>;
