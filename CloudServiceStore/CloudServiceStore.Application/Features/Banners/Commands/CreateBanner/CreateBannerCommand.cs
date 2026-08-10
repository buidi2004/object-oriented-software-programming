using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;

public class CreateBannerCommand : IRequest<Guid>
{
    public string ImageUrl { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
