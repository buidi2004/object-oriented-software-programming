using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/service-plans")]
public class ServicePlansController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServicePlansController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create(CreateServicePlanCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        // Returns 201 Created but GET endpoint doesn't exist yet, so we return a simple object.
        return CreatedAtAction(nameof(Create), new { id }, new { id }); 
    }
}
