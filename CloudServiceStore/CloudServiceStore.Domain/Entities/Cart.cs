using CloudServiceStore.Domain.Primitives;
using System.Collections.Generic;
using System;
using System.Linq;

namespace CloudServiceStore.Domain.Entities;

public class Cart : AggregateRoot
{
    public Guid UserId { get; private set; }
    public Enums.CartStatus Status { get; private set; } = Enums.CartStatus.Active;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public AppUser User { get; private set; } = null!;
    
    private readonly List<CartItem> _items = new();
    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    // private Cart() { } // EF Core

    public Cart(Guid userId)
    {
        UserId = userId;
        Status = Enums.CartStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(Guid servicePlanId, Enums.BillingCycle billingCycle, int quantity = 1)
    {
        var existingItem = _items.FirstOrDefault(x => x.ServicePlanId == servicePlanId && x.BillingCycle == billingCycle);
        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            _items.Add(new CartItem(servicePlanId, billingCycle, quantity));
        }
        UpdatedAt = DateTime.UtcNow;
        // RaiseDomainEvent(new CartItemAddedEvent(Id, servicePlanId));
    }

    public void UpdateItemQuantity(Guid itemId, int quantity)
    {
        var item = _items.FirstOrDefault(x => x.Id == itemId);
        if (item != null)
        {
            if (quantity <= 0)
            {
                _items.Remove(item);
            }
            else
            {
                item.UpdateQuantity(quantity);
            }
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(x => x.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Clear()
    {
        _items.Clear();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Checkout()
    {
        if (!_items.Any()) throw new InvalidOperationException("Cannot checkout an empty cart");
        Status = Enums.CartStatus.CheckedOut;
        UpdatedAt = DateTime.UtcNow;
    }
}
