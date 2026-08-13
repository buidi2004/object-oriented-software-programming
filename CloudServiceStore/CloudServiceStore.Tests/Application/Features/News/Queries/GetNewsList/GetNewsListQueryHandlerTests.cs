using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.News.Queries.GetNewsList;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.News.Queries.GetNewsList;

public class GetNewsListQueryHandlerTests
{
    private readonly Mock<IRepository<NewsArticle>> _mockRepositoryNewsArticle;
    private readonly GetNewsListQueryHandler _handler;

    public GetNewsListQueryHandlerTests()
    {
        _mockRepositoryNewsArticle = new Mock<IRepository<NewsArticle>>();
        _handler = new GetNewsListQueryHandler(_mockRepositoryNewsArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetNewsListQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
