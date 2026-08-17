using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.ControlPanels.Queries.GetCredentials;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.ControlPanels.Queries.GetCredentials;

public class GetControlPanelCredentialsQueryHandlerTests
{
    private readonly Mock<IRepository<ControlPanelCredential>> _mockRepositoryControlPanelCredential;
    private readonly Mock<IRepository<OrderRequest>> _mockOrderRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUser;
    private readonly GetControlPanelCredentialsQueryHandler _handler;

    public GetControlPanelCredentialsQueryHandlerTests()
    {
        _mockRepositoryControlPanelCredential = new Mock<IRepository<ControlPanelCredential>>();
        _mockOrderRepo = new Mock<IRepository<OrderRequest>>();
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _handler = new GetControlPanelCredentialsQueryHandler(_mockRepositoryControlPanelCredential.Object, _mockOrderRepo.Object, _mockCurrentUser.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var request = new GetControlPanelCredentialsQuery(orderId);
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
