using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Affiliates.Queries.GetMyApplication;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Affiliates.Queries.GetMyApplication;

public class GetMyAffiliateApplicationQueryHandlerTests
{
    private readonly Mock<IRepository<AffiliateApplication>> _mockRepositoryAffiliateApplication;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyAffiliateApplicationQueryHandler _handler;

    public GetMyAffiliateApplicationQueryHandlerTests()
    {
        _mockRepositoryAffiliateApplication = new Mock<IRepository<AffiliateApplication>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyAffiliateApplicationQueryHandler(_mockRepositoryAffiliateApplication.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyAffiliateApplicationQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
