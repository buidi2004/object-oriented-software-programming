using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Create;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServiceCategory> _repo;
    private readonly ICatalogCache _catalogCache;

    public CreateCategoryCommandHandler(
        IUnitOfWork uow,
        IRepository<ServiceCategory> repo,
        ICatalogCache catalogCache)
    {
        _uow = uow;
        _repo = repo;
        _catalogCache = catalogCache;
    }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var exists = await _repo.FirstOrDefaultAsync(c => c.Slug == request.Slug, ct);
        if (exists is not null)
            throw new ConflictException("Slug đã tồn tại.");

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = request.Name, Slug = request.Slug };
        await _repo.AddAsync(category, ct);
        await _uow.SaveChangesAsync(ct);
        await _catalogCache.InvalidateCatalogAsync(ct);
        return category.Id;
    }
}
