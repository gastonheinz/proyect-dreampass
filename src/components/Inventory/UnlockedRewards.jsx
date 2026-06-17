export default function UnlockedRewards({ rewards, level, claimedRewards, onClaim }) {
  const unlocked = rewards.filter(r => r.requiredLevel <= level && !claimedRewards.find(cr => cr.id === r.id))

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Recompensas obtenidas</h3>
      {unlocked.length === 0 ? (
        <p className="text-slate-500">No hay recompensas disponibles para reclamar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlocked.map(r => (
            <div key={r.id} className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex flex-col items-center text-center gap-2">
              {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-300" />}
              <span className="font-bold text-slate-900">{r.name}</span>
              <span className="text-xs text-slate-500">Nivel {r.requiredLevel}</span>
              <button
                onClick={() => onClaim(r)}
                className="mt-1 bg-violet-600 text-white text-xs px-4 py-1.5 rounded-full font-bold hover:bg-violet-700 transition-all active:scale-95"
              >
                Reclamar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
