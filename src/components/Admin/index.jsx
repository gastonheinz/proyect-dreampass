import AddTaskForm from './AddTaskForm'
import AddRewardForm from './AddRewardForm'

export default function Admin({ game }) {
  return (
    <div className="space-y-6">
      <AddTaskForm onAdd={game.addTask} miniXp={game.miniXp} mediaXp={game.mediaXp} blockXp={game.blockXp} />
      <AddRewardForm onAdd={game.addReward} />
    </div>
  )
}
