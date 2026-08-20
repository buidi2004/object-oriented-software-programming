using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AbandonedCarts.Commands.SendReminders;

public class SendAbandonedCartRemindersCommandHandler : IRequestHandler<SendAbandonedCartRemindersCommand, int>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartReminder> _reminderRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IEmailService _emailService;

    public SendAbandonedCartRemindersCommandHandler(
        IUnitOfWork uow, 
        IRepository<Cart> cartRepo, 
        IRepository<CartReminder> reminderRepo,
        IRepository<AppUser> userRepo,
        IEmailService emailService)
    {
        _uow = uow;
        _cartRepo = cartRepo;
        _reminderRepo = reminderRepo;
        _userRepo = userRepo;
        _emailService = emailService;
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

            if (cart.UserId != Guid.Empty)
            {
                var user = await _userRepo.GetByIdAsync(cart.UserId, ct);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    var html = $"<p>Xin chào <strong>{user.FullName}</strong>,</p><p>Bạn đang có sản phẩm chưa hoàn tất thanh toán trong giỏ hàng tại CloudHost VN. Hãy hoàn tất đơn hàng để nhận dịch vụ ngay hôm nay!</p><p><a href='http://localhost:3000/cart'>🛒 Xem lại giỏ hàng</a></p>";
                    await _emailService.SendEmailAsync(user.Email, "🛒 [Nhắc nhở] Giỏ hàng của bạn đang chờ hoàn tất - CloudHost VN", html, ct);
                }
            }
            
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
