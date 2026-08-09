using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;
using CloudServiceStore.Application.Features.Wishlists.Commands.RemoveFromWishlist;
using CloudServiceStore.Application.Features.Wishlists.Queries.GetMyWishlist;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Wishlists;

public class WishlistCommandHandlerTests
{
    private readonly Mock<IRepository<WishlistItem>> _repoMock = new();
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    // ---- GetMyWishlist ----

    [Fact]
    public async Task GetMyWishlist_Unauthenticated_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        var handler = new GetMyWishlistQueryHandler(_repoMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(new GetMyWishlistQuery(), CancellationToken.None));
    }

    [Fact]
    public async Task GetMyWishlist_Authenticated_ReturnsOnlyOwnItems()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);

        var items = new List<WishlistItem>
        {
            new() { Id = Guid.NewGuid(), UserId = userId, ServicePlanId = Guid.NewGuid(), AddedAt = DateTime.UtcNow, ServicePlan = new ServicePlan { Name = "Basic Plan" } }
        };
        _repoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<WishlistItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var handler = new GetMyWishlistQueryHandler(_repoMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyWishlistQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Basic Plan", result[0].ServicePlanName);
    }

    // ---- AddToWishlist ----

    [Fact]
    public async Task AddToWishlist_PlanNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _planRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((ServicePlan?)null);

        var handler = new AddToWishlistCommandHandler(_repoMock.Object, _planRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new AddToWishlistCommand { ServicePlanId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task AddToWishlist_AlreadyInWishlist_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var plan = new ServicePlan { Id = Guid.NewGuid() };
        _planRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(plan);

        var existingItem = new WishlistItem { Id = Guid.NewGuid() };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<WishlistItem, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<WishlistItem, object>>[]>()))
            .ReturnsAsync(existingItem);

        var handler = new AddToWishlistCommandHandler(_repoMock.Object, _planRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(new AddToWishlistCommand { ServicePlanId = plan.Id }, CancellationToken.None));
        Assert.Contains("already in your wishlist", ex.Message);
    }

    [Fact]
    public async Task AddToWishlist_ValidRequest_AddsItem()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var plan = new ServicePlan { Id = Guid.NewGuid() };
        _planRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(plan);

        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<WishlistItem, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<WishlistItem, object>>[]>()))
            .ReturnsAsync((WishlistItem?)null);

        var handler = new AddToWishlistCommandHandler(_repoMock.Object, _planRepoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new AddToWishlistCommand { ServicePlanId = plan.Id }, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _repoMock.Verify(r => r.AddAsync(It.Is<WishlistItem>(x => x.ServicePlanId == plan.Id && x.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // ---- RemoveFromWishlist ----

    [Fact]
    public async Task RemoveFromWishlist_NotOwner_ThrowsUnauthorizedException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);

        var item = new WishlistItem { Id = Guid.NewGuid(), UserId = Guid.NewGuid() }; // Different owner
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(item);

        var handler = new RemoveFromWishlistCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(new RemoveFromWishlistCommand { Id = item.Id }, CancellationToken.None));
    }

    [Fact]
    public async Task RemoveFromWishlist_ValidRequest_DeletesItem()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var item = new WishlistItem { Id = Guid.NewGuid(), UserId = userId };
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(item);

        var handler = new RemoveFromWishlistCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new RemoveFromWishlistCommand { Id = item.Id }, CancellationToken.None);

        Assert.True(result);
        _repoMock.Verify(r => r.Delete(item), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
