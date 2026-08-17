using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Banners.Commands.DeleteBanner;

public record DeleteBannerCommand(Guid Id) : IRequest;

public class DeleteBannerCommandHandler : IRequestHandler<DeleteBannerCommand>
{
    private readonly IRepository<Banner> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBannerCommandHandler(IRepository<Banner> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteBannerCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException(nameof(Banner), request.Id);

        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
