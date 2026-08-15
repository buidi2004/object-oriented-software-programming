import os
import re
from collections import defaultdict

controllers_dir = "CloudServiceStore/CloudServiceStore.WebApi/Controllers"
frontend_dir = "frontend"

be_endpoints = defaultdict(list)

for root, _, files in os.walk(controllers_dir):
    for file in sorted(files):
        if not file.endswith("Controller.cs"):
            continue
        ctrl_name = file.replace("Controller.cs", "")
        with open(os.path.join(root, file), "r", encoding="utf-8") as f:
            content = f.read()

        base_route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
        base_route = (
            base_route_match.group(1).replace("[controller]", ctrl_name.lower())
            if base_route_match
            else ""
        )
        if ctrl_name == "Sitemap":
            base_route = ""

        for m in re.finditer(
            r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\][^\n]*\n\s*(?:\[[^\]]+\]\s*)*(?:public\s+async\s+Task<[^>]+>|public\s+[^(\n]+)\s+([A-Za-z0-9_]+)\s*\(',
            content,
        ):
            method = m.group(1).upper()
            sub_route = m.group(2) if m.group(2) else ""
            action_name = m.group(3)

            full = base_route
            if sub_route:
                if not full.endswith("/") and not sub_route.startswith("/"):
                    full += "/"
                full += sub_route

            norm = "/" + full.strip("/").lower()
            norm = re.sub(r"\{[^}]+\}", "*", norm)
            be_endpoints[ctrl_name].append(
                {"method": method, "route": norm, "action": action_name}
            )

fe_calls = set()
for root, _, files in os.walk(frontend_dir):
    for file in sorted(files):
        if not (
            file.endswith(".ts")
            or file.endswith(".tsx")
            or file.endswith(".js")
        ):
            continue
        with open(os.path.join(root, file), "r", encoding="utf-8") as f:
            c = f.read()
        for m in re.finditer(
            r'(?:api\.(?:get|post|put|delete|patch)|fetch)\(\s*[`\'"]/?([^`\'"?]+)',
            c,
        ):
            raw = m.group(1).strip("/").lower()
            if not raw.startswith("api/") and raw != "sitemap.xml":
                raw = "api/" + raw
            r = "/" + raw
            r = re.sub(r"\$\{[^}]+\}", "*", r)
            r = re.sub(r"\{[^}]+\}", "*", r)
            fe_calls.add(r)


def match_ep(route, calls):
    r_parts = [p for p in route.split("/") if p]
    for c_r in calls:
        c_parts = [p for p in c_r.split("/") if p]
        if len(r_parts) != len(c_parts):
            continue
        match = True
        for p1, p2 in zip(r_parts, c_parts):
            if p1 != p2 and p1 != "*" and p2 != "*":
                match = False
                break
        if match:
            return True
    return False


missing_by_ctrl = {}
for ctrl, eps in be_endpoints.items():
    missing = []
    for ep in eps:
        if not match_ep(ep["route"], fe_calls):
            missing.append(ep)
    if missing:
        missing_by_ctrl[ctrl] = (missing, len(eps))

total_be = sum(len(v) for v in be_endpoints.values())
total_missing = sum(len(v[0]) for v in missing_by_ctrl.values())
connected = total_be - total_missing
pct = (connected / total_be) * 100

print("==========================================")
print(f"Total BE Endpoints: {total_be}")
print(f"Connected in FE: {connected} ({pct:.1f}%)")
print(f"Remaining (Webhooks/Special): {total_missing}")
print("==========================================")
for ctrl, (missing, total) in sorted(missing_by_ctrl.items()):
    print(f"\n=== {ctrl} ({len(missing)} uncalled / {total} total) ===")
    for m in missing:
        method = m["method"]
        route = m["route"]
        action = m["action"]
        print(f"  - [{method}] {route} (Action: {action})")
