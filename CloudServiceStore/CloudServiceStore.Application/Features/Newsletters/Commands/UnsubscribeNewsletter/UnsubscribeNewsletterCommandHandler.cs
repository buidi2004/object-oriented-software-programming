using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Newsletters.Commands.UnsubscribeNewsletter;

public class UnsubscribeNewsletterCommandHandler : IRequestHandler<UnsubscribeNewsletterCommand, bool>
{
    private readonly IRepository<NewsletterSubscriber> _repo;
    private readonly IUnitOfWork _uow;

    public UnsubscribeNewsletterCommandHandler(IRepository<NewsletterSubscriber> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<bool> Handle(UnsubscribeNewsletterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repo.FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);
        if (existing == null || !existing.IsActive) throw new NotFoundException("Active subscription not found for this email.");

        existing.IsActive = false;
        _repo.Update(existing);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
