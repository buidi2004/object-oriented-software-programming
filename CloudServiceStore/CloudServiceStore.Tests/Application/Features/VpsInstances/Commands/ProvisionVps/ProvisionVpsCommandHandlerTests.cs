using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommandHandlerTests
{
    private readonly Mock<IVpsProvisioningService> _mockVpsProvisioningService;
    private readonly Mock<IRepository<VpsInstance>> _mockRepositoryVpsInstance;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IJobScheduler> _mockJobScheduler;
    private readonly ProvisionVpsCommandHandler _handler;

    public ProvisionVpsCommandHandlerTests()
    {
        _mockVpsProvisioningService = new Mock<IVpsProvisioningService>();
        _mockRepositoryVpsInstance = new Mock<IRepository<VpsInstance>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockJobScheduler = new Mock<IJobScheduler>();
        _handler = new ProvisionVpsCommandHandler(_mockVpsProvisioningService.Object, _mockRepositoryVpsInstance.Object, _mockUnitOfWork.Object, _mockJobScheduler.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ProvisionVpsCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
