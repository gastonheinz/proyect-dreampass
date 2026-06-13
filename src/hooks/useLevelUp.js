import { useState, useEffect, useRef } from 'react'

export default function useLevelUp(totalXp, rewards) {
  const [showLevelUp, setShowLevelUp] = useState(null)
  const [levelUpToast, setLevelUpToast] = useState(null)
  const pendingLevelsRef = useRef([])
  const prevLevelRef = useRef(Math.floor(totalXp / 100) + 1)

  const level = Math.floor(totalXp / 100) + 1

  useEffect(() => {
    if (level > prevLevelRef.current) {
      for (let lv = prevLevelRef.current + 1; lv <= level; lv++) {
        pendingLevelsRef.current.push(lv)
      }
      prevLevelRef.current = level
    }
    if (!showLevelUp && !levelUpToast && pendingLevelsRef.current.length > 0) {
      const nextLevel = pendingLevelsRef.current.shift()
      const unlocked = rewards.filter(r => r.requiredLevel === nextLevel)
      if (unlocked.length > 0) {
        setShowLevelUp({ level: nextLevel, rewards: unlocked })
      } else {
        setLevelUpToast(nextLevel)
      }
    }
  }, [level, showLevelUp, levelUpToast, rewards])

  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(null), 7000)
      return () => clearTimeout(timer)
    }
    if (levelUpToast) {
      const timer = setTimeout(() => setLevelUpToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [showLevelUp, levelUpToast])

  return { level, showLevelUp, levelUpToast, setShowLevelUp, setLevelUpToast }
}
