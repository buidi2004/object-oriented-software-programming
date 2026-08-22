using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Features.LiveChats.Notifications;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.TriggerChatBotReply;

public record TriggerChatBotReplyCommand(Guid SessionId, string UserMessage) : IRequest;

public class TriggerChatBotReplyCommandHandler : IRequestHandler<TriggerChatBotReplyCommand>
{
    private readonly IChatBotService _chatBot;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<FaqItem> _faqRepo;
    private readonly IRepository<ChatMessage> _msgRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<NewsArticle> _newsRepo;
    private readonly IUnitOfWork _uow;
    private readonly IPublisher _publisher;

    public TriggerChatBotReplyCommandHandler(
        IChatBotService chatBot,
        IRepository<ServicePlan> planRepo,
        IRepository<FaqItem> faqRepo,
        IRepository<ChatMessage> msgRepo,
        IRepository<AppUser> userRepo,
        IRepository<ChatSession> sessionRepo,
        IRepository<VpsInstance> vpsRepo,
        IRepository<OrderRequest> orderRepo,
        IRepository<NewsArticle> newsRepo,
        IUnitOfWork uow,
        IPublisher publisher)
    {
        _chatBot = chatBot;
        _planRepo = planRepo;
        _faqRepo = faqRepo;
        _msgRepo = msgRepo;
        _userRepo = userRepo;
        _sessionRepo = sessionRepo;
        _vpsRepo = vpsRepo;
        _orderRepo = orderRepo;
        _newsRepo = newsRepo;
        _uow = uow;
        _publisher = publisher;
    }

    public async Task Handle(TriggerChatBotReplyCommand request, CancellationToken ct)
    {
        // 1. Get Base Data (Simple RAG)
        var allPlans = await _planRepo.WhereAsync(p => p.IsActive, ct, p => p.Prices);
        var allFaqs = await _faqRepo.GetAllAsync(ct);
        var recentNews = await _newsRepo.WhereAsync(n => n.Status == CloudServiceStore.Domain.Enums.ArticleStatus.Published, ct);

        var plans = allPlans.Take(10).ToList();
        var faqs = allFaqs.Take(10).ToList();
        var topNews = recentNews.OrderByDescending(n => n.PublishedAt).Take(5).ToList();

        // 2. Build Context
        var sb = new StringBuilder();
        
        // 2a. Fetch Personal User Context
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct);
        if (session != null)
        {
            var user = await _userRepo.GetByIdAsync(session.UserId, ct);
            if (user != null)
            {
                sb.AppendLine("== THÔNG TIN KHÁCH HÀNG ĐANG TRÒ CHUYỆN (BẠN ĐANG PHỤC VỤ KHÁCH NÀY) ==");
                sb.AppendLine($"- Tên khách hàng: {user.FullName}");
                sb.AppendLine($"- Email: {user.Email}");
                sb.AppendLine($"- Số điện thoại: {user.PhoneNumber ?? "Chưa cập nhật"}");

                // Get their VPS
                var userVps = await _vpsRepo.WhereAsync(v => v.UserId == user.Id, ct);
                if (userVps.Any())
                {
                    sb.AppendLine($"- Số lượng VPS đang sở hữu: {userVps.Count()}");
                    foreach (var v in userVps)
                    {
                        sb.AppendLine($"+ Tên VPS: {v.ContainerName}, Gói: {v.PlanName}, RAM: {v.RamMb}MB, CPU: {v.CpuCores} Core, Trạng thái: {v.Status}, Hết hạn: {v.ExpiresAt:dd/MM/yyyy}");
                    }
                }
                else
                {
                    sb.AppendLine("- Khách hàng hiện chưa có (chưa đăng ký/sở hữu) VPS nào.");
                }

                // Get their Order/Payment History
                var userOrders = await _orderRepo.WhereAsync(o => o.UserId == user.Id, ct);
                if (userOrders.Any())
                {
                    var recentOrders = userOrders.OrderByDescending(o => o.CreatedAt).Take(5).ToList();
                    sb.AppendLine($"- Lịch sử thanh toán/Hóa đơn gần đây (tối đa 5):");
                    foreach (var o in recentOrders)
                    {
                        sb.AppendLine($"+ Mã đơn: {o.Id}, Ngày tạo: {o.CreatedAt:dd/MM/yyyy}, Tổng tiền: {o.TotalAmount:N0} VND, Trạng thái: {o.Status}");
                    }
                }
            }
        }

