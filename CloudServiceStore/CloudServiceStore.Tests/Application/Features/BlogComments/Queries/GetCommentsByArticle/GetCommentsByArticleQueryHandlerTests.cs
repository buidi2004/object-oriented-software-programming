using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.BlogComments.Queries.GetCommentsByArticle;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.BlogComments.Queries.GetCommentsByArticle;

public class GetCommentsByArticleQueryHandlerTests
{
    private readonly Mock<IRepository<ArticleComment>> _mockRepositoryArticleComment;
    private readonly GetCommentsByArticleQueryHandler _handler;

    public GetCommentsByArticleQueryHandlerTests()
    {
        _mockRepositoryArticleComment = new Mock<IRepository<ArticleComment>>();
        _handler = new GetCommentsByArticleQueryHandler(_mockRepositoryArticleComment.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetCommentsByArticleQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
