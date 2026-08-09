using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.Loyalty.Queries.GetMyLoyalty;

public class GetMyLoyaltyQuery : IRequest<LoyaltyDto> { }
