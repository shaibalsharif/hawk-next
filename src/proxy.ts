import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'hawk_session'

// ── Sliding-window rate limiter (in-memory, per edge instance) ──────────────
const store = new Map<string, number[]>()

function slidingWindow(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    store.set(key, hits)
    const retryAfterSec = Math.ceil((windowMs - (now - hits[0])) / 1000)
    return { allowed: false, retryAfterSec }
  }
  hits.push(now)
  store.set(key, hits)
  return { allowed: true, retryAfterSec: 0 }
}

let lastPrune = 0
function pruneStore(windowMs: number) {
  const now = Date.now()
  if (now - lastPrune < 60_000) return
  lastPrune = now
  for (const [key, hits] of store) {
    if (hits.every((t) => now - t >= windowMs)) store.delete(key)
  }
}

// ── IP extraction ────────────────────────────────────────────────────────────
function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Bot / scanner detection ──────────────────────────────────────────────────
const SCANNER_SIGNATURES = [
  /zgrab/i, /masscan/i, /nikto/i, /sqlmap/i, /nmap/i,
  /dirbuster/i, /gobuster/i, /hydra/i, /nuclei/i, /wfuzz/i,
  /acunetix/i, /openvas/i, /nessus/i, /burpsuite/i, /havij/i, /metasploit/i,
]

function isKnownScanner(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua) return true
  return SCANNER_SIGNATURES.some((re) => re.test(ua))
}

// ── Rate-limit rules ─────────────────────────────────────────────────────────
interface Rule { max: number; windowMs: number }

const ROUTE_RULES: Record<string, Rule> = {
  '/api/auth/forgot':   { max: 5,   windowMs: 60 * 60_000 }, // 5 / hr
  '/api/auth/verify':  { max: 30,  windowMs: 60_000 },       // 30 / min
  '/api/auth/session': { max: 60,  windowMs: 60_000 },       // 60 / min
}

const GLOBAL_RULE: Rule = { max: 120, windowMs: 60_000 } // 120 / min

// ── Response helpers ─────────────────────────────────────────────────────────
function blockedResponse(status: 403 | 429, retryAfterSec = 0): NextResponse {
  if (status === 403) return new NextResponse('Forbidden', { status: 403 })
  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Remaining': '0',
      },
    },
  )
}

// ── Proxy ────────────────────────────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ① Admin route protection — redirect to login if no session cookie
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(SESSION_COOKIE)?.value
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ② API rate limiting + bot blocking
  if (pathname.startsWith('/api')) {
    // Skip UploadThing — it uses its own internal auth middleware
    if (pathname.startsWith('/api/uploadthing')) return NextResponse.next()

    const ip = getIp(request)
    pruneStore(GLOBAL_RULE.windowMs)

    // Block known scanners / zero-UA bots
    if (isKnownScanner(request)) return blockedResponse(403)

    // Per-route rate limit (auth endpoints)
    const routeRule = ROUTE_RULES[pathname]
    if (routeRule) {
      const { allowed, retryAfterSec } = slidingWindow(
        `r:${pathname}:${ip}`,
        routeRule.max,
        routeRule.windowMs,
      )
      if (!allowed) return blockedResponse(429, retryAfterSec)
    }

    // Global flood guard
    const { allowed, retryAfterSec } = slidingWindow(
      `g:${ip}`,
      GLOBAL_RULE.max,
      GLOBAL_RULE.windowMs,
    )
    if (!allowed) return blockedResponse(429, retryAfterSec)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
