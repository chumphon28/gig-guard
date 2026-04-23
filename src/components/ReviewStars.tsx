'use client'

export default function ReviewStars({
  rating,
  onChange,
  size = 24,
}: {
  rating: number
  onChange?: (r: number) => void
  size?: number
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onChange}
        >
          <span
            className={`material-symbols-outlined text-[${size}px] ${i <= rating ? 'text-yellow-400' : 'text-slate-300'}`}
            style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  )
}
