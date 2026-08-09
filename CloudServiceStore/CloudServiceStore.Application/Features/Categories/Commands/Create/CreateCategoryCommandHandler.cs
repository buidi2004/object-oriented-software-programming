using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Create;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServiceCategory> _repo;

    public CreateCategoryCommandHandler(IUnitOfWork uow, IRepository<ServiceCategory> repo)
    { _uow = uow; _repo = repo; }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var exists = await _repo.FirstOrDefaultAsync(c => c.Slug == request.Slug, ct);
        if (exists is not null)
            throw new ConflictException("Slug đã tồn tại.");

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = request.Name, Slug = request.Slug };
        await _repo.AddAsync(category, ct);
        await _uow.SaveChangesAsync(ct);
        return category.Id;
    }
}
