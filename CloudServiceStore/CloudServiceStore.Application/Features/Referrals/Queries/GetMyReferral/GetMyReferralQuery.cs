using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.Referrals.Queries.GetMyReferral;

public class GetMyReferralQuery : IRequest<ReferralDto> { }
