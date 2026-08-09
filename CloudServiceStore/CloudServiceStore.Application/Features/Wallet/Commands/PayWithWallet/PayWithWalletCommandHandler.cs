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
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Đơn hàng không thuộc về bạn.");
            
        if (order.Status == OrderStatus.Paid)
            throw new ConflictException("Đơn hàng này đã được thanh toán.");
            
        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = Enumerable.FirstOrDefault(wallets);
        
        if (wallet == null || wallet.Balance < order.TotalAmount)
            throw new ConflictException("Số dư ví không đủ để thanh toán.");

        // Deduct balance
        wallet.Balance -= order.TotalAmount;
        wallet.UpdatedAt = DateTime.UtcNow;
        _walletRepo.Update(wallet);

        // Update order status
        order.Status = OrderStatus.Paid;
        _orderRepo.Update(order);

        // Record transaction
        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = -order.TotalAmount,
            Type = TransactionType.Payment,
            RefOrderId = order.Id
        };
        await _transactionRepo.AddAsync(transaction, cancellationToken);
        
        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
