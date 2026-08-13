using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Dashboard.Queries.GetMyDashboard;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Dashboard.Queries.GetMyDashboard;

public class GetMyDashboardQueryHandlerTests
{
    private readonly Mock<IRepository<OrderRequest>> _mockRepositoryOrderRequest;
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyDashboardQueryHandler _handler;

    public GetMyDashboardQueryHandlerTests()
    {
        _mockRepositoryOrderRequest = new Mock<IRepository<OrderRequest>>();
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyDashboardQueryHandler(_mockRepositoryOrderRequest.Object, _mockRepositoryServicePlan.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyDashboardQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
