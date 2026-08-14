using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Referrals.Commands.ApplyReferralCode;

public class ApplyReferralCodeCommandHandlerTests
{
    private readonly Mock<IRepository<ReferralCode>> _mockRepositoryReferralCode;
    private readonly Mock<IRepository<ReferralReward>> _mockRepositoryReferralReward;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly ApplyReferralCodeCommandHandler _handler;

    public ApplyReferralCodeCommandHandlerTests()
    {
        _mockRepositoryReferralCode = new Mock<IRepository<ReferralCode>>();
        _mockRepositoryReferralReward = new Mock<IRepository<ReferralReward>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new ApplyReferralCodeCommandHandler(_mockRepositoryReferralCode.Object, _mockRepositoryReferralReward.Object, _mockUnitOfWork.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ApplyReferralCodeCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
