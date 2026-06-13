import { useState } from 'react'

import useGameState from './hooks/useGameState'
import useXpAnimation from './hooks/useXpAnimation'
import useLevelUp from './hooks/useLevelUp'
import useRegisterAnimation from './hooks/useRegisterAnimation'

import Header from './components/Header'
import Navigation from './components/Navigation'
import LevelUpPopup from './components/LevelUpPopup'
import LevelUpToast from './components/LevelUpToast'
import Dashboard from './components/Dashboard'
import Admin from './components/Admin'
import Inventory from './components/Inventory'
import Config from './components/Config'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const game = useGameState()
  const displayedXp = useXpAnimation(game.totalXp)
  const levelUp = useLevelUp(displayedXp, game.rewards)
  const regAnim = useRegisterAnimation(game.addXp, game.xpMode, game.miniXp, game.blockXp)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <LevelUpPopup show={levelUp.showLevelUp} onClose={() => levelUp.setShowLevelUp(null)} />
      <LevelUpToast level={levelUp.levelUpToast} />

      <div className="max-w-4xl mx-auto">
        <Header />
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          level={game.level}
          rewards={game.rewards}
          claimedRewards={game.claimedRewards}
        />

        {activeTab === 'dashboard' && (
          <Dashboard game={game} displayedXp={displayedXp} regAnim={regAnim} />
        )}
        {activeTab === 'admin' && (
          <Admin game={game} />
        )}
        {activeTab === 'inventario' && (
          <Inventory game={game} />
        )}
        {activeTab === 'config' && (
          <Config game={game} />
        )}
      </div>
    </div>
  )
}
