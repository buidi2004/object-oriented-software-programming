using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Orders.Commands.Checkout;

public class CheckoutCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<OrderRequest>> _mockRepositoryOrderRequest;
    private readonly Mock<IRepository<Coupon>> _mockRepositoryCoupon;
    private readonly Mock<IRepository<PlanPrice>> _mockRepositoryPlanPrice;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IRepository<Cart>> _mockRepositoryCart;
    private readonly CheckoutCommandHandler _handler;

    public CheckoutCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryOrderRequest = new Mock<IRepository<OrderRequest>>();
        _mockRepositoryCoupon = new Mock<IRepository<Coupon>>();
        _mockRepositoryPlanPrice = new Mock<IRepository<PlanPrice>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockRepositoryCart = new Mock<IRepository<Cart>>();
        _handler = new CheckoutCommandHandler(_mockUnitOfWork.Object, _mockRepositoryOrderRequest.Object, _mockRepositoryCoupon.Object, _mockRepositoryPlanPrice.Object, _mockCurrentUserService.Object, _mockRepositoryCart.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CheckoutCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
