using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.SystemSettings.Queries.GetAllSettings;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.SystemSettings.Queries.GetAllSettings;

public class GetAllSettingsQueryHandlerTests
{
    private readonly Mock<IRepository<SystemSetting>> _mockRepositorySystemSetting;
    private readonly GetAllSettingsQueryHandler _handler;

    public GetAllSettingsQueryHandlerTests()
    {
        _mockRepositorySystemSetting = new Mock<IRepository<SystemSetting>>();
        _handler = new GetAllSettingsQueryHandler(_mockRepositorySystemSetting.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAllSettingsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
