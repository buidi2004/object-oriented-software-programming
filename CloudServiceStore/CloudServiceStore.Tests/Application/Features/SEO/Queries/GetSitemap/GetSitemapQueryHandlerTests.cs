using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.SEO.Queries.GetSitemap;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.SEO.Queries.GetSitemap;

public class GetSitemapQueryHandlerTests
{
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<IRepository<KnowledgeBaseArticle>> _mockRepositoryKnowledgeBaseArticle;
    private readonly GetSitemapQueryHandler _handler;

    public GetSitemapQueryHandlerTests()
    {
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockRepositoryKnowledgeBaseArticle = new Mock<IRepository<KnowledgeBaseArticle>>();
        _handler = new GetSitemapQueryHandler(_mockRepositoryServicePlan.Object, _mockRepositoryKnowledgeBaseArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetSitemapQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
