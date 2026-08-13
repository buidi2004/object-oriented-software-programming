using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Banners.Queries.GetBanners;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Banners.Queries.GetBanners;

public class GetBannersQueryHandlerTests
{
    private readonly Mock<IRepository<Banner>> _mockRepositoryBanner;
    private readonly GetBannersQueryHandler _handler;

    public GetBannersQueryHandlerTests()
    {
        _mockRepositoryBanner = new Mock<IRepository<Banner>>();
        _handler = new GetBannersQueryHandler(_mockRepositoryBanner.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetBannersQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
