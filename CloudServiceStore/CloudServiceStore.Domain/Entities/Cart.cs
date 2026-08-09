using System.Collections.Generic;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Cart
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Enums.CartStatus Status { get; set; } = Enums.CartStatus.Active;
    
    public AppUser User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
