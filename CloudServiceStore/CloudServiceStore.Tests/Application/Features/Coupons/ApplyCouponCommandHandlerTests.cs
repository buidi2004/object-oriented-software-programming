using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Coupons;

public class ApplyCouponCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Coupon>> _couponRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private ApplyCouponCommandHandler CreateHandler() => new(_uowMock.Object, _couponRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((OrderRequest?)null);
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new ApplyCouponCommand(Guid.NewGuid(), "CODE"), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_CouponInvalid_ThrowsNotFoundException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Pending };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        
        _couponRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Coupon, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Coupon>());

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new ApplyCouponCommand(order.Id, "INVALID"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_CouponExpired_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Pending };
        var coupon = new Coupon { Id = Guid.NewGuid(), Code = "EXPIRED", ExpiryDate = DateTime.UtcNow.AddDays(-1), IsActive = true, MaxUsage = 10, UsedCount = 0 };
        
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        
        _couponRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Coupon, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Coupon> { coupon });

        var ex = await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new ApplyCouponCommand(order.Id, "EXPIRED"), CancellationToken.None));
        Assert.Contains("hết hạn", ex.Message);
    }
    
    [Fact]
    public async Task Handle_CouponMaxUsageReached_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Status = OrderStatus.Pending };
        var coupon = new Coupon { Id = Guid.NewGuid(), Code = "FULL", ExpiryDate = DateTime.UtcNow.AddDays(1), IsActive = true, MaxUsage = 10, UsedCount = 10 };
        
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _currentUserMock.Setup(c => c.UserId).Returns(order.UserId);
        
        _couponRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Coupon, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Coupon> { coupon });

        var ex = await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new ApplyCouponCommand(order.Id, "FULL"), CancellationToken.None));
        Assert.Contains("vượt quá", ex.Message);
    }

    [Fact]
    public async Task Handle_ValidRequest_AppliesCouponAndUpdatesPrices()
    {
        var userId = Guid.NewGuid();
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = userId, Status = OrderStatus.Pending, SubTotal = 1000, TotalAmount = 1000, DiscountAmount = 0 };
        var coupon = new Coupon { Id = Guid.NewGuid(), Code = "DISC20", DiscountPercent = 20, ExpiryDate = DateTime.UtcNow.AddDays(10), IsActive = true, MaxUsage = 100, UsedCount = 5 };

        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _couponRepoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Coupon, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Coupon> { coupon });

        var result = await CreateHandler().Handle(new ApplyCouponCommand(order.Id, "DISC20"), CancellationToken.None);
        
        Assert.True(result);
        Assert.Equal(200, order.DiscountAmount); // 20% of 1000
        Assert.Equal(800, order.TotalAmount);
        Assert.Equal(coupon.Id, order.CouponId);
        Assert.Equal(6, coupon.UsedCount); // Incremented
        
        _orderRepoMock.Verify(r => r.Update(order), Times.Once);
        _couponRepoMock.Verify(r => r.Update(coupon), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
