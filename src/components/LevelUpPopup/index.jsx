import { useMemo } from 'react'

export default function LevelUpPopup({ show, onClose }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${((i * 97 + 13) % 100)}vw`,
        delay: `${((i * 37 + 7) % 20) / 10}s`,
      })),
    [],
  )

  if (!show) return null

  return (
    <div key="levelup-popup" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-popup p-4">
      <div className="bg-white p-10 rounded-3xl text-center shadow-2xl max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-lg font-bold"
        >
          ✕
        </button>
        <h2 className="text-5xl font-black text-violet-600 mb-2">¡Nivel {show.level}!</h2>
        <p className="text-xl text-slate-600 mb-6">¡Has subido de nivel!</p>

        {show.rewards.length > 0 && (
          <div className="bg-violet-50 p-4 rounded-xl">
            <h3 className="font-bold text-violet-900 mb-3">¡Nuevas recompensas disponibles!</h3>
            <p className="text-sm text-violet-600 mb-3">Reclámalas desde tu inventario.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {show.rewards.map(r => (
                <div key={r.id} className="flex flex-col items-center gap-1">
                  {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-16 h-16 object-cover rounded-full border-2 border-violet-200" />}
                  <span className="text-sm font-semibold">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {confetti.map(c => (
        <div key={c.id} className="absolute w-4 h-4 bg-yellow-400 animate-confetti" style={{ left: c.left, animationDelay: c.delay }} />
      ))}
    </div>
  )
}
