using CloudServiceStore.Application.Features.LiveChat.Commands.CreateSession;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Tests.Application.Features.LiveChat;

public class CreateChatSessionCommandHandlerTests
{
    private readonly Mock<IRepository<ChatSession>> _chatRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateChatSessionCommandHandler _handler;

    public CreateChatSessionCommandHandlerTests()
    {
        _chatRepositoryMock = new Mock<IRepository<ChatSession>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateChatSessionCommandHandler(_chatRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidGuest_ShouldCreateSessionAndReturnId()
    {
        // Arrange
        var command = new CreateChatSessionCommand(null, "Guest User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        
        _chatRepositoryMock.Verify(x => x.AddAsync(It.Is<ChatSession>(s => 
            s.GuestName == "Guest User" &&
            s.UserId == null)), Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
