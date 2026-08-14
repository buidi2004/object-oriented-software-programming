import os
import re
from collections import defaultdict

controllers_dir = 'CloudServiceStore.WebApi/Controllers'
tests_dir = 'CloudServiceStore.Tests/E2E'

endpoints_by_controller = defaultdict(set)
endpoints_flat = set()

# 1. Extract all endpoints
for root, _, files in os.walk(controllers_dir):
    for file in files:
        if not file.endswith('Controller.cs'):
            continue
        filepath = os.path.join(root, file)
        controller_name = file.replace('Controller.cs', '')
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            base_route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
            base_route = base_route_match.group(1).replace('[controller]', controller_name.lower()) if base_route_match else ''
            if not base_route and controller_name == 'Sitemap':
                base_route = '' # Sitemap uses absolute path
                
            for match in re.finditer(r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\]', content):
                method = match.group(1).upper()
                sub_route = match.group(2) if match.group(2) else ''
                
                full_route = base_route
                if sub_route:
                    if not full_route.endswith('/') and not sub_route.startswith('/'):
                        full_route += '/'
                    full_route += sub_route
                
                normalized = re.sub(r'\{[^}]+\}', '*', full_route).lower()
                
                # Manual fixes for endpoints with implicit base routes
                if controller_name == 'Sitemap' and method == 'GET' and 'sitemap' in normalized:
                    normalized = 'sitemap.xml'
                
                route_sig = f"{method} /{normalized}"
                endpoints_by_controller[controller_name].add(route_sig)
                endpoints_flat.add(route_sig)

# 2. Extract calls
test_calls = set()
for root, _, files in os.walk(tests_dir):
    for file in files:
        if not file.endswith('Tests.cs'):
            continue
        filepath = os.path.join(root, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            for match in re.finditer(r'Client\.(GetAsync|PostAsJsonAsync|PutAsJsonAsync|DeleteAsync|PostAsync|PutAsync|PatchAsync|PatchAsJsonAsync)\([$]?"/?([^"?]+)', content):
                method_func = match.group(1)
                route = match.group(2)
                
                method = 'GET'
                if 'Post' in method_func: method = 'POST'
                elif 'Put' in method_func: method = 'PUT'
                elif 'Delete' in method_func: method = 'DELETE'
                elif 'Patch' in method_func: method = 'PATCH'
                
                normalized = re.sub(r'\{[^}]+\}', '*', route).lower()
                test_calls.add(f"{method} /{normalized}")

def is_matched(ep, calls):
    ep_parts = ep.split('/')
    for tc in calls:
        tc_parts = tc.split('/')
        if len(ep_parts) == len(tc_parts) and ep_parts[0] == tc_parts[0]:
            match = True
            for p1, p2 in zip(ep_parts[1:], tc_parts[1:]):
                if p1 != p2 and p1 != '*' and p2 != '*':
                    match = False
                    break
            if match: return True
    return False

# 3. Report
print("--- COVERAGE REPORT ---")
totally_uncovered = []
partially_uncovered = []
fully_covered = []

for ctrl, eps in endpoints_by_controller.items():
    uncovered_eps = [ep for ep in eps if not is_matched(ep, test_calls)]
    
    if len(uncovered_eps) == len(eps):
        totally_uncovered.append((ctrl, eps))
    elif len(uncovered_eps) > 0:
        partially_uncovered.append((ctrl, uncovered_eps, len(eps)))
    else:
        fully_covered.append(ctrl)

print(f"\n✅ FULLY COVERED CONTROLLERS ({len(fully_covered)}):")
print(", ".join(fully_covered))

print(f"\n⚠️ PARTIALLY COVERED CONTROLLERS ({len(partially_uncovered)}):")
for ctrl, uncov, total in partially_uncovered:
    print(f"- {ctrl} ({total-len(uncov)}/{total}): missing {', '.join(uncov)}")

print(f"\n❌ TOTALLY UNCOVERED CONTROLLERS ({len(totally_uncovered)}):")
for ctrl, eps in totally_uncovered:
    print(f"- {ctrl} (0/{len(eps)}): missing {', '.join(eps)}")
    
