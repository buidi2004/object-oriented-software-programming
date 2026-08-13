using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Update;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServiceCategory> _repo;
    private readonly ICatalogCache _catalogCache;

    public UpdateCategoryCommandHandler(
        IUnitOfWork uow,
        IRepository<ServiceCategory> repo,
        ICatalogCache catalogCache)
    {
        _uow = uow;
        _repo = repo;
        _catalogCache = catalogCache;
    }

    public async Task Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await _repo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Không tìm thấy danh mục.");

        var slugTaken = await _repo.FirstOrDefaultAsync(
            c => c.Slug == request.Slug && c.Id != request.Id, ct);
        if (slugTaken is not null) throw new ConflictException("Slug đã được dùng bởi danh mục khác.");

        category.Name = request.Name;
        category.Slug = request.Slug;
        await _uow.SaveChangesAsync(ct);
        await _catalogCache.InvalidateCatalogAsync(ct);
    }
}
