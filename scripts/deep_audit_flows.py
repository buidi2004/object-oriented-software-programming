import os
import re
from collections import defaultdict

controllers_dir = "CloudServiceStore/CloudServiceStore.WebApi/Controllers"
frontend_dir = "frontend"

be_endpoints = []

for root, _, files in os.walk(controllers_dir):
    for file in sorted(files):
        if not file.endswith("Controller.cs"):
            continue
        ctrl_name = file.replace("Controller.cs", "")
        file_path = os.path.join(root, file)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        base_route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
        base_route = (
            base_route_match.group(1).replace("[controller]", ctrl_name.lower())
            if base_route_match
            else ""
        )
        if ctrl_name == "Sitemap":
            base_route = ""

        # Find all HTTP actions
        for m in re.finditer(
            r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\][^\n]*\n\s*(?:\[[^\]]+\]\s*)*(?:public\s+async\s+Task<[^>]+>|public\s+[^(\n]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)',
            content,
        ):
            method = m.group(1).upper()
            sub_route = m.group(2) if m.group(2) else ""
            action_name = m.group(3)
            params_str = m.group(4)

            full = base_route
            if sub_route:
                if not full.endswith("/") and not sub_route.startswith("/"):
                    full += "/"
                full += sub_route

            norm = "/" + full.strip("/").lower()
            norm = re.sub(r"\{[^:]+:[^}]+\}", "*", norm)
            norm = re.sub(r"\{[^}]+\}", "*", norm)

            be_endpoints.append(
                {
                    "controller": ctrl_name,
                    "method": method,
                    "route": norm,
                    "action": action_name,
                    "params": params_str.strip(),
                    "file": file_path,
                }
            )

fe_usages = defaultdict(list)

for root, _, files in os.walk(frontend_dir):
    for file in sorted(files):
        if not (
            file.endswith(".ts")
            or file.endswith(".tsx")
            or file.endswith(".js")
        ):
            continue
        rel_path = os.path.join(root, file)
        with open(rel_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            for m in re.finditer(
                r'(?:api\.(get|post|put|delete|patch)|axios\.(get|post|put|delete|patch)|fetch)\(\s*[`\'"]/?([^`\'"?]+)',
                line,
            ):
                call_method = (
                    (m.group(1) or m.group(2) or "FETCH").upper()
                )
                raw = m.group(3).strip("/").lower()
                if not raw.startswith("api/") and raw != "sitemap.xml":
                    raw = "api/" + raw
                r = "/" + raw
                r = re.sub(r"\$\{[^}]+\}", "*", r)
                r = re.sub(r"\{[^}]+\}", "*", r)
                fe_usages[r].append(
                    {
                        "file": rel_path,
                        "line": line_num,
                        "method": call_method,
                        "code": line.strip(),
                    }
                )

            # Check sitemap reference
            if "sitemap.xml" in line:
                fe_usages["/sitemap.xml"].append(
                    {
                        "file": rel_path,
                        "line": line_num,
                        "method": "GET",
                        "code": line.strip(),
                    }
                )


def match_endpoint(be_route, be_method, usages):
    be_parts = [p for p in be_route.split("/") if p]
    matched_usages = []

    for fe_route, call_list in usages.items():
        fe_parts = [p for p in fe_route.split("/") if p]
        if len(be_parts) != len(fe_parts):
            continue
        matched = True
        for p1, p2 in zip(be_parts, fe_parts):
            if p1 != p2 and p1 != "*" and p2 != "*":
                matched = False
                break
        if matched:
            matched_usages.extend(call_list)

    return matched_usages


print("=== DEEP AUDIT: BE CONTROLLER ACTIONS VS FE USAGES ===")
unmatched = []
matched_count = 0

for ep in be_endpoints:
    usages = match_endpoint(ep["route"], ep["method"], fe_usages)
    if usages:
        matched_count += 1
    else:
        unmatched.append(ep)

pct = (matched_count / len(be_endpoints)) * 100
print(f"Total BE Endpoints: {len(be_endpoints)}")
print(f"Directly Matched in FE: {matched_count} ({pct:.1f}%)")
print(f"Unmatched: {len(unmatched)}")

if unmatched:
    print("\n--- Unmatched Endpoints Detail ---")
    for u in unmatched:
        print(
            f"Controller: {u['controller']:<20} | Method: {u['method']:<6} | Route: {u['route']:<40} | Action: {u['action']}"
        )
