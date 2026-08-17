import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface DedicatedServer {
  id: string;
  serverName: string;
  cpuModel: string;
  ramGb: number;
  diskBytes: number;
  osImage: string;
  status: string;
  expiresAt: string;
}

export const DedicatedServerManagement: React.FC = () => {
  const [servers, setServers] = useState<DedicatedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [serverName, setServerName] = useState('');
  const [cpuModel, setCpuModel] = useState('Intel Xeon Gold');
  const [ramGb, setRamGb] = useState(32);
  const [diskGb, setDiskGb] = useState(500);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const res = await api.get('/dedicated-servers');
      setServers(res.data || []);
    } catch (error) {
      console.error('Failed to load servers:', error);
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/dedicated-servers', {
        serverName,
        cpuModel,
        ramGb,
        diskBytes: diskGb * 1024 * 1024 * 1024,
        osImage: 'Ubuntu 24.04 LTS',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setShowCreate(false);
      setServerName('');
      loadServers();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">⚙️ Dedicated Server</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-cyan-600 text-white rounded"
      >
        + Đặt Server mới
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium">Chưa có dedicated server nào</h3>
          <p className="text-gray-500 mt-2">Máy chủ chuyên dụng cho yêu cầu cao</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <div key={server.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{server.serverName}</h3>
              <p className="text-sm text-gray-500">CPU: {server.cpuModel}</p>
              <p className="text-sm text-gray-500">RAM: {server.ramGb}GB | Disk: {server.diskBytes / (1024**3)}GB</p>
              <p className="text-sm text-gray-500">OS: {server.osImage}</p>
              <p className="text-sm text-green-600">Status: {server.status}</p>
              <p className="text-sm text-gray-500">Expires: {new Date(server.expiresAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Đặt Dedicated Server mới</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên server</label>
                <input 
                  type="text" 
                  value={serverName} 
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">CPU Model</label>
                <select 
                  value={cpuModel} 
                  onChange={(e) => setCpuModel(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Intel Xeon Gold">Intel Xeon Gold</option>
                  <option value="AMD EPYC">AMD EPYC</option>
                  <option value="Intel Xeon Silver">Intel Xeon Silver</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">RAM (GB)</label>
                <select 
                  value={ramGb} 
                  onChange={(e) => setRamGb(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value="8">8 GB</option>
                  <option value="16">16 GB</option>
                  <option value="32">32 GB</option>
                  <option value="64">64 GB</option>
                  <option value="128">128 GB</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Disk (GB)</label>
                <input 
                  type="number" 
                  value={diskGb} 
                  onChange={(e) => setDiskGb(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="100"
                  step="100"
                />
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
                  className="px-4 py-2 bg-cyan-600 text-white rounded"
                >
                  Đặt server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};