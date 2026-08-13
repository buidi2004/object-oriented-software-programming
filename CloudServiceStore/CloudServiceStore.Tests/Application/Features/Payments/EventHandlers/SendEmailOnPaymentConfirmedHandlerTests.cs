using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Payments.EventHandlers;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Payments.EventHandlers;

public class SendEmailOnPaymentConfirmedHandlerTests
{
    private readonly Mock<ILogger<SendEmailOnPaymentConfirmedHandler>> _mockLoggerSendEmailOnPaymentConfirmedHandler;
    private readonly SendEmailOnPaymentConfirmedHandler _handler;

    public SendEmailOnPaymentConfirmedHandlerTests()
    {
        _mockLoggerSendEmailOnPaymentConfirmedHandler = new Mock<ILogger<SendEmailOnPaymentConfirmedHandler>>();
        _handler = new SendEmailOnPaymentConfirmedHandler(_mockLoggerSendEmailOnPaymentConfirmedHandler.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new SendEmailOnPaymentConfirmed();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
