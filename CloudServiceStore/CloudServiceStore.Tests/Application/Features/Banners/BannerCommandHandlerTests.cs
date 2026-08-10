using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;
using CloudServiceStore.Application.Features.Banners.Queries.GetBanners;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Banners;

public class BannerCommandHandlerTests
{
    private readonly Mock<IRepository<Banner>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    [Fact]
    public async Task GetBanners_ReturnsActiveAndValidDateBanners()
    {
        var banners = new List<Banner>
        {
            new() { Id = Guid.NewGuid(), IsActive = true, DisplayOrder = 1, StartDate = DateTime.UtcNow.AddDays(-1), EndDate = DateTime.UtcNow.AddDays(1) },
            new() { Id = Guid.NewGuid(), IsActive = true, DisplayOrder = 2, StartDate = null, EndDate = null }
        };

        _repoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<Banner, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(banners);

        var handler = new GetBannersQueryHandler(_repoMock.Object);
        var result = await handler.Handle(new GetBannersQuery(), CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].DisplayOrder);
    }

    [Fact]
    public async Task CreateBanner_ValidRequest_CreatesBanner()
    {
        var handler = new CreateBannerCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new CreateBannerCommand { ImageUrl = "http://test.jpg", DisplayOrder = 1 }, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _repoMock.Verify(r => r.AddAsync(It.Is<Banner>(x => x.ImageUrl == "http://test.jpg"), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateBanner_NotFound_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Banner?)null);

        var handler = new UpdateBannerCommandHandler(_repoMock.Object, _uowMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new UpdateBannerCommand { Id = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task UpdateBanner_ValidRequest_UpdatesBanner()
    {
        var banner = new Banner { Id = Guid.NewGuid(), ImageUrl = "old.jpg" };
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(banner);

        var handler = new UpdateBannerCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new UpdateBannerCommand { Id = banner.Id, ImageUrl = "new.jpg", IsActive = false }, CancellationToken.None);

        Assert.True(result);
        Assert.Equal("new.jpg", banner.ImageUrl);
        Assert.False(banner.IsActive);
        _repoMock.Verify(r => r.Update(banner), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
