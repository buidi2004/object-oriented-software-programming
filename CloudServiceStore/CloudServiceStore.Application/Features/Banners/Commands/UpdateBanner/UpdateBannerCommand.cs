using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;

public class UpdateBannerCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
