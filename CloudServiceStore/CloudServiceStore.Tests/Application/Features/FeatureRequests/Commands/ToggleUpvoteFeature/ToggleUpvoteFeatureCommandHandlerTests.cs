using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.FeatureRequests.Commands.ToggleUpvoteFeature;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.FeatureRequests.Commands.ToggleUpvoteFeature;

public class ToggleUpvoteFeatureCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoExistingUpvote_ShouldAddUpvoteAndReturnTrue()
    {
        var userId = Guid.NewGuid();
        var featureId = Guid.NewGuid();

        var uow = new Mock<IUnitOfWork>();
        var featureRepo = new Mock<IRepository<FeatureRequest>>();
        var upvoteRepo = new Mock<IRepository<FeatureUpvote>>();
        var currentUser = new Mock<ICurrentUserService>();

        currentUser.Setup(x => x.UserId).Returns(userId);

        featureRepo.Setup(x => x.GetByIdAsync(featureId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FeatureRequest { Id = featureId, Title = "Need API", Description = "desc", Category = "Api", UpvoteCount = 0 });

        upvoteRepo.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<FeatureUpvote, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((FeatureUpvote?)null);

        var handler = new ToggleUpvoteFeatureCommandHandler(uow.Object, featureRepo.Object, upvoteRepo.Object, currentUser.Object);

        var result = await handler.Handle(new ToggleUpvoteFeatureCommand(featureId), CancellationToken.None);

        result.Should().BeTrue();
        upvoteRepo.Verify(x => x.AddAsync(It.IsAny<FeatureUpvote>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
