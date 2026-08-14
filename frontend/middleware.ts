import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildLoginRedirect, hasAdminRole, isAdminRoute } from './lib/admin-route-guard';

const SERVICE_PLAN_GUID =
  /^\/services\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyPlanMatch = pathname.match(SERVICE_PLAN_GUID);
  if (legacyPlanMatch) {
    return NextResponse.redirect(
      new URL(`/services/plans/${legacyPlanMatch[1]}`, request.url)
    );
  }

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token || !hasAdminRole(token)) {
    return NextResponse.redirect(buildLoginRedirect(pathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)'],
};
