using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Resources.Queries.GetDownloadableResources;

public class GetDownloadableResourcesQueryHandler : IRequestHandler<GetDownloadableResourcesQuery, IReadOnlyList<DownloadableResourceDto>>
{
    private readonly IRepository<DownloadableResource> _repo;

    public GetDownloadableResourcesQueryHandler(IRepository<DownloadableResource> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<DownloadableResourceDto>> Handle(GetDownloadableResourcesQuery request, CancellationToken ct)
    {
        var items = await _repo.GetAllAsync(ct);

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim();
            items = items.Where(x =>
                x.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.Category.Contains(keyword, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return items
            .OrderByDescending(x => x.DownloadCount)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new DownloadableResourceDto(
                x.Id,
                x.Title,
                x.Description,
                x.Category,
                x.FileUrl,
                x.FileExtension,
                x.SizeBytes,
                x.DownloadCount,
                x.CreatedAt))
            .ToList()
            .AsReadOnly();
    }
}
