import { useState } from 'react'
import { useData } from '../useData.js'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const TASK_COLORS = [
  { v:'#ffffff', l:'Branco'   },
  { v:'#B2DFDB', l:'Verde'    },
  { v:'#B3E5FC', l:'Azul'     },
  { v:'#FCE4EC', l:'Rosa'     },
  { v:'#FFF9C4', l:'Amarelo'  },
  { v:'#E1BEE7', l:'Roxo'     },
  { v:'#FFE0B2', l:'Laranja'  },
  { v:'#F5F5F5', l:'Cinza'    },
  { v:'#DCEDC8', l:'Lima'     },
  { v:'#E0F7FA', l:'Ciano'    },
]

const todayDow = new Date().getDay() // 0=Dom ... 6=Sáb

// Returns current week's Sunday as YYYY-MM-DD
function currentWeekKey() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

export default function ChoresScreen() {
  // weeks: { id, name, order }
  const { items: weeks,  add: addWeek,  update: updateWeek,  remove: removeWeek  } = useData('choresWeeks',  'group')
  // tasks: { id, weekId, dayIndex(-1=mensal), text, color }
  const { items: tasks,  add: addTask,  update: updateTask,  remove: removeTask  } = useData('choresTasks',  'group')
  // checks: { id, taskId, weekKey }  — one per task per calendar week
  const { items: checks, add: addCheck, remove: removeCheck } = useData('choresChecks', 'group')

  const [editingWeekId,   setEditingWeekId]   = useState(null)
  const [editingWeekName, setEditingWeekName] = useState('')
  const [newWeekName,     setNewWeekName]     = useState('')
  const [showWeekForm,    setShowWeekForm]    = useState(false)

  // task editing
  const [editTaskId,    setEditTaskId]    = useState(null)
  const [editTaskText,  setEditTaskText]  = useState('')
  const [editTaskColor, setEditTaskColor] = useState('#ffffff')
  const [showColorPick, setShowColorPick] = useState(null) // taskId

  // new task form per (weekId, dayIndex)
  const [newTaskForm, setNewTaskForm] = useState(null) // { weekId, dayIndex }
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskColor,setNewTaskColor]= useState('#ffffff')

  const wKey = currentWeekKey()

  const isChecked = (taskId) => checks.some(c => c.taskId === taskId && c.weekKey === wKey)

  const toggleCheck = async (taskId) => {
    const existing = checks.find(c => c.taskId === taskId && c.weekKey === wKey)
    if (existing) await removeCheck(existing.id)
    else          await addCheck({ taskId, weekKey: wKey })
  }

  const saveNewTask = async () => {
    if (!newTaskText.trim() || !newTaskForm) return
    await addTask({ weekId: newTaskForm.weekId, dayIndex: newTaskForm.dayIndex, text: newTaskText.trim(), color: newTaskColor })
    setNewTaskText(''); setNewTaskColor('#ffffff'); setNewTaskForm(null)
  }

  const saveEditTask = async () => {
    if (!editTaskText.trim()) return
    await updateTask(editTaskId, { text: editTaskText.trim(), color: editTaskColor })
    setEditTaskId(null)
  }

  const saveWeekName = async (id) => {
    await updateWeek(id, { name: editingWeekName.trim() || 'Semana' })
    setEditingWeekId(null)
  }

  const addNewWeek = async () => {
    if (!newWeekName.trim()) return
    const order = weeks.length
    await addWeek({ name: newWeekName.trim(), order })
    setNewWeekName(''); setShowWeekForm(false)
  }

  const dayTasks = (weekId, dayIndex) =>
    tasks.filter(t => t.weekId === weekId && t.dayIndex === dayIndex)
      .sort((a,b) => (a._at||'').localeCompare(b._at||''))

  const weekProgress = (weekId) => {
    const wTasks = tasks.filter(t => t.weekId === weekId && t.dayIndex >= 0)
    if (!wTasks.length) return 0
    const done = wTasks.filter(t => isChecked(t.id)).length
    return Math.round(done / wTasks.length * 100)
  }

  const sortedWeeks = [...weeks].sort((a,b) => (a.order||0)-(b.order||0))

  return (
    <div className="screen">
      {/* Add week button */}
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>setShowWeekForm(v=>!v)} style={{
          width:'100%', padding:'10px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer'
        }}>＋ Nova semana</button>
        {showWeekForm && (
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input type="text" placeholder="Nome da semana (ex: Semana normal)" value={newWeekName}
              onChange={e=>setNewWeekName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addNewWeek()}
              autoFocus style={{ flex:1 }}/>
            <button onClick={addNewWeek} style={{ background:'#534AB7', border:'none', borderRadius:10, padding:'8px 16px', color:'#fff', fontSize:13, cursor:'pointer' }}>Criar</button>
            <button onClick={()=>setShowWeekForm(false)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:10, padding:'8px 12px', color:'#888', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        )}
      </div>

      <div className="screen-scroll">
        {weeks.length === 0 && (
          <div style={{ textAlign:'center', color:'#bbb', padding:'40px 0', fontSize:13 }}>
            Crie uma semana para começar!<br/>Ex: "Semana normal", "Semana que a Lilian vem"
          </div>
        )}

        {sortedWeeks.map(week => {
          const pct = weekProgress(week.id)
          return (
            <div key={week.id} style={{ marginBottom:20 }}>
              {/* Week header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, background:'#534AB7', borderRadius:10, padding:'8px 12px' }}>
                {editingWeekId === week.id ? (
                  <>
                    <input type="text" value={editingWeekName} onChange={e=>setEditingWeekName(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&saveWeekName(week.id)}
                      autoFocus style={{ flex:1, fontSize:13, padding:'4px 8px', borderRadius:6 }}/>
                    <button onClick={()=>saveWeekName(week.id)} style={{ background:'#fff', border:'none', borderRadius:6, padding:'4px 10px', color:'#534AB7', fontSize:12, cursor:'pointer' }}>✓</button>
                    <button onClick={()=>setEditingWeekId(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff9', fontSize:14 }}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex:1, fontSize:14, fontWeight:700, color:'#fff' }}>{week.name}</span>
                    <span style={{ fontSize:12, color:'#fff9' }}>{pct}%</span>
                    <button onClick={()=>{ setEditingWeekId(week.id); setEditingWeekName(week.name) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff9', fontSize:14 }}>✏️</button>
                    <button onClick={()=>{ if(window.confirm('Excluir esta semana e todas as tarefas?')) removeWeek(week.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ffaaaa', fontSize:16 }}>×</button>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height:4, background:'#f0efe8', borderRadius:4, marginBottom:8, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: pct===100?'#639922':'#534AB7', borderRadius:4, transition:'width .3s' }}/>
              </div>

              {/* Days grid */}
              <div style={{ overflowX:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7, minmax(90px, 1fr))', gap:4, minWidth:630 }}>
                  {DAYS.map((day, di) => {
                    const isToday = di === todayDow
                    const dTasks  = dayTasks(week.id, di)
                    const doneCnt = dTasks.filter(t=>isChecked(t.id)).length
                    const dayPct  = dTasks.length ? Math.round(doneCnt/dTasks.length*100) : 0
                    return (
                      <div key={di} style={{ background: isToday?'#EEEDFE':'#fafafa', borderRadius:8, padding:'6px', border: isToday?'1.5px solid #534AB7':'1.5px solid #eee' }}>
                        {/* Day header */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontSize:10, fontWeight:700, color: isToday?'#534AB7':'#888' }}>{day}</span>
                          <span style={{ fontSize:9, color:'#bbb' }}>{dayPct}%</span>
                        </div>

                        {/* Tasks */}
                        {dTasks.map(task => {
                          const checked = isChecked(task.id)
                          return (
                            <div key={task.id} style={{
                              display:'flex', alignItems:'center', gap:4, marginBottom:3,
                              background: task.color||'#fff', borderRadius:6, padding:'3px 5px',
                              opacity: checked ? 0.6 : 1
                            }}>
                              {/* Checkbox */}
                              <div onClick={()=>toggleCheck(task.id)} style={{
                                width:14, height:14, borderRadius:3, flexShrink:0, cursor:'pointer',
                                background: checked?'#534AB7':'#fff',
                                border:`1.5px solid ${checked?'#534AB7':'#ccc'}`,
                                display:'flex', alignItems:'center', justifyContent:'center'
                              }}>
                                {checked && <span style={{ fontSize:9, color:'#fff', lineHeight:1 }}>✓</span>}
                              </div>

                              {/* Task text or edit */}
                              {editTaskId === task.id ? (
                                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
                                  <input type="text" value={editTaskText} onChange={e=>setEditTaskText(e.target.value)}
                                    onKeyDown={e=>e.key==='Enter'&&saveEditTask()} autoFocus
                                    style={{ fontSize:11, padding:'2px 4px', borderRadius:4, border:'0.5px solid #ccc', width:'100%' }}/>
                                  <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                                    {TASK_COLORS.map(c=>(
                                      <div key={c.v} onClick={()=>setEditTaskColor(c.v)} style={{
                                        width:14, height:14, borderRadius:3, background:c.v, cursor:'pointer',
                                        border: editTaskColor===c.v?'2px solid #534AB7':'1px solid #ddd'
                                      }}/>
                                    ))}
                                  </div>
                                  <div style={{ display:'flex', gap:3 }}>
                                    <button onClick={saveEditTask} style={{ flex:1, background:'#534AB7', border:'none', borderRadius:4, padding:'3px', color:'#fff', fontSize:10, cursor:'pointer' }}>✓</button>
                                    <button onClick={()=>setEditTaskId(null)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:4, padding:'3px 5px', color:'#888', fontSize:10, cursor:'pointer' }}>✕</button>
                                    <button onClick={()=>removeTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:12 }}>🗑</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span onClick={()=>toggleCheck(task.id)} style={{
                                    flex:1, fontSize:11, color:'#1a1a18', cursor:'pointer',
                                    textDecoration: checked?'line-through':'none',
                                    lineHeight:1.3, wordBreak:'break-word'
                                  }}>{task.text}</span>
                                  <button onClick={()=>{ setEditTaskId(task.id); setEditTaskText(task.text); setEditTaskColor(task.color||'#ffffff') }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:10, padding:0, flexShrink:0 }}>✏️</button>
                                </>
                              )}
                            </div>
                          )
                        })}

                        {/* Add task to this day */}
                        {newTaskForm?.weekId===week.id && newTaskForm?.dayIndex===di ? (
                          <div style={{ marginTop:4 }}>
                            <input type="text" value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                              onKeyDown={e=>e.key==='Enter'&&saveNewTask()} autoFocus placeholder="Nova tarefa..."
                              style={{ width:'100%', fontSize:11, padding:'3px 5px', borderRadius:4, border:'0.5px solid #534AB7', marginBottom:3 }}/>
                            <div style={{ display:'flex', gap:2, flexWrap:'wrap', marginBottom:3 }}>
                              {TASK_COLORS.map(c=>(
                                <div key={c.v} onClick={()=>setNewTaskColor(c.v)} style={{
                                  width:13, height:13, borderRadius:3, background:c.v, cursor:'pointer',
                                  border: newTaskColor===c.v?'2px solid #534AB7':'1px solid #ddd'
                                }}/>
                              ))}
                            </div>
                            <div style={{ display:'flex', gap:3 }}>
                              <button onClick={saveNewTask} style={{ flex:1, background:'#534AB7', border:'none', borderRadius:4, padding:'3px', color:'#fff', fontSize:10, cursor:'pointer' }}>✓ Salvar</button>
                              <button onClick={()=>setNewTaskForm(null)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:4, padding:'3px 5px', color:'#888', fontSize:10, cursor:'pointer' }}>✕</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={()=>{ setNewTaskForm({weekId:week.id,dayIndex:di}); setNewTaskText(''); setNewTaskColor('#ffffff') }} style={{
                            width:'100%', marginTop:3, background:'none', border:'0.5px dashed #ccc',
                            borderRadius:5, padding:'3px', color:'#bbb', fontSize:10, cursor:'pointer'
                          }}>＋</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {/* Monthly tasks section */}
        {sortedWeeks.length > 0 && (
          <div style={{ marginTop:8, marginBottom:20 }}>
            <div style={{ background:'#BA7517', borderRadius:10, padding:'8px 12px', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>📅 Fazer uma vez ao mês</span>
            </div>

            {/* Monthly tasks are shared across all weeks, dayIndex = -1 */}
            {(() => {
              const mTasks = tasks.filter(t => t.dayIndex === -1)
              return (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {mTasks.map(task => {
                    const checked = isChecked(task.id)
                    return (
                      <div key={task.id} style={{
                        display:'flex', alignItems:'center', gap:6, padding:'7px 10px',
                        borderRadius:8, background: task.color||'#fff',
                        border:'0.5px solid #eee', opacity: checked?0.6:1,
                        minWidth:140
                      }}>
                        <div onClick={()=>toggleCheck(task.id)} style={{
                          width:16, height:16, borderRadius:4, flexShrink:0, cursor:'pointer',
                          background: checked?'#BA7517':'#fff',
                          border:`1.5px solid ${checked?'#BA7517':'#ccc'}`,
                          display:'flex', alignItems:'center', justifyContent:'center'
                        }}>
                          {checked && <span style={{ fontSize:10, color:'#fff' }}>✓</span>}
                        </div>

                        {editTaskId === task.id ? (
                          <div style={{ flex:1 }}>
                            <input type="text" value={editTaskText} onChange={e=>setEditTaskText(e.target.value)}
                              onKeyDown={e=>e.key==='Enter'&&saveEditTask()} autoFocus
                              style={{ fontSize:12, padding:'2px 4px', borderRadius:4, border:'0.5px solid #ccc', width:'100%', marginBottom:3 }}/>
                            <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginBottom:3 }}>
                              {TASK_COLORS.map(c=>(
                                <div key={c.v} onClick={()=>setEditTaskColor(c.v)} style={{
                                  width:14, height:14, borderRadius:3, background:c.v, cursor:'pointer',
                                  border: editTaskColor===c.v?'2px solid #534AB7':'1px solid #ddd'
                                }}/>
                              ))}
                            </div>
                            <div style={{ display:'flex', gap:3 }}>
                              <button onClick={saveEditTask} style={{ flex:1, background:'#534AB7', border:'none', borderRadius:4, padding:'3px', color:'#fff', fontSize:10, cursor:'pointer' }}>✓</button>
                              <button onClick={()=>setEditTaskId(null)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:4, padding:'3px', color:'#888', fontSize:10, cursor:'pointer' }}>✕</button>
                              <button onClick={()=>removeTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:12 }}>🗑</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span onClick={()=>toggleCheck(task.id)} style={{
                              flex:1, fontSize:12, color:'#1a1a18', cursor:'pointer',
                              textDecoration: checked?'line-through':'none'
                            }}>{task.text}</span>
                            <button onClick={()=>{ setEditTaskId(task.id); setEditTaskText(task.text); setEditTaskColor(task.color||'#ffffff') }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:11, padding:0 }}>✏️</button>
                          </>
                        )}
                      </div>
                    )
                  })}

                  {/* Add monthly task */}
                  {newTaskForm?.weekId==='monthly' && newTaskForm?.dayIndex===-1 ? (
                    <div style={{ padding:'7px 10px', borderRadius:8, background:'#fff', border:'0.5px solid #ddd', minWidth:160 }}>
                      <input type="text" value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&saveNewTask()} autoFocus placeholder="Nova tarefa mensal..."
                        style={{ fontSize:12, padding:'3px 5px', borderRadius:4, border:'0.5px solid #ccc', width:'100%', marginBottom:4 }}/>
                      <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginBottom:4 }}>
                        {TASK_COLORS.map(c=>(
                          <div key={c.v} onClick={()=>setNewTaskColor(c.v)} style={{
                            width:14, height:14, borderRadius:3, background:c.v, cursor:'pointer',
                            border: newTaskColor===c.v?'2px solid #534AB7':'1px solid #ddd'
                          }}/>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:3 }}>
                        <button onClick={saveNewTask} style={{ flex:1, background:'#BA7517', border:'none', borderRadius:4, padding:'4px', color:'#fff', fontSize:11, cursor:'pointer' }}>✓ Salvar</button>
                        <button onClick={()=>setNewTaskForm(null)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:4, padding:'4px 6px', color:'#888', fontSize:11, cursor:'pointer' }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={()=>{ setNewTaskForm({weekId:'monthly',dayIndex:-1}); setNewTaskText(''); setNewTaskColor('#ffffff') }} style={{
                      padding:'7px 14px', borderRadius:8, border:'0.5px dashed #BA7517',
                      background:'none', color:'#BA7517', fontSize:12, cursor:'pointer'
                    }}>＋ Adicionar</button>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
