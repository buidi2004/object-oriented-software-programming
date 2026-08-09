using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AutoRenew.Commands.ProcessAutoRenewals;

public class ProcessAutoRenewalsCommandHandler : IRequestHandler<ProcessAutoRenewalsCommand, int>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<RenewalJob> _jobRepo;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _transactionRepo;

    public ProcessAutoRenewalsCommandHandler(IUnitOfWork uow, IRepository<OrderRequest> orderRepo, IRepository<RenewalJob> jobRepo, IRepository<Domain.Entities.Wallet> walletRepo, IRepository<WalletTransaction> transactionRepo)
    { _uow = uow; _orderRepo = orderRepo; _jobRepo = jobRepo; _walletRepo = walletRepo; _transactionRepo = transactionRepo; }

    public async Task<int> Handle(ProcessAutoRenewalsCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var pendingJobs = await _jobRepo.WhereAsync(j => j.Status == RenewalStatus.Pending && j.NextRunAt <= now, cancellationToken);

        int successCount = 0;

        foreach (var job in pendingJobs)
        {
            var order = await _orderRepo.GetByIdAsync(job.OrderRequestId, cancellationToken);
            if (order == null || !order.AutoRenew)
            {
                job.Status = RenewalStatus.Failed;
                _jobRepo.Update(job);
                continue;
            }

            var wallets = await _walletRepo.WhereAsync(w => w.UserId == order.UserId, cancellationToken);
            var wallet = wallets.FirstOrDefault();

            if (wallet != null && wallet.Balance >= order.TotalAmount)
            {
                // Sufficient balance
                wallet.Withdraw(order.TotalAmount);
                _walletRepo.Update(wallet);

                var transaction = new WalletTransaction(wallet.Id, order.TotalAmount, TransactionType.Payment, order.Id);
                await _transactionRepo.AddAsync(transaction, cancellationToken);

                job.Status = RenewalStatus.Success;
                _jobRepo.Update(job);

                // Create next renewal job (e.g. 1 month later)
                var nextJob = new RenewalJob
                {
                    OrderRequestId = order.Id,
                    NextRunAt = now.AddMonths(1),
                    Status = RenewalStatus.Pending
                };
                await _jobRepo.AddAsync(nextJob, cancellationToken);

                successCount++;
            }
            else
            {
                // Insufficient balance
                job.Status = RenewalStatus.Failed;
                _jobRepo.Update(job);
            }
        }

        if (pendingJobs.Any())
        {
            await _uow.SaveChangesAsync(cancellationToken);
        }

        return successCount;
    }
}
