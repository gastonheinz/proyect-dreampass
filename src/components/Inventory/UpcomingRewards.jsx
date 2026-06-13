export default function UpcomingRewards({ rewards, level, claimedRewards }) {
  const upcoming = rewards.filter(r => r.requiredLevel > level && !claimedRewards.find(cr => cr.id === r.id))

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Recompensas por conseguir</h3>
      {upcoming.length === 0 ? (
        <p className="text-slate-500">No hay más recompensas por descubrir.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map(r => (
            <div key={r.id} className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col items-center text-center gap-2">
              {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-amber-300" />}
              <span className="font-bold text-slate-900">{r.name}</span>
              <span className="text-xs text-slate-500">Nivel {r.requiredLevel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
