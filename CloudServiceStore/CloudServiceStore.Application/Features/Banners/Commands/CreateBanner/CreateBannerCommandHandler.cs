using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;

public class CreateBannerCommandHandler : IRequestHandler<CreateBannerCommand, Guid>
{
    private readonly IRepository<Banner> _repo;
    private readonly IUnitOfWork _uow;

    public CreateBannerCommandHandler(IRepository<Banner> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Guid> Handle(CreateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = new Banner
        {
            Id = Guid.NewGuid(),
            ImageUrl = request.ImageUrl,
            LinkUrl = request.LinkUrl,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        await _repo.AddAsync(banner, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return banner.Id;
    }
}
