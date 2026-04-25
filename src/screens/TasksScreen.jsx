import { useState, useEffect } from 'react'
import { useData } from '../useData.js'
import {
  requestNotificationPermission,
  scheduleTaskNotification,
  cancelTaskNotification,
  rescheduleAll
} from '../notifications.js'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const fmtDate = s => { const d=new Date(s+'T12:00'); return `${d.getDate()} ${MONTHS[d.getMonth()]}` }
const today = () => new Date().toISOString().split('T')[0]

const DEFAULT_CATS = [
  { name:'Alheio',   color:'#A0A0A0', emoji:'🤝' },
  { name:'Estudos',  color:'#D9899B', emoji:'📚' },
  { name:'Pessoal',  color:'#6B8F5E', emoji:'👤' },
  { name:'Saúde',    color:'#7BAFC4', emoji:'💊' },
  { name:'Trabalho', color:'#7C6FAF', emoji:'💼' },
]

const REPEAT_OPTS = [
  { v:'none',    l:'Não repetir' },
  { v:'weekly',  l:'Semanal' },
  { v:'monthly', l:'Mensal' },
  { v:'yearly',  l:'Anual' },
]

const ALERT_SOUNDS = [
  { v:'default', l:'Padrão' },
  { v:'bell',    l:'Sino' },
  { v:'chime',   l:'Carrilhão' },
  { v:'none',    l:'Só vibrar' },
]

function genNotifId() {
  return Math.floor(Math.random() * 2000000000) + 1
}

