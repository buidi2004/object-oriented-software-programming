using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.AutoRenew;

public class ToggleAutoRenewCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private ToggleAutoRenewCommandHandler CreateHandler() => new(_uowMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((OrderRequest)null);
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new ToggleAutoRenewCommand(Guid.NewGuid()), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_OrderNotOwned_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = Guid.NewGuid() });
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new ToggleAutoRenewCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_TogglesAutoRenew()
    {
        var userId = Guid.NewGuid();
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = userId, AutoRenew = false };
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);

        var result = await CreateHandler().Handle(new ToggleAutoRenewCommand(order.Id), CancellationToken.None);
        
        Assert.True(result);
        Assert.True(order.AutoRenew);
        _orderRepoMock.Verify(r => r.Update(order), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
