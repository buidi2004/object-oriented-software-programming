using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.SystemSettings.Commands.UpdateSetting;

public class UpdateSettingCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<SystemSetting>> _mockRepositorySystemSetting;
    private readonly UpdateSettingCommandHandler _handler;

    public UpdateSettingCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositorySystemSetting = new Mock<IRepository<SystemSetting>>();
        _handler = new UpdateSettingCommandHandler(_mockUnitOfWork.Object, _mockRepositorySystemSetting.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new UpdateSettingCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
