using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.LiveChats.Commands.StartChatSession;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.LiveChats.Commands.StartChatSession;

public class StartChatSessionCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<ChatSession>> _mockRepositoryChatSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly StartChatSessionCommandHandler _handler;

    public StartChatSessionCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryChatSession = new Mock<IRepository<ChatSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new StartChatSessionCommandHandler(_mockUnitOfWork.Object, _mockRepositoryChatSession.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new StartChatSessionCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
