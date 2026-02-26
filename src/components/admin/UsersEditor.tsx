'use client'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import type { AdminUser } from '@/types'

interface Props { initialUsers: AdminUser[] }

export default function UsersEditor({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLinks, setResetLinks] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null)
  const [revoking, setRevoking] = useState(false)

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
        setUsers((u) => [...u.filter((x) => x.uid !== user.uid), user])
        flash(`${user.email} added as admin. An invitation email has been sent with a password setup link.`)
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
      if (data.link) {
        setResetLinks((r) => ({ ...r, [userEmail]: data.link }))
        flash(`Password reset link generated for ${userEmail}`)
      }
    } catch { flash('Error generating reset link', false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Admin Users</h2>
        <p className="text-xs text-white/40 mt-1">
          Users with admin access can sign in and manage all site content.
          Access is controlled via Firebase Custom Claims.
        </p>
      </div>

      {/* Grant access + Current admins side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Add user form */}
        <div className="bg-dark-2 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">Grant Admin Access</h3>
          <p className="text-xs text-white/50">
            Enter an email address. If the account doesn&apos;t exist, it will be created automatically and a password reset email will be sent.
          </p>
          <form onSubmit={addUser} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="flex-1 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding…' : 'Add Admin'}
            </button>
          </form>
          {msg && (
            <p className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
          )}
        </div>

        {/* Current admins */}
        <div className="bg-dark-2 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">
            Current Admins <span className="text-white/30 font-normal">({users.length})</span>
          </h3>

          {users.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8 font-oswald tracking-wider">No admin users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.uid} className="bg-dark-3 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-yellow-2/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-2 font-oswald font-bold text-sm">
                          {(user.email ?? '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-oswald truncate">{user.email}</p>
                        {user.displayName && (
                          <p className="text-xs text-white/40 truncate">{user.displayName}</p>
                        )}
                        {user.disabled && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-oswald tracking-wider uppercase">Disabled</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => sendReset(user.email ?? '')}
                        className="text-xs text-white/40 hover:text-yellow-2 font-oswald tracking-wider uppercase transition-colors px-2 py-1 border border-white/10 hover:border-yellow-2/50 rounded"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => setRevokeTarget(user)}
                        className="text-xs text-white/40 hover:text-red-400 font-oswald tracking-wider uppercase transition-colors px-2 py-1 border border-white/10 hover:border-red-400/50 rounded"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  {resetLinks[user.email ?? ''] && (
                    <div className="mt-2 p-2 bg-dark-1 rounded border border-yellow-2/20">
                      <p className="text-xs text-white/50 font-oswald tracking-wider mb-1">Password Reset Link (share with user):</p>
                      <p className="text-xs text-yellow-2 break-all">{resetLinks[user.email ?? '']}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

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
          <li>• Admin access is granted via Firebase Custom Claims (<code className="text-yellow-2/60">admin: true</code>)</li>
          <li>• Users sign in with Google or email/password on the <a href="/login" className="text-yellow-2/60 hover:text-yellow-2">Login page</a></li>
          <li>• Revoking access signs out the user on their next token refresh</li>
          <li>• New users receive a password reset email to set their password</li>
        </ul>
      </div>
    </div>
  )
}
