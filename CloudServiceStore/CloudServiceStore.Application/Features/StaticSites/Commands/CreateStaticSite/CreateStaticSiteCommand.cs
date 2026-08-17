using MediatR;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;

public record CreateStaticSiteCommand(string Name, string BuildCommand, string OutputDirectory) : IRequest<Guid>;
