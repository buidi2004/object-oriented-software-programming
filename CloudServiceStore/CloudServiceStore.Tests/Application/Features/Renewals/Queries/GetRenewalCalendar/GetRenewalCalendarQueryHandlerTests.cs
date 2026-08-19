using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Renewals.Queries.GetRenewalCalendar;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Renewals.Queries.GetRenewalCalendar;

public class GetRenewalCalendarQueryHandlerTests
{
    [Fact]
    public async Task Handle_ShouldReturnRenewalEventsForMonth()
    {
        var userId = Guid.NewGuid();

        var vpsRepo = new Mock<IRepository<VpsInstance>>();
        var domainRepo = new Mock<IRepository<DomainRecord>>();
        var sslRepo = new Mock<IRepository<SslCertificate>>();
        var currentUser = new Mock<ICurrentUserService>();

        currentUser.Setup(x => x.UserId).Returns(userId);

        var monthDate = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc);

        vpsRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<VpsInstance, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VpsInstance>
            {
                new() { UserId = userId, PlanName = "VPS Pro", ExpiresAt = monthDate }
            });

        var domainId = Guid.NewGuid();
        domainRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<DomainRecord, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DomainRecord>
            {
                new() { Id = domainId, UserId = userId, Name = "example.com", ExpiryDate = monthDate, AutoRenew = true }
            });

        sslRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<SslCertificate, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<SslCertificate>
            {
                new() { DomainId = domainId, ExpiryDate = monthDate }
            });

        var handler = new GetRenewalCalendarQueryHandler(vpsRepo.Object, domainRepo.Object, sslRepo.Object, currentUser.Object);

        var result = await handler.Handle(new GetRenewalCalendarQuery(8, 2026), CancellationToken.None);

        result.Should().HaveCount(3);
    }
}
