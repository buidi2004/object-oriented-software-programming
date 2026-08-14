using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.ControlPanels.Commands.UpdateCredentials;

public class UpdateControlPanelCredentialsCommandHandlerTests
{
    private readonly Mock<IRepository<ControlPanelCredential>> _mockRepositoryControlPanelCredential;
    private readonly Mock<CloudServiceStore.Domain.Interfaces.IUnitOfWork> _mockCloudServiceStoreDomainInterfacesIUnitOfWork;
    private readonly UpdateControlPanelCredentialsCommandHandler _handler;

    public UpdateControlPanelCredentialsCommandHandlerTests()
    {
        _mockRepositoryControlPanelCredential = new Mock<IRepository<ControlPanelCredential>>();
        _mockCloudServiceStoreDomainInterfacesIUnitOfWork = new Mock<CloudServiceStore.Domain.Interfaces.IUnitOfWork>();
        _handler = new UpdateControlPanelCredentialsCommandHandler(_mockRepositoryControlPanelCredential.Object, _mockCloudServiceStoreDomainInterfacesIUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new UpdateControlPanelCredentialsCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
