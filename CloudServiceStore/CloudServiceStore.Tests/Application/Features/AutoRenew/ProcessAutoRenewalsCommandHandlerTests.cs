using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AutoRenew.Commands.ProcessAutoRenewals;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.AutoRenew;

public class ProcessAutoRenewalsCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IRepository<RenewalJob>> _jobRepoMock = new();
    private readonly Mock<IRepository<Domain.Entities.Wallet>> _walletRepoMock = new();
    private readonly Mock<IRepository<WalletTransaction>> _transactionRepoMock = new();

    private ProcessAutoRenewalsCommandHandler CreateHandler() => new(_uowMock.Object, _orderRepoMock.Object, _jobRepoMock.Object, _walletRepoMock.Object, _transactionRepoMock.Object);

    [Fact]
    public async Task Handle_NoJobs_ReturnsZero()
    {
        _jobRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<RenewalJob, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RenewalJob>());
        
        var result = await CreateHandler().Handle(new ProcessAutoRenewalsCommand(), CancellationToken.None);
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task Handle_JobWithSufficientBalance_Success()
    {
        var orderId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var job = new RenewalJob { Id = Guid.NewGuid(), OrderRequestId = orderId, NextRunAt = DateTime.UtcNow.AddMinutes(-1), Status = RenewalStatus.Pending };
        var order = new OrderRequest { Id = orderId, UserId = userId, TotalAmount = 100, AutoRenew = true };
        var wallet = new Domain.Entities.Wallet(userId);
        wallet.Deposit(150);

        _jobRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<RenewalJob, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RenewalJob> { job });
        _orderRepoMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _walletRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Domain.Entities.Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Wallet> { wallet });

        var result = await CreateHandler().Handle(new ProcessAutoRenewalsCommand(), CancellationToken.None);
        
        Assert.Equal(1, result); // 1 job processed successfully
        Assert.Equal(50, wallet.Balance);
        Assert.Equal(RenewalStatus.Success, job.Status);
        
        _walletRepoMock.Verify(r => r.Update(wallet), Times.Once);
        _jobRepoMock.Verify(r => r.Update(job), Times.Once);
        // Expecting a new job to be created for next cycle
        _jobRepoMock.Verify(r => r.AddAsync(It.IsAny<RenewalJob>(), It.IsAny<CancellationToken>()), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.Is<WalletTransaction>(t => t.Amount == -100 && t.Type == TransactionType.Payment), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
    
    [Fact]
    public async Task Handle_JobWithInsufficientBalance_FailsJob()
    {
        var orderId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var job = new RenewalJob { Id = Guid.NewGuid(), OrderRequestId = orderId, NextRunAt = DateTime.UtcNow.AddMinutes(-1), Status = RenewalStatus.Pending };
        var order = new OrderRequest { Id = orderId, UserId = userId, TotalAmount = 100, AutoRenew = true };
        var wallet = new Domain.Entities.Wallet(userId);
        wallet.Deposit(50);

        _jobRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<RenewalJob, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RenewalJob> { job });
        _orderRepoMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _walletRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Domain.Entities.Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Wallet> { wallet });

        var result = await CreateHandler().Handle(new ProcessAutoRenewalsCommand(), CancellationToken.None);
        
        Assert.Equal(0, result); // 0 jobs processed successfully
        Assert.Equal(RenewalStatus.Failed, job.Status);
        Assert.Equal(50, wallet.Balance); // Untouched
        
        _walletRepoMock.Verify(r => r.Update(It.IsAny<Domain.Entities.Wallet>()), Times.Never);
        _jobRepoMock.Verify(r => r.Update(job), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.IsAny<WalletTransaction>(), It.IsAny<CancellationToken>()), Times.Never);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
