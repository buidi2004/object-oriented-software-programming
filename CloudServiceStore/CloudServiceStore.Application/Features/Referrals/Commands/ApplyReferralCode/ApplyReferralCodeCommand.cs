using MediatR;

namespace CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;

public class ApplyReferralCodeCommand : IRequest<bool>
{
    public string Code { get; set; } = null!;
}