        sb.AppendLine("== HƯỚNG DẪN HỆ THỐNG & CHÍNH SÁCH ==");
        sb.AppendLine("- Cài lại hệ điều hành (Reinstall OS): Khách hàng có thể cài lại OS bằng cách vào trang Quản lý VPS -> Nhấp vào VPS tương ứng -> Chọn tab 'Hành động' hoặc 'Cài lại OS' -> Chọn hệ điều hành (Ubuntu, CentOS, Windows...) và xác nhận. Quá trình mất khoảng 2-5 phút.");
        sb.AppendLine("- Chính sách hoàn tiền (Refund Policy): Hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu khách hàng không hài lòng hoặc gặp lỗi từ phía máy chủ. Yêu cầu khách hàng gửi Ticket Hỗ Trợ để bộ phận kế toán xử lý.");
        sb.AppendLine("- Trang tin tức / Blog: Khuyên khách hàng truy cập đường link '/news' hoặc 'https://domain-cua-ban/news' để đọc các tin tức công nghệ và khuyến mãi mới nhất.");

        if (topNews.Any())
        {
            sb.AppendLine("== TIN TỨC MỚI NHẤT (LATEST NEWS) ==");
            foreach (var n in topNews)
            {
                sb.AppendLine($"- Tiêu đề: {n.Title}, Ngày đăng: {n.PublishedAt:dd/MM/yyyy} (Link: /news/{n.Slug})");
            }
        }

        if (plans.Any())
        {
            sb.AppendLine("== DANH SÁCH GÓI DỊCH VỤ CỦA CLOUDHOST VN ==");
            foreach (var p in plans)
            {
                var priceText = string.Join(", ", p.Prices.Select(pr => $"{pr.BillingCycle}: {pr.Price:N0} {pr.Currency}"));
                sb.AppendLine($"- Tên gói: {p.Name}, Cấu hình: (RAM {p.Ram}, CPU {p.Cpu}, SSD {p.Ssd}, Băng thông {p.Bandwidth}) - Giá: {priceText}");
            }
        }

        if (faqs.Any())
        {
            sb.AppendLine("== CÂU HỎI THƯỜNG GẶP ==");
            foreach (var f in faqs)
                sb.AppendLine($"- Q: {f.Question} / A: {f.Answer}");
        }

        string reply;
        if (!plans.Any() && !faqs.Any() && session == null)
        {
            reply = "Xin lỗi, tôi chưa có thông tin chính xác về câu hỏi này. Bạn vui lòng chờ trong giây lát để nhân viên tư vấn hỗ trợ nhé!";
        }
        else
        {
            // 3. Ask Gemini
            reply = await _chatBot.AskAsync(request.UserMessage, sb.ToString());
        }

        // 4. Resolve distinct Bot User so SenderId is never the customer's UserId
        var botUser = await _userRepo.FirstOrDefaultAsync(u => (session == null || u.Id != session.UserId) && (u.Email.Contains("admin") || u.Email.Contains("bot") || u.IsActive), ct);
        if (botUser == null && session != null)
        {
            var existingUser = await _userRepo.GetByIdAsync(session.UserId, ct);
            botUser = new AppUser(
                fullName: "CloudHost AI Assistant",
                email: "ai-assistant@cloudhost.vn",
                passwordHash: "SYSTEM_BOT_ACCOUNT",
                roleId: existingUser?.RoleId ?? Guid.Empty
            );
            await _userRepo.AddAsync(botUser, ct);
            await _uow.SaveChangesAsync(ct);
        }
        var botId = botUser?.Id ?? Guid.Empty;

        // 5. Save Bot Message
        var botMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            SenderId = botId,
            Message = reply,
            CreatedAt = DateTime.UtcNow
        };

        await _msgRepo.AddAsync(botMessage, ct);
        await _uow.SaveChangesAsync(ct);

        // 5. Broadcast via SignalR
        await _publisher.Publish(new ChatMessageSentNotification(
            botMessage.Id,
            botMessage.SessionId,
            botMessage.SenderId,
            botMessage.Message,
            botMessage.CreatedAt
        ), ct);
    }
}
