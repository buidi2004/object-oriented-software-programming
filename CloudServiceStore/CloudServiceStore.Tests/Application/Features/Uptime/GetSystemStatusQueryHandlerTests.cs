using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Uptime.Queries.GetSystemStatus;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Uptime;

public class GetSystemStatusQueryHandlerTests
{
    private readonly Mock<IRepository<ServiceStatusLog>> _statusRepoMock = new();

    private GetSystemStatusQueryHandler CreateHandler() => new(_statusRepoMock.Object);

    [Fact]
    public async Task Handle_ValidRequest_ReturnsSystemStatusLogs()
    {
        _statusRepoMock.Setup(r => r.WhereAsync(It.IsAny<Expression<Func<ServiceStatusLog, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceStatusLog> { new ServiceStatusLog { ServicePlanId = Guid.NewGuid() } });

        var result = await CreateHandler().Handle(new GetSystemStatusQuery(), CancellationToken.None);
        
        Assert.Single(result);
    }
}
