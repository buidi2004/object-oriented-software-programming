import os
import re

frontend_dir = '/home/object-oriented-software-programming/frontend/app/services'
components_dir = '/home/object-oriented-software-programming/frontend/src/components'

target_dirs = [frontend_dir, components_dir]

# Pattern for very dark gradients (like from-[#090d16])
bg_dark_pattern = re.compile(r'(<(?:section|div)[^>]*?bg-gradient-to-[a-z]+\s+from-\[#[0-9a-fA-F]+\][^>]*>)')

def fix_contrast(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = bg_dark_pattern.split(content)
    
    if len(sections) == 1:
        return # No dark gradient sections found

    modified = False
    new_content = sections[0]
    
    for i in range(1, len(sections), 2):
        section_tag = sections[i]
        chunk = sections[i] + sections[i+1]
        
        if 'text-slate-900' in chunk or 'text-slate-700' in chunk or 'text-slate-800' in chunk:
            chunk = chunk.replace('text-slate-900', 'text-white')
            chunk = chunk.replace('text-slate-800', 'text-slate-200')
            chunk = chunk.replace('text-slate-700', 'text-slate-300')
            modified = True
            
        new_content += chunk

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for d in target_dirs:
    if not os.path.exists(d): continue
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.jsx'):
                fix_contrast(os.path.join(root, f))
