"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Save } from "lucide-react";

type Role = {
  id: string;
  name: string;
};

type Permission = {
  id: string;
  code: string;
  name: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const rolesRes = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const permsRes = await fetch("http://localhost:5000/api/permissions", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (rolesRes.ok && permsRes.ok) {
        setRoles(await rolesRes.json());
        setPermissions(await permsRes.json());
      } else {
        alert("Failed to load roles or permissions.");
      }
    } catch (error) {
      alert("Error loading data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newRoleName })
      });

      if (res.ok) {
        alert("Role created successfully");
        setNewRoleName("");
        fetchData();
      } else {
        alert("Failed to create role.");
      }
    } catch (error) {
      alert("Error creating role.");
    }
  };

  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/roles/${role.id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Permission[] = await res.json();
        setRolePermissions(data.map(p => p.id));
      }
    } catch (error) {
      alert("Error loading role permissions.");
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setRolePermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          permissionIds: rolePermissions
        })
      });

      if (res.ok) {
        alert("Permissions updated successfully");
      } else {
        alert("Failed to update permissions.");
      }
    } catch (error) {
      alert("Error saving permissions.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-600">Đang tải dữ liệu phân quyền...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quản lý Phân quyền</h1>
        <p className="text-slate-600">Tạo nhóm quyền và thiết lập quyền truy cập chi tiết cho hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Nhóm quyền (Roles)</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Tên role mới..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1 bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleCreateRole}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                    selectedRole?.id === role.id 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-900/50 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <span className="font-medium">{role.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Configuration */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Chi tiết quyền: <span className="text-slate-200">{selectedRole.name}</span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Check vào các quyền mà bạn muốn cấp cho nhóm này.</p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu quyền
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map(permission => {
                  const isGranted = rolePermissions.includes(permission.id);
                  return (
                    <div 
                      key={permission.id}
                      onClick={() => handleTogglePermission(permission.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                        isGranted 
                          ? "bg-indigo-600/10 border-indigo-500/50" 
                          : "bg-slate-900/50 border-slate-700/50 hover:border-slate-600"
                      }`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
                        isGranted ? "bg-indigo-600 border-indigo-600" : "border-slate-600"
                      }`}>
                        {isGranted && <Check className="w-3 h-3 text-slate-900" />}
                      </div>
                      <div>
                        <p className={`font-medium ${isGranted ? "text-slate-200" : "text-slate-300"}`}>
                          {permission.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          {permission.code}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white/20 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-slate-500">
              <p>Chọn một nhóm quyền bên trái để thiết lập</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
