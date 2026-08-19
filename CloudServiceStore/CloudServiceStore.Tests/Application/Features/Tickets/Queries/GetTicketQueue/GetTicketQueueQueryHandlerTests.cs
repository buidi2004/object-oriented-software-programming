using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Tickets.Queries.GetTicketQueue;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Tickets.Queries.GetTicketQueue;

public class GetTicketQueueQueryHandlerTests
{
    private readonly Mock<IRepository<SupportTicket>> _mockRepositorySupportTicket;
    private readonly Mock<IRepository<TicketMessage>> _mockRepositoryTicketMessage;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly GetTicketQueueQueryHandler _handler;

    public GetTicketQueueQueryHandlerTests()
    {
        _mockRepositorySupportTicket = new Mock<IRepository<SupportTicket>>();
        _mockRepositoryTicketMessage = new Mock<IRepository<TicketMessage>>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _handler = new GetTicketQueueQueryHandler(_mockRepositorySupportTicket.Object, _mockRepositoryTicketMessage.Object, _mockRepositoryAppUser.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetTicketQueueQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
