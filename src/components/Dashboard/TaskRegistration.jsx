import { useEffect, useRef } from 'react'

export default function TaskRegistration({
  regAnim, displayedXp, totalXp,
  completedMinis, setCompletedMinis,
  completedBlocks, setCompletedBlocks,
}) {
  const prevShowResult = useRef(false)

  const xpARecibir = ((completedBlocks > 0 ? 1 : 0) + completedMinis * 5) * ((completedMinis > 0 ? 1 : 0) + completedBlocks)

  useEffect(() => {
    if (regAnim.showXpResult && !prevShowResult.current) {
      prevShowResult.current = true
    }
    if (regAnim.showXpResult && displayedXp === totalXp) {
      const timer = setTimeout(() => {
        regAnim.resetResult()
        setCompletedMinis(0)
        setCompletedBlocks(0)
        prevShowResult.current = false
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [regAnim.showXpResult, displayedXp, totalXp, regAnim.resetResult, setCompletedMinis, setCompletedBlocks])

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Registrar tareas realizadas hoy</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {(regAnim.isRegistering || regAnim.showXpResult) && (
            <span className="text-2xl font-black text-sky-600 whitespace-nowrap">
              {completedBlocks > 0 ? '1 +' : '0 +'}
            </span>
          )}
          <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 bg-sky-100 border-sky-200`}>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-sky-800">Tareas Mini:</label>
              <span className="text-xs font-bold text-sky-600 bg-sky-200 px-2 py-0.5 rounded">×5</span>
            </div>
            <input
              type="number"
              min="0"
              value={completedMinis}
              onChange={e => setCompletedMinis(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>
          <span className="text-2xl font-black text-slate-400">×</span>
          {(regAnim.isRegistering || regAnim.showXpResult) && (
            <span className="text-2xl font-black text-red-600 whitespace-nowrap">
              {completedMinis > 0 ? '1 +' : '0 +'}
            </span>
          )}
          <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 bg-red-100 border-red-200`}>
            <label className="block text-sm font-medium mb-1 text-red-800">Tareas Bloque:</label>
            <input
              type="number"
              min="0"
              value={completedBlocks}
              onChange={e => setCompletedBlocks(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          {regAnim.isRegistering || regAnim.showXpResult ? (
            <div className="flex flex-col items-center gap-1">
              {regAnim.animPhase === 'left' && (
                <div className="text-center">
                  <div className="text-lg font-black text-indigo-600">
                    ({completedBlocks > 0 ? '1' : '0'} + <span className="text-sky-600">{regAnim.animLeftValue}</span>) × ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                  </div>
                  <div className="text-lg font-black text-indigo-600 mt-1">
                    (<span className="text-sky-600">{(completedBlocks > 0 ? 1 : 0) + regAnim.animLeftValue}</span>)
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">Calculando multiplicando Mini...</div>
                </div>
              )}
              {regAnim.animPhase === 'right' && (
                <div className="text-center">
                  <div className="text-lg font-black text-indigo-600">
                    <span>({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})</span>
                    <span className="mx-2">×</span>
                    <span>({completedMinis > 0 ? '1' : '0'} + <span className="text-red-600">{regAnim.animRightValue}</span>)</span>
                  </div>
                  <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                    <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                    <span>×</span>
                    <span>(<span className="text-red-600">{(completedMinis > 0 ? 1 : 0) + regAnim.animRightValue}</span>)</span>
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">Calculando multiplicando Bloque...</div>
                </div>
              )}
              {regAnim.animPhase === 'total' && !regAnim.showXpResult && (
                <div className="text-center">
                  <div className="text-lg font-black text-indigo-600">
                    ({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})
                    <span className="mx-2">×</span>
                    ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                  </div>
                  <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                    <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                    <span>×</span>
                    <span>({(completedMinis > 0 ? 1 : 0) + completedBlocks})</span>
                    <span>=</span>
                    <span className="text-indigo-700">+{regAnim.registerXpDisplay}</span>
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">Calculando XP total...</div>
                </div>
              )}
              {regAnim.showXpResult && (
                <div className="text-center">
                  <div className="text-lg font-black text-indigo-600">
                    ({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})
                    <span className="mx-2">×</span>
                    ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                  </div>
                  <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                    <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                    <span>×</span>
                    <span>({(completedMinis > 0 ? 1 : 0) + completedBlocks})</span>
                    <span>=</span>
                    <span className="text-emerald-600">+{regAnim.lastXpAddedRef.current}</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">¡XP añadida!</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-indigo-900">Total XP a recibir:</span>
                <span className="block text-2xl font-black text-indigo-600">+{xpARecibir}</span>
              </div>
              <button
                onClick={() => regAnim.startRegister(completedMinis, completedBlocks)}
                disabled={regAnim.isRegistering || xpARecibir === 0}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  !regAnim.isRegistering && xpARecibir > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                Registrar y ganar XP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
