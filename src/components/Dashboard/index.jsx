import { useState } from 'react'
import LevelProgress from './LevelProgress'
import BattlePassGrid from './BattlePassGrid'
import TaskRegistration from './TaskRegistration'
import TaskList from './TaskList'

export default function Dashboard({ game, displayedXp, regAnim }) {
  const [completedMinis, setCompletedMinis] = useState(0)
  const [completedBlocks, setCompletedBlocks] = useState(0)

  const { level, currentLevelXp, nextLevelXp, totalXp, nextReward, tasks, completeTask, xpMode, miniXp, blockXp } = game

  const xpARecibir = xpMode === 'classic'
    ? (completedMinis * miniXp) + (completedBlocks * blockXp)
    : (1 + completedMinis * 5) * (1 + completedBlocks * 5)

  return (
    <div className="space-y-8">
      <LevelProgress
        displayedXp={displayedXp}
        level={level}
        currentLevelXp={currentLevelXp}
        nextLevelXp={nextLevelXp}
        nextReward={nextReward}
        totalXp={totalXp}
        isRegistering={regAnim.isRegistering}
        showXpResult={regAnim.showXpResult}
        xpARecibir={xpARecibir}
      />
      <BattlePassGrid
        level={level}
        rewards={game.rewards}
        claimedRewards={game.claimedRewards}
      />
      <TaskRegistration
        regAnim={regAnim}
        displayedXp={displayedXp}
        totalXp={totalXp}
        completedMinis={completedMinis}
        setCompletedMinis={setCompletedMinis}
        completedBlocks={completedBlocks}
        setCompletedBlocks={setCompletedBlocks}
        xpMode={xpMode}
        miniXp={miniXp}
        blockXp={blockXp}
      />
      <TaskList tasks={tasks} onComplete={completeTask} />
    </div>
  )
}
