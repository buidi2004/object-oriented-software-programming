using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using FluentValidation;
using System;

namespace CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;

public class UpdateControlPanelCredentialsCommandHandler : IRequestHandler<UpdateControlPanelCredentialsCommand, Guid>
{
    private readonly IRepository<ControlPanelCredential> _repo;
    private readonly CloudServiceStore.Domain.Interfaces.IUnitOfWork _uow;

    public UpdateControlPanelCredentialsCommandHandler(IRepository<ControlPanelCredential> repo, CloudServiceStore.Domain.Interfaces.IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Guid> Handle(UpdateControlPanelCredentialsCommand request, CancellationToken ct)
    {
        var existing = await _repo.WhereAsync(c => c.OrderId == request.OrderId, ct);
        var cred = existing.FirstOrDefault();

        if (cred == null)
        {
            cred = new ControlPanelCredential(request.OrderId, request.PanelType, request.Url, request.Username, request.Password);
            await _repo.AddAsync(cred, ct);
        }
        else
        {
            cred.Update(request.PanelType, request.Url, request.Username, request.Password);
            _repo.Update(cred);
        }

        await _uow.SaveChangesAsync(ct);
        return cred.Id;
    }
}
