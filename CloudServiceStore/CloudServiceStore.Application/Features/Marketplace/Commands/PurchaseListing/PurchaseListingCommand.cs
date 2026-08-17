using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Commands.PurchaseListing;

public record PurchaseListingCommand(Guid ListingId) : IRequest<Guid>;
