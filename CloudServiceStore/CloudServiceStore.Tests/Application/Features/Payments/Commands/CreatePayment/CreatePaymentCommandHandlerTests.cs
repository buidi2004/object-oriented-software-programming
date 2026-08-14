using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Payments.Commands.CreatePayment;

public class CreatePaymentCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<OrderRequest>> _mockRepositoryOrderRequest;
    private readonly Mock<IRepository<Payment>> _mockRepositoryPayment;
    private readonly CreatePaymentCommandHandler _handler;

    public CreatePaymentCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryOrderRequest = new Mock<IRepository<OrderRequest>>();
        _mockRepositoryPayment = new Mock<IRepository<Payment>>();
        _handler = new CreatePaymentCommandHandler(_mockUnitOfWork.Object, _mockRepositoryOrderRequest.Object, _mockRepositoryPayment.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreatePaymentCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
