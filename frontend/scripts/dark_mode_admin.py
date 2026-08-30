import os
import re

admin_dir = os.path.join(os.path.dirname(__file__), '../app/admin')

# Order matters! Replace more specific ones first.
replacements = {
    # Backgrounds
    r'\bbg-slate-50\b': 'bg-[#0F172A]',
    r'\bbg-white\b': 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md',
    r'\bbg-slate-100\b': 'bg-white/10',
    r'\bbg-slate-200\b': 'bg-white/20',
    r'\bhover:bg-slate-50/80\b': 'hover:bg-white/5 transition-colors',
    r'\bhover:bg-slate-50\b': 'hover:bg-white/5',
    r'\bhover:bg-slate-100\b': 'hover:bg-white/10',
    r'\bhover:bg-slate-200\b': 'hover:bg-white/20',
    r'\bbg-blue-50\b': 'bg-blue-900/30',
    r'\bbg-blue-100\b': 'bg-blue-900/50',
    r'\bhover:bg-blue-50\b': 'hover:bg-blue-900/30',
    r'\bhover:bg-blue-100\b': 'hover:bg-blue-900/50',
    
    # Text colors
    r'\btext-slate-900\b': 'text-white',
    r'\btext-slate-800\b': 'text-slate-100',
    r'\btext-slate-700\b': 'text-slate-200',
    r'\btext-slate-600\b': 'text-slate-400',
    r'\btext-slate-500\b': 'text-slate-400',
    r'\btext-slate-400\b': 'text-slate-500',
    r'\btext-blue-600\b': 'text-blue-400',
    r'\btext-blue-700\b': 'text-blue-300',
    r'\btext-gray-900\b': 'text-white',
    r'\btext-gray-800\b': 'text-gray-200',
    r'\btext-gray-700\b': 'text-gray-300',
    r'\btext-gray-600\b': 'text-gray-400',
    r'\btext-\[\#1F1F1F\]\b': 'text-white',
    r'\bhover:text-\[\#1F1F1F\]\b': 'hover:text-white',
    
    # Borders and Dividers
    r'\bborder-slate-200\b': 'border-white/10',
    r'\bborder-slate-300\b': 'border-white/20',
    r'\bborder-gray-200\b': 'border-white/10',
    r'\bborder-gray-300\b': 'border-white/20',
    r'\bdivide-slate-100\b': 'divide-white/10',
    r'\bdivide-slate-200\b': 'divide-white/10',
    r'\bdivide-gray-100\b': 'divide-white/10',
    r'\bdivide-gray-200\b': 'divide-white/10',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(admin_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done!")
