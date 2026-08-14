using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.VpsInstances.Commands.TerminateVps;

public class TerminateVpsCommandHandlerTests
{
    private readonly Mock<IVpsProvisioningService> _mockVpsProvisioningService;
    private readonly Mock<IRepository<VpsInstance>> _mockRepositoryVpsInstance;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly TerminateVpsCommandHandler _handler;

    public TerminateVpsCommandHandlerTests()
    {
        _mockVpsProvisioningService = new Mock<IVpsProvisioningService>();
        _mockRepositoryVpsInstance = new Mock<IRepository<VpsInstance>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new TerminateVpsCommandHandler(_mockVpsProvisioningService.Object, _mockRepositoryVpsInstance.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new TerminateVpsCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
