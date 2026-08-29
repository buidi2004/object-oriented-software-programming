using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<NewsletterSubscriber> _newsletterRepo;
    private readonly IPasswordHasher _hasher;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        IUnitOfWork uow, 
        IRepository<AppUser> userRepo, 
        IRepository<NewsletterSubscriber> newsletterRepo,
        IPasswordHasher hasher,
        IEmailService emailService)
    {
        _uow = uow;
        _userRepo = userRepo;
        _newsletterRepo = newsletterRepo;
        _hasher = hasher;
        _emailService = emailService;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var existing = await _userRepo.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (existing is not null)
            throw new ConflictException("Email đã được sử dụng.");

        var roleId = await _uow.Roles.GetIdByNameAsync("Customer", ct);

        var user = new AppUser(
            request.FullName,
            request.Email,
            _hasher.Hash(request.Password),
            roleId,
            request.PhoneNumber,
            request.FirstName,
            request.LastName,
            request.Country,
            request.City,
            request.Ward,
            request.AddressLine,
            request.CompanyName,
            request.TaxCode
        );

        await _userRepo.AddAsync(user, ct);

        if (request.SubscribeNewsletter)
        {
            var existingSubscriber = await _newsletterRepo.FirstOrDefaultAsync(n => n.Email == request.Email, ct);
            if (existingSubscriber == null)
            {
                var subscriber = new NewsletterSubscriber
                {
                    Email = request.Email,
                    SubscribedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _newsletterRepo.AddAsync(subscriber, ct);
            }
        }

        await _uow.SaveChangesAsync(ct);
        
        _ = Task.Run(async () =>
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName, cts.Token);
            }
            catch { }
        });

        return new RegisterResult(user.Id, user.Email);
    }
}
