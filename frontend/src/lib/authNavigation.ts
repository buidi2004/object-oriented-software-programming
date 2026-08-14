export type AuthMode = 'login' | 'register';

/** URL trang chủ mở AuthModal (giữ tương thích /login?redirect=...) */
export function getAuthModalUrl(mode: AuthMode = 'login', redirectPath?: string | null): string {
  const params = new URLSearchParams({ auth: mode });
  if (redirectPath && redirectPath.startsWith('/')) {
    params.set('redirect', redirectPath);
  }
  return `/?${params.toString()}`;
}

/** Điều hướng tới modal đăng nhập/đăng ký */
export function requestAuth(mode: AuthMode = 'login', redirectPath?: string) {
  if (typeof window === 'undefined') return;
  const fallback =
    redirectPath ??
    `${window.location.pathname}${window.location.search}`;
  window.location.assign(getAuthModalUrl(mode, fallback));
}
