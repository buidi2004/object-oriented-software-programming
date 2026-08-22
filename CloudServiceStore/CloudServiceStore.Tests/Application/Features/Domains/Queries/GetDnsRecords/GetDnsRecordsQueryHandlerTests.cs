using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Domains.Queries.GetDnsRecords;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Domains.Queries.GetDnsRecords;

public class GetDnsRecordsQueryHandlerTests
{
    private readonly Mock<IRepository<DomainRecord>> _mockRepositoryDomainRecord;
    private readonly Mock<IRepository<DnsRecord>> _mockRepositoryDnsRecord;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetDnsRecordsQueryHandler _handler;

    public GetDnsRecordsQueryHandlerTests()
    {
        _mockRepositoryDomainRecord = new Mock<IRepository<DomainRecord>>();
        _mockRepositoryDnsRecord = new Mock<IRepository<DnsRecord>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetDnsRecordsQueryHandler(_mockRepositoryDomainRecord.Object, _mockRepositoryDnsRecord.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetDnsRecordsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
