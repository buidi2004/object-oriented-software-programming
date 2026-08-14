using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Faqs.Queries.GetAllFaqs;

public class GetAllFaqsQueryHandlerTests
{
    private readonly Mock<IRepository<FaqItem>> _repoMock = new();
    private readonly GetAllFaqsQueryHandler _handler;

    public GetAllFaqsQueryHandlerTests()
    {
        _handler = new GetAllFaqsQueryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsFaqsOrderedByDisplayOrder()
    {
        var faqs = new List<FaqItem>
        {
            new("Q2", "A2", "Billing", 2),
            new("Q1", "A1", "VPS", 1)
        };

        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(faqs);

        var result = await _handler.Handle(new GetAllFaqsQuery(), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Select(f => f.Question).Should().ContainInOrder("Q1", "Q2");
    }
}
