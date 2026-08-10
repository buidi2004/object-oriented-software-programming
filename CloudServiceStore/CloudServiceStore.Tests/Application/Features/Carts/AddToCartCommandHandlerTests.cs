using System;
using System.Collections.Generic;
using System.Linq;
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
    private readonly Mock<IRepository<Cart>> _cartRepoMock = new(MockBehavior.Strict);
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private AddToCartCommandHandler CreateHandler() =>
        new(_uowMock.Object, _cartRepoMock.Object, _planRepoMock.Object, _currentUserMock.Object);

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
        _cartRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>(), Array.Empty<Expression<Func<Cart, object>>>()))
            .ReturnsAsync((Cart?)null);
        _cartRepoMock.Setup(r => r.AddAsync(It.IsAny<Cart>(), It.IsAny<CancellationToken>()))
            .Returns((Cart c, CancellationToken ct) => Task.FromResult(c));

        await CreateHandler().Handle(new AddToCartCommand(planId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 2), CancellationToken.None);

        _cartRepoMock.Verify(r => r.AddAsync(It.Is<Cart>(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ItemAlreadyInCart_UpdatesQuantity()
    {
        var userId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var cart = new Cart(userId);
        cart.AddItem(planId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 1);
        
        _currentUserMock.Setup(x => x.UserId).Returns(userId);
        _planRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _cartRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Cart, object>>[]>()))
            .ReturnsAsync(cart);

        await CreateHandler().Handle(new AddToCartCommand(planId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 3), CancellationToken.None);

        cart.Items.First().Quantity.Should().Be(4);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
