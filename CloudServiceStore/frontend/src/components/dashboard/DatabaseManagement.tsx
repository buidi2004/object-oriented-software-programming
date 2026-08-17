import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface DatabaseInstance {
  id: string;
  name: string;
  engine: string;
  version: string;
  status: string;
  createdAt: string;
}

export const DatabaseManagement: React.FC = () => {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [dbName, setDbName] = useState('');
  const [engine, setEngine] = useState('PostgreSQL');
  const [version, setVersion] = useState('15');

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const res = await api.get('/databases');
      setDatabases(res.data || []);
    } catch (error) {
      console.error('Failed to load databases:', error);
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/databases', { name: dbName, engine, version });
      setShowCreate(false);
      setDbName('');
      loadDatabases();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🗄️ Managed Database</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Tạo Database mới
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : databases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🗄️</div>
          <h3 className="text-lg font-medium">Chưa có database nào</h3>
          <p className="text-gray-500 mt-2">Khởi tạo cơ sở dữ liệu MySQL hoặc PostgreSQL</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {databases.map((db) => (
            <div key={db.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{db.name}</h3>
              <p className="text-sm text-gray-500">Engine: {db.engine} {db.version}</p>
              <p className="text-sm text-green-600">Status: {db.status}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo Database mới</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên database</label>
                <input 
                  type="text" 
                  value={dbName} 
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                <select 
                  value={engine} 
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="MySQL">MySQL</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                <select 
                  value={version} 
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="15">PostgreSQL 15</option>
                  <option value="14">PostgreSQL 14</option>
                  <option value="8">MySQL 8.0</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Tạo database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};