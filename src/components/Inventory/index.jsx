import ClaimedRewards from './ClaimedRewards'
import UnlockedRewards from './UnlockedRewards'
import UpcomingRewards from './UpcomingRewards'

export default function Inventory({ game }) {
  return (
    <div className="space-y-6">
      <ClaimedRewards claimedRewards={game.claimedRewards} />
      <UnlockedRewards
        rewards={game.rewards}
        level={game.level}
        claimedRewards={game.claimedRewards}
        onClaim={game.claimReward}
      />
      <UpcomingRewards
        rewards={game.rewards}
        level={game.level}
        claimedRewards={game.claimedRewards}
      />
    </div>
  )
}
