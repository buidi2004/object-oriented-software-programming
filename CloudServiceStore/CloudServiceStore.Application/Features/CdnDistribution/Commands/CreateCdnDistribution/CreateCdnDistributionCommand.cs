using CloudServiceStore.Domain.Enums;
using MediatR;

namespace CloudServiceStore.Application.Features.CdnDistribution.Commands.CreateCdnDistribution;

public record CreateCdnDistributionCommand(string OriginUrl, CdnProvider Provider) : IRequest<Guid>;
