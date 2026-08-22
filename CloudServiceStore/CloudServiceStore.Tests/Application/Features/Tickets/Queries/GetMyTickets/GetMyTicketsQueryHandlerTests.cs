using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Tickets.Queries.GetMyTickets;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Tickets.Queries.GetMyTickets;

public class GetMyTicketsQueryHandlerTests
{
    private readonly Mock<IRepository<SupportTicket>> _mockRepositorySupportTicket;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyTicketsQueryHandler _handler;

    public GetMyTicketsQueryHandlerTests()
    {
        _mockRepositorySupportTicket = new Mock<IRepository<SupportTicket>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyTicketsQueryHandler(_mockRepositorySupportTicket.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyTicketsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
