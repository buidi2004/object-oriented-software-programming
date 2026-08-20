using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;

public class UpdateNotificationSettingCommandHandler : IRequestHandler<UpdateNotificationSettingCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<NotificationSetting> _repo;
    private readonly ICurrentUserService _currentUser;

    public UpdateNotificationSettingCommandHandler(
        IUnitOfWork uow,
        IRepository<NotificationSetting> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateNotificationSettingCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var setting = await _repo.FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (setting == null)
        {
            setting = new NotificationSetting
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EmailOnOrder = request.EmailOnOrder,
                EmailOnSecurity = request.EmailOnSecurity,
                EmailOnPromotion = request.EmailOnPromotion,
                PhoneNumber = request.PhoneNumber,
                ZaloId = request.ZaloId,
                TelegramChatId = request.TelegramChatId,
                SmsOnOrder = request.SmsOnOrder,
                SmsOnExpiring = request.SmsOnExpiring,
                ZaloOnPromotion = request.ZaloOnPromotion,
                TelegramOnAlert = request.TelegramOnAlert
            };
            await _repo.AddAsync(setting, ct);
        }
        else
        {
            setting.EmailOnOrder = request.EmailOnOrder;
            setting.EmailOnSecurity = request.EmailOnSecurity;
            setting.EmailOnPromotion = request.EmailOnPromotion;
            setting.PhoneNumber = request.PhoneNumber;
            setting.ZaloId = request.ZaloId;
            setting.TelegramChatId = request.TelegramChatId;
            setting.SmsOnOrder = request.SmsOnOrder;
            setting.SmsOnExpiring = request.SmsOnExpiring;
            setting.ZaloOnPromotion = request.ZaloOnPromotion;
            setting.TelegramOnAlert = request.TelegramOnAlert;
            _repo.Update(setting);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
