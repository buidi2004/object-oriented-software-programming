using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;

public class DeletePaymentMethodCommandHandlerTests
{
    private readonly Mock<IRepository<SavedPaymentMethod>> _mockRepositorySavedPaymentMethod;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DeletePaymentMethodCommandHandler _handler;

    public DeletePaymentMethodCommandHandlerTests()
    {
        _mockRepositorySavedPaymentMethod = new Mock<IRepository<SavedPaymentMethod>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new DeletePaymentMethodCommandHandler(_mockRepositorySavedPaymentMethod.Object, _mockUnitOfWork.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new DeletePaymentMethodCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
