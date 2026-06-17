import { useState } from 'react'

export default function AddRewardForm({ onAdd }) {
  const [toastKey, setToastKey] = useState(0)

  const handleAdd = () => {
    const name = document.getElementById('rewardName').value
    const level = document.getElementById('rewardLevel').value
    const fileInput = document.getElementById('rewardImageFile')
    if (!name || !level) return
    onAdd(name, level, fileInput)
    document.getElementById('rewardName').value = ''
    document.getElementById('rewardLevel').value = ''
    fileInput.value = ''
    setToastKey(k => k + 1)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
      <h3 className="text-lg font-bold mb-4">Añadir nueva recompensa</h3>
      <div className="flex flex-col gap-2">
        <input id="rewardName" type="text" placeholder="Nombre Recompensa" className="border rounded-lg p-2.5" />
        <div className="flex gap-2">
          <input id="rewardLevel" type="number" placeholder="Nivel" className="w-24 border rounded-lg p-2.5" />
          <input id="rewardImageFile" type="file" accept="image/*" className="flex-grow border rounded-lg p-2.5" />
        </div>
        <button onClick={handleAdd} className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold">
          Añadir Recompensa
        </button>
      </div>
      {toastKey > 0 && (
        <div key={toastKey} className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg animate-toast text-sm font-semibold whitespace-nowrap z-10">
          ✓ Recompensa añadida
        </div>
      )}
    </div>
  )
}
