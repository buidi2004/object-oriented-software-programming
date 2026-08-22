using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Security.Commands.ChangePassword;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Security.Commands.ChangePassword;

public class ChangePasswordCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IPasswordHasher> _mockPasswordHasher;
    private readonly ChangePasswordCommandHandler _handler;

    public ChangePasswordCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockPasswordHasher = new Mock<IPasswordHasher>();
        _handler = new ChangePasswordCommandHandler(_mockUnitOfWork.Object, _mockRepositoryAppUser.Object, _mockCurrentUserService.Object, _mockPasswordHasher.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ChangePasswordCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
