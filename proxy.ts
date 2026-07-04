import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // In demo mode, auth is handled client-side via localStorage
  // The middleware just passes through - protection is done in page components
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
