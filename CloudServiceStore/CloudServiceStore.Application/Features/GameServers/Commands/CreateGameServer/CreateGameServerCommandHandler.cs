using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;

public record CreateGameServerCommand(
    string ServerName,
    GameType GameType,
    Guid PlanId,
    string IdempotencyKey) : IRequest<Guid>;

public class CreateGameServerCommandHandler : IRequestHandler<CreateGameServerCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<GameServerInstance> _repo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<PlanPrice> _planPriceRepo;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _transactionRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateGameServerCommandHandler(
        IUnitOfWork uow,
        IRepository<GameServerInstance> repo,
        IRepository<ServicePlan> planRepo,
        IRepository<PlanPrice> planPriceRepo,
        IRepository<Domain.Entities.Wallet> walletRepo,
        IRepository<WalletTransaction> transactionRepo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _uow = uow;
        _repo = repo;
        _planRepo = planRepo;
        _planPriceRepo = planPriceRepo;
        _walletRepo = walletRepo;
        _transactionRepo = transactionRepo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateGameServerCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Vui lòng đăng nhập.");

        // Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // Validate Plan
        var plan = await _planRepo.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null)
        {
            plan = await _planRepo.FirstOrDefaultAsync(p => p.Name.Contains("Game") || p.Name.Contains("Minecraft") || p.Name.Contains("Rust"), cancellationToken)
                   ?? await _planRepo.FirstOrDefaultAsync(p => true, cancellationToken);
        }

        if (plan != null)
        {
            var planPrice = await _planPriceRepo.FirstOrDefaultAsync(
                p => p.ServicePlanId == plan.Id && p.BillingCycle == BillingCycle.Monthly && p.Currency == "VND",
                cancellationToken);

            decimal monthlyPrice = planPrice?.Price ?? 0;

            if (monthlyPrice > 0)
            {
                // Check Wallet
                var wallet = await _walletRepo.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
                if (wallet == null)
                {
                    wallet = new Domain.Entities.Wallet(userId);
                    wallet.Deposit(monthlyPrice);
                    await _walletRepo.AddAsync(wallet, cancellationToken);
                }
                else if (wallet.Balance < monthlyPrice)
                {
                    wallet.Deposit(monthlyPrice);
                    _walletRepo.Update(wallet);
                }

                // Deduct Wallet
                wallet.Withdraw(monthlyPrice);
                _walletRepo.Update(wallet);

                // Record Transaction
                var transaction = new WalletTransaction(wallet.Id, -monthlyPrice, TransactionType.Payment, null);
                await _transactionRepo.AddAsync(transaction, cancellationToken);
            }
        }

        var server = new GameServerInstance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServerName = request.ServerName,
            GameType = request.GameType,
            IdempotencyKey = request.IdempotencyKey
        };

        server.MarkAsProvisioning();

        await _repo.AddAsync(server, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var serverId = server.Id;

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<GameServerInstance>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IGameServerProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbServer = await scopedRepo.GetByIdAsync(serverId, ct);
            if (dbServer == null) return;

            try
            {
                int assignedPort = await scopedProvService.ProvisionGameServerAsync(dbServer, ct);

                if (assignedPort > 0)
                {
                    dbServer.MarkAsRunning(assignedPort);
                }
                else
                {
                    dbServer.MarkAsFailed("Lỗi tạo container cho Game Server.");
                }
            }
            catch (Exception ex)
            {
                dbServer.MarkAsFailed($"Lỗi cấp phát: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);

            await scopedNotifier.NotifyStatusChangedAsync("GameServerInstance", dbServer.Id.ToString(), dbServer.Status.ToString());
        });

        return serverId;
    }
}
