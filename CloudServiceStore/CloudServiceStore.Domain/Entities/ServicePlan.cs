using CloudServiceStore.Domain.Primitives;
using System.Collections.Generic;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ServicePlan : AggregateRoot
{
    public Guid CategoryId { get; internal set; }
    public string Name { get; internal set; } = null!;
    public string? Cpu { get; internal set; }
    public string? Ram { get; internal set; }
    public string? Ssd { get; internal set; }
    public string? Bandwidth { get; internal set; }
    public string? QrCodeUrl { get; internal set; }
    public bool IsActive { get; internal set; }

    public ServiceCategory Category { get; internal set; } = null!;
    
    private readonly List<PlanPrice> _prices = new();
    public IReadOnlyCollection<PlanPrice> Prices => _prices.AsReadOnly();
    
    private readonly List<Promotion> _promotions = new();
    public IReadOnlyCollection<Promotion> Promotions => _promotions.AsReadOnly();
    
    private readonly List<Review> _reviews = new();
    public IReadOnlyCollection<Review> Reviews => _reviews.AsReadOnly();

    internal ServicePlan() { }

    public ServicePlan(Guid categoryId, string name, string? cpu, string? ram, string? ssd, string? bandwidth, string? qrCodeUrl)
    {
        Id = Guid.NewGuid();
        CategoryId = categoryId;
        Name = name;
        Cpu = cpu;
        Ram = ram;
        Ssd = ssd;
        Bandwidth = bandwidth;
        QrCodeUrl = qrCodeUrl;
        IsActive = true;
    }

    public void UpdateDetails(string name, string? cpu, string? ram, string? ssd, string? bandwidth)
    {
        Name = name;
        Cpu = cpu;
        Ram = ram;
        Ssd = ssd;
        Bandwidth = bandwidth;
    }

    public void AddPrice(PlanPrice price)
    {
        _prices.Add(price);
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}
