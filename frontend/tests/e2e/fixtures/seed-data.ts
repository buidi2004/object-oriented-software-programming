export const E2E_CONFIG = {
  API_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5053',
  FE_BASE: 'http://localhost:3000',
  
  USERS: {
    admin: {
      email: 'admin@cloudservicestore.com',
      password: 'Admin@123',
      fullName: 'Administrator',
      role: 'Admin',
    },
    customerA: {
      email: 'e2e.customerA@test.local',
      password: 'Admin@123',
      fullName: 'E2E Customer A',
      role: 'Customer',
    },
    customerB: {
      email: 'e2e.customerB@test.local',
      password: 'Admin@123',
      fullName: 'E2E Customer B',
      role: 'Customer',
    },
    noPermVps: {
      email: 'e2e.noperm.vps@test.local',
      password: 'Admin@123',
      fullName: 'E2E NoPerm VPS',
      role: 'RestrictedCustomer',
    },
    customerEmpty: {
      email: 'e2e.customerEmpty@test.local',
      password: 'Admin@123',
      fullName: 'E2E Customer Empty',
      role: 'Customer',
    },
  },

  COUPONS: {
    valid10: 'E2E-VALID10',
    expired: 'E2E-EXPIRED',
    usedUp: 'E2E-USEDUP',
  },

  GIFT_CARDS: {
    gift100k: 'E2E-GIFT-100K',
  },

  CUSTOMER_A: {
    vpsRunningId: 'aaaaaaaa-1111-1111-1111-111111111111',
    vpsStoppedId: 'aaaaaaaa-2222-2222-2222-222222222222',
    vpsProvId: 'aaaaaaaa-3333-3333-3333-333333333333',
    vpsFailedId: 'aaaaaaaa-4444-4444-4444-444444444444',
    vpsTermId: 'aaaaaaaa-5555-5555-5555-555555555555',
    orderCompletedId: '11111111-aaaa-1111-1111-111111111111',
    orderProcessingId: '22222222-aaaa-2222-2222-222222222222',
    orderPendingId: '33333333-aaaa-3333-3333-333333333333',
    orderCancelledId: '44444444-aaaa-4444-4444-444444444444',
    domActiveId: 'dddddddd-1111-1111-1111-111111111111',
    domExpiringId: 'dddddddd-2222-2222-2222-222222222222',
    domExpiredId: 'dddddddd-3333-3333-3333-333333333333',
    ticketOpenId: 'eeeeeeee-1111-1111-1111-111111111111',
    ticketInProgId: 'eeeeeeee-2222-2222-2222-222222222222',
    ticketResolvedId: 'eeeeeeee-3333-3333-3333-333333333333',
  },

  CUSTOMER_B_IDOR: {
    vpsId: 'bbbbbbbb-2222-2222-2222-222222222222',
    ticketId: 'bbbbbbbb-3333-3333-3333-333333333333',
    domainId: 'bbbbbbbb-4444-4444-4444-444444444444',
    cpId: 'bbbbbbbb-5555-5555-5555-555555555555',
  },
};
