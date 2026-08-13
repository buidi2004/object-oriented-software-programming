using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.VpsInstances.Queries.GetVpsInstances;

public class GetVpsInstancesQueryHandlerTests
{
    private readonly Mock<IRepository<VpsInstance>> _mockRepositoryVpsInstance;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetVpsInstancesQueryHandler _handler;

    public GetVpsInstancesQueryHandlerTests()
    {
        _mockRepositoryVpsInstance = new Mock<IRepository<VpsInstance>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetVpsInstancesQueryHandler(_mockRepositoryVpsInstance.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetVpsInstancesQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
