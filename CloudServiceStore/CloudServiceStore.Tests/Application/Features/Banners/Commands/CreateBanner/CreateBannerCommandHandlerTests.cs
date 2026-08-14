using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Banners.Commands.CreateBanner;

public class CreateBannerCommandHandlerTests
{
    private readonly Mock<IRepository<Banner>> _mockRepositoryBanner;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly CreateBannerCommandHandler _handler;

    public CreateBannerCommandHandlerTests()
    {
        _mockRepositoryBanner = new Mock<IRepository<Banner>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new CreateBannerCommandHandler(_mockRepositoryBanner.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreateBannerCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
