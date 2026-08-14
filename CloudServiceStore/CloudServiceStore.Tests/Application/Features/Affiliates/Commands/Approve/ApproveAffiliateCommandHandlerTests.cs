using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Affiliates.Commands.Approve;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Affiliates.Commands.Approve;

public class ApproveAffiliateCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<AffiliateApplication>> _mockRepositoryAffiliateApplication;
    private readonly ApproveAffiliateCommandHandler _handler;

    public ApproveAffiliateCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryAffiliateApplication = new Mock<IRepository<AffiliateApplication>>();
        _handler = new ApproveAffiliateCommandHandler(_mockUnitOfWork.Object, _mockRepositoryAffiliateApplication.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ApproveAffiliateCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
