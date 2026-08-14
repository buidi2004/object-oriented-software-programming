import os
import re

test_dir = 'CloudServiceStore.Tests'

# Match `new OrderRequest(arg1, arg2, arg3, arg4, arg5, arg6)`
# Ensure there are exactly 6 arguments and they match typical test patterns.
pattern = re.compile(
    r'new\s+(?:CloudServiceStore\.Domain\.Entities\.)?OrderRequest\(\s*(?P<userId>[^,]+),\s*(?P<planId>[^,]+),\s*(?:CloudServiceStore\.Domain\.Enums\.)?(?P<billingCycle>BillingCycle\.[^,]+),\s*(?P<couponId>[^,]+),\s*(?P<discountAmount>[^,]+),\s*(?P<subTotal>[^,)]+)\s*\)'
)

# Match `var order = new OrderRequest { ... ServicePlanId = planId ... }`
object_init_pattern = re.compile(
    r'new\s+OrderRequest\s*\{\s*Id\s*=\s*(?P<id>[^,]+),\s*UserId\s*=\s*(?P<userId>[^,]+),\s*ServicePlanId\s*=\s*(?P<planId>[^,]+),\s*BillingCycle\s*=\s*(?P<billingCycle>[^,]+),\s*Status\s*=\s*(?P<status>[^,]+),\s*SubTotal\s*=\s*(?P<subTotal>[^\}]+)\}'
)

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = pattern.sub(
        lambda m: f"new OrderRequest({m.group('userId')}, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> {{ new CloudServiceStore.Domain.Entities.OrderItem({m.group('planId')}, {m.group('billingCycle')}, 1, {m.group('subTotal')}) }}, {m.group('couponId')}, {m.group('discountAmount')}, {m.group('subTotal')}, false)",
        content
    )

    new_content = object_init_pattern.sub(
        lambda m: f"new OrderRequest({m.group('userId')}, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> {{ new CloudServiceStore.Domain.Entities.OrderItem({m.group('planId')}, {m.group('billingCycle')}, 1, {m.group('subTotal').strip()}) }}, null, 0, {m.group('subTotal').strip()}, false) {{ Id = {m.group('id')}, Status = {m.group('status')} }}",
        new_content
    )

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.cs') and 'ProvisionVpsCommandHandlerTests.cs' not in file:
            process_file(os.path.join(root, file))
