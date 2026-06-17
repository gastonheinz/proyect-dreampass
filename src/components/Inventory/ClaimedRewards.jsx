export default function ClaimedRewards({ claimedRewards }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Recompensas reclamadas</h3>
      {claimedRewards.length === 0 ? (
        <p className="text-slate-500">Aún no has reclamado ninguna recompensa.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...claimedRewards]
            .sort((a, b) => b.claimedAt - a.claimedAt)
            .map(r => (
              <div key={r.id + r.claimedAt} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
                {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-violet-200" />}
                <span className="font-bold text-slate-900">{r.name}</span>
                <span className="text-xs text-slate-500">Reclamada - Nivel {r.requiredLevel}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
