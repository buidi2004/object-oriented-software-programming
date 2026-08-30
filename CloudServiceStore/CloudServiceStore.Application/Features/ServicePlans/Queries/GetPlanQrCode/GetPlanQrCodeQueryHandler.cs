using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using QRCoder;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetPlanQrCode;

public class GetPlanQrCodeQueryHandler : IRequestHandler<GetPlanQrCodeQuery, string>
{
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;

    public GetPlanQrCodeQueryHandler(IRepository<ServicePlan> planRepo, IRepository<ServiceCategory> categoryRepo)
    {
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<string> Handle(GetPlanQrCodeQuery request, CancellationToken cancellationToken)
    {
        var plan = await _planRepo.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) throw new Exception("Plan not found");
        
        var category = await _categoryRepo.GetByIdAsync(plan.CategoryId, cancellationToken);
        if (category == null) throw new Exception("Category not found");

        var domain = "http://localhost:3000"; 
        var url = $"{domain}/services/{category.Slug}?plan={plan.Id}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeImage = qrCode.GetGraphic(20);
        
        return "data:image/png;base64," + Convert.ToBase64String(qrCodeImage);
    }
}
