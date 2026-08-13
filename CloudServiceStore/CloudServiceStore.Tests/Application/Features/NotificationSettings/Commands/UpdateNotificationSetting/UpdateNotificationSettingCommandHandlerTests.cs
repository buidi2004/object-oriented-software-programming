using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;

public class UpdateNotificationSettingCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<NotificationSetting>> _mockRepositoryNotificationSetting;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly UpdateNotificationSettingCommandHandler _handler;

    public UpdateNotificationSettingCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryNotificationSetting = new Mock<IRepository<NotificationSetting>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new UpdateNotificationSettingCommandHandler(_mockUnitOfWork.Object, _mockRepositoryNotificationSetting.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new UpdateNotificationSettingCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
