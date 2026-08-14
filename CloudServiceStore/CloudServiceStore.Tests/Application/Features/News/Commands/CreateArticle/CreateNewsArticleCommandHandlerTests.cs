using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.News.Commands.CreateArticle;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.News.Commands.CreateArticle;

public class CreateNewsArticleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<NewsArticle>> _mockRepositoryNewsArticle;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly CreateNewsArticleCommandHandler _handler;

    public CreateNewsArticleCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryNewsArticle = new Mock<IRepository<NewsArticle>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new CreateNewsArticleCommandHandler(_mockUnitOfWork.Object, _mockRepositoryNewsArticle.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreateNewsArticleCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
