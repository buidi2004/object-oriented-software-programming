import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface GameServer {
  id: string;
  gameType: string;
  serverName: string;
  port: number;
  status: string;
}

export const GameServerManagement: React.FC = () => {
  const [servers, setServers] = useState<GameServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [gameType, setGameType] = useState('Minecraft');
  const [serverName, setServerName] = useState('');
  const [port, setPort] = useState(25565);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const res = await api.get('/game-servers');
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
      await api.post('/game-servers', { gameType, serverName, port });
      setShowCreate(false);
      setServerName('');
      loadServers();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎮 Game Server</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
      >
        + Tạo Server
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-lg font-medium">Chưa có game server nào</h3>
          <p className="text-gray-500 mt-2">Minecraft, CS2, Ark, Rust...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <div key={server.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{server.serverName}</h3>
              <p className="text-sm text-gray-500">Game: {server.gameType}</p>
              <p className="text-sm text-gray-500">Port: {server.port}</p>
              <p className="text-sm text-green-600">Status: {server.status}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo Game Server</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại game</label>
                <select 
                  value={gameType} 
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Minecraft">Minecraft</option>
                  <option value="CS2">Counter-Strike 2</option>
                  <option value="Ark">Ark: Survival Evolved</option>
                  <option value="Rust">Rust</option>
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                <input 
                  type="number" 
                  value={port} 
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full p-2 border rounded"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Tạo server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};