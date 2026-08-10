using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;

public class PayWithWalletCommandHandler : IRequestHandler<PayWithWalletCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _transactionRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public PayWithWalletCommandHandler(IUnitOfWork uow, IRepository<Domain.Entities.Wallet> walletRepo, IRepository<WalletTransaction> transactionRepo, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _walletRepo = walletRepo; _transactionRepo = transactionRepo; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<bool> Handle(PayWithWalletCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null || order.UserId != userId) throw new NotFoundException("Đơn hàng không hợp lệ.");
        if (order.Status != OrderStatus.Pending) throw new ConflictException("Đơn hàng đã được thanh toán hoặc hủy.");

        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = wallets.FirstOrDefault();

        if (wallet == null || wallet.Balance < order.TotalAmount)
            throw new ConflictException("Số dư ví không đủ.");

        wallet.Withdraw(order.TotalAmount);
        _walletRepo.Update(wallet);

        var transaction = new WalletTransaction(wallet.Id, -order.TotalAmount, TransactionType.Payment, order.Id);
        await _transactionRepo.AddAsync(transaction, cancellationToken);

        order.Pay();
        _orderRepo.Update(order);

        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
