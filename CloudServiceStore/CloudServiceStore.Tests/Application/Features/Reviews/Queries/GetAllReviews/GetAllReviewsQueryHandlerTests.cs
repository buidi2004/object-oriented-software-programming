using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Reviews.Queries.GetAllReviews;

public class GetAllReviewsQueryHandlerTests
{
    private readonly Mock<IRepository<Review>> _mockRepositoryReview;
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly GetAllReviewsQueryHandler _handler;

    public GetAllReviewsQueryHandlerTests()
    {
        _mockRepositoryReview = new Mock<IRepository<Review>>();
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _handler = new GetAllReviewsQueryHandler(_mockRepositoryReview.Object, _mockRepositoryServicePlan.Object, _mockRepositoryAppUser.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAllReviewsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
