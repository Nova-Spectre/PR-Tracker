export default function ColumnHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{count}</span>
    </div>
  )
}


