export type OsTemplateKey = 'ubuntu' | 'debian' | 'almalinux' | 'windows';
export type DatacenterRegionKey = 'vn-hn' | 'vn-hcm' | 'sg';

export interface DomainResult {
  extension: string;
  pricePerYear: number;
  originalPrice?: number;
  isPopular?: boolean;
  available: boolean;
  featuredText?: string;
}

export interface VpsConfig {
  cpu: number; // Cores
  ram: number; // GB
  disk: number; // GB NVMe
  bandwidth: number; // TB or unlimited
  ips: number;
  os: string;
  datacenter: string;
  billingCycle: '1month' | '6months' | '12months' | '24months';
}

export interface HostingPackage {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPriceMonthly: number; // discounted monthly price when billed yearly
  isPopular?: boolean;
  specs: {
    storage: string;
    bandwidth: string;
    domains: string;
    ram: string;
    cpu: string;
    ssl: string;
    backup: string;
  };
  features: string[];
}

export interface CloudInstance {
  id: string;
  name: string;
  ip: string;
  os: string;
  cpu: number;
  ram: number;
  disk: number;
  status: 'running' | 'stopped' | 'rebooting';
  datacenter: string;
  uptimeDays: number;
  cpuUsage: number;
  ramUsage: number;
  bandwidthMbps: number;
}

export interface CartItem {
  id: string;
  type: 'vps' | 'hosting' | 'domain' | 'game' | 'database' | 'storage' | 'ssl' | 'app' | 'security' | 'migration' | 'static' | 'cdn' | 'dedicated' | 'email';
  title: string;
  name?: string;
  details: string;
  price: number;
  billingCycle: string | number;
  quantity?: number;
  servicePlanId?: string;
}

export interface ServicePlanPriceDto {
  servicePlanId: string;
  servicePlanName: string;
  billingCycle: number;
  price: number;
  currency: string;
}
