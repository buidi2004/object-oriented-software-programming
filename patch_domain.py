import os

domain_path = "/home/buidi/Tài liệu/laptrinhphanemhuogndoituong/CloudServiceStore/CloudServiceStore.Domain"

def add_using(file_path, using_stmt):
    with open(file_path, "r") as f:
        content = f.read()
    if using_stmt not in content:
        content = using_stmt + "\n" + content
    with open(file_path, "w") as f:
        f.write(content)

def add_property(file_path, prop):
    with open(file_path, "r") as f:
        lines = f.readlines()
    
    # find the last closing brace
    for i in range(len(lines)-1, -1, -1):
        if "}" in lines[i]:
            lines.insert(i, "    " + prop + "\n")
            break
            
    with open(file_path, "w") as f:
        f.writelines(lines)

def replace_in_file(file_path, old, new):
    with open(file_path, "r") as f:
        content = f.read()
    content = content.replace(old, new)
    with open(file_path, "w") as f:
        f.write(content)

# 1. Add Coupon to OrderRequest
add_property(os.path.join(domain_path, "Entities/OrderRequest.cs"), "public Coupon? Coupon { get; set; }")

# 2. Add collections
# Cart -> CartItems
add_using(os.path.join(domain_path, "Entities/Cart.cs"), "using System.Collections.Generic;")
add_property(os.path.join(domain_path, "Entities/Cart.cs"), "public ICollection<CartItem> Items { get; set; } = new List<CartItem>();")

# ServicePlan -> PlanPrices, Promotions, Reviews
add_using(os.path.join(domain_path, "Entities/ServicePlan.cs"), "using System.Collections.Generic;")
add_property(os.path.join(domain_path, "Entities/ServicePlan.cs"), "public ICollection<PlanPrice> Prices { get; set; } = new List<PlanPrice>();")
add_property(os.path.join(domain_path, "Entities/ServicePlan.cs"), "public ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();")
add_property(os.path.join(domain_path, "Entities/ServicePlan.cs"), "public ICollection<Review> Reviews { get; set; } = new List<Review>();")

# SupportTicket -> TicketMessages
add_using(os.path.join(domain_path, "Entities/SupportTicket.cs"), "using System.Collections.Generic;")
add_property(os.path.join(domain_path, "Entities/SupportTicket.cs"), "public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();")

# OrderRequest -> Payments? No, 1-1, and it's already there (public Payment? Payment { get; set; })

# ServiceCategory -> ServicePlans
add_using(os.path.join(domain_path, "Entities/ServiceCategory.cs"), "using System.Collections.Generic;")
add_property(os.path.join(domain_path, "Entities/ServiceCategory.cs"), "public ICollection<ServicePlan> ServicePlans { get; set; } = new List<ServicePlan>();")

# 3. Create CartStatus Enum and apply it
cart_status_enum = """namespace CloudServiceStore.Domain.Enums;

public enum CartStatus
{
    Active = 1,
    CheckedOut = 2
}
"""
with open(os.path.join(domain_path, "Enums/CartStatus.cs"), "w") as f:
    f.write(cart_status_enum)

replace_in_file(os.path.join(domain_path, "Entities/Cart.cs"), 
    'public string Status { get; set; } = "Active"; // Active/CheckedOut',
    'public Enums.CartStatus Status { get; set; } = Enums.CartStatus.Active;')

print("Patched domain files successfully.")
