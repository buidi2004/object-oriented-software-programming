using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Wallet;

public class PayWithWalletCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Domain.Entities.Wallet>> _walletRepoMock = new();
    private readonly Mock<IRepository<WalletTransaction>> _transactionRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private PayWithWalletCommandHandler CreateHandler() => new(_uowMock.Object, _walletRepoMock.Object, _transactionRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((OrderRequest)null);
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new PayWithWalletCommand(Guid.NewGuid()), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_OrderNotOwned_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = Guid.NewGuid() });
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new PayWithWalletCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderAlreadyPaid_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = userId, Status = OrderStatus.Paid });
        await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new PayWithWalletCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WalletInsufficientBalance_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = userId, Status = OrderStatus.Pending, TotalAmount = 100 });
        var wallet = new Domain.Entities.Wallet(Guid.NewGuid());
        wallet.Deposit(50);

        _walletRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Domain.Entities.Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Wallet> { wallet }); // Not enough

        await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new PayWithWalletCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_PaysOrderAndUpdatesWallet()
    {
        var userId = Guid.NewGuid();
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = userId, Status = OrderStatus.Pending, TotalAmount = 100 };
        var wallet = new Domain.Entities.Wallet(userId);
        wallet.Deposit(150);

        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _walletRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Domain.Entities.Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Wallet> { wallet });

        var result = await CreateHandler().Handle(new PayWithWalletCommand(order.Id), CancellationToken.None);
        
        Assert.True(result);
        Assert.Equal(50, wallet.Balance);
        Assert.Equal(OrderStatus.Paid, order.Status);
        
        _walletRepoMock.Verify(r => r.Update(wallet), Times.Once);
        _orderRepoMock.Verify(r => r.Update(order), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.Is<WalletTransaction>(t => t.Amount == -100 && t.Type == TransactionType.Payment), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
