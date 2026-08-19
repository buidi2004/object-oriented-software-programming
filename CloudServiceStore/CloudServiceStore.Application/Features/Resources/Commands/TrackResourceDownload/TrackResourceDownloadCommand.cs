using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Resources.Commands.TrackResourceDownload;

public record TrackResourceDownloadCommand(Guid ResourceId) : IRequest<int>;
