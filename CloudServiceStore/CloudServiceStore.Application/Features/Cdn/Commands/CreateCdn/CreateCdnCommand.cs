using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;

public record CreateCdnCommand(
    string OriginUrl,
    string IdempotencyKey) : IRequest<Guid>;
