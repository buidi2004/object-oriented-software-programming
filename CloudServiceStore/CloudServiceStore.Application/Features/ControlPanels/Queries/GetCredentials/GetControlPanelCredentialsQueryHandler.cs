using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ControlPanels.Queries.GetCredentials;

public class GetControlPanelCredentialsQueryHandler : IRequestHandler<GetControlPanelCredentialsQuery, ControlPanelCredentialDto?>
{
    private readonly IRepository<ControlPanelCredential> _repo;

    public GetControlPanelCredentialsQueryHandler(IRepository<ControlPanelCredential> repo)
    {
        _repo = repo;
    }

    public async Task<ControlPanelCredentialDto?> Handle(GetControlPanelCredentialsQuery request, CancellationToken ct)
    {
        var creds = await _repo.WhereAsync(c => c.OrderId == request.OrderId, ct);
        var cred = creds.FirstOrDefault();

        if (cred == null) return null;

        return new ControlPanelCredentialDto(cred.Id, cred.OrderId, cred.PanelType, cred.Url, cred.Username, cred.Password);
    }
}
