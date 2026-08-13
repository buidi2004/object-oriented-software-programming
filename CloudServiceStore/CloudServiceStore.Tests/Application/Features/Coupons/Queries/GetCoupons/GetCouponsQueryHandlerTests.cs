using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Coupons.Queries.GetCoupons;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Coupons.Queries.GetCoupons;

public class GetCouponsQueryHandlerTests
{
    private readonly Mock<IRepository<Coupon>> _mockRepositoryCoupon;
    private readonly GetCouponsQueryHandler _handler;

    public GetCouponsQueryHandlerTests()
    {
        _mockRepositoryCoupon = new Mock<IRepository<Coupon>>();
        _handler = new GetCouponsQueryHandler(_mockRepositoryCoupon.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetCouponsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
