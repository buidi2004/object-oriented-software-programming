import os
import re

controllers_dir = 'CloudServiceStore.WebApi/Controllers'
tests_dir = 'CloudServiceStore.Tests/E2E'

# 1. Extract all endpoints from controllers
endpoints = set()
for root, _, files in os.walk(controllers_dir):
    for file in files:
        if not file.endswith('Controller.cs'):
            continue
        filepath = os.path.join(root, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find base route
            base_route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
            base_route = base_route_match.group(1).replace('[controller]', file.replace('Controller.cs', '').lower()) if base_route_match else ''
            
            # Find HTTP methods
            for match in re.finditer(r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\]', content):
                method = match.group(1).upper()
                sub_route = match.group(2) if match.group(2) else ''
                
                # Construct full route
                full_route = base_route
                if sub_route:
                    if not full_route.endswith('/') and not sub_route.startswith('/'):
                        full_route += '/'
                    full_route += sub_route
                
                # Normalize route (e.g. replace {id} with *)
                normalized = re.sub(r'\{[^}]+\}', '*', full_route).lower()
                endpoints.add(f"{method} /{normalized}")

# 2. Extract API calls from E2E tests
test_calls = set()
for root, _, files in os.walk(tests_dir):
    for file in files:
        if not file.endswith('Tests.cs'):
            continue
        filepath = os.path.join(root, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            for match in re.finditer(r'Client\.(GetAsync|PostAsJsonAsync|PutAsJsonAsync|DeleteAsync|PostAsync|PutAsync)\([$]?"([^"?]+)', content):
                method_func = match.group(1)
                route = match.group(2)
                
                method = 'GET'
                if 'Post' in method_func: method = 'POST'
                elif 'Put' in method_func: method = 'PUT'
                elif 'Delete' in method_func: method = 'DELETE'
                
                # Normalize route (e.g. replace variables with *)
                # Since we use string interpolation in C# like $"/api/orders/{orderId}", 
                # python regex for {var} is tricky because the literal string in C# code has {var}.
                normalized = re.sub(r'\{[^}]+\}', '*', route).lower()
                test_calls.add(f"{method} {normalized}")

print("Total Endpoints in Controllers:", len(endpoints))
print("Total API Calls in Tests:", len(test_calls))

# Compare
print("\n=== UNCOVERED ENDPOINTS ===")
uncovered = 0
for ep in sorted(endpoints):
    # Try to find a match in test_calls
    # test_calls often have exact matches or slightly different var replacements
    matched = False
    ep_parts = ep.split('/')
    for tc in test_calls:
        tc_parts = tc.split('/')
        if len(ep_parts) == len(tc_parts) and ep_parts[0] == tc_parts[0]: # method matches
            # check parts
            match = True
            for p1, p2 in zip(ep_parts[1:], tc_parts[1:]):
                if p1 != p2 and p1 != '*' and p2 != '*':
                    match = False
                    break
            if match:
                matched = True
                break
    
    if not matched:
        print(ep)
        uncovered += 1

print(f"\nTotal Uncovered: {uncovered}/{len(endpoints)}")

