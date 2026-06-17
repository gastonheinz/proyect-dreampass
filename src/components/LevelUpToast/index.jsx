export default function LevelUpToast({ level }) {
  if (!level) return null

  return (
    <div key={`toast-${level}`} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 pointer-events-none">
      <div className="bg-violet-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-toast pointer-events-auto border border-violet-400">
        <span className="text-3xl">⬆</span>
        <div>
          <p className="text-xl font-bold">¡Nivel {level}!</p>
          <p className="text-sm text-violet-200">Has subido de nivel</p>
        </div>
      </div>
    </div>
  )
}
