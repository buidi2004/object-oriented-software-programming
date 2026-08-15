using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Settings.Commands.UpdateSetting;

public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand, bool>
{
    private readonly IRepository<SystemSetting> _repository;

    public UpdateSettingCommandHandler(IRepository<SystemSetting> repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(UpdateSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = (await _repository.WhereAsync(s => s.Key == request.Key, cancellationToken)).FirstOrDefault();

        if (setting == null)
        {
            setting = new SystemSetting { Id = System.Guid.NewGuid(), Key = request.Key, Value = request.Value };
            await _repository.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = request.Value;
            _repository.Update(setting);
        }

        return true;
    }
}
