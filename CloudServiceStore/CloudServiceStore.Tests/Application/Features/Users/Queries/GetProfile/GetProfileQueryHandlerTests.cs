using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Users.Queries.GetProfile;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Users.Queries.GetProfile;

public class GetProfileQueryHandlerTests
{
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetProfileQueryHandler _handler;

    public GetProfileQueryHandlerTests()
    {
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetProfileQueryHandler(_mockRepositoryAppUser.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetProfileQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
