import os
import re

directories_to_check = [
    'app/',
    'src/components/',
    'src/store/'
]

frontend_path = '/home/object-oriented-software-programming/frontend/'

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_api = bool(re.search(r'\b(api\.(get|post|put|patch|delete)|fetch)\b', content))
    has_mock = bool(re.search(r'(Mock data|mock data|mockResults|mockData|mockInvoices|// This is a mock)', content, re.IGNORECASE))
    
    return has_api, has_mock

results = []

for root, _, files in os.walk(frontend_path):
    # Only check inside user-facing directories, excluding admin for now to focus on user-side
    rel_path = os.path.relpath(root, frontend_path)
    
    # We want to check user pages and components
    if rel_path.startswith('app/admin'):
        continue
    if not (rel_path.startswith('app') or rel_path.startswith('src/components') or rel_path.startswith('src/store')):
        continue
        
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            has_api, has_mock = check_file(filepath)
            
            # Simple heuristic
            if has_api and not has_mock:
                status = "Connected"
            elif has_api and has_mock:
                status = "Partial/Mock Fallback"
            elif has_mock:
                status = "Mock Data Only"
            else:
                status = "Static/No API"
                
            results.append((rel_path, file, status))

# Group by folder
grouped = {}
for path, file, status in results:
    if path not in grouped:
        grouped[path] = []
    grouped[path].append((file, status))

for path in sorted(grouped.keys()):
    print(f"[{path}]")
    for file, status in grouped[path]:
        print(f"  {file}: {status}")

