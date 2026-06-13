export default function Navigation({ activeTab, onTabChange, level, rewards, claimedRewards }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'admin', label: 'Administrar' },
    { key: 'config', label: 'Configuración' },
    {
      key: 'inventario',
      label: 'Inventario',
      badge: (() => {
        const count = rewards.filter(r => r.requiredLevel <= level && !claimedRewards.find(cr => cr.id === r.id)).length
        return count > 0 ? count : null
      })(),
    },
  ]

  return (
    <nav className="mb-8 bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm gap-1">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 relative ${
            activeTab === tab.key
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600'
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {tab.badge != null && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
