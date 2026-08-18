using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;

public class AddTicketMessageCommandHandler : IRequestHandler<AddTicketMessageCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<TicketMessage> _messageRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly IRepository<AppUser> _userRepo;

    public AddTicketMessageCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        IRepository<TicketMessage> messageRepo,
        ICurrentUserService currentUser,
        IEmailService emailService,
        IRepository<AppUser> userRepo)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _messageRepo = messageRepo;
        _currentUser = currentUser;
        _emailService = emailService;
        _userRepo = userRepo;
    }

    public async Task<Guid> Handle(AddTicketMessageCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = await _ticketRepo.GetByIdAsync(request.TicketId, ct)
            ?? throw new NotFoundException($"Ticket {request.TicketId} không tồn tại.");

        ticket.AddMessage(userId, request.Message, request.AttachmentUrl); // Domain logic throws if closed
        
        var message = ticket.Messages.Last();
        await _messageRepo.AddAsync(message, ct);

        await _uow.SaveChangesAsync(ct);

        // --- Send Email Notification if Admin replies to Customer ---
        if (userId != ticket.UserId)
        {
            var customer = await _userRepo.GetByIdAsync(ticket.UserId, ct);
            if (customer != null && !string.IsNullOrEmpty(customer.Email))
            {
                var frontendUrl = "http://localhost:3000";
                var ticketUrl = $"{frontendUrl}/tickets/{ticket.Id}";
                var emailSubject = $"[Cập nhật Support Ticket] {ticket.Subject}";
                var emailBody = $@"
                    <h3>Xin chào {customer.FullName},</h3>
                    <p>Ticket hỗ trợ <b>#{ticket.Id.ToString().Substring(0, 8)}</b> của bạn vừa có phản hồi mới từ bộ phận Support.</p>
                    <div style=""padding: 10px; border-left: 4px solid #0056b3; background-color: #f8f9fa; margin: 15px 0;"">
                        {request.Message.Replace("\n", "<br/>")}
                    </div>
                    <p>Vui lòng nhấp vào đường link bên dưới để xem chi tiết hoặc tiếp tục trao đổi:</p>
                    <p><a href=""{ticketUrl}"" style=""background-color: #0056b3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;"">Xem chi tiết Ticket</a></p>
                    <p>Trân trọng,<br/>Đội ngũ Hỗ trợ CloudServiceStore</p>
                ";
                await _emailService.SendEmailAsync(customer.Email, emailSubject, emailBody);
            }
        }

        return message.Id;
    }
}
