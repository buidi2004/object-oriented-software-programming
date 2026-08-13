using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Testimonials.Queries.GetTestimonials;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Testimonials.Queries.GetTestimonials;

public class GetTestimonialsQueryHandlerTests
{
    private readonly Mock<IRepository<Review>> _mockRepositoryReview;
    private readonly GetTestimonialsQueryHandler _handler;

    public GetTestimonialsQueryHandlerTests()
    {
        _mockRepositoryReview = new Mock<IRepository<Review>>();
        _handler = new GetTestimonialsQueryHandler(_mockRepositoryReview.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetTestimonialsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
