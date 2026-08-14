using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;

public record AffiliateApplicationDto(Guid Id, Guid UserId, string CompanyName, string Status, decimal CommissionRate);

public record GetAllAffiliateApplicationsQuery() : IRequest<IReadOnlyList<AffiliateApplicationDto>>;
