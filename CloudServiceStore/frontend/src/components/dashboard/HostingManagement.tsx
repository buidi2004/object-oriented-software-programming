import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface HostingAccount {
  id: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export const HostingManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<HostingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHosting();
  }, []);

  const loadHosting = async () => {
    try {
      const res = await api.get('/hosting/me');
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Failed to load hosting:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (planId: string) => {
    try {
      await api.post('/hosting', { planId });
      loadHosting();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shared Hosting</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-lg font-medium">Chưa có hosting nào</h3>
          <button 
            onClick={() => handleCreate('1')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            + Tạo Hosting mới
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{account.userName || 'Hosting Account'}</h3>
              <p className="text-sm text-gray-500">Trạng thái: {account.isActive ? 'Hoạt động' : 'Tạm dừng'}</p>
              <p className="text-sm text-gray-500">Kỳ hạn: {new Date(account.expiresAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};