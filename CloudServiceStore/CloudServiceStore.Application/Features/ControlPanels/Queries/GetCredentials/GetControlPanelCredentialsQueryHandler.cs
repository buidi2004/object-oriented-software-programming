using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ControlPanels.Queries.GetCredentials;

public class GetControlPanelCredentialsQueryHandler : IRequestHandler<GetControlPanelCredentialsQuery, ControlPanelCredentialDto?>
{
    private readonly IRepository<ControlPanelCredential> _repo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUserService;

    public GetControlPanelCredentialsQueryHandler(
        IRepository<ControlPanelCredential> repo,
        IRepository<OrderRequest> orderRepo,
        ICurrentUserService currentUserService)
    {
        _repo = repo;
        _orderRepo = orderRepo;
        _currentUserService = currentUserService;
    }

    public async Task<ControlPanelCredentialDto?> Handle(GetControlPanelCredentialsQuery request, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(request.OrderId, ct);
        if (order == null) return null;

        if (_currentUserService.UserId.HasValue 
            && order.UserId != _currentUserService.UserId.Value 
            && !_currentUserService.IsInRole("Admin"))
        {
            return null;
        }

        var creds = await _repo.WhereAsync(c => c.OrderId == request.OrderId, ct);
        var cred = creds.FirstOrDefault();

        if (cred == null) return null;

        return new ControlPanelCredentialDto(cred.Id, cred.OrderId, cred.PanelType, cred.Url, cred.Username, cred.Password);
    }
}
