export default function LevelProgress({
  displayedXp, nextLevelXp, totalXp, rewards = [],
  isRegistering, showXpResult, xpARecibir,
}) {
  const animLevel = Math.floor(displayedXp / 100) + 1
  const animCurrentLevelXp = displayedXp % 100
  const nextReward = [...rewards]
    .sort((a, b) => a.requiredLevel - b.requiredLevel)
    .find(r => r.requiredLevel > animLevel)
  const xpFaltante = nextReward
    ? (nextReward.requiredLevel - animLevel) * 100 - animCurrentLevelXp
    : 0

  const pendingXp = isRegistering ? xpARecibir : 0
  const finalLevel = Math.floor((totalXp + pendingXp) / 100) + 1
  const alcanzaRecompensa = nextReward
    && nextReward.requiredLevel > animLevel
    && (isRegistering || showXpResult
      ? finalLevel >= nextReward.requiredLevel
      : xpARecibir >= xpFaltante && xpFaltante > 0
    )

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Progreso Nivel Actual ({animLevel})</h2>
        <span className="text-3xl font-black text-indigo-600">
          {animCurrentLevelXp} <span className="text-lg font-medium text-slate-500">/ {nextLevelXp} XP</span>
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden border border-slate-200">
        <div
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          style={{ width: `${(animCurrentLevelXp / nextLevelXp) * 100}%` }}
        />
      </div>
      {nextReward && (
        <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${alcanzaRecompensa ? 'bg-emerald-50 border-emerald-300 animate-reward-glow' : 'bg-indigo-50 border-indigo-100'}`}>
          {nextReward.imageUrl && <img src={nextReward.imageUrl} alt={nextReward.name} className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200" />}
          <div className="flex-1">
            <span className={`text-xs font-semibold ${alcanzaRecompensa ? 'text-emerald-700' : 'text-indigo-600'}`}>
              SIGUIENTE RECOMPENSA
            </span>
            <p className="text-lg font-bold text-indigo-900">{nextReward.name}</p>
            <p className="text-sm text-indigo-600">Nivel {nextReward.requiredLevel}</p>
            <p className={`text-sm font-bold mt-1 ${alcanzaRecompensa ? 'text-emerald-700' : 'text-indigo-600'}`}>
              {alcanzaRecompensa
                ? '✓ ¡Alcanzas esta recompensa!'
                : (
                  <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-700">OBTÉN</span>
                    <span className="text-2xl font-black text-indigo-600">{xpFaltante}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-500">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 1L13 7L20 8L15 13L16 20L10 16.5L4 20L5 13L0 8L7 7L10 1Z" />
                      </svg>
                      XP
                    </span>
                  </div>
                )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
