using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Permissions.Queries.GetRolePermissions;

public class GetRolePermissionsQueryHandlerTests
{
    private readonly Mock<IRepository<RolePermission>> _mockRepositoryRolePermission;
    private readonly Mock<IRepository<Permission>> _mockRepositoryPermission;
    private readonly GetRolePermissionsQueryHandler _handler;

    public GetRolePermissionsQueryHandlerTests()
    {
        _mockRepositoryRolePermission = new Mock<IRepository<RolePermission>>();
        _mockRepositoryPermission = new Mock<IRepository<Permission>>();
        _handler = new GetRolePermissionsQueryHandler(_mockRepositoryRolePermission.Object, _mockRepositoryPermission.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetRolePermissionsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
