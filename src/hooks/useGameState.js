import { useState, useEffect, useCallback, useRef } from 'react'

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    return JSON.parse(stored)
  } catch {
    return fallback
  }
}

function loadInt(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    return parseInt(stored) || fallback
  } catch {
    return fallback
  }
}

export default function useGameState() {
  const [tasks, setTasks] = useState(() => loadJSON('tasks', []))
  const [recurringTasks, setRecurringTasks] = useState(() => loadJSON('recurringTasks', []))
  const [rewards, setRewards] = useState(() => loadJSON('rewards', []))
  const [claimedRewards, setClaimedRewards] = useState(() => loadJSON('claimedRewards', []))
  const [totalXp, setTotalXp] = useState(() => loadInt('totalXp', 0))
  const [miniXp, setMiniXp] = useState(() => loadInt('miniXp', 10))
  const [blockXp, setBlockXp] = useState(() => loadInt('blockXp', 50))

  const recurringTasksRef = useRef(recurringTasks)
  recurringTasksRef.current = recurringTasks

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks)) }, [recurringTasks])
  useEffect(() => { localStorage.setItem('rewards', JSON.stringify(rewards)) }, [rewards])
  useEffect(() => { localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards)) }, [claimedRewards])
  useEffect(() => { localStorage.setItem('totalXp', totalXp.toString()) }, [totalXp])
  useEffect(() => { localStorage.setItem('miniXp', miniXp.toString()) }, [miniXp])
  useEffect(() => { localStorage.setItem('blockXp', blockXp.toString()) }, [blockXp])

  const level = Math.floor(totalXp / 100) + 1
  const currentLevelXp = totalXp % 100
  const nextLevelXp = 100

  const nextReward = [...rewards]
    .sort((a, b) => a.requiredLevel - b.requiredLevel)
    .find(r => r.requiredLevel > level)

  useEffect(() => {
    const lastGenerated = localStorage.getItem('lastGeneratedDate')
    const today = new Date().toDateString()
    if (lastGenerated !== today) {
      const dayOfWeek = (new Date().getDay() + 6) % 7
      const dailyTasks = recurringTasksRef.current
        .filter(t => t.days[dayOfWeek])
        .map(t => ({ id: Date.now() + Math.random(), name: t.name, xp: t.xp, status: 'pending', type: t.type }))
      setTasks(prev => [...prev.filter(t => t.status === 'pending'), ...dailyTasks])
      localStorage.setItem('lastGeneratedDate', today)
    }
  }, [])

  const generateDailyTasks = useCallback(() => {
    const dayOfWeek = (new Date().getDay() + 6) % 7
    const dailyTasks = recurringTasksRef.current
      .filter(t => t.days[dayOfWeek])
      .map(t => ({ id: Date.now() + Math.random(), name: t.name, xp: t.xp, status: 'pending', type: t.type }))
    setTasks(prev => [...prev.filter(t => t.status === 'pending'), ...dailyTasks])
  }, [])

  const addTask = useCallback((name, type, customXp, isRecurring, selectedDays) => {
    if (!name) return
    let xp = 0
    if (type === 'Mini') xp = miniXp
    else if (type === 'Bloque') xp = blockXp
    else xp = parseInt(customXp) || 0
    const newTask = { id: Date.now(), name, xp, status: 'pending', type }
    if (isRecurring) {
      setRecurringTasks(prev => [...prev, { ...newTask, days: selectedDays }])
    } else {
      setTasks(prev => [...prev, newTask])
    }
  }, [miniXp, blockXp])

  const completeTask = useCallback((taskId) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId)
      if (task) {
        setTotalXp(xp => xp + task.xp)
        return prev.filter(t => t.id !== taskId)
      }
      return prev
    })
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const deleteRecurringTask = useCallback((taskId) => {
    setRecurringTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const updateRecurringTaskDays = useCallback((taskId, dayIdx) => {
    setRecurringTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const days = [...t.days]
      days[dayIdx] = !days[dayIdx]
      return { ...t, days }
    }))
  }, [])

  const makeTaskRecurring = useCallback((task) => {
    setRecurringTasks(prev => [...prev, { ...task, days: [true, true, true, true, true, true, true] }])
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }, [])

  const addReward = useCallback(async (name, requiredLevel, fileInput) => {
    if (!name || !requiredLevel) return
    let imageUrl = ''
    if (fileInput?.files.length > 0) {
      imageUrl = await new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsDataURL(fileInput.files[0])
        reader.onload = () => resolve(reader.result)
      })
    }
    setRewards(prev => [...prev, { id: Date.now(), name, requiredLevel: parseInt(requiredLevel), imageUrl }])
  }, [])

  const deleteReward = useCallback((rewardId) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }, [])

  const claimReward = useCallback((reward) => {
    setClaimedRewards(prev => {
      if (prev.find(cr => cr.id === reward.id)) return prev
      const maxOrder = prev.reduce((max, r) => Math.max(max, r.claimedAt || 0), 0)
      return [...prev, { ...reward, claimedAt: maxOrder + 1 }]
    })
  }, [])

  const addXp = useCallback((amount) => {
    setTotalXp(prev => prev + amount)
  }, [])

  const resetLevel = useCallback(() => {
    setTotalXp(0)
    setTasks([])
    setClaimedRewards([])
  }, [])

  return {
    tasks, setTasks,
    recurringTasks,
    rewards, setRewards,
    claimedRewards,
    totalXp, setTotalXp,
    miniXp, setMiniXp,
    blockXp, setBlockXp,
    level, currentLevelXp, nextLevelXp,
    nextReward,
    addTask, completeTask,
    deleteTask, deleteRecurringTask,
    updateRecurringTaskDays, makeTaskRecurring,
    addReward, deleteReward, claimReward,
    addXp, resetLevel, generateDailyTasks,
  }
}
