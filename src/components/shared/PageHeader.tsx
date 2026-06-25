interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-4">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
