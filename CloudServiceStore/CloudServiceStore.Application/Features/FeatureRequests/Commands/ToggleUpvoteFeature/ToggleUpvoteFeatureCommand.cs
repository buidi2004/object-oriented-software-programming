using System;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands.ToggleUpvoteFeature;

public record ToggleUpvoteFeatureCommand(Guid FeatureRequestId) : IRequest<bool>;
