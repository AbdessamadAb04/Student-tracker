interface KPICardProps {
  label: string
  value: string | number
  delta?: { value: string; direction: 'up' | 'down' | 'neutral' }
  loading?: boolean
}

export default function KPICard({ label, value, delta, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
        <div className="mb-2 h-4 w-20 rounded bg-gray-100" />
        <div className="h-8 w-16 rounded bg-gray-100" />
        {delta && <div className="mt-2 h-3 w-14 rounded bg-gray-100" />}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-medium ${
          delta.direction === 'up' ? 'text-green-600' :
          delta.direction === 'down' ? 'text-red-500' :
          'text-gray-400'
        }`}>
          {delta.direction === 'up' && '↑ '}
          {delta.direction === 'down' && '↓ '}
          {delta.value}
        </div>
      )}
    </div>
  )
}
