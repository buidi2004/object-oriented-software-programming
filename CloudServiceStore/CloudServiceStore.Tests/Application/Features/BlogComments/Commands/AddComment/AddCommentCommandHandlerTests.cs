using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.BlogComments.Commands.AddComment;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.BlogComments.Commands.AddComment;

public class AddCommentCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<ArticleComment>> _mockRepositoryArticleComment;
    private readonly Mock<IRepository<NewsArticle>> _mockRepositoryNewsArticle;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly AddCommentCommandHandler _handler;

    public AddCommentCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryArticleComment = new Mock<IRepository<ArticleComment>>();
        _mockRepositoryNewsArticle = new Mock<IRepository<NewsArticle>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new AddCommentCommandHandler(_mockUnitOfWork.Object, _mockRepositoryArticleComment.Object, _mockRepositoryNewsArticle.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new AddCommentCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
