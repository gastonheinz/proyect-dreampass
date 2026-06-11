import { useState, useEffect, useRef } from 'react';

function App() {
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('tasks')) || []);
  const [recurringTasks, setRecurringTasks] = useState(JSON.parse(localStorage.getItem('recurringTasks')) || []);
  const [rewards, setRewards] = useState(JSON.parse(localStorage.getItem('rewards')) || []);
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

  // Animación nivel
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const prevLevelRef = useRef(Math.floor((parseInt(localStorage.getItem('totalXp')) || 0) / 100) + 1);

  const levelsPerPage = 7;

  const getLevelInfo = (xp) => {
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;
    const nextLevelXp = 100;
    return { level, currentLevelXp, nextLevelXp };
  };

  const { level, currentLevelXp, nextLevelXp } = getLevelInfo(displayedXp);
  
  // Buscar la próxima recompensa (que aún no hemos alcanzado)
  const nextReward = [...rewards]
    .sort((a, b) => a.requiredLevel - b.requiredLevel)
    .find(r => r.requiredLevel > level);

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
    const step = Math.max(1, Math.ceil(Math.abs(diff) / 30));
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

  // Detectar subidas de nivel conforme la barra anima
  useEffect(() => {
    if (level > prevLevelRef.current) {
        const levelsGained = [];
        for (let lv = prevLevelRef.current + 1; lv <= level; lv++) {
            levelsGained.push(lv);
        }
        setLevelUpQueue(prev => [...prev, ...levelsGained]);
    }
    prevLevelRef.current = level;
  }, [level]);

  // Persistir datos en localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
    localStorage.setItem('rewards', JSON.stringify(rewards));
    localStorage.setItem('totalXp', totalXp.toString());
    localStorage.setItem('miniXp', miniXp.toString());
    localStorage.setItem('blockXp', blockXp.toString());
  }, [tasks, recurringTasks, rewards, totalXp, miniXp, blockXp]);

  // Procesar cola de subidas de nivel de manera secuencial
  useEffect(() => {
    if (levelUpQueue.length > 0 && !showLevelUp) {
      const nextLevelToAnimate = levelUpQueue[0];
      const unlocked = rewards.filter(r => r.requiredLevel === nextLevelToAnimate);
      
      setShowLevelUp({ level: nextLevelToAnimate, rewards: unlocked });
      
      const timer = setTimeout(() => {
        setShowLevelUp(null);
        setLevelUpQueue(prev => prev.slice(1));
      }, 4000); // 4 segundos de animación por cada subida de nivel
      
      return () => clearTimeout(timer);
    }
  }, [levelUpQueue, showLevelUp, rewards]);

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
    const xpToAdd = (completedMinis * miniXp) + (completedBlocks * blockXp);
    if (xpToAdd > 0) {
      setTotalXp(totalXp + xpToAdd);
      setCompletedMinis(0);
      setCompletedBlocks(0);
    }
  };

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

  const visibleLevels = Array.from({ length: levelsPerPage }, (_, i) => passOffset + i + 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Animación Nivel Up */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-popup p-4">
          <div className="bg-white p-10 rounded-3xl text-center shadow-2xl max-w-lg w-full relative">
            <button 
              onClick={() => { setShowLevelUp(null); setLevelUpQueue(prev => prev.slice(1)); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-lg font-bold"
            >
              ✕
            </button>
            <h2 className="text-5xl font-black text-indigo-600 mb-2">¡Nivel {showLevelUp.level}!</h2>
            <p className="text-xl text-slate-600 mb-6">¡Has subido de nivel!</p>
            
            {showLevelUp.rewards.length > 0 && (
                <div className='bg-indigo-50 p-4 rounded-xl'>
                    <h3 className='font-bold text-indigo-900 mb-3'>¡Nuevas recompensas!</h3>
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
        </nav>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Progreso Nivel Actual ({level})</h2>
                <div className='flex items-center gap-3'>
                    {nextReward && (
                        <div className='flex items-center gap-2 bg-slate-100 p-2 rounded-lg'>
                            {nextReward.imageUrl && <img src={nextReward.imageUrl} alt={nextReward.name} className="w-8 h-8 object-cover rounded" />}
                            <span className='text-xs font-semibold'>Prox: {nextReward.name} (Lv.{nextReward.requiredLevel})</span>
                        </div>
                    )}
                    <span className="text-3xl font-black text-indigo-600">{currentLevelXp} <span className="text-lg font-medium text-slate-500">/ {nextLevelXp} XP</span></span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden border border-slate-200">
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${(currentLevelXp / nextLevelXp) * 100}%` }}
                ></div>
              </div>
            </div>

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
                    <div key={lv} className={`relative p-3 border-2 rounded-lg flex flex-col items-center justify-between min-h-[120px] ${level > lv ? 'bg-indigo-600 border-indigo-700 text-white' : level === lv ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-xs font-bold mb-2 ${level > lv ? 'text-indigo-100' : 'text-slate-500'}`}>Lv.{lv}</span>
                      <div className="flex-grow flex flex-col justify-center gap-1 w-full">
                        {levelRewards.map(r => (
                          <div key={r.id} className={`flex flex-col items-center text-center p-1 rounded ${level > lv ? 'bg-indigo-700 text-white' : level === lv ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                            {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-8 h-8 object-cover rounded mb-1" />}
                            <span className="text-[10px] break-words w-full">{r.name}</span>
                          </div>
                        ))}
                      </div>
                      {level === lv && <div className="absolute -bottom-2 w-4 h-4 bg-indigo-600 rotate-45 rounded-sm"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Registrar tareas realizadas hoy</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Tareas Minis ({miniXp} XP c/u):</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={completedMinis} 
                      onChange={(e) => setCompletedMinis(Math.max(0, parseInt(e.target.value) || 0))} 
                      className="w-full border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Tareas Bloque ({blockXp} XP c/u):</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={completedBlocks} 
                      onChange={(e) => setCompletedBlocks(Math.max(0, parseInt(e.target.value) || 0))} 
                      className="w-full border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center border border-indigo-100">
                  <div>
                    <span className="text-sm font-medium text-indigo-900">Total XP a recibir:</span>
                    <span className="block text-2xl font-black text-indigo-600">+{ (completedMinis * miniXp) + (completedBlocks * blockXp) } XP</span>
                  </div>
                  <button 
                    onClick={registerCompletedTasks} 
                    disabled={((completedMinis * miniXp) + (completedBlocks * blockXp)) === 0}
                    className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      ((completedMinis * miniXp) + (completedBlocks * blockXp)) > 0 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Registrar y ganar XP
                  </button>
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
                    <button onClick={() => { setTotalXp(0); setDisplayedXp(0); setPassOffset(0); setTasks([]); }} className="bg-red-600 text-white p-3 rounded-lg flex-grow font-bold">Reiniciar Nivel a 1</button>
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
