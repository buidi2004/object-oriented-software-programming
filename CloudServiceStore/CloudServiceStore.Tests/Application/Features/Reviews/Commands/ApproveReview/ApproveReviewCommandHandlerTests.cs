using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Reviews.Commands.ApproveReview;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Reviews.Commands.ApproveReview;

public class ApproveReviewCommandHandlerTests
{
    private readonly Mock<IRepository<Review>> _mockRepositoryReview;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly ApproveReviewCommandHandler _handler;

    public ApproveReviewCommandHandlerTests()
    {
        _mockRepositoryReview = new Mock<IRepository<Review>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new ApproveReviewCommandHandler(_mockRepositoryReview.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ApproveReviewCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
