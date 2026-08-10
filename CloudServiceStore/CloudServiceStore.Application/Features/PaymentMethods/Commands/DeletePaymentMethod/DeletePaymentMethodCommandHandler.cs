using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;

public class DeletePaymentMethodCommandHandler : IRequestHandler<DeletePaymentMethodCommand, bool>
{
    private readonly IRepository<SavedPaymentMethod> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public DeletePaymentMethodCommandHandler(IRepository<SavedPaymentMethod> repo, IUnitOfWork uow, ICurrentUserService currentUser)
    {
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(DeletePaymentMethodCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var method = await _repo.GetByIdAsync(request.PaymentMethodId, cancellationToken);
        if (method == null) throw new NotFoundException(nameof(SavedPaymentMethod), request.PaymentMethodId);
        if (method.UserId != userId) throw new UnauthorizedException("You do not own this payment method.");

        _repo.Delete(method);
        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
