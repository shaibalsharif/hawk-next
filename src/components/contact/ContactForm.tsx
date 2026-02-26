'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    // Placeholder — integrate email service when ready
    await new Promise((r) => setTimeout(r, 1200))
    setStatus('sent')
  }

  const inputCls = 'bg-transparent border-b border-white/20 focus:border-yellow-2 outline-none py-3 text-sm font-montserrat placeholder:text-white/30 transition-colors duration-300 w-full'

  return (
    <div className="bg-dark-2 py-24 px-4 md:px-[10%]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: XEN_EASE }}
        className="max-w-2xl"
      >
        <p className="section-label mb-3">Get In Touch</p>
        <h2 className="section-title text-[clamp(2rem,4vw,3rem)] mb-10">Send Us a Message</h2>

        {status === 'sent' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-yellow-2 text-sm tracking-widest uppercase py-12"
          >
            Message received — we&apos;ll be in touch soon.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className={inputCls}
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className={inputCls}
              />
            </div>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className={inputCls}
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows={5}
              required
              className={inputCls + ' resize-none'}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="xen-btn text-white disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
