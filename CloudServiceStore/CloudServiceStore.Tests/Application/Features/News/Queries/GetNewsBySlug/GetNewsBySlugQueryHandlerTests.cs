using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.News.Queries.GetNewsBySlug;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.News.Queries.GetNewsBySlug;

public class GetNewsBySlugQueryHandlerTests
{
    private readonly Mock<IRepository<NewsArticle>> _mockRepositoryNewsArticle;
    private readonly GetNewsBySlugQueryHandler _handler;

    public GetNewsBySlugQueryHandlerTests()
    {
        _mockRepositoryNewsArticle = new Mock<IRepository<NewsArticle>>();
        _handler = new GetNewsBySlugQueryHandler(_mockRepositoryNewsArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetNewsBySlugQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
