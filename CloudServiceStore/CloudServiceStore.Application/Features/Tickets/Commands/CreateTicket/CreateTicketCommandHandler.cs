using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;

public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;

    public CreateTicketCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUser,
        IEmailService emailService)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _userRepo = userRepo;
        _currentUser = currentUser;
        _emailService = emailService;
    }

    public async Task<Guid> Handle(CreateTicketCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = new SupportTicket(userId, request.Subject, request.Priority);
        await _ticketRepo.AddAsync(ticket, ct);
        await _uow.SaveChangesAsync(ct);

        try
        {
            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                var shortId = ticket.Id.ToString().Substring(0, 8);
                var subject = $"[CloudHost VN] Đã nhận yêu cầu hỗ trợ #{shortId}: {ticket.Subject}";
                var body = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;"">
                        <div style=""text-align: center; margin-bottom: 20px;"">
                            <img src=""https://object-oriented-software-programmin-sable.vercel.app/images/logo.png"" alt=""CloudHost VN Logo"" style=""height: 50px;"" />
                        </div>
                        <h2 style=""color: #2563eb; text-align: center;"">CloudHost VN - Hỗ Trợ Khách Hàng</h2>
                        <p>Xin chào <strong>{user.FullName ?? user.Email}</strong>,</p>
                        <p>Chúng tôi đã tiếp nhận yêu cầu hỗ trợ của bạn với thông tin sau:</p>
                        <table style=""width: 100%; border-collapse: collapse; margin: 15px 0;"">
                            <tr><td style=""padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;"">Mã Ticket:</td><td style=""padding: 8px; border: 1px solid #e2e8f0;"">#{shortId}</td></tr>
                            <tr><td style=""padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;"">Tiêu đề:</td><td style=""padding: 8px; border: 1px solid #e2e8f0;"">{ticket.Subject}</td></tr>
                            <tr><td style=""padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;"">Độ ưu tiên:</td><td style=""padding: 8px; border: 1px solid #e2e8f0;"">{ticket.Priority}</td></tr>
                            <tr><td style=""padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;"">Trạng thái:</td><td style=""padding: 8px; border: 1px solid #e2e8f0;"">Đang mở (Open)</td></tr>
                        </table>
                        <p>Đội ngũ kỹ thuật viên sẽ xem xét và phản hồi cho bạn trong thời gian sớm nhất.</p>
                        <p style=""text-align: center; margin-top: 20px;"">
                            <a href=""https://object-oriented-software-programmin-sable.vercel.app/tickets/{ticket.Id}"" style=""display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;"">Xem Ticket Của Bạn</a>
                        </p>
                        <hr style=""border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"" />
                        <p style=""font-size: 12px; color: #64748b; text-align: center;"">Email tự động từ hệ thống hỗ trợ CloudHost VN.</p>
                    </div>";

                await _emailService.SendEmailAsync(user.Email, subject, body);
            }
        }
        catch
        {
            // Email dispatch failure should not block ticket creation
        }

        return ticket.Id;
    }
}
