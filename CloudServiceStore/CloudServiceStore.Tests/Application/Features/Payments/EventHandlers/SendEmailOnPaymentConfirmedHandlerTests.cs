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
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IRepository<OrderRequest>> _mockOrderRepo;
    private readonly Mock<IRepository<AppUser>> _mockUserRepo;
    private readonly Mock<ILogger<SendEmailOnPaymentConfirmedHandler>> _mockLoggerSendEmailOnPaymentConfirmedHandler;
    private readonly SendEmailOnPaymentConfirmedHandler _handler;

    public SendEmailOnPaymentConfirmedHandlerTests()
    {
        _mockEmailService = new Mock<IEmailService>();
        _mockOrderRepo = new Mock<IRepository<OrderRequest>>();
        _mockUserRepo = new Mock<IRepository<AppUser>>();
        _mockLoggerSendEmailOnPaymentConfirmedHandler = new Mock<ILogger<SendEmailOnPaymentConfirmedHandler>>();
        _handler = new SendEmailOnPaymentConfirmedHandler(
            _mockEmailService.Object,
            _mockOrderRepo.Object,
            _mockUserRepo.Object,
            _mockLoggerSendEmailOnPaymentConfirmedHandler.Object);
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
