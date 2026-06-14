import { useState } from 'react'

const LEVELS_PER_PAGE = 7
const MAX_OFFSET = 93

export default function BattlePassGrid({ level, rewards, claimedRewards }) {
  const [passOffset, setPassOffset] = useState(0)
  const [hoveredLevel, setHoveredLevel] = useState(null)

  const visibleLevels = Array.from({ length: LEVELS_PER_PAGE }, (_, i) => passOffset + i + 1)

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Progreso del Pase</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPassOffset(Math.max(0, passOffset - LEVELS_PER_PAGE))}
              className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 text-slate-600"
            >
              ◀
            </button>
            <button
              onClick={() => setPassOffset(Math.min(MAX_OFFSET, passOffset + LEVELS_PER_PAGE))}
              className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 text-slate-600"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {visibleLevels.map(lv => {
            const levelRewards = rewards.filter(r => r.requiredLevel === lv)
            return (
              <div
                key={lv}
                onMouseEnter={() => setHoveredLevel(lv)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`relative p-3 border-2 rounded-lg flex flex-col items-center justify-between min-h-[120px] transition-transform hover:scale-105 cursor-pointer ${
                  level >= lv
                    ? 'bg-indigo-600 border-indigo-700 text-white'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {level >= lv && levelRewards.length > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className={`text-xs font-bold mb-2 ${level >= lv ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Lv.{lv}
                </span>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full">
                  {levelRewards.map(r => {
                    const isClaimed = claimedRewards.find(cr => cr.id === r.id)
                    return (
                      <div
                        key={r.id}
                        className={`flex flex-col items-center text-center p-1 rounded transition-all ${
                          level >= lv ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-8 h-8 object-cover rounded mb-1" />}
                        <span className="text-[10px] break-words w-full">{r.name}</span>
                        {isClaimed && <span className="text-[9px] font-bold text-emerald-400">✓</span>}
                      </div>
                    )
                  })}
                </div>
                {level === lv && <div className="absolute -bottom-2 w-4 h-4 bg-indigo-600 rotate-45 rounded-sm" />}
              </div>
            )
          })}
        </div>
      </div>

      {hoveredLevel && (() => {
        const r = rewards.find(r => r.requiredLevel === hoveredLevel)
        if (!r) return null
        return (
          <div className="absolute left-full top-0 ml-3 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-5 flex flex-col items-center text-center gap-3 z-50">
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.name} className="w-32 h-32 object-cover rounded-xl border-2 border-indigo-200" />
            ) : (
              <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-indigo-200 flex items-center justify-center text-slate-400 text-4xl">?</div>
            )}
            <span className="font-bold text-slate-900 text-lg">{r.name}</span>
            <span className="text-sm text-slate-500">Nivel {r.requiredLevel}</span>
            {claimedRewards.find(cr => cr.id === r.id) && (
              <span className="text-xs text-emerald-600 font-bold">✓ Reclamada</span>
            )}
          </div>
        )
      })()}
    </div>
  )
}
