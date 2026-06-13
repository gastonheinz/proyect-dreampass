import { useState, useEffect } from 'react'

export default function useXpAnimation(totalXp) {
  const [displayedXp, setDisplayedXp] = useState(totalXp)

  useEffect(() => {
    if (displayedXp === totalXp) return
    const diff = totalXp - displayedXp
    const absDiff = Math.abs(diff)
    const divisor = absDiff > 300 ? 120 : 60
    const step = Math.max(1, Math.ceil(absDiff / divisor))
    const direction = diff > 0 ? 1 : -1
    const timer = setTimeout(() => {
      setDisplayedXp(prev => {
        const next = prev + direction * step
        if (direction === 1 && next >= totalXp) return totalXp
        if (direction === -1 && next <= totalXp) return totalXp
        return next
      })
    }, 30)
    return () => clearTimeout(timer)
  }, [displayedXp, totalXp])

  return displayedXp
}
