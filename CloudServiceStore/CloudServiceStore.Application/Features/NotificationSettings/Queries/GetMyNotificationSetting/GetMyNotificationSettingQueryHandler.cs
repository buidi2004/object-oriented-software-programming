using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.NotificationSettings.Queries.GetMyNotificationSetting;

public class GetMyNotificationSettingQueryHandler : IRequestHandler<GetMyNotificationSettingQuery, NotificationSettingDto>
{
    private readonly IRepository<NotificationSetting> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyNotificationSettingQueryHandler(IRepository<NotificationSetting> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<NotificationSettingDto> Handle(GetMyNotificationSettingQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var setting = await _repo.FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (setting == null)
        {
            return new NotificationSettingDto(true, true, true); // Default settings if not created
        }

        return new NotificationSettingDto(setting.EmailOnOrder, setting.EmailOnSecurity, setting.EmailOnPromotion);
    }
}
