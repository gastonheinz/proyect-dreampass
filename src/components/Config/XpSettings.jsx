export default function XpSettings({ miniXp, setMiniXp, blockXp, setBlockXp, xpMode, setXpMode, onReset, onGenerateTasks }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Configuración XP</h3>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Modo de cálculo XP:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setXpMode('current')}
            className={`flex-1 p-3 rounded-lg font-semibold border transition-all ${
              xpMode === 'current'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setXpMode('classic')}
            className={`flex-1 p-3 rounded-lg font-semibold border transition-all ${
              xpMode === 'classic'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
            }`}
          >
            Clásico
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {xpMode === 'current'
            ? 'Actual: (1 + Mini×5) × (1 + Bloque×5)'
            : 'Clásico: (Mini×XP Mini) + (Bloque×XP Bloque)'
          }
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium">XP Mini:</label>
          <input
            type="number"
            value={miniXp}
            onChange={e => setMiniXp(parseInt(e.target.value) || 0)}
            className="w-full border rounded-lg p-2.5"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">XP Bloque:</label>
          <input
            type="number"
            value={blockXp}
            onChange={e => setBlockXp(parseInt(e.target.value) || 0)}
            className="w-full border rounded-lg p-2.5"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onReset} className="bg-red-600 text-white p-3 rounded-lg flex-grow font-bold">
          Reiniciar Nivel a 1
        </button>
        <button onClick={onGenerateTasks} className="bg-emerald-600 text-white p-3 rounded-lg flex-grow font-bold">
          Añadir tareas hoy
        </button>
      </div>
    </div>
  )
}
