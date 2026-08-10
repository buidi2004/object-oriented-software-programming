using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Queries.GetBanners;

public class GetBannersQuery : IRequest<IReadOnlyList<BannerDto>> { }
