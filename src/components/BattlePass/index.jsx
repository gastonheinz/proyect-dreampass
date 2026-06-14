import LevelProgress from '../Dashboard/LevelProgress'
import BattlePassGrid from '../Dashboard/BattlePassGrid'

export default function BattlePass({ game, displayedXp, regAnim }) {
  const { level, nextLevelXp, totalXp } = game

  return (
    <div className="space-y-8">
      <BattlePassGrid
        level={level}
        rewards={game.rewards}
        claimedRewards={game.claimedRewards}
      />
      <LevelProgress
        displayedXp={displayedXp}
        nextLevelXp={nextLevelXp}
        totalXp={totalXp}
        rewards={game.rewards}
        isRegistering={regAnim.isRegistering}
        showXpResult={regAnim.showXpResult}
        xpARecibir={0}
      />
    </div>
  )
}
