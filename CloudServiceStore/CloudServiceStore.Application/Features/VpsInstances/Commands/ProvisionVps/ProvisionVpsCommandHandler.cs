using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommandHandler : IRequestHandler<ProvisionVpsCommand, System.Collections.Generic.List<VpsInstanceDto>>
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IVpsSpecParser _specParser;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IUnitOfWork _uow;
    private readonly IJobScheduler _jobScheduler;
    private readonly ICurrentUserService _currentUserService;
    private readonly VpsSettings _vpsSettings;

    public ProvisionVpsCommandHandler(
        IVpsProvisioningService provisioningService,
        IVpsSpecParser specParser,
        IRepository<VpsInstance> vpsRepo,
        IRepository<OrderRequest> orderRepo,
        IRepository<ServiceCategory> categoryRepo,
        IRepository<ServicePlan> planRepo,
        IUnitOfWork uow,
        IJobScheduler jobScheduler,
        ICurrentUserService currentUserService,
        IOptions<VpsSettings> vpsSettings)
    {
        _provisioningService = provisioningService;
        _specParser = specParser;
        _vpsRepo = vpsRepo;
        _orderRepo = orderRepo;
        _categoryRepo = categoryRepo;
        _planRepo = planRepo;
        _uow = uow;
        _jobScheduler = jobScheduler;
        _currentUserService = currentUserService;
        _vpsSettings = vpsSettings.Value;
    }

    public async Task<System.Collections.Generic.List<VpsInstanceDto>> Handle(ProvisionVpsCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken, o => o.Items!)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");

        if (order.Status != OrderStatus.Paid)
        {
            throw new BadRequestException("Chỉ có thể tạo VPS cho đơn hàng đã thanh toán.");
        }

        if (_currentUserService.UserId.HasValue
            && order.UserId != _currentUserService.UserId.Value
            && !_currentUserService.IsInRole("Admin"))
        {
            throw new UnauthorizedException("Bạn không có quyền tạo VPS cho đơn hàng này.");
        }

        var results = new System.Collections.Generic.List<VpsInstanceDto>();
        
        foreach (var item in order.Items)
        {
            var plan = await _planRepo.GetByIdAsync(item.ServicePlanId, cancellationToken);
            if (plan == null) throw new BadRequestException($"Plan is null for ID {item.ServicePlanId}");

            var category = await _categoryRepo.GetByIdAsync(plan.CategoryId, cancellationToken);
            if (category == null) throw new BadRequestException($"Category is null for ID {plan.CategoryId}");
            
            if (category.Slug != "cloud-vps")
            {
                throw new BadRequestException($"Category slug is {category.Slug} not cloud-vps");
            }

            // We should use a unique key for existing check, perhaps add OrderItemId later, 
            // but for now, this may have issues if multiple same VPS plans are ordered.
            // We just let it create. Wait, existing check needs PlanId at least.
            var existing = await _vpsRepo.FirstOrDefaultAsync(
                v => v.OrderId == order.Id && v.PlanId == item.ServicePlanId && v.Status != VpsInstanceStatus.Terminated,
                cancellationToken);

            if (existing != null)
            {
                results.Add(VpsInstanceMapper.ToDto(existing));
                continue;
            }

            var (cpuCores, memoryBytes, diskGb) = _specParser.Parse(plan);
            var containerName = BuildContainerName(plan.Name, order.UserId);
            var spec = new VpsProvisionSpec(
                containerName,
                cpuCores,
                memoryBytes,
                diskGb,
                _vpsSettings.DefaultImage);

            var ttl = ResolveTtl(item.BillingCycle);
            var now = DateTime.UtcNow;

            var vpsInstance = new VpsInstance
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                UserId = order.UserId,
                PlanId = plan.Id,
                PlanName = plan.Name,
                CpuCores = cpuCores,
                RamMb = (int)(memoryBytes / (1024 * 1024)),
                DiskGb = diskGb,
                ContainerName = containerName,
                Status = VpsInstanceStatus.Provisioning,
                CreatedAt = now,
                ExpiresAt = now.Add(ttl),
                LastActiveAt = now
            };

            await _vpsRepo.AddAsync(vpsInstance, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);

            var provisionResult = await _provisioningService.ProvisionAsync(spec, cancellationToken);
            if (!provisionResult.Success || string.IsNullOrEmpty(provisionResult.ContainerId))
            {
                vpsInstance.Status = VpsInstanceStatus.Failed;
                _vpsRepo.Update(vpsInstance);
                await _uow.SaveChangesAsync(cancellationToken);
                throw new BadRequestException(
                    provisionResult.ErrorMessage ?? "Failed to provision VPS container.");
            }

            vpsInstance.ContainerId = provisionResult.ContainerId;
            vpsInstance.ContainerName = provisionResult.ContainerName;
            vpsInstance.Status = VpsInstanceStatus.Running;
            _vpsRepo.Update(vpsInstance);
            await _uow.SaveChangesAsync(cancellationToken);

            results.Add(VpsInstanceMapper.ToDto(vpsInstance));
        }

        if (results.Count == 0)
        {
            throw new BadRequestException("Đơn hàng này không có gói Cloud VPS nào để tạo.");
        }

        return results;
    }

    private TimeSpan ResolveTtl(BillingCycle billingCycle)
    {
        return billingCycle switch
        {
            BillingCycle.Yearly => TimeSpan.FromDays(365),
            _ => TimeSpan.FromDays(30)
        };
    }

    private static string BuildContainerName(string planName, Guid userId)
    {
        var slug = new string(planName
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
            .ToArray())
            .Trim('-');

        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            slug = "vps";
        }

        return $"vps-{slug}-{userId.ToString()[..8]}-{Guid.NewGuid().ToString()[..8]}";
    }
}
