import { Page, BrowserContext } from '@playwright/test';
import { E2E_CONFIG } from './seed-data';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
}

export async function loginViaApi(userKey: keyof typeof E2E_CONFIG.USERS): Promise<AuthTokens> {
  const user = E2E_CONFIG.USERS[userKey];
  const res = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      deviceInfo: 'Playwright E2E Runner',
      ipAddress: '127.0.0.1',
      userAgent: 'Playwright',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to login via API for ${user.email} (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.userId,
    role: data.role,
  };
}

export async function authenticatePage(page: Page, userKey: keyof typeof E2E_CONFIG.USERS): Promise<AuthTokens> {
  const tokens = await loginViaApi(userKey);
  
  // Set localStorage via addInitScript before any page loads
  await page.context().addInitScript(({ token, rToken, user }) => {
    try {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('token', token);
      if (rToken) localStorage.setItem('refreshToken', rToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      // Ignore if localStorage unavailable in mock context
    }
  }, { token: tokens.accessToken, rToken: tokens.refreshToken, user: E2E_CONFIG.USERS[userKey] });

  return tokens;
}

export async function createAuthenticatedContext(context: BrowserContext, userKey: keyof typeof E2E_CONFIG.USERS): Promise<Page> {
  const page = await context.newPage();
  await authenticatePage(page, userKey);
  return page;
}
