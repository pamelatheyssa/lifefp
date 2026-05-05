import { useState } from 'react'
import { useData } from '../useData.js'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const TASK_COLORS = ['#ffffff','#B2DFDB','#B3E5FC','#FCE4EC','#FFF9C4','#E1BEE7','#FFE0B2','#DCEDC8','#F5F5F5','#E0F7FA']

function currentWeekKey() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

const todayDow = new Date().getDay()

export default function ChoresScreen() {
  const { items: weeks,  add: addWeek,  update: updateWeek,  remove: removeWeek  } = useData('choresWeeks',  'group')
  const { items: tasks,  add: addTask,  update: updateTask,  remove: removeTask  } = useData('choresTasks',  'group')
  const { items: checks, add: addCheck, remove: removeCheck } = useData('choresChecks', 'group')

  const wKey = currentWeekKey()

  // UI state — all modals, no inline editing
  const [showWeekForm,   setShowWeekForm]   = useState(false)
  const [newWeekName,    setNewWeekName]    = useState('')
  const [editWeek,       setEditWeek]       = useState(null) // { id, name }
  const [showTaskModal,  setShowTaskModal]  = useState(false)
  const [taskModalCtx,   setTaskModalCtx]   = useState(null) // { weekId, dayIndex }
  const [editTask,       setEditTask]       = useState(null) // task object
  const [taskText,       setTaskText]       = useState('')
  const [taskColor,      setTaskColor]      = useState('#ffffff')
  const [selWeekView,    setSelWeekView]    = useState(null) // weekId currently expanded

  const isChecked = (taskId) => checks.some(c => c.taskId === taskId && c.weekKey === wKey)

  const toggleCheck = async (taskId) => {
    const ex = checks.find(c => c.taskId === taskId && c.weekKey === wKey)
    if (ex) await removeCheck(ex.id)
    else    await addCheck({ taskId, weekKey: wKey })
  }

  const openAddTask = (weekId, dayIndex) => {
    setEditTask(null); setTaskText(''); setTaskColor('#ffffff')
    setTaskModalCtx({ weekId, dayIndex }); setShowTaskModal(true)
  }

  const openEditTask = (task) => {
    setEditTask(task); setTaskText(task.text); setTaskColor(task.color||'#ffffff')
    setTaskModalCtx({ weekId: task.weekId, dayIndex: task.dayIndex }); setShowTaskModal(true)
  }

  const saveTask = async () => {
    if (!taskText.trim()) return
    if (editTask) {
      await updateTask(editTask.id, { text: taskText.trim(), color: taskColor })
    } else {
      await addTask({ weekId: taskModalCtx.weekId, dayIndex: taskModalCtx.dayIndex, text: taskText.trim(), color: taskColor })
    }
    setShowTaskModal(false); setEditTask(null); setTaskText(''); setTaskColor('#ffffff')
  }

  const saveWeek = async () => {
    if (!newWeekName.trim()) return
    await addWeek({ name: newWeekName.trim(), order: weeks.length })
    setNewWeekName(''); setShowWeekForm(false)
  }

  const saveEditWeek = async () => {
    if (!editWeek?.name?.trim()) return
    await updateWeek(editWeek.id, { name: editWeek.name.trim() })
    setEditWeek(null)
  }

  const dayTasks = (weekId, dayIndex) =>
    tasks.filter(t => t.weekId === weekId && t.dayIndex === dayIndex)

  const weekProgress = (weekId) => {
    const wt = tasks.filter(t => t.weekId === weekId && t.dayIndex >= 0)
    if (!wt.length) return 0
    return Math.round(wt.filter(t => isChecked(t.id)).length / wt.length * 100)
  }

  const sortedWeeks = [...weeks].sort((a,b)=>(a.order||0)-(b.order||0))

  return (
    <div className="screen">
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>setShowWeekForm(v=>!v)} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Nova semana</button>
        {showWeekForm && (
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input type="text" placeholder="Nome da semana (ex: Semana normal)" value={newWeekName}
              onChange={e=>setNewWeekName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveWeek()}
              autoFocus style={{ flex:1 }}/>
            <button onClick={saveWeek} style={{ background:'#534AB7', border:'none', borderRadius:10, padding:'8px 16px', color:'#fff', fontSize:13, cursor:'pointer' }}>Criar</button>
            <button onClick={()=>setShowWeekForm(false)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:10, padding:'8px 12px', color:'#888', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        )}
      </div>

      <div className="screen-scroll">
        {weeks.length === 0 && (
          <div style={{ textAlign:'center', color:'#bbb', padding:'40px 0', fontSize:13 }}>
            Crie uma semana para começar!
          </div>
        )}

        {sortedWeeks.map(week => {
          const pct      = weekProgress(week.id)
          const isOpen   = selWeekView === week.id || selWeekView === null
          const monthTasks = tasks.filter(t => t.weekId === week.id && t.dayIndex === -1)

          return (
            <div key={week.id} style={{ marginBottom:16, border:'0.5px solid #e4e2dc', borderRadius:14, overflow:'hidden' }}>

              {/* Week header */}
              <div style={{ background:'#534AB7', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                {editWeek?.id === week.id ? (
                  <>
                    <input type="text" value={editWeek.name} onChange={e=>setEditWeek({...editWeek,name:e.target.value})}
                      onKeyDown={e=>e.key==='Enter'&&saveEditWeek()} autoFocus
                      style={{ flex:1, fontSize:13, padding:'4px 8px', borderRadius:6 }}/>
                    <button onClick={saveEditWeek} style={{ background:'#fff', border:'none', borderRadius:6, padding:'4px 10px', color:'#534AB7', fontSize:12, cursor:'pointer' }}>✓</button>
                    <button onClick={()=>setEditWeek(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff9', fontSize:16 }}>✕</button>
                  </>
                ) : (
                  <>
                    <span onClick={()=>setSelWeekView(selWeekView===week.id?null:week.id)} style={{ flex:1, fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer' }}>{week.name}</span>
                    <span style={{ fontSize:11, color:'#fff9' }}>{pct}%</span>
                    <button onClick={()=>setEditWeek({id:week.id,name:week.name})} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff9', fontSize:14, padding:'0 4px' }}>✏️</button>
                    <button onClick={()=>{ if(window.confirm('Excluir esta semana?')) removeWeek(week.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ffaaaa', fontSize:18, padding:'0 4px' }}>×</button>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height:4, background:'#f0efe8', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: pct===100?'#639922':'#534AB7', transition:'width .3s' }}/>
              </div>

              {/* Days */}
              <div style={{ padding:'10px 10px 4px' }}>
                {DAYS.map((dayName, di) => {
                  const isToday  = di === todayDow
                  const dTasks   = dayTasks(week.id, di)
                  const doneCnt  = dTasks.filter(t=>isChecked(t.id)).length
                  return (
                    <div key={di} style={{
                      marginBottom:8, borderRadius:10, overflow:'hidden',
                      border: isToday ? '1.5px solid #534AB7' : '1px solid #eee',
                      background: isToday ? '#EEEDFE' : '#fafafa'
                    }}>
                      {/* Day header */}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background: isToday?'#534AB7':'#f5f4f0' }}>
                        <span style={{ fontSize:12, fontWeight:700, color: isToday?'#fff':'#555' }}>{dayName}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {dTasks.length > 0 && (
                            <span style={{ fontSize:10, color: isToday?'#fff9':'#aaa' }}>{doneCnt}/{dTasks.length}</span>
                          )}
                          <button onClick={()=>openAddTask(week.id, di)} style={{
                            background: isToday?'rgba(255,255,255,.25)':'#e4e2dc', border:'none', borderRadius:6,
                            padding:'3px 10px', fontSize:12, color: isToday?'#fff':'#666', cursor:'pointer', fontWeight:600
                          }}>＋</button>
                        </div>
                      </div>

                      {/* Tasks list */}
                      {dTasks.length > 0 && (
                        <div style={{ padding:'6px 8px', display:'flex', flexDirection:'column', gap:5 }}>
                          {dTasks.map(task => {
                            const checked = isChecked(task.id)
                            return (
                              <div key={task.id} style={{
                                display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                                borderRadius:8, background: task.color||'#fff',
                                border:'0.5px solid rgba(0,0,0,.06)',
                                opacity: checked ? 0.6 : 1
                              }}>
                                <div onClick={()=>toggleCheck(task.id)} style={{
                                  width:20, height:20, borderRadius:5, flexShrink:0, cursor:'pointer',
                                  background: checked?'#534AB7':'#fff',
                                  border:`2px solid ${checked?'#534AB7':'#ccc'}`,
                                  display:'flex', alignItems:'center', justifyContent:'center'
                                }}>
                                  {checked && <span style={{ fontSize:11, color:'#fff', lineHeight:1 }}>✓</span>}
                                </div>
                                <span onClick={()=>toggleCheck(task.id)} style={{
                                  flex:1, fontSize:13, color:'#1a1a18', cursor:'pointer',
                                  textDecoration: checked?'line-through':'none', lineHeight:1.4
                                }}>{task.text}</span>
                                <button onClick={()=>openEditTask(task)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13, padding:'2px 4px', flexShrink:0 }}>✏️</button>
                                <button onClick={()=>removeTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16, padding:'2px 4px', flexShrink:0 }}>×</button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {dTasks.length === 0 && (
                        <div style={{ padding:'8px 10px', fontSize:12, color:'#ccc', fontStyle:'italic' }}>
                          Sem tarefas — toque em ＋ para adicionar
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Monthly tasks section */}
              <div style={{ margin:'0 10px 10px', borderRadius:10, overflow:'hidden', border:'1px solid #FFE0B2' }}>
                <div style={{ background:'#BA7517', padding:'7px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>📅 1x ao mês</span>
                  <button onClick={()=>openAddTask(week.id, -1)} style={{ background:'rgba(255,255,255,.25)', border:'none', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#fff', cursor:'pointer', fontWeight:600 }}>＋</button>
                </div>
                {monthTasks.length > 0 ? (
                  <div style={{ padding:'6px 8px', display:'flex', flexDirection:'column', gap:5, background:'#FFFDE7' }}>
                    {monthTasks.map(task => {
                      const checked = isChecked(task.id)
                      return (
                        <div key={task.id} style={{
                          display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                          borderRadius:8, background: task.color||'#fff',
                          border:'0.5px solid rgba(0,0,0,.06)', opacity: checked?0.6:1
                        }}>
                          <div onClick={()=>toggleCheck(task.id)} style={{
                            width:20, height:20, borderRadius:5, flexShrink:0, cursor:'pointer',
                            background: checked?'#BA7517':'#fff',
                            border:`2px solid ${checked?'#BA7517':'#ccc'}`,
                            display:'flex', alignItems:'center', justifyContent:'center'
                          }}>
                            {checked && <span style={{ fontSize:11, color:'#fff', lineHeight:1 }}>✓</span>}
                          </div>
                          <span onClick={()=>toggleCheck(task.id)} style={{
                            flex:1, fontSize:13, color:'#1a1a18', cursor:'pointer',
                            textDecoration: checked?'line-through':'none'
                          }}>{task.text}</span>
                          <button onClick={()=>openEditTask(task)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13, padding:'2px 4px' }}>✏️</button>
                          <button onClick={()=>removeTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16, padding:'2px 4px' }}>×</button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding:'8px 10px', fontSize:12, color:'#ccc', fontStyle:'italic', background:'#FFFDE7' }}>
                    Sem tarefas mensais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={()=>{ setShowTaskModal(false); setEditTask(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">
              {editTask ? 'Editar tarefa' : taskModalCtx?.dayIndex===-1 ? 'Nova tarefa mensal' : `Nova tarefa — ${DAYS[taskModalCtx?.dayIndex]}`}
            </div>
            <div className="form-group">
              <input type="text" placeholder="Nome da tarefa" value={taskText}
                onChange={e=>setTaskText(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&saveTask()} autoFocus/>
              <div>
                <label className="form-label">Cor</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {TASK_COLORS.map(c=>(
                    <div key={c} onClick={()=>setTaskColor(c)} style={{
                      width:28, height:28, borderRadius:7, background:c, cursor:'pointer',
                      border: taskColor===c?'3px solid #534AB7':'1.5px solid #ddd',
                      boxShadow: taskColor===c?'0 0 0 1px #534AB7':'none'
                    }}/>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowTaskModal(false); setEditTask(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={saveTask}>{editTask?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
