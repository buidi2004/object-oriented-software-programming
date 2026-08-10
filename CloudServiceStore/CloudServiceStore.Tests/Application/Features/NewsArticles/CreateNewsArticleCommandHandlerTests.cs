using CloudServiceStore.Application.Features.NewsArticles.Commands.Create;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Moq;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Tests.Application.Features.NewsArticles;

public class CreateNewsArticleCommandHandlerTests
{
    private readonly Mock<IRepository<NewsArticle>> _newsRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateNewsArticleCommandHandler _handler;

    public CreateNewsArticleCommandHandlerTests()
    {
        _newsRepositoryMock = new Mock<IRepository<NewsArticle>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateNewsArticleCommandHandler(_newsRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateArticleAndReturnId()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var command = new CreateNewsArticleCommand("Welcome to our new Blog!", "welcome-blog", "Content of the blog...", authorId, null, "Tech", ArticleStatus.Published);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        
        _newsRepositoryMock.Verify(x => x.AddAsync(It.Is<NewsArticle>(a => 
            a.Title == "Welcome to our new Blog!" &&
            a.Slug == "welcome-blog" &&
            a.Content == "Content of the blog..." &&
            a.AuthorId == authorId &&
            a.Tags == "Tech" &&
            a.Status == ArticleStatus.Published)), Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
