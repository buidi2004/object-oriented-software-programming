using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Backups;

public class ScheduleBackupCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IRepository<BackupJob>> _backupRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private ScheduleBackupCommandHandler CreateHandler() => new(_uowMock.Object, _orderRepoMock.Object, _backupRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderRequest?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new ScheduleBackupCommand(Guid.NewGuid(), DateTime.UtcNow), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotOwnedByUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OrderRequest { UserId = Guid.NewGuid() }); // Different owner

        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new ScheduleBackupCommand(Guid.NewGuid(), DateTime.UtcNow), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotPaid_ThrowsConflictException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OrderRequest { UserId = userId, Status = OrderStatus.Pending }); // Not Paid

        await Assert.ThrowsAsync<ConflictException>(() => CreateHandler().Handle(new ScheduleBackupCommand(Guid.NewGuid(), DateTime.UtcNow), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_SchedulesBackup()
    {
        var userId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OrderRequest { Id = orderId, UserId = userId, Status = OrderStatus.Paid });

        var result = await CreateHandler().Handle(new ScheduleBackupCommand(orderId, DateTime.UtcNow), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _backupRepoMock.Verify(r => r.AddAsync(It.Is<BackupJob>(b => b.OrderRequestId == orderId && b.Status == BackupStatus.Pending), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
