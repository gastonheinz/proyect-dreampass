const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function DaySelector({ days, onToggle }) {
  return (
    <div className="flex gap-1 text-xs">
      {DAYS.map((d, i) => (
        <button
          key={d}
          onClick={() => onToggle(i)}
          className={`p-2 rounded ${days[i] ? 'bg-violet-600 text-white' : 'bg-slate-200'}`}
        >
          {d}
        </button>
      ))}
    </div>
  )
}
