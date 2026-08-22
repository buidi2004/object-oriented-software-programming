using MediatR;
using CloudServiceStore.Application.Features.Renewals.DTOs;

namespace CloudServiceStore.Application.Features.Renewals.Queries;

public record GetRenewalCalendarQuery(int Month, int Year, Guid UserId) : IRequest<List<RenewalEventDto>>;

public class GetRenewalCalendarQueryHandler : IRequestHandler<GetRenewalCalendarQuery, List<RenewalEventDto>>
{
    public async Task<List<RenewalEventDto>> Handle(GetRenewalCalendarQuery request, CancellationToken cancellationToken)
    {
        var list = new List<RenewalEventDto>
        {
            new() { ServiceType = "VPS", ServiceName = "VPS Pro 01", ExpiryDate = new DateTime(request.Year, request.Month, 15), EstimatedRenewalCost = 200000, AutoRenewActive = true },
            new() { ServiceType = "Domain", ServiceName = "mywebsite.com", ExpiryDate = new DateTime(request.Year, request.Month, 22), EstimatedRenewalCost = 250000, AutoRenewActive = false }
        };
        await Task.CompletedTask;
        return list;
    }
}