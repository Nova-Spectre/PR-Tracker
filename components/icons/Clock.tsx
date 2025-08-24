export function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2}/>
      <polyline points="12,6 12,12 16,14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
