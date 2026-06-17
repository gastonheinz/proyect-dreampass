import { useState } from 'react'
import LevelProgress from './LevelProgress'
import TaskRegistration from './TaskRegistration'
import TaskList from './TaskList'

export default function Dashboard({ game, displayedXp, regAnim }) {
  const [completedMinis, setCompletedMinis] = useState(0)
  const [completedMedias, setCompletedMedias] = useState(0)
  const [completedBlocks, setCompletedBlocks] = useState(0)

  const { nextLevelXp, totalXp, rewards, tasks, completeTask, xpMode, miniXp, mediaXp, blockXp } = game

  const xpARecibir = xpMode === 'classic'
    ? (completedMinis * miniXp) + (completedMedias * mediaXp) + (completedBlocks * blockXp)
    : (1 + completedMinis * 5) * (1 + completedMedias * 5) * (1 + completedBlocks * 5)

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10">
        <LevelProgress
          displayedXp={displayedXp}
          nextLevelXp={nextLevelXp}
          totalXp={totalXp}
          rewards={rewards}
          isRegistering={regAnim.isRegistering}
          showXpResult={regAnim.showXpResult}
          xpARecibir={xpARecibir}
        />
      </div>
      <TaskRegistration
        regAnim={regAnim}
        displayedXp={displayedXp}
        totalXp={totalXp}
        completedMinis={completedMinis}
        setCompletedMinis={setCompletedMinis}
        completedMedias={completedMedias}
        setCompletedMedias={setCompletedMedias}
        completedBlocks={completedBlocks}
        setCompletedBlocks={setCompletedBlocks}
        xpMode={xpMode}
        miniXp={miniXp}
        mediaXp={mediaXp}
        blockXp={blockXp}
      />
      <TaskList tasks={tasks} onComplete={completeTask} />
    </div>
  )
}
