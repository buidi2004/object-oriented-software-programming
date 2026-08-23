export const STAFF_ROLES = ['Admin', 'Accountant', 'Technician', 'Support', 'Editor', 'Staff'];

export const isStaffRole = (role?: string): boolean => {
  if (!role) return false;
  return STAFF_ROLES.some(r => r.toLowerCase() === role.toLowerCase());
};

export const canAccessModule = (role?: string, moduleKey?: string): boolean => {
  const r = (role || '').toLowerCase();
  if (r === 'admin') return true;

  const key = (moduleKey || '').toLowerCase();

  // Accountant (Kế Toán)
  if (r === 'accountant' || r.includes('kế toán') || r.includes('ketoan')) {
    const allowed = [
      'invoices', 'revenue', 'orders', 'refund-requests', 'exchange-rates', 
      'gift-cards', 'exports', 'audit-logs', 'spending-reports'
    ];
    return allowed.includes(key);
  }

  // Technician (Kỹ Thuật)
  if (r === 'technician' || r.includes('kỹ thuật') || r.includes('kythuat') || r.includes('devops')) {
    const allowed = [
      'vps-instances', 'dedicated-servers', 'databases', 'game-servers', 'apps', 
      'storage', 'static-sites', 'security', 'ssl-certificates', 'uptime', 
      'backups', 'migrations', 'tickets', 'contacts', 'careers', 'jobs', 'service-plans', 'knowledge-base', 'audit-logs'
    ];
    return allowed.includes(key);
  }

  // Support (CSKH)
  if (r === 'support' || r.includes('chăm sóc') || r.includes('cskh')) {
    const allowed = [
      'tickets', 'contacts', 'careers', 'live-chat', 'orders', 'reviews', 'faqs', 
      'knowledge-base', 'refund-requests', 'testimonials'
    ];
    return allowed.includes(key);
  }

  // Editor (Biên Tập)
  if (r === 'editor' || r.includes('biên tập') || r.includes('bientap')) {
    const allowed = [
      'news', 'blog-comments', 'reviews', 'contacts', 'careers', 'banners', 'landing-content', 'coupons', 
      'promotions', 'service-seo', 'newsletters', 'faqs', 'testimonials', 
      'resources', 'categories', 'marketplace'
    ];
    return allowed.includes(key);
  }

  // Generic Staff
  if (r === 'staff') {
    const allowed = ['orders', 'tickets', 'contacts', 'careers', 'live-chat', 'knowledge-base', 'faqs'];
    return allowed.includes(key);
  }

  return false;
};
