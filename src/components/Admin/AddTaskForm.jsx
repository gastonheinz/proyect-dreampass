import { useState } from 'react'
import DaySelector from './DaySelector'

export default function AddTaskForm({ onAdd, miniXp, mediaXp, blockXp }) {
  const [taskName, setTaskName] = useState('')
  const [taskType, setTaskType] = useState('Mini')
  const [taskCustomXp, setTaskCustomXp] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true])
  const [toastKey, setToastKey] = useState(0)

  const handleAdd = () => {
    if (!taskName) return
    onAdd(taskName, taskType, taskCustomXp, isRecurring, selectedDays)
    setTaskName('')
    setTaskCustomXp('')
    setToastKey(k => k + 1)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
      <h3 className="text-lg font-bold mb-4">Añadir nueva tarea</h3>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre Tarea"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          className="border rounded-lg p-2.5"
        />
        <div className="flex gap-2 items-center">
            <select value={taskType} onChange={e => setTaskType(e.target.value)} className="border rounded-lg p-2.5 flex-grow">
              <option value="Mini">Mini ({miniXp} XP)</option>
              <option value="Media">Media ({mediaXp} XP)</option>
              <option value="Bloque">Bloque ({blockXp} XP)</option>
              <option value="Personalizada">Personalizada</option>
            </select>
          {taskType === 'Personalizada' && (
            <input
              type="number"
              placeholder="XP"
              value={taskCustomXp}
              onChange={e => setTaskCustomXp(e.target.value)}
              className="w-24 border rounded-lg p-2.5"
            />
          )}
          <button onClick={handleAdd} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold">
            Añadir
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
          <label>¿Es recurrente?</label>
        </div>

        {isRecurring && (
          <DaySelector
            days={selectedDays}
            onToggle={i => setSelectedDays(prev => prev.map((val, idx) => idx === i ? !val : val))}
          />
        )}
      </div>
      {toastKey > 0 && (
        <div key={toastKey} className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg animate-toast text-sm font-semibold whitespace-nowrap z-10">
          ✓ Tarea añadida
        </div>
      )}
    </div>
  )
}
