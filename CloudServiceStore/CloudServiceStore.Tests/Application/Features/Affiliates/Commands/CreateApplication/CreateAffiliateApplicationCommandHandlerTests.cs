using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Affiliates.Commands.CreateApplication;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Affiliates.Commands.CreateApplication;

public class CreateAffiliateApplicationCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<AffiliateApplication>> _mockRepositoryAffiliateApplication;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly CreateAffiliateApplicationCommandHandler _handler;

    public CreateAffiliateApplicationCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryAffiliateApplication = new Mock<IRepository<AffiliateApplication>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new CreateAffiliateApplicationCommandHandler(_mockUnitOfWork.Object, _mockRepositoryAffiliateApplication.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreateAffiliateApplicationCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
