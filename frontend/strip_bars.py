import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Remove the black absolute bottom bar blocks
pattern = r"""\s*\{.*?\&\&\s*\(\s*<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-\[2\.5px\] bg-\[\#1F1F1F\] rounded-full transition-all duration-300" />\s*\)\}\s*"""
content = re.sub(pattern, "\n", content)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
