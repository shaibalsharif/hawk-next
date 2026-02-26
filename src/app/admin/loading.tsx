export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-36 bg-white/10 rounded" />
        <div className="h-3 w-64 bg-white/5 rounded mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-dark-2 rounded-lg p-6 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-8 w-16 bg-white/10 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-dark-2 rounded-lg p-6 space-y-4">
        <div className="h-4 w-32 bg-white/10 rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="h-2 bg-white/5 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
