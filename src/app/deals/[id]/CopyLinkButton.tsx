'use client'
import { useState } from 'react'

export default function CopyLinkButton({ dealId }: { dealId: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(`${window.location.origin}/deals/${dealId}/join`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-[13px] font-semibold text-on-surface-variant"
    >
      <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
      {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
    </button>
  )
}
