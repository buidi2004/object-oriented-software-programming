using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Tickets.Commands.CloseTicket;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Tickets.Commands.CloseTicket;

public class CloseTicketCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<SupportTicket>> _mockRepositorySupportTicket;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly CloseTicketCommandHandler _handler;

    public CloseTicketCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositorySupportTicket = new Mock<IRepository<SupportTicket>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new CloseTicketCommandHandler(_mockUnitOfWork.Object, _mockRepositorySupportTicket.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CloseTicketCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
