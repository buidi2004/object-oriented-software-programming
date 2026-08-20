using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.Create;

public class CreateServicePlanCommandHandler : IRequestHandler<CreateServicePlanCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IQrCodeGeneratorFactory _qrFactory;
    private readonly ICatalogCache _catalogCache;

    public CreateServicePlanCommandHandler(
        IUnitOfWork uow,
        IRepository<ServicePlan> planRepo,
        IRepository<ServiceCategory> categoryRepo,
        IQrCodeGeneratorFactory qrFactory,
        ICatalogCache catalogCache)
    {
        _uow = uow;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _qrFactory = qrFactory;
        _catalogCache = catalogCache;
    }

    public async Task<Guid> Handle(CreateServicePlanCommand request, CancellationToken ct)
    {
        var categoryExists = await _categoryRepo.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
            throw new NotFoundException("Không tìm thấy danh mục.");

        // Here we just pre-generate ID to have it for QR code. Wait, the constructor creates an ID.
        // It's better to pass it or let it generate. The constructor generates a random GUID.
        // If we want to use the generated ID for QR code, we should instantiate first, then set QR code.
        // But since we want to avoid public setters, let's just let constructor accept it or use it after.
        // I will change the constructor of ServicePlan to accept Id optionally.
        
        var planId = Guid.NewGuid();
        var qrGenerator = _qrFactory.CreateGenerator(QrCodeType.ServicePlan);
        var qrCodeUrl = qrGenerator.GenerateUrl(planId.ToString());

        var plan = new ServicePlan(request.CategoryId, request.Name, request.Cpu, request.Ram, request.Ssd, request.Bandwidth, qrCodeUrl);
        // Force the ID since we needed it for QR
        var prop = plan.GetType().GetProperty("Id");
        prop?.SetValue(plan, planId);

        if (!request.IsActive)
        {
            plan.Deactivate();
        }

        await _planRepo.AddAsync(plan, ct);
        await _uow.SaveChangesAsync(ct);
        await _catalogCache.InvalidateCatalogAsync(ct);
        return plan.Id;
    }
}
