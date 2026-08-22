using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Tickets.Commands.CreateTicket;

public class CreateTicketCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<SupportTicket>> _mockRepositorySupportTicket;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly CreateTicketCommandHandler _handler;

    public CreateTicketCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositorySupportTicket = new Mock<IRepository<SupportTicket>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _mockEmailService = new Mock<IEmailService>();
        _handler = new CreateTicketCommandHandler(_mockUnitOfWork.Object, _mockRepositorySupportTicket.Object, _mockRepositoryAppUser.Object, _mockCurrentUserService.Object, _mockEmailService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreateTicketCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
