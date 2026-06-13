export default function XpSettings({ miniXp, setMiniXp, blockXp, setBlockXp, onReset, onGenerateTasks }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Configuración XP</h3>
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
