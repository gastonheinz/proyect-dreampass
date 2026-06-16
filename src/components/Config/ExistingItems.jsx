import DaySelector from '../Admin/DaySelector'

export default function ExistingItems({
  rewards, onDeleteReward,
  tasks, recurringTasks,
  onDeleteTask, onDeleteRecurringTask,
  onUpdateDays, onMakeRecurring, onMakeNonRecurring,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h4 className="font-bold text-lg mb-4">Recompensas existentes:</h4>
      <div className="space-y-2 mb-6">
        {rewards.map(r => (
          <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-3">
              {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-10 h-10 object-cover rounded" />}
              <span className="text-sm font-medium">
                {r.name} <span className="text-slate-500">(Nivel {r.requiredLevel})</span>
              </span>
            </div>
            <button onClick={() => onDeleteReward(r.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <h4 className="font-bold text-lg mb-4">Tareas:</h4>
      <div className="space-y-2">
        {[...tasks, ...recurringTasks.map(t => ({ ...t, isRecurring: true }))].map(r => (
          <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {r.name} <span className="text-slate-500">({r.type})</span>
              </span>
              {r.isRecurring && (
                <DaySelector
                  days={r.days}
                  onToggle={i => onUpdateDays(r.id, i)}
                />
              )}
            </div>
            <div className="flex gap-2">
              {!r.isRecurring ? (
                <button onClick={() => onMakeRecurring(r)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                  Hacer Recurrente
                </button>
              ) : (
                <button onClick={() => onMakeNonRecurring(r)} className="text-amber-600 hover:text-amber-800 text-sm font-semibold">
                  Quitar Recurrente
                </button>
              )}
              <button
                onClick={() => r.isRecurring ? onDeleteRecurringTask(r.id) : onDeleteTask(r.id)}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
