'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  loading?: boolean
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  danger = true,
  loading = false,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-dark-2 rounded-lg p-6 w-full max-w-sm space-y-4 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  danger ? 'bg-red-500/15' : 'bg-yellow-2/15'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-yellow-2'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-oswald tracking-wider uppercase text-white">{title}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 text-xs font-oswald tracking-wider uppercase rounded transition-colors disabled:opacity-50 ${
                  danger
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-yellow-2 hover:bg-yellow-2/90 text-dark-1'
                }`}
              >
                {loading ? 'Deleting…' : confirmLabel}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 border border-white/20 text-white/60 text-xs font-oswald tracking-wider uppercase rounded hover:border-white/40 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
