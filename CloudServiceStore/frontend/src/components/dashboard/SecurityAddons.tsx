import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SecurityAddon {
  id: string;
  addonType: string;
  targetResourceId: string;
  isActive: boolean;
}

export const SecurityAddons: React.FC = () => {
  const [addons, setAddons] = useState<SecurityAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      const res = await api.get('/security/addons/me');
      setAddons(res.data || []);
    } catch (error) {
      console.error('Failed to load addons:', error);
      setAddons([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (addonType: string, targetResourceId: string) => {
    try {
      await api.post('/security/addons', { addonType, targetResourceId });
      setShowPurchase(false);
      loadAddons();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleScan = async (id: string) => {
    try {
      await api.post(`/security/addons/${id}/scan`);
      alert('Đã bắt đầu scan!');
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🛡️ Security Add-ons</h2>
      
      <button 
        onClick={() => setShowPurchase(true)}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        + Mua WAF/Scan
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : addons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium">Chưa có add-ons nào</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {addons.map((addon) => (
            <div key={addon.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{addon.addonType === 'Waf' ? '🛡️ WAF Protection' : '🔍 Malware Scan'}</h3>
              <p className="text-sm text-gray-500">Target: {addon.targetResourceId}</p>
              <button 
                onClick={() => handleScan(addon.id)}
                className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm"
              >
                Chạy Scan
              </button>
            </div>
          ))}
        </div>
      )}

      {showPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Mua Security Add-on</h2>
            <button onClick={() => setShowPurchase(false)} className="text-gray-600">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};