using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Commands.ApproveMarketplaceListing;

public record ApproveMarketplaceListingCommand(Guid Id) : IRequest;

public class ApproveMarketplaceListingCommandHandler : IRequestHandler<ApproveMarketplaceListingCommand>
{
    private readonly IRepository<MarketplaceListing> _repo;
    private readonly IUnitOfWork _uow;

    public ApproveMarketplaceListingCommandHandler(IRepository<MarketplaceListing> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task Handle(ApproveMarketplaceListingCommand request, CancellationToken cancellationToken)
    {
        var listing = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (listing == null)
            throw new Exception("Listing not found.");

        listing.MarkAsActive();
        
        await _uow.SaveChangesAsync(cancellationToken);
    }
}
