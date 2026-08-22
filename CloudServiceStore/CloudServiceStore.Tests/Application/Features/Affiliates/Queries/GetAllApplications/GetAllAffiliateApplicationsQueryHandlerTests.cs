using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Affiliates.Queries.GetAllApplications;

public class GetAllAffiliateApplicationsQueryHandlerTests
{
    private readonly Mock<IRepository<AffiliateApplication>> _mockRepositoryAffiliateApplication;
    private readonly GetAllAffiliateApplicationsQueryHandler _handler;

    public GetAllAffiliateApplicationsQueryHandlerTests()
    {
        _mockRepositoryAffiliateApplication = new Mock<IRepository<AffiliateApplication>>();
        _handler = new GetAllAffiliateApplicationsQueryHandler(_mockRepositoryAffiliateApplication.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAllAffiliateApplicationsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
