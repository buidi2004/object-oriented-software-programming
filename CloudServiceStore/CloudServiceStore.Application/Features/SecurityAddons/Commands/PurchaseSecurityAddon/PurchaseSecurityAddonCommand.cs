using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using MediatR;

namespace CloudServiceStore.Application.Features.SecurityAddons.Commands.PurchaseSecurityAddon;

public record PurchaseSecurityAddonCommand(Guid UserId, SecurityAddonType AddonType, string TargetResourceId) : IRequest<Guid>;
