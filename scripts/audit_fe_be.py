import os
import re
from collections import defaultdict

controllers_dir = "/home/object-oriented-software-programming/CloudServiceStore/CloudServiceStore.WebApi/Controllers"
frontend_dir = "/home/object-oriented-software-programming/frontend"

be_endpoints = defaultdict(list)

for root, _, files in os.walk(controllers_dir):
    for file in sorted(files):
        if not file.endswith("Controller.cs"):
            continue
        ctrl_name = file.replace("Controller.cs", "")
        filepath = os.path.join(root, file)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        base_route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
        base_route = base_route_match.group(1).replace("[controller]", ctrl_name.lower()) if base_route_match else ""
        if ctrl_name == "Sitemap":
            base_route = ""
        
        for m in re.finditer(r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\][^\n]*\n\s*(?:\[[^\]]+\]\s*)*(?:public\s+async\s+Task<[^>]+>|public\s+async\s+Task|public\s+[^(\n]+)\s+([A-Za-z0-9_]+)\s*\(', content):
            method = m.group(1).upper()
            sub_route = m.group(2) if m.group(2) else ""
            action_name = m.group(3)
            
            full = base_route
            if sub_route:
                if not full.endswith("/") and not sub_route.startswith("/"):
                    full += "/"
                full += sub_route
            
            norm = "/" + full.strip("/").lower()
            norm = re.sub(r'\{[^}]+\}', '*', norm)
            be_endpoints[ctrl_name].append({
                "method": method,
                "route": norm,
                "action": action_name,
                "file": file
            })

fe_calls = []

for root, _, files in os.walk(frontend_dir):
    for file in sorted(files):
        if not (file.endswith(".ts") or file.endswith(".tsx") or file.endswith(".js")):
            continue
        filepath = os.path.join(root, file)
        rel_path = os.path.relpath(filepath, frontend_dir)
        with open(filepath, "r", encoding="utf-8") as f:
            c = f.read()
        
        # 1. match api.get / api.post / api.put / api.delete / api.patch
        for m in re.finditer(r'api\.(get|post|put|delete|patch)\s*(?:<[^>]+>)?\s*\(\s*[`\'"]/?([^`\'"?]+)', c):
            http_m = m.group(1).upper()
            raw_r = m.group(2).strip("/").lower()
            if not raw_r.startswith("api/"):
                raw_r = "api/" + raw_r
            r = "/" + raw_r
            r = re.sub(r'\$\{[^}]+\}', '*', r)
            r = re.sub(r'\{[^}]+\}', '*', r)
            fe_calls.append((http_m, r, rel_path))
            
        # 2. match fetch(..., { method: ... })
        for m in re.finditer(r'fetch\s*\(\s*[`\'"]/?([^`\'"?]+)[`\'"](?:\s*,\s*\{[^}]*method:\s*[`\'"]([A-Za-z]+)[`\'"])?', c, re.DOTALL):
            raw_r = m.group(1).strip("/").lower()
            http_m = (m.group(2) or "GET").upper()
            if not raw_r.startswith("api/") and raw_r != "sitemap.xml":
                raw_r = "api/" + raw_r
            r = "/" + raw_r
            r = re.sub(r'\$\{[^}]+\}', '*', r)
            r = re.sub(r'\{[^}]+\}', '*', r)
            fe_calls.append((http_m, r, rel_path))

def match_ep(method, route, calls):
    r_parts = [p for p in route.split("/") if p]
    matching_files = []
    for c_m, c_r, c_file in calls:
        if c_m != method:
            continue
        c_parts = [p for p in c_r.split("/") if p]
        if len(r_parts) != len(c_parts):
            continue
        match = True
        for p1, p2 in zip(r_parts, c_parts):
            if p1 != p2 and p1 != "*" and p2 != "*":
                match = False
                break
        if match:
            matching_files.append(c_file)
    return list(set(matching_files))

all_missing = []
all_connected = []

print("="*80)
print("KẾT QUẢ RÀ SOÁT ĐỘ PHỦ TÍNH NĂNG FRONTEND (FE) SO VỚI BACKEND (BE)")
print("="*80)

for ctrl, eps in sorted(be_endpoints.items()):
    for ep in eps:
        files = match_ep(ep["method"], ep["route"], fe_calls)
        if files:
            all_connected.append((ctrl, ep, files))
        else:
            all_missing.append((ctrl, ep))

total = len(all_connected) + len(all_missing)
print(f"Tổng số API Endpoints trong Backend: {total}")
print(f"Số API đã được Frontend kết nối: {len(all_connected)} ({len(all_connected)/total*100:.1f}%)")
print(f"Số API Backend CHƯA ĐƯỢC Frontend gọi: {len(all_missing)} ({len(all_missing)/total*100:.1f}%)")

print("\n" + "="*80)
print("DANH SÁCH CHI TIẾT CÁC API VÀ TÍNH NĂNG FRONTEND CÒN THIẾU:")
print("="*80)

missing_by_ctrl = defaultdict(list)
for ctrl, ep in all_missing:
    missing_by_ctrl[ctrl].append(ep)

for ctrl, eps in sorted(missing_by_ctrl.items()):
    print(f"\n📁 [{ctrl}] ({len(eps)} endpoints chưa có giao diện gọi):")
    for ep in eps:
        print(f"  ❌ [{ep['method']}] {ep['route']} -> Action: {ep['action']}()")
