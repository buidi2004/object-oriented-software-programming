import os, re
from collections import defaultdict

def to_camel_case(s):
    return s[0].lower() + s[1:] if s else s

def extract_csharp_properties(directory):
    props = defaultdict(list)
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(".cs"): continue
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                # matches: public Type PropertyName { get; set; }
                matches = re.finditer(r"public\s+(?:virtual\s+)?(?:[\w<>,?\s\[\]]+)\s+(\w+)\s*\{\s*get;", content)
                class_name = file.replace('.cs', '')
                for m in matches:
                    props[class_name].append(to_camel_case(m.group(1)))
    return props

def check_fe_usage(fe_dir, search_terms):
    usage = {term: False for term in search_terms}
    for root, dirs, files in os.walk(fe_dir):
        # Exclude node_modules and .next
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '.git')]
        for file in files:
            if not (file.endswith(".ts") or file.endswith(".tsx") or file.endswith(".js") or file.endswith(".jsx")):
                continue
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                for term in search_terms:
                    if not usage[term] and re.search(r'\b' + re.escape(term) + r'\b', content):
                        usage[term] = True
    return usage

print("Extracting DTO properties...")
dtos = extract_csharp_properties("CloudServiceStore/CloudServiceStore.Application/DTOs")
entities = extract_csharp_properties("CloudServiceStore/CloudServiceStore.Domain/Entities")

all_props = {}
for k, v in dtos.items(): all_props[k] = v
for k, v in entities.items(): all_props[k] = v

unique_props = set()
for props in all_props.values():
    unique_props.update(props)

print(f"Found {len(unique_props)} unique properties in BE.")
print("Checking FE usage...")

usage = check_fe_usage("frontend", unique_props)

missing_by_class = defaultdict(list)
for cls, props in all_props.items():
    for p in props:
        if not usage[p]:
            missing_by_class[cls].append(p)

print("\n--- Missing Properties in Frontend ---")
for cls, props in missing_by_class.items():
    if props:
        print(f"{cls}: {', '.join(props)}")
