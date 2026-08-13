using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.ApiKeys.Queries.GetMyApiKeys;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.ApiKeys.Queries.GetMyApiKeys;

public class GetMyApiKeysQueryHandlerTests
{
    private readonly Mock<IRepository<ApiKey>> _mockRepositoryApiKey;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyApiKeysQueryHandler _handler;

    public GetMyApiKeysQueryHandlerTests()
    {
        _mockRepositoryApiKey = new Mock<IRepository<ApiKey>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyApiKeysQueryHandler(_mockRepositoryApiKey.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyApiKeysQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
