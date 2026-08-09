using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Testimonials;

public class TestimonialCommandHandlerTests
{
    private readonly Mock<IRepository<Review>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    [Fact]
    public async Task FeatureTestimonial_NotFound_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Review?)null);

        var handler = new FeatureTestimonialCommandHandler(_repoMock.Object, _uowMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new FeatureTestimonialCommand { ReviewId = Guid.NewGuid(), IsFeatured = true }, CancellationToken.None));
    }

    [Fact]
    public async Task FeatureTestimonial_Unapproved_ThrowsBadRequestException()
    {
        var review = new Review { Id = Guid.NewGuid(), IsApproved = false };
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(review);

        var handler = new FeatureTestimonialCommandHandler(_repoMock.Object, _uowMock.Object);
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => handler.Handle(new FeatureTestimonialCommand { ReviewId = review.Id, IsFeatured = true }, CancellationToken.None));
        Assert.Contains("unapproved", ex.Message);
    }

    [Fact]
    public async Task FeatureTestimonial_Valid_UpdatesReview()
    {
        var review = new Review { Id = Guid.NewGuid(), IsApproved = true, IsFeatured = false };
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(review);

        var handler = new FeatureTestimonialCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new FeatureTestimonialCommand { ReviewId = review.Id, IsFeatured = true }, CancellationToken.None);

        Assert.True(result);
        Assert.True(review.IsFeatured);
        _repoMock.Verify(r => r.Update(review), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
