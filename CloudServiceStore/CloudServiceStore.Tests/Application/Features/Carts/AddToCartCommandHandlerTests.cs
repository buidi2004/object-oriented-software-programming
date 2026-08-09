using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Carts;

public class AddToCartCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Cart>> _cartRepoMock = new();
    private readonly Mock<IRepository<CartItem>> _cartItemRepoMock = new();
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private AddToCartCommandHandler CreateHandler() =>
        new(_uowMock.Object, _cartRepoMock.Object, _cartItemRepoMock.Object, _planRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_UserNotLoggedIn_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(x => x.UserId).Returns((Guid?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => CreateHandler().Handle(new AddToCartCommand(Guid.NewGuid(), CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 1), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ServicePlanNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        _planRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().Handle(new AddToCartCommand(Guid.NewGuid(), CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 1), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_CartDoesNotExist_CreatesCartAndAddsItem()
    {
        var userId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.UserId).Returns(userId);
        _planRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _cartRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Cart?)null); // No cart
        _cartItemRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<CartItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CartItem>());

        await CreateHandler().Handle(new AddToCartCommand(planId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 2), CancellationToken.None);

        _cartRepoMock.Verify(r => r.AddAsync(It.Is<Cart>(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active), It.IsAny<CancellationToken>()), Times.Once);
        _cartItemRepoMock.Verify(r => r.AddAsync(It.Is<CartItem>(i => i.ServicePlanId == planId && i.Quantity == 2), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
    
    [Fact]
    public async Task Handle_ItemAlreadyInCart_UpdatesQuantity()
    {
        var userId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var cart = new Cart { Id = Guid.NewGuid(), UserId = userId, Status = CloudServiceStore.Domain.Enums.CartStatus.Active };
        var existingItem = new CartItem { Id = Guid.NewGuid(), CartId = cart.Id, ServicePlanId = planId, BillingCycle = CloudServiceStore.Domain.Enums.BillingCycle.Monthly, Quantity = 1 };

        _currentUserMock.Setup(x => x.UserId).Returns(userId);
        _planRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _cartRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(cart); 
        _cartItemRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<CartItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CartItem> { existingItem });

        await CreateHandler().Handle(new AddToCartCommand(planId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 3), CancellationToken.None);

        existingItem.Quantity.Should().Be(4);
        _cartItemRepoMock.Verify(r => r.Update(existingItem), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
