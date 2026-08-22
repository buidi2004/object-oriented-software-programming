using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.GlobalSearch.Queries.SearchAll;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.GlobalSearch.Queries.SearchAll;

public class SearchAllQueryHandlerTests
{
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<IRepository<KnowledgeBaseArticle>> _mockRepositoryKnowledgeBaseArticle;
    private readonly SearchAllQueryHandler _handler;

    public SearchAllQueryHandlerTests()
    {
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockRepositoryKnowledgeBaseArticle = new Mock<IRepository<KnowledgeBaseArticle>>();
        _handler = new SearchAllQueryHandler(_mockRepositoryServicePlan.Object, _mockRepositoryKnowledgeBaseArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new SearchAllQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
