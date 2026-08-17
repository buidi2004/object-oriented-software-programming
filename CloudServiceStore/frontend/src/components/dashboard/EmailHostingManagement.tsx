import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface EmailAccount {
  id: string;
  localPart: string;
  domain: string;
  quotaMb: number;
  status: string;
}

export const EmailHostingManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [localPart, setLocalPart] = useState('');
  const [domain, setDomain] = useState('');
  const [quotaMb, setQuotaMb] = useState(512);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await api.get('/email-hosting/accounts');
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/email-hosting/accounts', {
        hostingAccountId: 'placeholder',
        localPart,
        domain,
        quotaMb,
      });
      setShowCreate(false);
      setLocalPart('');
      setDomain('');
      loadAccounts();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📧 Email Hosting</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        + Tạo Email Account
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium">Chưa có email account nào</h3>
          <p className="text-gray-500 mt-2">Tạo email doanh nghiệp với custom domain</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{account.localPart}@{account.domain}</h3>
              <p className="text-sm text-gray-500">Quota: {account.quotaMb}MB</p>
              <p className="text-sm text-green-600">Status: {account.status}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo Email Account</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Local Part</label>
                <input 
                  type="text" 
                  value={localPart} 
                  onChange={(e) => setLocalPart(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="info"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input 
                  type="text" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="example.com"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quota (MB)</label>
                <select 
                  value={quotaMb} 
                  onChange={(e) => setQuotaMb(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value="256">256 MB</option>
                  <option value="512">512 MB</option>
                  <option value="1024">1 GB</option>
                  <option value="2048">2 GB</option>
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
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Tạo account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};