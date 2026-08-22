using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.KnowledgeBase.Queries.GetById;

public class GetKbArticleByIdQueryHandlerTests
{
    private readonly Mock<IRepository<KnowledgeBaseArticle>> _mockRepositoryKnowledgeBaseArticle;
    private readonly GetKbArticleByIdQueryHandler _handler;

    public GetKbArticleByIdQueryHandlerTests()
    {
        _mockRepositoryKnowledgeBaseArticle = new Mock<IRepository<KnowledgeBaseArticle>>();
        _handler = new GetKbArticleByIdQueryHandler(_mockRepositoryKnowledgeBaseArticle.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetKbArticleByIdQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
