import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

// ========== 16 MODULES API CLIENTS ==========

// Module #1: Shared Hosting
export const hostingApi = {
  create: (planId: string) => api.post('/hosting', { planId }),
  getMy: () => api.get('/hosting/me'),
};

// Module #2: Email Hosting
export const emailHostingApi = {
  createAccount: (data: { hostingAccountId: string; localPart: string; domain: string; quotaMb: number }) =>
    api.post('/email-hosting/accounts', data),
  getMy: () => api.get('/email-hosting/accounts'),
};

// Module #3: App Installer
export const appInstallerApi = {
  install: (templateId: string, hostingAccountId: string) =>
    api.post('/app-installer/install', { templateId, hostingAccountId }),
};

// Module #4: CDN
export const cdnApi = {
  createDistribution: (data: { originUrl: string; provider: string }) =>
    api.post('/cdn/distributions', data),
  getMy: () => api.get('/cdn/distributions'),
};

// Module #5: Managed Database
export const databaseApi = {
  create: (data: { name: string; engine: string; version: string }) =>
    api.post('/databases', data),
  getMy: () => api.get('/databases'),
};

// Module #6: Object Storage
export const storageApi = {
  createBucket: (data: { name: string; visibility: string }) =>
    api.post('/storage/buckets', data),
  getMy: () => api.get('/storage/buckets'),
};

// Module #7: Dedicated Server
export const dedicatedServerApi = {
  create: (data: { serverName: string; cpuModel: string; ramGb: number; diskBytes: number; osImage: string; expiresAt: string }) =>
    api.post('/dedicated-servers', data),
  getMy: () => api.get('/dedicated-servers'),
};

// Module #8: Website Builder
export const websiteBuilderApi = {
  createProject: (data: { name: string; templateId: string }) =>
    api.post('/website-builder/projects', data),
  getMy: () => api.get('/website-builder/projects'),
};

// Module #9: Domain Privacy
export const domainApi = {
  enablePrivacy: (id: string) => api.post(`/api/domains/${id}/privacy/enable`),
  disablePrivacy: (id: string) => api.post(`/api/domains/${id}/privacy/disable`),
  getMy: () => api.get('/domains'),
};

// Module #10: Organizations
export const orgApi = {
  create: (data: { name: string }) => api.post('/organizations', data),
  getMy: () => api.get('/organizations'),
  getMembers: (id: string) => api.get(`/organizations/${id}/members`),
  inviteMember: (id: string, email: string) => api.post(`/organizations/${id}/invite`, { email }),
  removeMember: (id: string, memberId: string) => api.post(`/organizations/${id}/remove`, { memberId }),
};

// Module #11: Business Email
export const emailSubscriptionApi = {
  orderSubscription: (data: { provider: string; domain: string }) =>
    api.post('/email-subscriptions', data),
  getMy: () => api.get('/email-subscriptions'),
};

// Module #12: Game Server
export const gameServerApi = {
  create: (data: { gameType: string; serverName: string; port: number }) =>
    api.post('/game-servers', data),
  getMy: () => api.get('/game-servers'),
};

// Module #13: Security Add-ons
export const securityApi = {
  purchase: (data: { addonType: string; targetResourceId: string }) =>
    api.post('/security/addons', data),
  runScan: (id: string) => api.post(`/security/addons/${id}/scan`),
  getMy: () => api.get('/security/addons/me'),
};

// Module #14: Static Sites
export const staticSiteApi = {
  create: (data: { name: string; buildCommand: string; outputDirectory: string }) =>
    api.post('/static-sites', data),
  deploy: (siteId: string, commitHash: string) =>
    api.post(`/static-sites/${siteId}/deploy`, { gitCommitHash: commitHash }),
  getMy: () => api.get('/static-sites'),
};

// Module #16: Marketplace
export const marketplaceApi = {
  purchase: (listingId: string) => api.post(`/marketplace/purchase/${listingId}`),
  getListings: () => api.get('/marketplace/listings'),
};

export { api };