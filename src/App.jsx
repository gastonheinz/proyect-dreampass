import { useState, useEffect, useRef } from 'react';

function App() {
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('tasks')) || []);
  const [recurringTasks, setRecurringTasks] = useState(JSON.parse(localStorage.getItem('recurringTasks')) || []);
  const [rewards, setRewards] = useState(JSON.parse(localStorage.getItem('rewards')) || []);
  const [claimedRewards, setClaimedRewards] = useState(JSON.parse(localStorage.getItem('claimedRewards')) || []);
  const [totalXp, setTotalXp] = useState(parseInt(localStorage.getItem('totalXp')) || 0);
  const [displayedXp, setDisplayedXp] = useState(parseInt(localStorage.getItem('totalXp')) || 0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [passOffset, setPassOffset] = useState(0);

  // Configuraciones XP
  const [miniXp, setMiniXp] = useState(parseInt(localStorage.getItem('miniXp')) || 10);
  const [blockXp, setBlockXp] = useState(parseInt(localStorage.getItem('blockXp')) || 50);

  // Estados para formulario de tareas
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('Mini');
  const [taskCustomXp, setTaskCustomXp] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]); // Mon-Sun

  // Estados para tareas rápidas completadas hoy (Mini/Bloque)
  const [completedMinis, setCompletedMinis] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerXpDisplay, setRegisterXpDisplay] = useState(0);
  const [showXpResult, setShowXpResult] = useState(false);
  const [animPhase, setAnimPhase] = useState('idle'); // 'left' | 'right' | 'total' | 'idle'
  const [animLeftValue, setAnimLeftValue] = useState(0);
  const [animRightValue, setAnimRightValue] = useState(0);
  const lastXpAddedRef = useRef(0);
  const leftRef = useRef(0);
  const rightRef = useRef(0);

  // Animación nivel
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [levelUpToast, setLevelUpToast] = useState(null);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const pendingLevelsRef = useRef([]);
  const prevLevelRef = useRef(Math.floor((parseInt(localStorage.getItem('totalXp')) || 0) / 100) + 1);
  const claimOrderRef = useRef(0);
  const rewardsRef = useRef(rewards);
  rewardsRef.current = rewards;

  const levelsPerPage = 7;

  const getLevelInfo = (xp) => {
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;
    const nextLevelXp = 100;
    return { level, currentLevelXp, nextLevelXp };
  };

  const { level, currentLevelXp, nextLevelXp } = getLevelInfo(displayedXp);
  const { level: realLevel, currentLevelXp: realCurrentLevelXp } = getLevelInfo(totalXp);
  
  // Buscar la próxima recompensa (que aún no hemos alcanzado)
  const nextReward = [...rewards]
    .sort((a, b) => a.requiredLevel - b.requiredLevel)
    .find(r => r.requiredLevel > realLevel);

  const xpFaltante = nextReward ? (nextReward.requiredLevel - realLevel) * 100 - realCurrentLevelXp : 0;
  const xpARecibir = ((completedBlocks > 0 ? 1 : 0) + completedMinis * 5) * ((completedMinis > 0 ? 1 : 0) + completedBlocks);
  const alcanzaRecompensa = !isRegistering && !showXpResult && xpARecibir >= xpFaltante && xpFaltante > 0;

  const generateDailyTasks = () => {
    const dayOfWeek = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
    const dailyTasks = recurringTasks
        .filter(t => t.days[dayOfWeek])
        .map(t => ({ id: Date.now() + Math.random(), name: t.name, xp: t.xp, status: 'pending', type: t.type }));
    
    setTasks(prev => [...prev.filter(t => t.status === 'pending'), ...dailyTasks]);
  };

  useEffect(() => {
    // Generación automática de tareas diarias
    const lastGenerated = localStorage.getItem('lastGeneratedDate');
    const today = new Date().toDateString();
    
    if (lastGenerated !== today) {
        generateDailyTasks();
        localStorage.setItem('lastGeneratedDate', today);
    }
  }, []);

  // Animación suave de XP hacia el valor real
  useEffect(() => {
    if (displayedXp === totalXp) return;
    const diff = totalXp - displayedXp;
    const absDiff = Math.abs(diff);
    const divisor = absDiff > 300 ? 120 : 60;
    const step = Math.max(1, Math.ceil(absDiff / divisor));
    const direction = diff > 0 ? 1 : -1;
    const timer = setTimeout(() => {
      setDisplayedXp(prev => {
        const next = prev + (direction * step);
        if (direction === 1 && next >= totalXp) return totalXp;
        if (direction === -1 && next <= totalXp) return totalXp;
        return next;
      });
    }, 30);
    return () => clearTimeout(timer);
  }, [displayedXp, totalXp]);

  // Detectar subidas de nivel y mostrar toast/popup
  useEffect(() => {
    if (level > prevLevelRef.current) {
      for (let lv = prevLevelRef.current + 1; lv <= level; lv++) {
        pendingLevelsRef.current.push(lv);
      }
      prevLevelRef.current = level;
    }
    if (!showLevelUp && !levelUpToast && pendingLevelsRef.current.length > 0) {
      const nextLevel = pendingLevelsRef.current.shift();
      const unlocked = rewardsRef.current.filter(r => r.requiredLevel === nextLevel);
      if (unlocked.length > 0) {
        setShowLevelUp({ level: nextLevel, rewards: unlocked });
      } else {
        setLevelUpToast(nextLevel);
      }
    }
  }, [level, showLevelUp, levelUpToast]);

  // Auto-dismiss toast/popup después de un tiempo
  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(null), 7000);
      return () => clearTimeout(timer);
    }
    if (levelUpToast) {
      const timer = setTimeout(() => setLevelUpToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp, levelUpToast]);

  // Persistir datos en localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
    localStorage.setItem('rewards', JSON.stringify(rewards));
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
    localStorage.setItem('totalXp', totalXp.toString());
    localStorage.setItem('miniXp', miniXp.toString());
    localStorage.setItem('blockXp', blockXp.toString());
  }, [tasks, recurringTasks, rewards, claimedRewards, totalXp, miniXp, blockXp]);

  const addTask = () => {
    if (!taskName) return;
    let xp = 0;
    if (taskType === 'Mini') xp = miniXp;
    else if (taskType === 'Bloque') xp = blockXp;
    else xp = parseInt(taskCustomXp) || 0;
    
    const newTask = { id: Date.now(), name: taskName, xp, status: 'pending', type: taskType };

    if (isRecurring) {
        setRecurringTasks([...recurringTasks, { ...newTask, days: selectedDays }]);
    } else {
        setTasks([...tasks, newTask]);
    }
    setTaskName('');
    setTaskCustomXp('');
  };

  const addReward = async (name, requiredLevel, fileInput) => {
    if (!name || !requiredLevel) return;
    
    let imageUrl = '';
    if (fileInput && fileInput.files.length > 0) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]);
        reader.onload = () => resolve(reader.result);
      });
    }
    
    setRewards([...rewards, { id: Date.now(), name, requiredLevel: parseInt(requiredLevel), imageUrl }]);
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTotalXp(totalXp + task.xp);
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const registerCompletedTasks = () => {
    const left = (completedBlocks > 0 ? 1 : 0) + completedMinis * 5;
    const right = (completedMinis > 0 ? 1 : 0) + completedBlocks;
    const total = left * right;
    if (total > 0) {
      registerTargetRef.current = total;
      leftRef.current = left;
      rightRef.current = right;
      setAnimPhase('left');
      setAnimLeftValue(0);
      setAnimRightValue(0);
      setRegisterXpDisplay(0);
      setIsRegistering(true);
    }
  };

  const registerTargetRef = useRef(0);

  useEffect(() => {
    if (!isRegistering) return;

    if (animPhase === 'left') {
      if (animLeftValue < leftRef.current) {
        const step = Math.max(1, Math.ceil(leftRef.current / 20));
        const timer = setTimeout(() => {
          setAnimLeftValue(prev => Math.min(prev + step, leftRef.current));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setAnimPhase('right'), 300);
        return () => clearTimeout(timer);
      }
    } else if (animPhase === 'right') {
      if (animRightValue < rightRef.current) {
        const step = Math.max(1, Math.ceil(rightRef.current / 20));
        const timer = setTimeout(() => {
          setAnimRightValue(prev => Math.min(prev + step, rightRef.current));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setAnimPhase('total'), 300);
        return () => clearTimeout(timer);
      }
    } else if (animPhase === 'total') {
      const target = registerTargetRef.current;
      if (registerXpDisplay < target) {
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setTimeout(() => {
          setRegisterXpDisplay(prev => {
            const next = prev + step;
            if (next >= target) return target;
            return next;
          });
        }, 25);
        return () => clearTimeout(timer);
      } else {
        lastXpAddedRef.current = target;
        setShowXpResult(true);
        setTotalXp(prev => prev + target);
        setIsRegistering(false);
      }
    }
  }, [isRegistering, animPhase, animLeftValue, animRightValue, registerXpDisplay]);

  useEffect(() => {
    if (showXpResult && displayedXp === totalXp) {
      const timer = setTimeout(() => {
        setShowXpResult(false);
        setRegisterXpDisplay(0);
        setCompletedMinis(0);
        setCompletedBlocks(0);
        setAnimPhase('idle');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [showXpResult, displayedXp, totalXp]);

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };
  
  const deleteRecurringTask = (taskId) => {
      setRecurringTasks(recurringTasks.filter(t => t.id !== taskId));
  };
  
  const updateRecurringTaskDays = (taskId, dayIdx) => {
      setRecurringTasks(recurringTasks.map(t => {
          if (t.id === taskId) {
              const newDays = [...t.days];
              newDays[dayIdx] = !newDays[dayIdx];
              return { ...t, days: newDays };
          }
          return t;
      }));
  };

  const makeTaskRecurring = (task) => {
      setRecurringTasks([...recurringTasks, { ...task, days: [true, true, true, true, true, true, true] }]);
      setTasks(tasks.filter(t => t.id !== task.id));
  };

  const deleteReward = (rewardId) => {
    setRewards(rewards.filter(r => r.id !== rewardId));
  };

  const claimReward = (reward) => {
    if (!claimedRewards.find(cr => cr.id === reward.id)) {
      claimOrderRef.current += 1;
      setClaimedRewards([...claimedRewards, { ...reward, claimedAt: claimOrderRef.current }]);
    }
  };

  const visibleLevels = Array.from({ length: levelsPerPage }, (_, i) => passOffset + i + 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Animación Nivel Up */}
      {showLevelUp && (
        <div key="levelup-popup" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-popup p-4">
          <div className="bg-white p-10 rounded-3xl text-center shadow-2xl max-w-lg w-full relative">
            <button 
              onClick={() => setShowLevelUp(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-lg font-bold"
            >
              ✕
            </button>
            <h2 className="text-5xl font-black text-indigo-600 mb-2">¡Nivel {showLevelUp.level}!</h2>
            <p className="text-xl text-slate-600 mb-6">¡Has subido de nivel!</p>
            
            {showLevelUp.rewards.length > 0 && (
                <div className='bg-indigo-50 p-4 rounded-xl'>
                    <h3 className='font-bold text-indigo-900 mb-3'>¡Nuevas recompensas disponibles!</h3>
                    <p className='text-sm text-indigo-600 mb-3'>Reclámalas desde tu inventario.</p>
                    <div className='flex flex-wrap justify-center gap-3'>
                        {showLevelUp.rewards.map(r => (
                            <div key={r.id} className='flex flex-col items-center gap-1'>
                                {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-16 h-16 object-cover rounded-full border-2 border-indigo-200" />}
                                <span className='text-sm font-semibold'>{r.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute w-4 h-4 bg-yellow-400 animate-confetti" style={{left: `${Math.random()*100}vw`, animationDelay: `${Math.random()*2}s`}}></div>
          ))}
        </div>
      )}

      {levelUpToast && (
        <div key={`toast-${levelUpToast}`} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 pointer-events-none">
          <div className="bg-indigo-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-toast pointer-events-auto border border-indigo-400">
            <span className="text-3xl">⬆</span>
            <div>
              <p className="text-xl font-bold">¡Nivel {levelUpToast}!</p>
              <p className="text-sm text-indigo-200">Has subido de nivel</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Battle Pass Pro</h1>
          <p className="text-slate-600">Completa tareas, obtén XP, sube de nivel y gana recompensas.</p>
        </header>

        <nav className="mb-8 bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm gap-1">
          <button 
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600'}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600'}`} 
            onClick={() => setActiveTab('admin')}
          >
            Administrar
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600'}`} 
            onClick={() => setActiveTab('config')}
          >
            Configuración
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 relative ${activeTab === 'inventario' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600'}`} 
            onClick={() => setActiveTab('inventario')}
          >
            Inventario
            {(() => {
              const count = rewards.filter(r => r.requiredLevel <= level && !claimedRewards.find(cr => cr.id === r.id)).length;
              if (count === 0) return null;
              return <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{count}</span>;
            })()}
          </button>
        </nav>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Progreso Nivel Actual ({level})</h2>
                <span className="text-3xl font-black text-indigo-600">{currentLevelXp} <span className="text-lg font-medium text-slate-500">/ {nextLevelXp} XP</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden border border-slate-200">
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${(currentLevelXp / nextLevelXp) * 100}%` }}
                ></div>
              </div>
              {nextReward && (() => {
                return (
                <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${alcanzaRecompensa ? 'bg-emerald-50 border-emerald-300 animate-reward-glow' : 'bg-indigo-50 border-indigo-100'}`}>
                    {nextReward.imageUrl && <img src={nextReward.imageUrl} alt={nextReward.name} className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200" />}
                    <div className="flex-1">
                        <span className={`text-xs font-semibold ${alcanzaRecompensa ? 'text-emerald-700' : 'text-indigo-600'}`}>SIGUIENTE RECOMPENSA</span>
                        <p className='text-lg font-bold text-indigo-900'>{nextReward.name}</p>
                        <p className='text-sm text-indigo-600'>Nivel {nextReward.requiredLevel}</p>
                        <p className={`text-sm font-bold mt-1 ${alcanzaRecompensa ? 'text-emerald-700' : 'text-indigo-600'}`}>
                          {alcanzaRecompensa ? '✓ ¡Alcanzas esta recompensa!' : (
                            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                              <span className="text-xs font-semibold text-indigo-700">OBTÉN</span>
                              <span className="text-2xl font-black text-indigo-600">{xpFaltante}</span>
                              <span className="flex items-center gap-1 text-xs font-bold text-indigo-500">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 1L13 7L20 8L15 13L16 20L10 16.5L4 20L5 13L0 8L7 7L10 1Z" />
                                </svg>
                                XP
                              </span>
                            </div>
                          )}
                        </p>
                    </div>
                </div>
                );
              })()}
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Progreso del Pase</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setPassOffset(Math.max(0, passOffset - levelsPerPage))} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 text-slate-600">◀</button>
                    <button onClick={() => setPassOffset(Math.min(93, passOffset + levelsPerPage))} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 text-slate-600">▶</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {visibleLevels.map(lv => {
                    const levelRewards = rewards.filter(r => r.requiredLevel === lv);
                    return (
                      <div key={lv}
                        onMouseEnter={() => setHoveredLevel(lv)}
                        onMouseLeave={() => setHoveredLevel(null)}
                        className={`relative p-3 border-2 rounded-lg flex flex-col items-center justify-between min-h-[120px] transition-transform hover:scale-105 cursor-pointer ${level >= lv ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                        <span className={`text-xs font-bold mb-2 ${level >= lv ? 'text-indigo-100' : 'text-slate-500'}`}>Lv.{lv}</span>
                        <div className="flex-grow flex flex-col justify-center gap-1 w-full">
                          {levelRewards.map(r => {
                            const isClaimed = claimedRewards.find(cr => cr.id === r.id);
                            return (
                              <div key={r.id}
                                className={`flex flex-col items-center text-center p-1 rounded transition-all ${level >= lv ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-8 h-8 object-cover rounded mb-1" />}
                                <span className="text-[10px] break-words w-full">{r.name}</span>
                                {isClaimed && <span className="text-[9px] font-bold text-emerald-400">✓</span>}
                              </div>
                            );
                          })}
                        </div>
                        {level === lv && <div className="absolute -bottom-2 w-4 h-4 bg-indigo-600 rotate-45 rounded-sm"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hoveredLevel && (() => {
                const r = rewards.find(r => r.requiredLevel === hoveredLevel);
                if (!r) return null;
                return (
                <div className="absolute left-full top-0 ml-3 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-5 flex flex-col items-center text-center gap-3 z-50">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.name} className="w-32 h-32 object-cover rounded-xl border-2 border-indigo-200" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-indigo-200 flex items-center justify-center text-slate-400 text-4xl">?</div>
                  )}
                  <span className="font-bold text-slate-900 text-lg">{r.name}</span>
                  <span className="text-sm text-slate-500">Nivel {r.requiredLevel}</span>
                  {claimedRewards.find(cr => cr.id === r.id) && (
                    <span className="text-xs text-emerald-600 font-bold">✓ Reclamada</span>
                  )}
                </div>
                );
              })()}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Registrar tareas realizadas hoy</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  {(isRegistering || showXpResult) && <span className="text-2xl font-black text-sky-600 whitespace-nowrap">{completedBlocks > 0 ? '1 +' : '0 +'}</span>}
                  <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 bg-sky-100 ${alcanzaRecompensa ? 'animate-fire-blue border-sky-300' : 'border-sky-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-sky-800">Tareas Mini:</label>
                      <span className="text-xs font-bold text-sky-600 bg-sky-200 px-2 py-0.5 rounded">×5</span>
                    </div>
                    <input 
                      type="number" 
                      min="0" 
                      value={completedMinis} 
                      onChange={(e) => setCompletedMinis(Math.max(0, parseInt(e.target.value) || 0))} 
                      className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
                    />
                  </div>
                  <span className="text-2xl font-black text-slate-400">×</span>
                  {(isRegistering || showXpResult) && <span className="text-2xl font-black text-red-600 whitespace-nowrap">{completedMinis > 0 ? '1 +' : '0 +'}</span>}
                  <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 bg-red-100 ${alcanzaRecompensa ? 'animate-fire-red border-red-300' : 'border-red-200'}`}>
                    <label className="block text-sm font-medium mb-1 text-red-800">Tareas Bloque:</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={completedBlocks} 
                      onChange={(e) => setCompletedBlocks(Math.max(0, parseInt(e.target.value) || 0))} 
                      className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  {isRegistering || showXpResult ? (
                    <div className="flex flex-col items-center gap-1">
                      {animPhase === 'left' && (
                        <div className="text-center">
                          <div className="text-lg font-black text-indigo-600">
                            ({completedBlocks > 0 ? '1' : '0'} + <span className="text-sky-600">{animLeftValue}</span>) × ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                          </div>
                          <div className="text-lg font-black text-indigo-600 mt-1">
                            (<span className="text-sky-600">{(completedBlocks > 0 ? 1 : 0) + animLeftValue}</span>)
                          </div>
                          <div className="text-xs text-indigo-400 mt-1">Calculando multiplicando Mini...</div>
                        </div>
                      )}
                      {animPhase === 'right' && (
                        <div className="text-center">
                          <div className="text-lg font-black text-indigo-600">
                            <span>({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})</span>
                            <span className="mx-2">×</span>
                            <span>({completedMinis > 0 ? '1' : '0'} + <span className="text-red-600">{animRightValue}</span>)</span>
                          </div>
                          <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                            <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                            <span>×</span>
                            <span>(<span className="text-red-600">{(completedMinis > 0 ? 1 : 0) + animRightValue}</span>)</span>
                          </div>
                          <div className="text-xs text-indigo-400 mt-1">Calculando multiplicando Bloque...</div>
                        </div>
                      )}
                      {animPhase === 'total' && !showXpResult && (
                        <div className="text-center">
                          <div className="text-lg font-black text-indigo-600">
                            ({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})
                            <span className="mx-2">×</span>
                            ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                          </div>
                          <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                            <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                            <span>×</span>
                            <span>({(completedMinis > 0 ? 1 : 0) + completedBlocks})</span>
                            <span>=</span>
                            <span className="text-indigo-700">+{registerXpDisplay}</span>
                          </div>
                          <div className="text-xs text-indigo-400 mt-1">Calculando XP total...</div>
                        </div>
                      )}
                      {showXpResult && (
                        <div className="text-center">
                          <div className="text-lg font-black text-indigo-600">
                            ({completedBlocks > 0 ? '1' : '0'} + {completedMinis * 5})
                            <span className="mx-2">×</span>
                            ({completedMinis > 0 ? '1' : '0'} + {completedBlocks})
                          </div>
                          <div className="text-lg font-black text-indigo-600 mt-1 flex justify-center gap-3">
                            <span>({(completedBlocks > 0 ? 1 : 0) + completedMinis * 5})</span>
                            <span>×</span>
                            <span>({(completedMinis > 0 ? 1 : 0) + completedBlocks})</span>
                            <span>=</span>
                            <span className="text-emerald-600">+{lastXpAddedRef.current}</span>
                          </div>
                          <div className="text-xs text-emerald-600 font-medium mt-1">¡XP añadida!</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-indigo-900">Total XP a recibir:</span>
                        <span className="block text-2xl font-black text-indigo-600">
                          +{((completedBlocks > 0 ? 1 : 0) + completedMinis * 5) * ((completedMinis > 0 ? 1 : 0) + completedBlocks)}
                        </span>
                      </div>
                      <button 
                        onClick={registerCompletedTasks} 
                        disabled={isRegistering || (((completedBlocks > 0 ? 1 : 0) + completedMinis * 5) * ((completedMinis > 0 ? 1 : 0) + completedBlocks)) === 0}
                        className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                          !isRegistering && (((completedBlocks > 0 ? 1 : 0) + completedMinis * 5) * ((completedMinis > 0 ? 1 : 0) + completedBlocks)) > 0 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                      >
                        Registrar y ganar XP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-bold mb-4 text-slate-950">Tareas</h3>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{task.name} <span className="text-xs text-slate-400">({task.type})</span></h4>
                      <p className="text-sm text-indigo-600 font-medium">{task.xp} XP</p>
                    </div>
                    <button onClick={() => completeTask(task.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95">Completar</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : activeTab === 'admin' ? (
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Añadir nueva tarea</h3>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Nombre Tarea" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="border rounded-lg p-2.5" />
                  <div className='flex gap-2'>
                    <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="border rounded-lg p-2.5 flex-grow">
                      <option>Mini</option>
                      <option>Bloque</option>
                      <option>Personalizada</option>
                    </select>
                    {taskType === 'Personalizada' && (
                      <input type="number" placeholder="XP" value={taskCustomXp} onChange={(e) => setTaskCustomXp(e.target.value)} className="w-24 border rounded-lg p-2.5" />
                    )}
                    <button onClick={addTask} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold">Añadir</button>
                  </div>
                  
                  <div className='flex items-center gap-2'>
                      <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)}/>
                      <label>¿Es recurrente?</label>
                  </div>

                  {isRecurring && (
                      <div className='flex gap-1 text-xs'>
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                              <button key={d} onClick={() => setSelectedDays(prev => prev.map((val, idx) => idx === i ? !val : val))} className={`p-2 rounded ${selectedDays[i] ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
                                  {d}
                              </button>
                          ))}
                      </div>
                  )}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Añadir nueva recompensa</h3>
                <div className="flex flex-col gap-2">
                  <input id="rewardName" type="text" placeholder="Nombre Recompensa" className="border rounded-lg p-2.5" />
                  <div className='flex gap-2'>
                    <input id="rewardLevel" type="number" placeholder="Nivel" className="w-24 border rounded-lg p-2.5" />
                    <input id="rewardImageFile" type="file" accept="image/*" className="flex-grow border rounded-lg p-2.5" />
                  </div>
                  <button onClick={() => {
                    const name = document.getElementById('rewardName').value;
                    const level = document.getElementById('rewardLevel').value;
                    const fileInput = document.getElementById('rewardImageFile');
                    addReward(name, level, fileInput);
                    document.getElementById('rewardName').value = '';
                    document.getElementById('rewardLevel').value = '';
                    fileInput.value = '';
                  }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold">Añadir Recompensa</button>
                </div>
              </div>
          </div>
        ) : activeTab === 'inventario' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Recompensas reclamadas</h3>
              {claimedRewards.length === 0 ? (
                <p className="text-slate-500">Aún no has reclamado ninguna recompensa.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claimedRewards.sort((a, b) => b.claimedAt - a.claimedAt).map(r => (
                    <div key={r.id + r.claimedAt} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
                      {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-200" />}
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="text-xs text-slate-500">Reclamada - Nivel {r.requiredLevel}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Recompensas obtenidas</h3>
              {(() => {
                const unlocked = rewards.filter(r => r.requiredLevel <= level && !claimedRewards.find(cr => cr.id === r.id));
                if (unlocked.length === 0) return <p className="text-slate-500">No hay recompensas disponibles para reclamar.</p>;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlocked.map(r => (
                      <div key={r.id} className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex flex-col items-center text-center gap-2">
                        {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-300" />}
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-xs text-slate-500">Nivel {r.requiredLevel}</span>
                        <button onClick={() => claimReward(r)} className="mt-1 bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full font-bold hover:bg-indigo-700 transition-all active:scale-95">
                          Reclamar
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Recompensas por conseguir</h3>
              {(() => {
                const upcoming = rewards.filter(r => r.requiredLevel > level && !claimedRewards.find(cr => cr.id === r.id));
                if (upcoming.length === 0) return <p className="text-slate-500">No hay más recompensas por descubrir.</p>;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcoming.map(r => (
                      <div key={r.id} className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col items-center text-center gap-2">
                        {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-20 h-20 object-cover rounded-xl border-2 border-amber-300" />}
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-xs text-slate-500">Nivel {r.requiredLevel}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* Config Tab */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Configuración XP</h3>
                <div className="flex gap-4 mb-6">
                  <div className='flex-1'>
                    <label className='block text-sm font-medium'>XP Mini:</label>
                    <input type="number" value={miniXp} onChange={(e) => setMiniXp(parseInt(e.target.value) || 0)} className='w-full border rounded-lg p-2.5'/>
                  </div>
                  <div className='flex-1'>
                    <label className='block text-sm font-medium'>XP Bloque:</label>
                    <input type="number" value={blockXp} onChange={(e) => setBlockXp(parseInt(e.target.value) || 0)} className='w-full border rounded-lg p-2.5'/>
                  </div>
                </div>
                <div className='flex gap-2'>
                    <button onClick={() => { setTotalXp(0); setDisplayedXp(0); setPassOffset(0); setTasks([]); setClaimedRewards([]); }} className="bg-red-600 text-white p-3 rounded-lg flex-grow font-bold">Reiniciar Nivel a 1</button>
                    <button onClick={generateDailyTasks} className="bg-emerald-600 text-white p-3 rounded-lg flex-grow font-bold">Añadir tareas hoy</button>
                </div>
            </div>
              
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-lg mb-4">Recompensas existentes:</h4>
                <div className="space-y-2 mb-6">
                  {rewards.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                      <div className='flex items-center gap-3'>
                        {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-10 h-10 object-cover rounded" />}
                        <span className="text-sm font-medium">{r.name} <span className="text-slate-500">(Nivel {r.requiredLevel})</span></span>
                      </div>
                      <button onClick={() => deleteReward(r.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Eliminar</button>
                    </div>
                  ))}
                </div>

                <h4 className="font-bold text-lg mb-4">Tareas:</h4>
                <div className="space-y-2">
                  {[...tasks, ...recurringTasks.map(t => ({...t, isRecurring: true}))].map(r => (
                    <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                      <div className='flex flex-col gap-1'>
                        <span className="text-sm font-medium">{r.name} <span className="text-slate-500">({r.type})</span></span>
                        {r.isRecurring && (
                            <div className='flex gap-1 text-[10px]'>
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                                    <button key={d} onClick={() => updateRecurringTaskDays(r.id, i)} className={`p-1 rounded ${r.days[i] ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        {!r.isRecurring && <button onClick={() => makeTaskRecurring(r)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Hacer Recurrente</button>}
                        <button onClick={() => r.isRecurring ? deleteRecurringTask(r.id) : deleteTask(r.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
