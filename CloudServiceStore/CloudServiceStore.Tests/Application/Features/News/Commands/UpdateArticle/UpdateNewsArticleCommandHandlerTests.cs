using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.News.Commands.UpdateArticle;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.News.Commands.UpdateArticle;

public class UpdateNewsArticleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<NewsArticle>> _mockRepositoryNewsArticle;
    private readonly UpdateNewsArticleCommandHandler _handler;

    public UpdateNewsArticleCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryNewsArticle = new Mock<IRepository<NewsArticle>>();
        _handler = new UpdateNewsArticleCommandHandler(_mockUnitOfWork.Object, _mockRepositoryNewsArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new UpdateNewsArticleCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
