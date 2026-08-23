const ADMIN_PREFIX = '/admin';

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '='));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const STAFF_ROLES = ['Admin', 'Accountant', 'Technician', 'Support', 'Editor', 'Staff'];

export function hasAdminRole(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const role =
    (payload['role'] as string | undefined) ||
    (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | undefined);

  if (!role) return false;
  return STAFF_ROLES.some(r => r.toLowerCase() === role.toLowerCase());
}

export function buildLoginRedirect(pathname: string, origin: string): string {
  const url = new URL('/', origin);
  url.searchParams.set('auth', 'login');
  url.searchParams.set('redirect', pathname);
  return url.toString();
}
