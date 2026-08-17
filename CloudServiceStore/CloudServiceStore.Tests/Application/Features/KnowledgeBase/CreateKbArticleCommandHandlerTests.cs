using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;

namespace CloudServiceStore.Tests.Application.Features.KnowledgeBase;

public class CreateKbArticleCommandHandlerTests
{
    private readonly Mock<IRepository<KnowledgeBaseArticle>> _kbRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly CreateKbArticleCommandHandler _handler;

    public CreateKbArticleCommandHandlerTests()
    {
        _kbRepositoryMock = new Mock<IRepository<KnowledgeBaseArticle>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _handler = new CreateKbArticleCommandHandler(_kbRepositoryMock.Object, _unitOfWorkMock.Object, _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateArticleAndReturnId()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var command = new CreateKbArticleCommand("How to use VPN?", "how-to-use-vpn", "Detailed steps to use VPN...", "Network", authorId, true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        
        _kbRepositoryMock.Verify(x => x.AddAsync(It.Is<KnowledgeBaseArticle>(a => 
            a.Title == "How to use VPN?" &&
            a.Slug == "how-to-use-vpn" &&
            a.Content == "Detailed steps to use VPN..." &&
            a.CategoryTag == "Network" &&
            a.AuthorId == authorId &&
            a.IsPublished == true)), Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
