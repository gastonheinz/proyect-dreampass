import AddTaskForm from './AddTaskForm'
import AddRewardForm from './AddRewardForm'

export default function Admin({ game }) {
  return (
    <div className="space-y-6">
      <AddTaskForm onAdd={game.addTask} />
      <AddRewardForm onAdd={game.addReward} />
    </div>
  )
}
