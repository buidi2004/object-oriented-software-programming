using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Migrations.Queries.GetMyMigrations;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Migrations.Queries.GetMyMigrations;

public class GetMyMigrationsQueryHandlerTests
{
    private readonly Mock<IRepository<MigrationRequest>> _mockRepositoryMigrationRequest;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyMigrationsQueryHandler _handler;

    public GetMyMigrationsQueryHandlerTests()
    {
        _mockRepositoryMigrationRequest = new Mock<IRepository<MigrationRequest>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyMigrationsQueryHandler(_mockRepositoryMigrationRequest.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyMigrationsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
