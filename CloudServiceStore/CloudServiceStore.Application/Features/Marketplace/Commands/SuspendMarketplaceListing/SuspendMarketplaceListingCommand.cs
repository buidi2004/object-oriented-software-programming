using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Commands.SuspendMarketplaceListing;

public record SuspendMarketplaceListingCommand(Guid Id, string Reason) : IRequest;

public class SuspendMarketplaceListingCommandHandler : IRequestHandler<SuspendMarketplaceListingCommand>
{
    private readonly IRepository<MarketplaceListing> _repo;
    private readonly IUnitOfWork _uow;

    public SuspendMarketplaceListingCommandHandler(IRepository<MarketplaceListing> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task Handle(SuspendMarketplaceListingCommand request, CancellationToken cancellationToken)
    {
        var listing = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (listing == null)
            throw new Exception("Listing not found.");

        listing.MarkAsSuspended(request.Reason);
        
        await _uow.SaveChangesAsync(cancellationToken);
    }
}
