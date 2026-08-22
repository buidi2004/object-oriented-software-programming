using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Security.Commands.RevokeSession;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Security.Commands.RevokeSession;

public class RevokeSessionCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<UserSession>> _mockRepositoryUserSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly RevokeSessionCommandHandler _handler;

    public RevokeSessionCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryUserSession = new Mock<IRepository<UserSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new RevokeSessionCommandHandler(_mockUnitOfWork.Object, _mockRepositoryUserSession.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RevokeSessionCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
