using MediatR;

namespace CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;

public record InstallAppCommand(
    Guid TemplateId, 
    Guid HostingAccountId,
    string IdempotencyKey) : IRequest<Guid>;
