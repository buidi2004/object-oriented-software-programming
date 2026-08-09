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

    public CreateServicePlanCommandHandler(
        IUnitOfWork uow, 
        IRepository<ServicePlan> planRepo, 
        IRepository<ServiceCategory> categoryRepo,
        IQrCodeGeneratorFactory qrFactory)
    {
        _uow = uow;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _qrFactory = qrFactory;
    }

    public async Task<Guid> Handle(CreateServicePlanCommand request, CancellationToken ct)
    {
        var categoryExists = await _categoryRepo.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
            throw new NotFoundException("Không tìm thấy danh mục.");

        var planId = Guid.NewGuid();
        var qrGenerator = _qrFactory.CreateGenerator(QrCodeType.ServicePlan);
        var qrCodeUrl = qrGenerator.GenerateUrl(planId.ToString());

        var plan = new ServicePlan
        {
            Id = planId,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Cpu = request.Cpu,
            Ram = request.Ram,
            Ssd = request.Ssd,
            Bandwidth = request.Bandwidth,
            QrCodeUrl = qrCodeUrl,
            IsActive = request.IsActive
        };

        await _planRepo.AddAsync(plan, ct);
        await _uow.SaveChangesAsync(ct);
        return plan.Id;
    }
}
