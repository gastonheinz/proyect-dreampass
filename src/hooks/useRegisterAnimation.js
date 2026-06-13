import { useState, useEffect, useRef, useCallback } from 'react'

export default function useRegisterAnimation(addXp, xpMode = 'current', miniXp = 10, blockXp = 100) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerXpDisplay, setRegisterXpDisplay] = useState(0)
  const [showXpResult, setShowXpResult] = useState(false)
  const [animPhase, setAnimPhase] = useState('idle')
  const [animLeftValue, setAnimLeftValue] = useState(0)
  const [animRightValue, setAnimRightValue] = useState(0)

  const lastXpAddedRef = useRef(0)
  const addXpRef = useRef(addXp)
  const leftRef = useRef(0)
  const rightRef = useRef(0)
  const targetRef = useRef(0)

  useEffect(() => {
    addXpRef.current = addXp
  })

  const startRegister = useCallback((completedMinis, completedBlocks) => {
    const left = xpMode === 'classic'
      ? completedMinis * miniXp
      : 1 + completedMinis * 5
    const right = xpMode === 'classic'
      ? completedBlocks * blockXp
      : 1 + completedBlocks * 5
    const total = xpMode === 'classic' ? left + right : left * right
    if (total <= 0) return null
    targetRef.current = total
    leftRef.current = left
    rightRef.current = right
    setAnimPhase('left')
    setAnimLeftValue(0)
    setAnimRightValue(0)
    setRegisterXpDisplay(0)
    setIsRegistering(true)
    setShowXpResult(false)
    return total
  }, [xpMode, miniXp, blockXp])

  useEffect(() => {
    if (!isRegistering) return
    if (animPhase === 'left') {
      if (animLeftValue < leftRef.current) {
        const step = Math.max(1, Math.ceil(leftRef.current / 20))
        const timer = setTimeout(() => {
          setAnimLeftValue(prev => Math.min(prev + step, leftRef.current))
        }, 50)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setAnimPhase('right'), 300)
        return () => clearTimeout(timer)
      }
    } else if (animPhase === 'right') {
      if (animRightValue < rightRef.current) {
        const step = Math.max(1, Math.ceil(rightRef.current / 20))
        const timer = setTimeout(() => {
          setAnimRightValue(prev => Math.min(prev + step, rightRef.current))
        }, 50)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setAnimPhase('total'), 300)
        return () => clearTimeout(timer)
      }
    } else if (animPhase === 'total') {
      const target = targetRef.current
      if (registerXpDisplay < target) {
        const step = Math.max(1, Math.ceil(target / 40))
        const timer = setTimeout(() => {
          setRegisterXpDisplay(prev => {
            const next = prev + step
            return next >= target ? target : next
          })
        }, 25)
        return () => clearTimeout(timer)
      } else {
        lastXpAddedRef.current = target
        addXpRef.current(target)
        setShowXpResult(true)
        setIsRegistering(false)
      }
    }
  }, [isRegistering, animPhase, animLeftValue, animRightValue, registerXpDisplay])

  const resetResult = useCallback(() => {
    setShowXpResult(false)
    setRegisterXpDisplay(0)
    setAnimPhase('idle')
  }, [])

  return {
    isRegistering, showXpResult, animPhase,
    animLeftValue, animRightValue, registerXpDisplay,
    lastXpAddedRef, startRegister, resetResult,
  }
}
