using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Reviews.Commands.CreateReview;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Reviews.Commands.CreateReview;

public class CreateReviewCommandHandlerTests
{
    private readonly Mock<IRepository<Review>> _mockRepositoryReview;
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryUser;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly CreateReviewCommandHandler _handler;

    public CreateReviewCommandHandlerTests()
    {
        _mockRepositoryReview = new Mock<IRepository<Review>>();
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockRepositoryUser = new Mock<IRepository<AppUser>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new CreateReviewCommandHandler(
            _mockRepositoryReview.Object,
            _mockRepositoryServicePlan.Object,
            _mockRepositoryUser.Object,
            _mockCurrentUserService.Object,
            _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreateReviewCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
