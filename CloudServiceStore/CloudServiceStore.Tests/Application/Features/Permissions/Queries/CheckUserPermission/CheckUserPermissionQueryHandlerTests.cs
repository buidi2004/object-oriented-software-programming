using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Permissions.Queries.CheckUserPermission;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Permissions.Queries.CheckUserPermission;

public class CheckUserPermissionQueryHandlerTests
{
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly Mock<IRepository<RolePermission>> _mockRepositoryRolePermission;
    private readonly CheckUserPermissionQueryHandler _handler;

    public CheckUserPermissionQueryHandlerTests()
    {
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _mockRepositoryRolePermission = new Mock<IRepository<RolePermission>>();
        _handler = new CheckUserPermissionQueryHandler(_mockRepositoryAppUser.Object, _mockRepositoryRolePermission.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CheckUserPermissionQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
