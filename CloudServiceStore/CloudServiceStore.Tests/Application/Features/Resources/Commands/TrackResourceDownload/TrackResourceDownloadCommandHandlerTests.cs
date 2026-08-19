using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Resources.Commands.TrackResourceDownload;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Resources.Commands.TrackResourceDownload;

public class TrackResourceDownloadCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldIncreaseDownloadCount()
    {
        var id = Guid.NewGuid();
        var resource = new DownloadableResource
        {
            Id = id,
            Title = "Nginx Template",
            Description = "desc",
            Category = "Nginx",
            FileUrl = "https://example.com/nginx.conf",
            FileExtension = ".conf",
            DownloadCount = 3
        };

        var repo = new Mock<IRepository<DownloadableResource>>();
        var uow = new Mock<IUnitOfWork>();

        repo.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resource);

        var handler = new TrackResourceDownloadCommandHandler(repo.Object, uow.Object);

        var result = await handler.Handle(new TrackResourceDownloadCommand(id), CancellationToken.None);

        result.Should().Be(4);
        resource.DownloadCount.Should().Be(4);
    }
}
