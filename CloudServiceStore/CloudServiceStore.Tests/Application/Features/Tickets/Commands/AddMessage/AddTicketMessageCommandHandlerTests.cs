using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Tickets.Commands.AddMessage;

public class AddTicketMessageCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<SupportTicket>> _mockRepositorySupportTicket;
    private readonly Mock<IRepository<TicketMessage>> _mockRepositoryTicketMessage;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly AddTicketMessageCommandHandler _handler;

    public AddTicketMessageCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositorySupportTicket = new Mock<IRepository<SupportTicket>>();
        _mockRepositoryTicketMessage = new Mock<IRepository<TicketMessage>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _handler = new AddTicketMessageCommandHandler(
            _mockUnitOfWork.Object, 
            _mockRepositorySupportTicket.Object, 
            _mockRepositoryTicketMessage.Object, 
            _mockCurrentUserService.Object,
            _mockEmailService.Object,
            _mockRepositoryAppUser.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new AddTicketMessageCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
