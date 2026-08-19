using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Renewals.Queries.GetRenewalCalendar;

public record RenewalEventDto(
    string ServiceType,
    string ServiceName,
    DateTime ExpiryDate,
    decimal EstimatedRenewalCost,
    bool AutoRenewActive);

public record GetRenewalCalendarQuery(int? Month, int? Year) : IRequest<IReadOnlyList<RenewalEventDto>>;
