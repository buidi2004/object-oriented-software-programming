using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;

public class GetPublishedKbArticlesQueryHandlerTests
{
    private readonly Mock<IRepository<KnowledgeBaseArticle>> _repoMock = new();
    private readonly GetPublishedKbArticlesQueryHandler _handler;

    public GetPublishedKbArticlesQueryHandlerTests()
    {
        _handler = new GetPublishedKbArticlesQueryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsOnlyPublishedArticles_WithoutContent()
    {
        var authorId = Guid.NewGuid();
        var articles = new List<KnowledgeBaseArticle>
        {
            new("Published", "published-slug", "Secret content", "VPS", authorId, isPublished: true),
            new("Draft", "draft-slug", "Draft content", "VPS", authorId, isPublished: false)
        };

        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(articles);

        var result = await _handler.Handle(new GetPublishedKbArticlesQuery(), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Published");
        result[0].Slug.Should().Be("published-slug");
        result[0].CategoryTag.Should().Be("VPS");
    }
}
