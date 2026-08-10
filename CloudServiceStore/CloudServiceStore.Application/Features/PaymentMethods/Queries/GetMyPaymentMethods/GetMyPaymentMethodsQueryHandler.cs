using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;

public class GetMyPaymentMethodsQueryHandler : IRequestHandler<GetMyPaymentMethodsQuery, IReadOnlyList<SavedPaymentMethodDto>>
{
    private readonly IRepository<SavedPaymentMethod> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyPaymentMethodsQueryHandler(IRepository<SavedPaymentMethod> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<SavedPaymentMethodDto>> Handle(GetMyPaymentMethodsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");
        var methods = await _repo.WhereAsync(m => m.UserId == userId, cancellationToken);
        return methods.Select(m => new SavedPaymentMethodDto
        {
            Id = m.Id,
            Gateway = m.Gateway,
            MaskedInfo = m.MaskedInfo,
            IsDefault = m.IsDefault,
            CreatedAt = m.CreatedAt
        }).ToList();
    }
}
