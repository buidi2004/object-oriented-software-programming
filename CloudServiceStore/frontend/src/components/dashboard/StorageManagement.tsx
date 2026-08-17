import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface StorageBucket {
  id: string;
  name: string;
  visibility: string;
  sizeBytes: number;
  createdAt: string;
}

export const StorageManagement: React.FC = () => {
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [bucketName, setBucketName] = useState('');
  const [visibility, setVisibility] = useState('private');

  useEffect(() => {
    loadBuckets();
  }, []);

  const loadBuckets = async () => {
    try {
      const res = await api.get('/storage/buckets');
      setBuckets(res.data || []);
    } catch (error) {
      console.error('Failed to load buckets:', error);
      setBuckets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/storage/buckets', { name: bucketName, visibility });
      setShowCreate(false);
      setBucketName('');
      loadBuckets();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Object Storage</h2>
      
      <button 
        onClick={() => setShowCreate(true)}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded"
      >
        + Tạo Bucket
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : buckets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium">Chưa có bucket nào</h3>
          <p className="text-gray-500 mt-2">Lưu trữ đối tượng S3-compatible</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{bucket.name}</h3>
              <p className="text-sm text-gray-500">Visibility: {bucket.visibility}</p>
              <p className="text-sm text-gray-500">Created: {new Date(bucket.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo Storage Bucket</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên bucket</label>
                <input 
                  type="text" 
                  value={bucketName} 
                  onChange={(e) => setBucketName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select 
                  value={visibility} 
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
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
                  className="px-4 py-2 bg-orange-600 text-white rounded"
                >
                  Tạo bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};