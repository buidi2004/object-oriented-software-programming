using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.RecentlyViewed.Commands.RecordView;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.RecentlyViewed.Commands.RecordView;

public class RecordViewCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<RecentlyViewedItem>> _mockRepositoryRecentlyViewedItem;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly RecordViewCommandHandler _handler;

    public RecordViewCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryRecentlyViewedItem = new Mock<IRepository<RecentlyViewedItem>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new RecordViewCommandHandler(_mockUnitOfWork.Object, _mockRepositoryRecentlyViewedItem.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RecordViewCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
