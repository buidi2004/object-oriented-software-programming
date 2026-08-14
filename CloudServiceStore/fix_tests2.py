import os
import re

test_dir = 'CloudServiceStore.Tests'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content

    # Fix 1: Add 'm' suffix to 100 in OrderItem instantiation
    content = re.sub(
        r'OrderItem\(([^,]+),\s*([^,]+),\s*1,\s*(\d+)\)',
        r'OrderItem(\1, \2, 1, \3m)',
        content
    )

    # Fix 2: Add 'm' suffix to subTotal in OrderRequest instantiation
    content = re.sub(
        r'OrderRequest\(([^,]+),\s*([^,]+),\s*(null|[^,]+),\s*(\d+),\s*(\d+),\s*(false|true)\)',
        r'OrderRequest(\1, \2, \3, \4, \5m, \6)',
        content
    )
    
    # Fix 3: Handle the multi-line OrderRequest that wasn't touched
    content = re.sub(
        r'new\s+(?:CloudServiceStore\.Domain\.Entities\.)?OrderRequest\(\s*([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+),\s*(?:CloudServiceStore\.Domain\.Enums\.)?BillingCycle\.([a-zA-Z]+),\s*null,\s*0,\s*([0-9m]+)\s*\)',
        r'new CloudServiceStore.Domain.Entities.OrderRequest(\1, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(\2, CloudServiceStore.Domain.Enums.BillingCycle.\3, 1, \4) }, null, 0, \4, false)',
        content
    )
    
    # Fix 4: ConfirmPaymentWebhookCommand amount
    content = re.sub(
        r'new\s+ConfirmPaymentWebhookCommand\("([^"]+)"\)',
        r'new ConfirmPaymentWebhookCommand("\1", 100000m)',
        content
    )

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.cs') and 'ProvisionVpsCommandHandlerTests.cs' not in file:
            process_file(os.path.join(root, file))
