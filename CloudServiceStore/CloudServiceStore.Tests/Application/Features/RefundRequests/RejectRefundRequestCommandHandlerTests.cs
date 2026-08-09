using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.RefundRequests.Commands.RejectRefundRequest;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.RefundRequests;

public class RejectRefundRequestCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<RefundRequest>> _refundRepoMock = new();

    private RejectRefundRequestCommandHandler CreateHandler() => new(_uowMock.Object, _refundRepoMock.Object);

    [Fact]
    public async Task Handle_ValidRequest_RejectsRefund()
    {
        var refundId = Guid.NewGuid();
        var refund = new RefundRequest { Id = refundId, Status = RefundRequestStatus.Pending };

        _refundRepoMock.Setup(r => r.GetByIdAsync(refundId, It.IsAny<CancellationToken>())).ReturnsAsync(refund);

        var result = await CreateHandler().Handle(new RejectRefundRequestCommand(refundId), CancellationToken.None);
        
        Assert.True(result);
        Assert.Equal(RefundRequestStatus.Rejected, refund.Status);
        
        _refundRepoMock.Verify(r => r.Update(refund), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
