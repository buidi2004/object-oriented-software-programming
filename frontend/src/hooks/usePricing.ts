import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface ServicePlanPrice {
  servicePlanId: string;
  servicePlanName: string;
  billingCycle: number; 
  price: number;
  currency: string;
}

// Global cache to avoid redundant network requests across components
let globalPricesCache: ServicePlanPrice[] | null = null;
let fetchPromise: Promise<ServicePlanPrice[]> | null = null;

export function usePricing() {
  const [prices, setPrices] = useState<ServicePlanPrice[]>(globalPricesCache || []);
  const [isLoading, setIsLoading] = useState(!globalPricesCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (globalPricesCache) {
      setPrices(globalPricesCache);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = api.get('/service-plans').then(res => res.data);
    }

    fetchPromise
      .then(data => {
        globalPricesCache = data;
        setPrices(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const getPrice = (planName: string, billingCycle: number = 1, fallbackPrice: number = 0) => {
    if (!globalPricesCache && prices.length === 0) return fallbackPrice;
    const currentPrices = globalPricesCache || prices;
    
    // Normalize strings for safer comparison
    const normalizedName = planName.trim().toLowerCase();
    
    const plan = currentPrices.find(
      p => p.servicePlanName.trim().toLowerCase() === normalizedName && p.billingCycle === billingCycle
    );
    return plan ? plan.price : fallbackPrice;
  };

  return { prices, isLoading, error, getPrice };
}
