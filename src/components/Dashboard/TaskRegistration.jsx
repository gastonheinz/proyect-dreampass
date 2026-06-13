import { useEffect, useRef } from 'react'

export default function TaskRegistration({
  regAnim, displayedXp, totalXp,
  completedMinis, setCompletedMinis,
  completedBlocks, setCompletedBlocks,
  xpMode, miniXp, blockXp,
}) {
  const prevShowResult = useRef(false)

  const xpARecibir = xpMode === 'classic'
    ? (completedMinis * miniXp) + (completedBlocks * blockXp)
    : (1 + completedMinis * 5) * (1 + completedBlocks * 5)

  const hasBlocks = completedBlocks > 0
  const hasMinis = completedMinis > 0

  const leftFinal = xpMode === 'classic' ? completedMinis * miniXp : 1 + completedMinis * 5
  const rightFinal = xpMode === 'classic' ? completedBlocks * blockXp : 1 + completedBlocks * 5

  const leftComplete = regAnim.animPhase !== 'left' || regAnim.animLeftValue >= leftFinal
  const rightComplete = regAnim.animPhase === 'total' || regAnim.showXpResult || (regAnim.animPhase === 'right' && regAnim.animRightValue >= rightFinal)

  const leftDisplay = leftComplete ? leftFinal : regAnim.animLeftValue
  const rightDisplay = rightComplete ? rightFinal : regAnim.animRightValue

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

  function renderFormula() {
    if (xpMode === 'classic') {
      return (
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 text-lg font-black text-indigo-600 flex-wrap">
            <span className={`transition-all duration-300 ${regAnim.animPhase === 'left' || leftComplete ? 'opacity-100' : 'opacity-40'}`}>
              ({completedMinis} × {miniXp})
            </span>
            <span className="text-slate-400">+</span>
            <span className={`transition-all duration-300 ${regAnim.animPhase === 'right' || rightComplete ? 'opacity-100' : 'opacity-40'}`}>
              ({completedBlocks} × {blockXp})
            </span>
          </div>
          <div className="flex justify-center items-center gap-2 text-lg font-black mt-2 flex-wrap">
            <span className={`transition-all duration-300 text-sky-600 ${regAnim.animPhase === 'left' ? 'scale-110' : ''}`}>
              {leftDisplay}
            </span>
            <span className="text-slate-400">+</span>
            <span className={`transition-all duration-300 text-red-600 ${regAnim.animPhase === 'right' ? 'scale-110' : ''}`}>
              {rightDisplay}
            </span>
            {(regAnim.animPhase === 'total' || regAnim.showXpResult) && (
              <>
                <span className="text-slate-400">=</span>
                <span className={`transition-all duration-300 ${regAnim.showXpResult ? 'text-emerald-600 scale-110' : 'text-indigo-700'}`}>
                  +{regAnim.showXpResult ? regAnim.lastXpAddedRef.current : regAnim.registerXpDisplay}
                </span>
              </>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="text-center">
        <div className="flex justify-center items-center gap-2 text-lg font-black text-indigo-600 flex-wrap">
          <span className={`transition-all duration-300 ${regAnim.animPhase === 'left' || leftComplete ? 'opacity-100' : 'opacity-40'}`}>
            (1 + {completedMinis}×5)
          </span>
          <span className="text-slate-400">×</span>
          <span className={`transition-all duration-300 ${regAnim.animPhase === 'right' || rightComplete ? 'opacity-100' : 'opacity-40'}`}>
            (1 + {completedBlocks}×5)
          </span>
        </div>
        <div className="flex justify-center items-center gap-2 text-lg font-black mt-2 flex-wrap">
          <span className={`transition-all duration-300 text-sky-600 ${regAnim.animPhase === 'left' ? 'scale-110' : ''}`}>
            {leftDisplay}
          </span>
          <span className="text-slate-400">×</span>
          <span className={`transition-all duration-300 text-red-600 ${regAnim.animPhase === 'right' ? 'scale-110' : ''}`}>
            {rightDisplay}
          </span>
          {(regAnim.animPhase === 'total' || regAnim.showXpResult) && (
            <>
              <span className="text-slate-400">=</span>
              <span className={`transition-all duration-300 ${regAnim.showXpResult ? 'text-emerald-600 scale-110' : 'text-indigo-700'}`}>
                +{regAnim.showXpResult ? regAnim.lastXpAddedRef.current : regAnim.registerXpDisplay}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  function renderStatusText() {
    if (regAnim.showXpResult) {
      return <div className="text-xs text-emerald-600 font-medium mt-1">¡XP añadida!</div>
    }
    if (regAnim.animPhase === 'left') {
      return <div className="text-xs text-indigo-400 mt-1">Calculando factor izquierdo...</div>
    }
    if (regAnim.animPhase === 'right') {
      return <div className="text-xs text-indigo-400 mt-1">Calculando factor derecho...</div>
    }
    if (regAnim.animPhase === 'total') {
      return <div className="text-xs text-indigo-400 mt-1">Calculando XP total...</div>
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Registrar tareas realizadas hoy</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 p-4 rounded-xl border bg-sky-100 border-sky-200">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-sky-800">Tareas Mini:</label>
              <span className="text-xs font-bold text-sky-600 bg-sky-200 px-2 py-0.5 rounded">
                {xpMode === 'classic' ? `×${miniXp} XP` : '×5'}
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={completedMinis}
              onChange={e => setCompletedMinis(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={regAnim.isRegistering}
              className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-50"
            />
          </div>
          <span className="text-2xl font-black text-slate-400 shrink-0">
            {xpMode === 'classic' ? '+' : '×'}
          </span>
          <div className="flex-1 p-4 rounded-xl border bg-red-100 border-red-200">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-red-800">Tareas Bloque:</label>
              <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded">
                {xpMode === 'classic' ? `×${blockXp} XP` : '×5'}
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={completedBlocks}
              onChange={e => setCompletedBlocks(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={regAnim.isRegistering}
              className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          {regAnim.isRegistering || regAnim.showXpResult ? (
            <div className="flex flex-col items-center gap-1">
              {renderFormula()}
              {renderStatusText()}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => regAnim.startRegister(completedMinis, completedBlocks)}
                disabled={regAnim.isRegistering || xpARecibir === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
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
