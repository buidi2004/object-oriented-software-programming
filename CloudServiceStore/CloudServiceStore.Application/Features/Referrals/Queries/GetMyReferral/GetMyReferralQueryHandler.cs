using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Referrals.Queries.GetMyReferral;

public class GetMyReferralQueryHandler : IRequestHandler<GetMyReferralQuery, ReferralDto>
{
    private readonly IRepository<ReferralCode> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public GetMyReferralQueryHandler(IRepository<ReferralCode> repo, IUnitOfWork uow, ICurrentUserService currentUser)
    {
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<ReferralDto> Handle(GetMyReferralQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var existing = await _repo.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (existing != null)
        {
            return new ReferralDto { Id = existing.Id, Code = existing.Code };
        }

        // Auto-generate code if not exists
        var code = GenerateUniqueCode(userId);
        var newCode = new ReferralCode { Id = Guid.NewGuid(), UserId = userId, Code = code };
        
        await _repo.AddAsync(newCode, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return new ReferralDto { Id = newCode.Id, Code = newCode.Code };
    }

    private string GenerateUniqueCode(Guid userId)
    {
        return $"REF-{userId.ToString().Substring(0, 8).ToUpper()}";
    }
}
