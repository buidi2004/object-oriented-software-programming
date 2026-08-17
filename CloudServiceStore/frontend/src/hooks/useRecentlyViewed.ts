'use client';

import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface ViewRecord {
  id?: string;
  type: 'service' | 'order' | 'vps' | 'domain' | 'article' | 'page';
  title: string;
  description: string;
  url: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<ViewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch history from BE
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/recently-viewed/me');
      if (response.data && Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch recently viewed:', err);
      setError('Không thể tải lịch sử xem.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Record a new view to BE
  const recordView = useCallback(async (viewData: Omit<ViewRecord, 'viewedAt'>) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Fallback to localStorage if not authenticated
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const newItem = { ...viewData, viewedAt: new Date().toISOString() };
      const updated = [newItem, ...stored.filter((i: any) => i.url !== viewData.url)].slice(0, 20);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return;
    }

    try {
      await api.post('/recently-viewed', {
        ...viewData,
        viewedAt: new Date().toISOString()
      });
      // Refetch to get updated list
      await fetchHistory();
    } catch (err) {
      console.error('Failed to record view:', err);
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const newItem = { ...viewData, viewedAt: new Date().toISOString() };
      const updated = [newItem, ...stored.filter((i: any) => i.url !== viewData.url)].slice(0, 20);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [fetchHistory]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.delete('/recently-viewed/me');
        setItems([]);
      } catch (err) {
        console.error('Failed to clear history:', err);
        localStorage.removeItem('recentlyViewed');
        setItems([]);
      }
    } else {
      localStorage.removeItem('recentlyViewed');
      setItems([]);
    }
  }, []);

  // Delete single item
  const deleteItem = useCallback(async (id: string) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.delete(`/recently-viewed/${id}`);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } else {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = stored.filter((i: any) => i.id !== id);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      setItems(updated);
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    fetchHistory,
    recordView,
    clearHistory,
    deleteItem
  };
}
