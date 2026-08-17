import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface StaticSite {
  id: string;
  name: string;
  buildCommand: string;
  outputDirectory: string;
  deployUrl: string;
  status: string;
}

export const StaticSites: React.FC = () => {
  const [sites, setSites] = useState<StaticSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [outputDir, setOutputDir] = useState('dist');
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await api.get('/static-sites');
      setSites(res.data || []);
    } catch (error) {
      console.error('Failed to load sites:', error);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/static-sites', { name: siteName, buildCommand, outputDirectory: outputDir });
      setShowCreate(false);
      setSiteName('');
      loadSites();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDeploy = async (siteId: string) => {
    setDeploying(siteId);
    try {
      await api.post(`/static-sites/${siteId}/deploy`, { gitCommitHash: 'abc123' });
      alert('Deploy thành công!');
      loadSites();
    } catch (error) {
      alert('Có lỗi xảy ra');
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">✨ Static Sites</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        + Tạo Site mới
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : sites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-medium">Chưa có static site nào</h3>
          <p className="text-gray-500 mt-2">Deploy trang web tĩnh của bạn với CDN tích hợp sẵn</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{site.name}</h3>
              <p className="text-sm text-gray-500">Build: {site.buildCommand}</p>
              <p className="text-sm text-gray-500">Output: {site.outputDirectory}</p>
              <p className="text-sm text-green-600">Deploy URL: {site.deployUrl || 'https://example.com'}</p>
              <button 
                onClick={() => handleDeploy(site.id)}
                disabled={deploying === site.id}
                className="mt-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                {deploying === site.id ? 'Đang deploy...' : 'Deploy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo Static Site mới</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên site</label>
                <input 
                  type="text" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Build command</label>
                <input 
                  type="text" 
                  value={buildCommand} 
                  onChange={(e) => setBuildCommand(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Output directory</label>
                <input 
                  type="text" 
                  value={outputDir} 
                  onChange={(e) => setOutputDir(e.target.value)}
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
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Tạo site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};