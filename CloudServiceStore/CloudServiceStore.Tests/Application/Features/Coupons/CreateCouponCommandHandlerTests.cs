using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Coupons;

public class CreateCouponCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Coupon>> _couponRepoMock = new();

    private CreateCouponCommandHandler CreateHandler() => new(_uowMock.Object, _couponRepoMock.Object);

    [Fact]
    public async Task Handle_ValidRequest_CreatesCoupon()
    {
        var command = new CreateCouponCommand("TEST20", 20, 100, DateTime.UtcNow.AddDays(10), true);
        var result = await CreateHandler().Handle(command, CancellationToken.None);
        
        Assert.NotEqual(Guid.Empty, result);
        _couponRepoMock.Verify(r => r.AddAsync(It.Is<Coupon>(c => c.Code == "TEST20" && c.DiscountPercent == 20), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
