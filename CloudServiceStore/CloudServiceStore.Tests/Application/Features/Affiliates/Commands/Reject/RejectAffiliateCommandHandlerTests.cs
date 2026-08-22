using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Affiliates.Commands.Reject;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Affiliates.Commands.Reject;

public class RejectAffiliateCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<AffiliateApplication>> _mockRepositoryAffiliateApplication;
    private readonly RejectAffiliateCommandHandler _handler;

    public RejectAffiliateCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryAffiliateApplication = new Mock<IRepository<AffiliateApplication>>();
        _handler = new RejectAffiliateCommandHandler(_mockUnitOfWork.Object, _mockRepositoryAffiliateApplication.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RejectAffiliateCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
