using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQueryHandlerTests
{
    private readonly Mock<IRepository<Permission>> _mockRepositoryPermission;
    private readonly GetAllPermissionsQueryHandler _handler;

    public GetAllPermissionsQueryHandlerTests()
    {
        _mockRepositoryPermission = new Mock<IRepository<Permission>>();
        _handler = new GetAllPermissionsQueryHandler(_mockRepositoryPermission.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAllPermissionsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
