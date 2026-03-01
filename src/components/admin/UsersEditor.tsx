'use client'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import type { AdminUser } from '@/types'

interface Props { initialUsers: AdminUser[] }

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function formatIp(ip: string | null): string {
  if (!ip) return 'Not recorded yet'
  if (ip === '::1' || ip === '127.0.0.1') return 'Localhost (dev)'
  return ip
}

function parseDevice(ua: string | null): { os: string; browser: string } {
  if (!ua) return { os: 'Unknown', browser: 'Unknown' }
  const os =
    /iPhone/.test(ua) ? 'iPhone' :
    /iPad/.test(ua) ? 'iPad' :
    /Android/.test(ua) ? 'Android' :
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /Linux/.test(ua) ? 'Linux' : 'Unknown'
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /OPR\//.test(ua) ? 'Opera' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? 'Safari' : 'Browser'
  return { os, browser }
}

function getStatus(u: AdminUser): 'active' | 'pending' | 'disabled' {
  if (u.disabled) return 'disabled'
  if (!u.lastSignInTime) return 'pending'
  return 'active'
}

const STATUS_STYLES = {
  active:   'bg-green-500/15 text-green-400 border-green-500/30',
  pending:  'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
  disabled: 'bg-red-500/15 text-red-400 border-red-500/30',
}
const STATUS_LABELS = {
  active:   'Active',
  pending:  'Pending Activation',
  disabled: 'Disabled',
}

const PROVIDER_LABELS: Record<string, string> = {
  'google.com': 'Google',
  'password':   'Email',
  'github.com': 'GitHub',
}

// ── Details Modal ─────────────────────────────────────────────────────────────

function DetailsModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const status = getStatus(user)
  const { os, browser } = parseDevice(user.lastDevice)

  const rows: [string, string][] = [
    ['UID',             user.uid],
    ['Email',           user.email ?? '—'],
    ['Display Name',    user.displayName ?? '—'],
    ['Status',          STATUS_LABELS[status]],
    ['Email Verified',  user.emailVerified ? 'Yes' : 'No'],
    ['Sign-in Methods', user.providers.map(p => PROVIDER_LABELS[p] ?? p).join(', ') || '—'],
    ['Added At',        fmtDate(user.creationTime)],
    ['First / Last Firebase Login', fmtDate(user.lastSignInTime)],
    ['Last Portal Login',           fmtDate(user.lastSeenAt)],
    ['Last IP',         formatIp(user.lastIp)],
    ['Last Location',   user.lastLocation ?? 'Not recorded yet'],
    ['Last Device',     user.lastDevice ? `${browser} on ${os}` : 'Not recorded yet'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-2 rounded-xl border border-white/10 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-2/20 flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-2 font-oswald font-bold text-sm">
                {(user.email ?? '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-white font-oswald">{user.email}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-oswald tracking-wider uppercase border rounded px-1.5 py-0.5 ${STATUS_STYLES[status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-400' : status === 'pending' ? 'bg-yellow-300' : 'bg-red-400'}`} />
                {STATUS_LABELS[status]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rows */}
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <span className="text-[10px] font-oswald tracking-wider uppercase text-white/30 w-40 flex-shrink-0 pt-0.5">{label}</span>
              <span className="text-xs text-white/80 break-all">{value}</span>
            </div>
          ))}

          {/* Raw UA expandable */}
          {user.lastDevice && (
            <details className="mt-2">
              <summary className="text-[10px] font-oswald tracking-wider uppercase text-white/20 cursor-pointer hover:text-white/40 transition-colors">
                Raw User-Agent
              </summary>
              <p className="text-[10px] text-white/30 mt-1 break-all leading-relaxed font-mono">{user.lastDevice}</p>
            </details>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10">
          <button onClick={onClose}
            className="w-full py-2 text-[10px] font-oswald tracking-wider uppercase text-white/40 border border-white/10 rounded hover:border-white/30 hover:text-white/70 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UsersEditor({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null)

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000)
  }

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        flash(err.error ?? 'Failed to add user', false)
      } else {
        const user = await res.json()
        // New user from API doesn't have full metadata yet — add defaults
        const newUser: AdminUser = {
          ...user,
          photoURL: undefined,
          emailVerified: false,
          creationTime: new Date().toISOString(),
          lastSignInTime: undefined,
          providers: [],
          lastIp: null,
          lastLocation: null,
          lastDevice: null,
          lastSeenAt: null,
        }
        setUsers((u) => [...u.filter((x) => x.uid !== user.uid), newUser])
        flash(`${user.email} added. Activation email sent.`)
        setEmail('')
      }
    } catch { flash('Error adding user', false) }
    setLoading(false)
  }

  const confirmRevokeUser = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    const res = await fetch('/api/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: revokeTarget.uid }),
    })
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.uid !== revokeTarget.uid))
      flash(`Admin access removed from ${revokeTarget.email}`)
    }
    setRevoking(false)
    setRevokeTarget(null)
  }

  const sendReset = async (userEmail: string) => {
    try {
      const res = await fetch('/api/users/reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
      const data = await res.json()
      if (data.emailSent) flash(`Password reset email sent to ${userEmail}`)
      else flash(`Failed to send reset email to ${userEmail}`, false)
    } catch { flash('Error sending reset email', false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Admin Users</h2>
        <p className="text-xs text-white/40 mt-1">
          Manage who can access the admin portal. Access is controlled via Firebase Custom Claims.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Add user form ── */}
        <div className="bg-dark-2 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">Grant Admin Access</h3>
          <p className="text-xs text-white/50">
            Enter an email address. If the account doesn&apos;t exist it will be created and an activation email sent.
          </p>
          <form onSubmit={addUser} className="flex gap-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com" required
              className="flex-1 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
            />
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50">
              {loading ? 'Adding…' : 'Add Admin'}
            </button>
          </form>
          {msg && (
            <p className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
          )}
        </div>

        {/* ── Current admins ── */}
        <div className="bg-dark-2 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">
            Current Admins <span className="text-white/30 font-normal">({users.length})</span>
          </h3>

          {users.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8 font-oswald tracking-wider">No admin users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const status = getStatus(user)
                const { os, browser } = parseDevice(user.lastDevice)
                return (
                  <div key={user.uid} className="bg-dark-3 rounded-lg p-4">
                    {/* Row 1: avatar + info + actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-yellow-2/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-2 font-oswald font-bold text-sm">
                            {(user.email ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                        {/* Name + status */}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-oswald truncate">{user.email}</p>
                          {user.displayName && (
                            <p className="text-xs text-white/40 truncate">{user.displayName}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-oswald tracking-wider uppercase border rounded px-1.5 py-0.5 ${STATUS_STYLES[status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                status === 'active' ? 'bg-green-400' :
                                status === 'pending' ? 'bg-yellow-300 animate-pulse' :
                                'bg-red-400'}`} />
                              {STATUS_LABELS[status]}
                            </span>
                            {/* Provider badges */}
                            {user.providers.map((p) => (
                              <span key={p} className="text-[10px] font-oswald tracking-wider uppercase text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                                {PROVIDER_LABELS[p] ?? p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setDetailsUser(user)}
                          title="View details"
                          className="text-xs text-white/40 hover:text-yellow-2 font-oswald tracking-wider uppercase transition-colors px-2 py-1 border border-white/10 hover:border-yellow-2/50 rounded">
                          Details
                        </button>
                        <button onClick={() => sendReset(user.email ?? '')}
                          title="Send password reset email"
                          className="text-xs text-white/40 hover:text-yellow-2 font-oswald tracking-wider uppercase transition-colors px-2 py-1 border border-white/10 hover:border-yellow-2/50 rounded">
                          Reset
                        </button>
                        <button onClick={() => setRevokeTarget(user)}
                          className="text-xs text-white/40 hover:text-red-400 font-oswald tracking-wider uppercase transition-colors px-2 py-1 border border-white/10 hover:border-red-400/50 rounded">
                          Revoke
                        </button>
                      </div>
                    </div>

                    {/* Row 2: meta strip */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-x-5 gap-y-1">
                      <MetaItem label="Added" value={timeAgo(user.creationTime)} />
                      <MetaItem
                        label="Last login"
                        value={user.lastSeenAt ? timeAgo(user.lastSeenAt) : (user.lastSignInTime ? timeAgo(user.lastSignInTime) : '—')}
                      />
                      {user.lastDevice && (
                        <MetaItem label="Device" value={`${browser} / ${os}`} />
                      )}
                      {user.lastIp && (
                        <MetaItem label="IP" value={formatIp(user.lastIp)} />
                      )}
                      {user.lastLocation && (
                        <MetaItem label="Location" value={user.lastLocation} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details modal */}
      {detailsUser && <DetailsModal user={detailsUser} onClose={() => setDetailsUser(null)} />}

      <ConfirmModal
        open={revokeTarget !== null}
        title="Revoke Admin Access"
        message={`Remove admin access from ${revokeTarget?.email}? They will lose access on their next login.`}
        confirmLabel="Revoke"
        onConfirm={confirmRevokeUser}
        onCancel={() => setRevokeTarget(null)}
        loading={revoking}
      />

      {/* Info card */}
      <div className="bg-dark-2/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-xs font-oswald tracking-widest uppercase text-white/40 mb-2">How It Works</h4>
        <ul className="space-y-1.5 text-xs text-white/30">
          <li>• <span className="text-green-400/70">Active</span> — user has signed in at least once</li>
          <li>• <span className="text-yellow-300/70">Pending Activation</span> — invite sent but user hasn&apos;t signed in yet</li>
          <li>• IP and device are recorded each time an admin logs in to the portal</li>
          <li>• Revoking access takes effect on their next token refresh (~1 hour)</li>
        </ul>
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[10px] text-white/30 font-oswald tracking-wider">
      <span className="uppercase text-white/20">{label}: </span>{value}
    </span>
  )
}
