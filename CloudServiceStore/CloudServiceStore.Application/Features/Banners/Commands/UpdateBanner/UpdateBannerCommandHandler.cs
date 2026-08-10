using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;

public class UpdateBannerCommandHandler : IRequestHandler<UpdateBannerCommand, bool>
{
    private readonly IRepository<Banner> _repo;
    private readonly IUnitOfWork _uow;

    public UpdateBannerCommandHandler(IRepository<Banner> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<bool> Handle(UpdateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (banner == null) throw new NotFoundException(nameof(Banner), request.Id);

        banner.ImageUrl = request.ImageUrl;
        banner.LinkUrl = request.LinkUrl;
        banner.DisplayOrder = request.DisplayOrder;
        banner.IsActive = request.IsActive;
        banner.StartDate = request.StartDate;
        banner.EndDate = request.EndDate;

        _repo.Update(banner);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
