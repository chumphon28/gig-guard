export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant text-[14px] font-semibold">กำลังโหลด Deal...</p>
      </div>
    </div>
  )
}
