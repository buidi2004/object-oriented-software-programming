using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Queries.GetBanners;

public class GetBannersQueryHandler : IRequestHandler<GetBannersQuery, IReadOnlyList<BannerDto>>
{
    private readonly IRepository<Banner> _repo;

    public GetBannersQueryHandler(IRepository<Banner> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<BannerDto>> Handle(GetBannersQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var banners = await _repo.WhereAsync(b => b.IsActive 
                                                  && (b.StartDate == null || b.StartDate <= now)
                                                  && (b.EndDate == null || b.EndDate >= now), 
                                             cancellationToken);

        return banners.Select(b => new BannerDto
        {
            Id = b.Id,
            ImageUrl = b.ImageUrl,
            LinkUrl = b.LinkUrl,
            DisplayOrder = b.DisplayOrder,
            IsActive = b.IsActive,
            StartDate = b.StartDate,
            EndDate = b.EndDate
        }).OrderBy(x => x.DisplayOrder).ToList();
    }
}
