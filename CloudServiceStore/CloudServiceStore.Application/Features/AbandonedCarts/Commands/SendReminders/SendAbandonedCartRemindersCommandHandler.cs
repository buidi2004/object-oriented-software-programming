using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AbandonedCarts.Commands.SendReminders;

public class SendAbandonedCartRemindersCommandHandler : IRequestHandler<SendAbandonedCartRemindersCommand, int>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartReminder> _reminderRepo;

    public SendAbandonedCartRemindersCommandHandler(
        IUnitOfWork uow, 
        IRepository<Cart> cartRepo, 
        IRepository<CartReminder> reminderRepo)
    {
        _uow = uow;
        _cartRepo = cartRepo;
        _reminderRepo = reminderRepo;
    }

    public async Task<int> Handle(SendAbandonedCartRemindersCommand request, CancellationToken ct)
    {
        var threshold = DateTime.UtcNow.AddHours(-24);
        var carts = await _cartRepo.GetAllAsync(ct);
        
        // Filter abandoned carts
        var abandonedCarts = carts.Where(c => c.Items != null && c.Items.Any() && c.UpdatedAt <= threshold).ToList();
        
        int sentCount = 0;
        foreach (var cart in abandonedCarts)
        {
            var existingReminders = await _reminderRepo.WhereAsync(r => r.CartId == cart.Id, ct);
            if (existingReminders.Any()) continue; // Already sent

            // Simulate sending email (in real life, inject IEmailService)
            
            var reminder = new CartReminder
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                UserId = cart.UserId,
                SentAt = DateTime.UtcNow,
                Status = "Sent"
            };

            await _reminderRepo.AddAsync(reminder, ct);
            sentCount++;
        }

        if (sentCount > 0)
        {
            await _uow.SaveChangesAsync(ct);
        }

        return sentCount;
    }
}
