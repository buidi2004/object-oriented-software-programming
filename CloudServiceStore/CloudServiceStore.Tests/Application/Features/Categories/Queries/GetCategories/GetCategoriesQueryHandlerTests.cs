using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Categories.Queries.GetCategories;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandlerTests
{
    private readonly Mock<IRepository<ServiceCategory>> _categoryRepoMock = new();
    private readonly GetCategoriesQueryHandler _handler;

    public GetCategoriesQueryHandlerTests()
    {
        _handler = new GetCategoriesQueryHandler(_categoryRepoMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnCategoriesOrderedByName()
    {
        var categories = new List<ServiceCategory>
        {
            new() { Id = Guid.NewGuid(), Name = "Web Hosting", Slug = "web-hosting" },
            new() { Id = Guid.NewGuid(), Name = "Cloud VPS", Slug = "cloud-vps" },
        };

        _categoryRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(categories);

        var result = await _handler.Handle(new GetCategoriesQuery(), CancellationToken.None);

        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Cloud VPS");
        result[1].Name.Should().Be("Web Hosting");
        result[0].Slug.Should().Be("cloud-vps");
    }
}
