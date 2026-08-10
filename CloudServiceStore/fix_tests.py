import os
import re

directory = '/home/buidi/Tài liệu/laptrinhphanemhuogndoituong/CloudServiceStore/CloudServiceStore.Tests/'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.cs'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace basic OrderRequest creations
            # Example: new OrderRequest { Id = ..., UserId = ..., TotalAmount = ... }
            # Since properties vary, let's just replace all `new OrderRequest { ... }` with `CreateMockOrder()`
            # Actually, it's easier to just use regex to replace specific properties inside the new block if we can,
            # or replace new OrderRequest { ... } with a reflection-based helper, or just use the constructor.
            
            # Let's replace simple new OrderRequest { ... } 
            
            # This requires careful parsing. Let's do a simple string replace for the exact ones if there are not many.
            pass
