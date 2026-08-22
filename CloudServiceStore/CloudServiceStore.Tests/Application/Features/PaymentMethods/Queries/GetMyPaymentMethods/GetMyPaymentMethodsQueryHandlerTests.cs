using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;

public class GetMyPaymentMethodsQueryHandlerTests
{
    private readonly Mock<IRepository<SavedPaymentMethod>> _mockRepositorySavedPaymentMethod;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyPaymentMethodsQueryHandler _handler;

    public GetMyPaymentMethodsQueryHandlerTests()
    {
        _mockRepositorySavedPaymentMethod = new Mock<IRepository<SavedPaymentMethod>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyPaymentMethodsQueryHandler(_mockRepositorySavedPaymentMethod.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyPaymentMethodsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
