using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;

public class SubscribeNewsletterCommandHandler : IRequestHandler<SubscribeNewsletterCommand, bool>
{
    private readonly IRepository<NewsletterSubscriber> _repo;
    private readonly IUnitOfWork _uow;

    public SubscribeNewsletterCommandHandler(IRepository<NewsletterSubscriber> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<bool> Handle(SubscribeNewsletterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repo.FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);
        if (existing != null)
        {
            if (existing.IsActive) throw new ConflictException("Email is already subscribed.");
            
            existing.IsActive = true;
            _repo.Update(existing);
        }
        else
        {
            var sub = new NewsletterSubscriber
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                SubscribedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _repo.AddAsync(sub, cancellationToken);
        }

        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
