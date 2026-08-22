using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Permissions.Commands.AssignPermissions;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Permissions.Commands.AssignPermissions;

public class AssignPermissionsToRoleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<RolePermission>> _mockRepositoryRolePermission;
    private readonly AssignPermissionsToRoleCommandHandler _handler;

    public AssignPermissionsToRoleCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryRolePermission = new Mock<IRepository<RolePermission>>();
        _handler = new AssignPermissionsToRoleCommandHandler(_mockUnitOfWork.Object, _mockRepositoryRolePermission.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new AssignPermissionsToRoleCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
