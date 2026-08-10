using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Commands.SavePaymentMethod;

public class SavePaymentMethodCommandHandler : IRequestHandler<SavePaymentMethodCommand, Guid>
{
    private readonly IRepository<SavedPaymentMethod> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public SavePaymentMethodCommandHandler(IRepository<SavedPaymentMethod> repo, IUnitOfWork uow, ICurrentUserService currentUser)
    {
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(SavePaymentMethodCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        // If new method is default, unset existing defaults
        if (request.IsDefault)
        {
            var existingMethods = await _repo.WhereAsync(m => m.UserId == userId && m.IsDefault, cancellationToken);
            foreach (var m in existingMethods)
            {
                m.IsDefault = false;
                _repo.Update(m);
            }
        }

        var method = new SavedPaymentMethod
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Gateway = request.Gateway,
            MaskedInfo = request.MaskedInfo,
            IsDefault = request.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(method, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return method.Id;
    }
}
