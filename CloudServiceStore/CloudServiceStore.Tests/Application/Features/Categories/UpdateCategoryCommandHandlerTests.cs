using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Categories.Commands.Update;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;
using FluentAssertions;

namespace CloudServiceStore.Tests.Application.Features.Categories;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<ServiceCategory>> _repoMock = new();

    private UpdateCategoryCommandHandler CreateHandler() =>
        new(_uowMock.Object, _repoMock.Object);

    [Fact]
    public async Task Handle_CategoryNotFound_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceCategory?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().Handle(new UpdateCategoryCommand(Guid.NewGuid(), "Name", "slug"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_SlugTakenByAnotherCategory_ThrowsConflictException()
    {
        var categoryId = Guid.NewGuid();
        var existingCategory = new ServiceCategory { Id = categoryId, Name = "Old Name", Slug = "old-slug" };
        
        _repoMock.Setup(r => r.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCategory);

        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ServiceCategory, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ServiceCategory { Id = Guid.NewGuid() }); // Returns another category

        await Assert.ThrowsAsync<ConflictException>(
            () => CreateHandler().Handle(new UpdateCategoryCommand(categoryId, "New Name", "taken-slug"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_UpdatesAndSaves()
    {
        var categoryId = Guid.NewGuid();
        var existingCategory = new ServiceCategory { Id = categoryId, Name = "Old Name", Slug = "old-slug" };
        
        _repoMock.Setup(r => r.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCategory);

        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ServiceCategory, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceCategory?)null);

        await CreateHandler().Handle(new UpdateCategoryCommand(categoryId, "New Name", "new-slug"), CancellationToken.None);

        existingCategory.Name.Should().Be("New Name");
        existingCategory.Slug.Should().Be("new-slug");
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
