using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;

public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SystemSetting> _settingRepo;

    public UpdateSettingCommandHandler(IUnitOfWork uow, IRepository<SystemSetting> settingRepo)
    {
        _uow = uow;
        _settingRepo = settingRepo;
    }

    public async Task Handle(UpdateSettingCommand request, CancellationToken ct)
    {
        var setting = await _settingRepo.FirstOrDefaultAsync(s => s.Key == request.Key, ct);

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Id = Guid.NewGuid(),
                Key = request.Key,
                Value = request.Value,
                Description = request.Description
            };
            await _settingRepo.AddAsync(setting, ct);
        }
        else
        {
            setting.Value = request.Value;
            if (request.Description != null)
                setting.Description = request.Description;
            _settingRepo.Update(setting);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
