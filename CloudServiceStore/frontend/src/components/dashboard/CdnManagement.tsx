import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface CdnDistribution {
  id: string;
  originUrl: string;
  cname: string;
  httpsEnabled: boolean;
  isActive: boolean;
}

export const CdnManagement: React.FC = () => {
  const [distributions, setDistributions] = useState<CdnDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [originUrl, setOriginUrl] = useState('');
  const [provider, setProvider] = useState('Cloudflare');

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      const res = await api.get('/cdn/distributions');
      setDistributions(res.data || []);
    } catch (error) {
      console.error('Failed to load distributions:', error);
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cdn/distributions', { originUrl, provider });
      setShowCreate(false);
      setOriginUrl('');
      loadDistributions();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🚀 CDN Distribution</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-teal-600 text-white rounded"
      >
        + Tạo Distribution
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : distributions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-medium">Chưa có CDN distribution nào</h3>
          <p className="text-gray-500 mt-2">Tăng tốc nội dung với Cloudflare hoặc Fastly</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {distributions.map((dist) => (
            <div key={dist.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{dist.originUrl}</h3>
              <p className="text-sm text-gray-500">CNAME: {dist.cname}</p>
              <p className="text-sm text-gray-500">HTTPS: {dist.httpsEnabled ? 'Enabled' : 'Disabled'}</p>
              <p className="text-sm text-green-600">Status: {dist.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo CDN Distribution</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin URL</label>
                <input 
                  type="url" 
                  value={originUrl} 
                  onChange={(e) => setOriginUrl(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Cloudflare">Cloudflare</option>
                  <option value="Fastly">Fastly</option>
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
                  className="px-4 py-2 bg-teal-600 text-white rounded"
                >
                  Tạo distribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};