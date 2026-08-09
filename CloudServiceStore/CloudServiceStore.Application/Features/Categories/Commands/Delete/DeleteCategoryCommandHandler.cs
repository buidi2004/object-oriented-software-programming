using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Delete;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IRepository<ServicePlan> _planRepo;

    public DeleteCategoryCommandHandler(
        IUnitOfWork uow, IRepository<ServiceCategory> categoryRepo, IRepository<ServicePlan> planRepo)
    { _uow = uow; _categoryRepo = categoryRepo; _planRepo = planRepo; }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await _categoryRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Không tìm thấy danh mục.");

        var stillReferenced = await _planRepo.AnyAsync(p => p.CategoryId == request.Id, ct);
        if (stillReferenced)
            throw new ConflictException("Không thể xoá — vẫn còn gói dịch vụ thuộc danh mục này.");

        _categoryRepo.Delete(category);
        await _uow.SaveChangesAsync(ct);
    }
}
