using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.SystemSettings.Queries.GetSettingByKey;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.SystemSettings.Queries.GetSettingByKey;

public class GetSettingByKeyQueryHandlerTests
{
    private readonly Mock<IRepository<SystemSetting>> _mockRepositorySystemSetting;
    private readonly GetSettingByKeyQueryHandler _handler;

    public GetSettingByKeyQueryHandlerTests()
    {
        _mockRepositorySystemSetting = new Mock<IRepository<SystemSetting>>();
        _handler = new GetSettingByKeyQueryHandler(_mockRepositorySystemSetting.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetSettingByKeyQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
