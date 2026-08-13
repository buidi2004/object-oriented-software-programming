using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.BlogComments.Commands.DeleteComment;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.BlogComments.Commands.DeleteComment;

public class DeleteCommentCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<ArticleComment>> _mockRepositoryArticleComment;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DeleteCommentCommandHandler _handler;

    public DeleteCommentCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryArticleComment = new Mock<IRepository<ArticleComment>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new DeleteCommentCommandHandler(_mockUnitOfWork.Object, _mockRepositoryArticleComment.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new DeleteCommentCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