export default function TasksScreen() {
  const { items:tasks, add, update, remove } = useData('tasks','private')
  const { items:lists, add:addList }         = useData('taskLists','private')
  const { items:catDocs, add:addCat, update:updateCat, remove:removeCat } = useData('taskCategories','private')

  const cats        = catDocs.length > 0 ? catDocs : DEFAULT_CATS
  const catMap      = Object.fromEntries(cats.map(c=>[c.name, c.color]))
  const catEmojiMap = Object.fromEntries(cats.map(c=>[c.name, c.emoji||'']))

  const [selList,    setSelList]    = useState('Todas')
  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [showCatMgr, setShowCatMgr] = useState(false)
  const [editCat,    setEditCat]    = useState(null)
  const [newCatName,  setNewCatName]  = useState('')
  const [newCatColor, setNewCatColor] = useState('#888888')
  const [newCatEmoji, setNewCatEmoji] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(false)
  const emptyForm = { title:'', priority:'média', date:'', list:'Pessoal', note:'', notifyAt:'', repeat:'none', emoji:'', alertSound:'default' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if ('Notification' in window) setNotifEnabled(Notification.permission === 'granted')
  }, [])

  useEffect(() => {
    if (tasks.length && notifEnabled) rescheduleAll(tasks)
  }, [tasks.length, notifEnabled])

  const askNotifPermission = async () => {
    const granted = await requestNotificationPermission()
    setNotifEnabled(granted)
  }

  const t0 = today()
  const catNames  = [...cats.map(c=>c.name)].sort()
  const listNames = lists.map(l=>l.name).sort()
  const allNames  = ['Todas', ...new Set([...catNames, ...listNames])]

  const expandRecurring = (taskList) => {
    const expanded = []
    taskList.forEach(task => {
      expanded.push(task)
      if (!task.repeat || task.repeat==='none' || !task.date) return
      const limit = new Date(); limit.setMonth(limit.getMonth()+3)
      let next = new Date(task.date+'T12:00')
      for (let i=0; i<60; i++) {
        if (task.repeat==='weekly')  next.setDate(next.getDate()+7)
        if (task.repeat==='monthly') next.setMonth(next.getMonth()+1)
        if (task.repeat==='yearly')  next.setFullYear(next.getFullYear()+1)
        if (next > limit) break
        const ds = next.toISOString().split('T')[0]
        if (ds !== task.date) expanded.push({...task, id:task.id+'_r_'+ds, date:ds, _virtual:true})
      }
    })
    return expanded
  }

  const filtered    = tasks.filter(t => selList==='Todas' || t.list===selList)
  const allExpanded = expandRecurring(filtered)
  const overdue     = allExpanded.filter(t => t.date && t.date<t0 && !t.done)
  const todayT      = allExpanded.filter(t => t.date===t0 && !t.done)
  const upcoming    = allExpanded.filter(t => t.date>t0 && !t.done).sort((a,b)=>a.date.localeCompare(b.date))
  const done        = filtered.filter(t => t.done)

  const openNew  = () => { setEditItem(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (task) => {
    if (task._virtual) return
    setEditItem(task)
    setForm({ title:task.title, priority:task.priority||'média', date:task.date||'', list:task.list||'Pessoal', note:task.note||'', notifyAt:task.notifyAt||'', repeat:task.repeat||'none', emoji:task.emoji||'', alertSound:task.alertSound||'default' })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const notifId = (editItem?._notifId > 0) ? editItem._notifId : genNotifId()
    const data = { ...form, date:form.date||t0, done:editItem?.done||false, _notifId:notifId }

    // Save to Firestore first
    if (editItem) await update(editItem.id, data)
    else          await add(data)

    // Schedule notification separately (don't await — avoid blocking UI)
    if (form.notifyAt && (form.date||t0) >= t0) {
      scheduleTaskNotification({
        id:    notifId,
        title: form.title,
        date:  form.date||t0,
        time:  form.notifyAt,
        sound: form.alertSound
      }).catch(e => console.warn('Notif error:', e))
    }

    // Close form immediately
    setForm(emptyForm); setEditItem(null); setShowForm(false)
  }

  const toggleTask = async (task) => {
    if (task._virtual) return
    await update(task.id, { done: !task.done })
    if (!task.done && task._notifId) {
      cancelTaskNotification(task._notifId).catch(()=>{})
    }
  }

  const deleteTask = async (task) => {
    if (task._virtual) return
    // Cancel notification without awaiting
    if (task._notifId) cancelTaskNotification(task._notifId).catch(()=>{})
    // Remove immediately
    await remove(task.id)
  }

  const addNewCat = async () => {
    if (!newCatName.trim()) return
    if (catDocs.length===0) for (const c of DEFAULT_CATS) await addCat(c)
    await addCat({ name:newCatName.trim(), color:newCatColor, emoji:newCatEmoji })
    setNewCatName(''); setNewCatColor('#888888'); setNewCatEmoji('')
  }

  const saveEditCat = async () => {
    if (!editCat?.id) return
    await updateCat(editCat.id, { name:editCat.name, color:editCat.color, emoji:editCat.emoji||'' })
    setEditCat(null)
  }

  return (
    <div className="screen">
      {!notifEnabled && (
        <div style={{ background:'#FAEEDA', padding:'10px 14px', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{fontSize:16}}>🔔</span>
          <span style={{fontSize:12,color:'#633806',flex:1}}>Ative notificações para lembretes</span>
          <button onClick={askNotifPermission} style={{ background:'#BA7517', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, color:'#fff', cursor:'pointer' }}>Ativar</button>
        </div>
      )}

      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={openNew} style={{ width:'100%', padding:'11px', borderRadius:12, border:'none', background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          ＋ Nova tarefa
        </button>
      </div>

      <div style={{ display:'flex', gap:6, padding:'8px 14px 0', overflowX:'auto', flexShrink:0 }}>
        {allNames.map(l=>(
          <button key={l} onClick={()=>setSelList(l)} className={`pill${selList===l?' on':''}`} style={{fontSize:11,padding:'4px 12px'}}>{l}</button>
        ))}
        <button onClick={async()=>{ const n=prompt('Nome da nova lista:'); if(n?.trim()) await addList({name:n.trim()}) }} style={{ padding:'4px 10px', borderRadius:20, border:'0.5px dashed #ccc', background:'transparent', color:'#bbb', fontSize:11, cursor:'pointer', flexShrink:0 }}>+ lista</button>
        <button onClick={()=>setShowCatMgr(true)} style={{ padding:'4px 10px', borderRadius:20, border:'0.5px dashed #ccc', background:'transparent', color:'#bbb', fontSize:11, cursor:'pointer', flexShrink:0 }}>🎨 cats</button>
      </div>

      <div style={{ display:'flex', gap:8, padding:'10px 14px', flexShrink:0 }}>
        {[{label:'Hoje',val:todayT.length,bg:'#EEEDFE',tc:'#534AB7'},{label:'Atrasadas',val:overdue.length,bg:'#FCEBEB',tc:'#A32D2D'},{label:'Feitas',val:done.length,bg:'#EAF3DE',tc:'#27500A'}].map(s=>(
          <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:10, padding:'10px', textAlign:'center' }}>
            <div style={{fontSize:20,fontWeight:700,color:s.tc}}>{s.val}</div>
            <div style={{fontSize:10,color:s.tc,opacity:.8}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="screen-scroll">
        {overdue.length>0 && <>
          <div className="section-label" style={{color:'#A32D2D'}}>⚠️ Atrasadas</div>
          {overdue.map(t=><TaskRow key={t.id} task={t} catMap={catMap} catEmojiMap={catEmojiMap} isOverdue onToggle={()=>toggleTask(t)} onDel={()=>deleteTask(t)} onEdit={()=>openEdit(t)} fmtDate={fmtDate}/>)}
        </>}
        <div className="section-label">Hoje</div>
        {todayT.length===0
          ? <div style={{fontSize:13,color:'#bbb',padding:'4px 0 12px'}}>Sem tarefas para hoje 🎉</div>
          : todayT.map(t=><TaskRow key={t.id} task={t} catMap={catMap} catEmojiMap={catEmojiMap} onToggle={()=>toggleTask(t)} onDel={()=>deleteTask(t)} onEdit={()=>openEdit(t)} fmtDate={fmtDate}/>)
        }
        {upcoming.length>0 && <>
          <div className="section-label" style={{marginTop:8}}>Próximas</div>
          {upcoming.map(t=><TaskRow key={t.id} task={t} catMap={catMap} catEmojiMap={catEmojiMap} onToggle={()=>toggleTask(t)} onDel={()=>deleteTask(t)} onEdit={()=>openEdit(t)} fmtDate={fmtDate}/>)}
        </>}
        {done.length>0 && <>
          <div className="section-label" style={{marginTop:8,color:'#bbb'}}>Concluídas ({done.length})</div>
          {done.map(t=><TaskRow key={t.id} task={t} catMap={catMap} catEmojiMap={catEmojiMap} onToggle={()=>toggleTask(t)} onDel={()=>deleteTask(t)} onEdit={()=>openEdit(t)} fmtDate={fmtDate}/>)}
        </>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>{setShowForm(false);setEditItem(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar tarefa':'Nova tarefa'}</div>
            <div className="form-group">
              <div style={{display:'flex',gap:8}}>
                <input type="text" placeholder="😀" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{width:60,flexShrink:0}}/>
                <input type="text" placeholder="Nome da tarefa" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus style={{flex:1}}/>
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Prioridade</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                    <option value="alta">Alta</option><option value="média">Média</option><option value="baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Categoria</label>
                  <select value={form.list} onChange={e=>setForm({...form,list:e.target.value})}>
                    {allNames.filter(n=>n!=='Todas').map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div><label className="form-label">Data</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                <div><label className="form-label">🔔 Lembrete</label><input type="time" value={form.notifyAt} onChange={e=>setForm({...form,notifyAt:e.target.value})}/></div>
              </div>
              {form.notifyAt && (
                <div>
                  <label className="form-label">Som do alerta</label>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    {ALERT_SOUNDS.map(s=>(
                      <button key={s.v} onClick={()=>setForm({...form,alertSound:s.v})} style={{ padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, background:form.alertSound===s.v?'#534AB7':'#f0efe8', color:form.alertSound===s.v?'#fff':'#888' }}>{s.l}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="form-label">Repetição</label>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {REPEAT_OPTS.map(r=>(
                    <button key={r.v} onClick={()=>setForm({...form,repeat:r.v})} style={{ padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, background:form.repeat===r.v?'#534AB7':'#f0efe8', color:form.repeat===r.v?'#fff':'#888' }}>{r.l}</button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Nota" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{resize:'none',height:56,padding:'8px 10px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>{setShowForm(false);setEditItem(null)}}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {showCatMgr && (
        <div className="modal-overlay" onClick={()=>{setShowCatMgr(false);setEditCat(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Categorias de tarefas</div>
            {cats.map((c,i)=>(
              <div key={c.id||c.name} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'0.5px solid #f0efe8'}}>
                {editCat?.id===c.id ? (
                  <>
                    <input type="text" value={editCat.emoji||''} onChange={e=>setEditCat({...editCat,emoji:e.target.value})} style={{width:44,textAlign:'center',fontSize:16}} placeholder="😀"/>
                    <input type="text" value={editCat.name} onChange={e=>setEditCat({...editCat,name:e.target.value})} style={{flex:1}}/>
                    <input type="color" value={editCat.color} onChange={e=>setEditCat({...editCat,color:e.target.value})} style={{width:32,height:32,borderRadius:6,border:'none',cursor:'pointer',padding:2}}/>
                    <button onClick={saveEditCat} style={{background:'#534AB7',border:'none',borderRadius:8,padding:'5px 10px',color:'#fff',fontSize:12,cursor:'pointer'}}>✓</button>
                    <button onClick={()=>setEditCat(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:14}}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{fontSize:16}}>{c.emoji||'⬤'}</span>
                    <div style={{width:10,height:10,borderRadius:'50%',background:c.color,flexShrink:0}}/>
                    <span style={{flex:1,fontSize:14}}>{c.name}</span>
                    <button onClick={()=>setEditCat({...c})} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:13}}>✏️</button>
                    {c.id && <button onClick={()=>removeCat(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#E24B4A',fontSize:14}}>×</button>}
                  </>
                )}
              </div>
            ))}
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,color:'#888',marginBottom:6,fontWeight:600}}>Nova categoria</div>
              <div style={{display:'flex',gap:6}}>
                <input type="text" placeholder="😀" value={newCatEmoji} onChange={e=>setNewCatEmoji(e.target.value)} style={{width:50,textAlign:'center'}}/>
                <input type="text" placeholder="Nome" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{flex:1}}/>
                <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} style={{width:36,height:36,borderRadius:6,border:'none',cursor:'pointer',padding:2}}/>
                <button className="btn-primary" onClick={addNewCat} style={{width:'auto',padding:'8px 14px'}}>+</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{setShowCatMgr(false);setEditCat(null)}} style={{marginTop:10}}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, catMap, catEmojiMap, isOverdue, onToggle, onDel, onEdit, fmtDate }) {
  const catColor = catMap[task.list] || '#e0ddd8'
  const ptColor  = task.priority==='alta'?'#E24B4A':task.priority==='média'?'#BA7517':'#639922'
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px',
      borderRadius:10, marginBottom:6,
      background: task.done ? '#f5f5f3' : isOverdue ? '#FEF0F0' : catColor+'22',
      borderLeft: `3px solid ${task.done?'#ddd':isOverdue?'#E24B4A':catColor}`
    }}>
      <div className={`check-square ${task.done?'done':''}`} onClick={onToggle} style={{marginTop:2}}>{task.done?'✓':''}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,color:task.done?'#bbb':'#1a1a18',textDecoration:task.done?'line-through':'none'}}>
          {task.emoji?task.emoji+' ':''}{task.title}
        </div>
        <div style={{display:'flex',gap:5,alignItems:'center',marginTop:3,flexWrap:'wrap'}}>
          <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:ptColor+'22',color:ptColor,fontWeight:600}}>{task.priority}</span>
          {task.date&&<span style={{fontSize:11,color:'#bbb'}}>{fmtDate(task.date)}</span>}
          {task.list&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:catColor+'33',color:catColor,fontWeight:600}}>{catEmojiMap[task.list]||''} {task.list}</span>}
          {task.notifyAt&&<span style={{fontSize:10,color:'#534AB7'}}>🔔 {task.notifyAt}</span>}
          {task.repeat&&task.repeat!=='none'&&<span style={{fontSize:10,color:'#888'}}>🔁</span>}
          {task._virtual&&<span style={{fontSize:10,color:'#bbb'}}>repetição</span>}
        </div>
        {task.note&&<div style={{fontSize:12,color:'#999',marginTop:3}}>{task.note}</div>}
      </div>
      {!task._virtual&&<button onClick={onEdit} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:14,padding:'2px'}}>✏️</button>}
      {!task._virtual&&<button onClick={onDel} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18,padding:'2px'}}>×</button>}
    </div>
  )
}
