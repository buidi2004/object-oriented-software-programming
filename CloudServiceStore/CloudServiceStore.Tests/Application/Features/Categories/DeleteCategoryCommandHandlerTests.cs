using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Categories.Commands.Delete;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Categories;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<ServiceCategory>> _categoryRepoMock = new();
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();

    private DeleteCategoryCommandHandler CreateHandler() =>
        new(_uowMock.Object, _categoryRepoMock.Object, _planRepoMock.Object);

    [Fact]
    public async Task Handle_CategoryStillReferenced_ThrowsConflictException()
    {
        var categoryId = Guid.NewGuid();
        _categoryRepoMock.Setup(r => r.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ServiceCategory { Id = categoryId });
        _planRepoMock.Setup(r => r.AnyAsync(
                It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); 

        await Assert.ThrowsAsync<ConflictException>(
            () => CreateHandler().Handle(new DeleteCategoryCommand(categoryId), CancellationToken.None));

        _categoryRepoMock.Verify(r => r.Delete(It.IsAny<ServiceCategory>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoReferences_DeletesSuccessfully()
    {
        var categoryId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId };
        _categoryRepoMock.Setup(r => r.GetByIdAsync(categoryId, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _planRepoMock.Setup(r => r.AnyAsync(
                It.IsAny<Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await CreateHandler().Handle(new DeleteCategoryCommand(categoryId), CancellationToken.None);

        _categoryRepoMock.Verify(r => r.Delete(category), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ThrowsNotFoundException()
    {
        _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceCategory?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().Handle(new DeleteCategoryCommand(Guid.NewGuid()), CancellationToken.None));
    }
}
