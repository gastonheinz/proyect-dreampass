import { useState, useEffect, useRef, useCallback } from 'react'

export default function useRegisterAnimation(addXp, xpMode = 'current', miniXp = 10, mediaXp = 50, blockXp = 100) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerXpDisplay, setRegisterXpDisplay] = useState(0)
  const [showXpResult, setShowXpResult] = useState(false)
  const [animPhase, setAnimPhase] = useState('idle')
  const [animLeftValue, setAnimLeftValue] = useState(0)
  const [animMiddleValue, setAnimMiddleValue] = useState(0)
  const [animRightValue, setAnimRightValue] = useState(0)

  const lastXpAddedRef = useRef(0)
  const addXpRef = useRef(addXp)
  const leftRef = useRef(0)
  const middleRef = useRef(0)
  const rightRef = useRef(0)
  const targetRef = useRef(0)

  useEffect(() => {
    addXpRef.current = addXp
  })

  const startRegister = useCallback((completedMinis, completedMedias, completedBlocks) => {
    if (completedMinis === 0 && completedMedias === 0 && completedBlocks === 0) return null
    const left = xpMode === 'classic'
      ? completedMinis * miniXp
      : 1 + completedMinis * 5
    const middle = xpMode === 'classic'
      ? completedMedias * mediaXp
      : 1 + completedMedias * 5
    const right = xpMode === 'classic'
      ? completedBlocks * blockXp
      : 1 + completedBlocks * 5
    const total = xpMode === 'classic' ? left + middle + right : left * middle * right
    if (total <= 0) return null
    targetRef.current = total
    leftRef.current = left
    middleRef.current = middle
    rightRef.current = right
    setAnimPhase('left')
    setAnimLeftValue(0)
    setAnimMiddleValue(0)
    setAnimRightValue(0)
    setRegisterXpDisplay(0)
    setIsRegistering(true)
    setShowXpResult(false)
    return total
  }, [xpMode, miniXp, mediaXp, blockXp])

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
        const timer = setTimeout(() => setAnimPhase('middle'), 300)
        return () => clearTimeout(timer)
      }
    } else if (animPhase === 'middle') {
      if (animMiddleValue < middleRef.current) {
        const step = Math.max(1, Math.ceil(middleRef.current / 20))
        const timer = setTimeout(() => {
          setAnimMiddleValue(prev => Math.min(prev + step, middleRef.current))
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
  }, [isRegistering, animPhase, animLeftValue, animMiddleValue, animRightValue, registerXpDisplay])

  const resetResult = useCallback(() => {
    setShowXpResult(false)
    setRegisterXpDisplay(0)
    setAnimPhase('idle')
  }, [])

  return {
    isRegistering, showXpResult, animPhase,
    animLeftValue, animMiddleValue, animRightValue, registerXpDisplay,
    lastXpAddedRef, startRegister, resetResult,
  }
}