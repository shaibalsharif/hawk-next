export default function FileManagerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-44 bg-white/10 rounded" />
        <div className="h-3 w-72 bg-white/5 rounded mt-2" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2">
        {[80, 110, 90, 100, 80].map((w, i) => (
          <div key={i} className="h-8 bg-white/10 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Stats bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-8 w-28 bg-white/10 rounded" />
      </div>

      {/* Table skeleton */}
      <div className="bg-dark-2 rounded-lg overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0">
            <div className="w-14 h-14 bg-white/10 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-20 bg-white/10 rounded-full" />
              <div className="h-5 w-16 bg-white/10 rounded-full" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
