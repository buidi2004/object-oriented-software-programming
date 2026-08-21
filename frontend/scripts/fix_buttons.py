import os
import re

frontend_dir = '/home/object-oriented-software-programming/frontend/app/services'

def fix_buttons(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The script accidentally replaced text-slate-900 with text-white on buttons that have bg-white
    if 'bg-white hover:bg-slate-200 text-white' in content:
        content = content.replace('bg-white hover:bg-slate-200 text-white', 'bg-white hover:bg-slate-200 text-slate-900')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed button in {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.jsx'):
            fix_buttons(os.path.join(root, f))
