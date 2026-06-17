export default function Header() {
  return (
    <header className="mb-8 text-center md:text-left">
      <div className="flex items-center gap-3 justify-center md:justify-start">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-300/50">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Dream <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Pass</span>
        </h1>
      </div>
      <p className="text-slate-500 mt-2">Completa tareas, obtén XP, sube de nivel y gana recompensas.</p>
    </header>
  )
}
