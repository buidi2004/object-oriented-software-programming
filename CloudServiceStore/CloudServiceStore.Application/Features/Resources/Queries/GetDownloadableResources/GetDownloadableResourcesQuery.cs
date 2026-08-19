using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Resources.Queries.GetDownloadableResources;

public record DownloadableResourceDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    string FileUrl,
    string FileExtension,
    long SizeBytes,
    int DownloadCount,
    DateTime CreatedAt);

public record GetDownloadableResourcesQuery(string? Keyword = null) : IRequest<IReadOnlyList<DownloadableResourceDto>>;
