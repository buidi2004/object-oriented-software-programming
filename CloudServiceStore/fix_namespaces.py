import os
import re

directories = ['CloudServiceStore.Tests/Integration', 'CloudServiceStore.Tests/E2E']

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content

    # Prepend namespace to BillingCycle if it's missing it
    # We can just add the using directive at the top of the file! That's much easier!
    if 'BillingCycle' in content and 'using CloudServiceStore.Domain.Enums;' not in content:
        content = content.replace('using System;', 'using System;\nusing CloudServiceStore.Domain.Enums;')
        
    if 'OrderRequest' in content and 'using CloudServiceStore.Domain.Entities;' not in content:
        content = content.replace('using System;', 'using System;\nusing CloudServiceStore.Domain.Entities;')

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed namespaces in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.cs'):
                process_file(os.path.join(root, file))
