using MediatR;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;

public record DeployStaticSiteCommand(Guid SiteId, string GitCommitHash) : IRequest<Guid>;
