import XpSettings from './XpSettings'
import ExistingItems from './ExistingItems'

export default function Config({ game }) {
  return (
    <div className="space-y-6">
      <XpSettings
        miniXp={game.miniXp}
        setMiniXp={game.setMiniXp}
        blockXp={game.blockXp}
        setBlockXp={game.setBlockXp}
        mediaXp={game.mediaXp}
        setMediaXp={game.setMediaXp}
        xpMode={game.xpMode}
        setXpMode={game.setXpMode}
        onReset={game.resetLevel}
        onGenerateTasks={game.generateDailyTasks}
      />
      <ExistingItems
        rewards={game.rewards}
        onDeleteReward={game.deleteReward}
        tasks={game.tasks}
        recurringTasks={game.recurringTasks}
        onDeleteTask={game.deleteTask}
        onDeleteRecurringTask={game.deleteRecurringTask}
        onUpdateDays={game.updateRecurringTaskDays}
        onMakeRecurring={game.makeTaskRecurring}
        onMakeNonRecurring={game.makeTaskNonRecurring}
      />
    </div>
  )
}
