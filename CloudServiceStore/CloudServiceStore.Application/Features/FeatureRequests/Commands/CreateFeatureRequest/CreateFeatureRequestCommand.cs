using System;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands.CreateFeatureRequest;

public record CreateFeatureRequestCommand(string Title, string Description, string Category) : IRequest<Guid>;
