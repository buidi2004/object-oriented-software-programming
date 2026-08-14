using CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Queries.GetMyApplication;

public record GetMyAffiliateApplicationQuery() : IRequest<AffiliateApplicationDto?>;
