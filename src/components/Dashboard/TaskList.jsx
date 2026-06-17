export default function TaskList({ tasks, onComplete }) {
  return (
    <section>
      <h3 className="text-lg font-bold mb-4 text-slate-950">Tareas</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-semibold">
                {task.name} <span className="text-xs text-slate-400">({task.type})</span>
              </h4>
              <p className="text-sm text-violet-600 font-medium">{task.xp} XP</p>
            </div>
            <button
              onClick={() => onComplete(task.id)}
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-all active:scale-95"
            >
              Completar
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
