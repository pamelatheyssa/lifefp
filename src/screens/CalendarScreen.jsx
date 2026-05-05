import { useState, useEffect, useMemo } from 'react'
import { useData }                       from '../useData.js'
import { updateWidgetData }              from '../notifications.js'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const COLORS = [
  '#534AB7','#7C6FAF','#9B59B6',
  '#0F6E56','#27AE60','#39FF14',
  '#D85A30','#E67E22','#F1C40F',
  '#FFD700','#D4537E','#E74C3C',
  '#185FA5','#3498DB','#1ABC9C',
  '#FF6B35','#FF4500','#C0392B'
]
const DAY_COLORS = ['#FFE8E8','#FFF3E0','#FFFDE7','#F1F8E9','#E8F5E9','#E3F2FD','#EDE7F6','#FCE4EC','#F3E5F5','#E0F7FA']
const fmt   = d => d.toISOString().split('T')[0]
const today = new Date()

const REPEAT_OPTS = [
  { v:'none',    l:'Não repetir' },
  { v:'weekly',  l:'Semanalmente' },
  { v:'monthly', l:'Mensalmente' },
  { v:'yearly',  l:'Anualmente' },
]

// Expand recurring events into virtual occurrences up to 2 years ahead
function expandEvents(events) {
  const result = []
  const limit = new Date()
  limit.setFullYear(limit.getFullYear() + 2)

  for (const ev of events) {
    result.push(ev) // always include the original

    if (!ev.repeat || ev.repeat === 'none' || !ev.date) continue

    let next = new Date(ev.date + 'T12:00')

    for (let i = 0; i < 200; i++) {
      if (ev.repeat === 'weekly')  next.setDate(next.getDate() + 7)
      if (ev.repeat === 'monthly') next.setMonth(next.getMonth() + 1)
      if (ev.repeat === 'yearly')  next.setFullYear(next.getFullYear() + 1)
      if (next > limit) break

      const ds = fmt(next)
      // virtual copy — same id prefix so we can trace it back, _virtual flag prevents edit/delete
      result.push({ ...ev, date: ds, id: ev.id + '_r_' + ds, _virtual: true, _sourceId: ev.id })
    }
  }
  return result
}

export default function CalendarScreen() {
  const { items: rawEvents, add, update, remove } = useData('events', 'group')
  const { items: dayColors, add: addDayColor, update: updateDayColor, remove: removeDayColor } = useData('calendarDayColors', 'group')

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [sel,   setSel]   = useState(fmt(today))
  const [view,  setView]  = useState('month')
  const [showForm,           setShowForm]           = useState(false)
  const [editItem,           setEditItem]           = useState(null)
  const [showDayColorPicker, setShowDayColorPicker] = useState(false)
  const [evColor, setEvColor] = useState(COLORS[0])
  const [form, setForm] = useState({ title:'', time:'09:00', allDay:false, note:'', repeat:'none', emoji:'' })

  // All events including virtual recurring copies
  const events = useMemo(() => expandEvents(rawEvents), [rawEvents])

  useEffect(() => { updateWidgetData(rawEvents) }, [rawEvents])

  const nav = dir => {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()

  const evOn = d => events
    .filter(e => e.date === d)
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return (a.time || '00:00').localeCompare(b.time || '00:00')
    })

  const getDayColor = d => dayColors.find(dc => dc.date === d)?.color

  const getWeekDates = () => {
    const base = new Date(sel), dow = base.getDay()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(d.getDate() - dow + i)
      return fmt(d)
    })
  }
  const weekDates = getWeekDates()

  const openNew = () => {
    setEditItem(null)
    setForm({ title:'', time:'09:00', allDay:false, note:'', repeat:'none', emoji:'' })
    setEvColor(COLORS[0])
    setShowForm(true)
  }

  const openEdit = (ev) => {
    // If virtual, edit the source event
    const source = ev._virtual ? rawEvents.find(e => e.id === ev._sourceId) : ev
    if (!source) return
    setEditItem(source)
    setForm({ title:source.title, time:source.time||'09:00', allDay:source.allDay||false, note:source.note||'', repeat:source.repeat||'none', emoji:source.emoji||'' })
    setEvColor(source.color || COLORS[0])
    // Keep sel on the clicked date so date field shows the original date
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    if (editItem) {
      await update(editItem.id, { ...form, date: editItem.date, color: evColor })
    } else {
      await add({ ...form, date: sel, color: evColor, done: false })
    }
    setForm({ title:'', time:'09:00', allDay:false, note:'', repeat:'none', emoji:'' })
    setEditItem(null); setShowForm(false)
  }

  const handleRemove = (ev) => {
    // If virtual, remove the source
    const id = ev._virtual ? ev._sourceId : ev.id
    remove(id)
  }

  const handleToggleDone = (ev) => {
    // Toggle done on source event
    const id = ev._virtual ? ev._sourceId : ev.id
    const source = rawEvents.find(e => e.id === id)
    if (source) update(id, { done: !source.done })
  }

  const setDayBgColor = async (color) => {
    const existing = dayColors.find(dc => dc.date === sel)
    if (color === null) {
      if (existing) await removeDayColor(existing.id)
    } else if (existing) {
      await updateDayColor(existing.id, { color })
    } else {
      await addDayColor({ date: sel, color })
    }
    setShowDayColorPicker(false)
  }

  const evRow = e => (
    <div key={e.id} style={{
      display:'flex', alignItems:'center', gap:9, padding:'8px 10px',
      borderRadius:8, background: e.color + '22', borderLeft: `3px solid ${e.color}`,
      marginBottom:5, opacity: e.date < fmt(today) ? 0.6 : 1
    }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500, textDecoration:e.done?'line-through':'none', color:e.done?'#bbb':'#1a1a18' }}>
          {e.emoji ? e.emoji + ' ' : ''}{e.title}
          {e._virtual && <span style={{ fontSize:9, color:'#bbb', marginLeft:4 }}>🔁</span>}
        </div>
        <div style={{ fontSize:11, color:'#bbb' }}>{e.allDay ? 'Dia inteiro' : e.time}{e.note ? ' · ' + e.note : ''}</div>
      </div>
      <div className={`check-circle ${e.done?'done':''}`} onClick={() => handleToggleDone(e)}>{e.done?'✓':''}</div>
      <button onClick={() => openEdit(e)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
      <button onClick={() => handleRemove(e)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18, lineHeight:1 }}>×</button>
    </div>
  )

  return (
    <div className="screen">
      <div style={{ display:'flex', gap:8, padding:'10px 14px 6px', overflowX:'auto', flexShrink:0 }}>
        {[
          { icon:'📅', label:'Hoje', val:today.getDate(), sub:MONTHS[today.getMonth()].slice(0,3), bg:'#EEEDFE', tc:'#534AB7', onClick:()=>{ setSel(fmt(today)); setMonth(today.getMonth()); setYear(today.getFullYear()) } },
          { icon:'🗓️', label:'Esta semana', val:weekDates.reduce((s,d)=>s+evOn(d).length,0), sub:'eventos', bg:'#EAF3DE', tc:'#27500A' },
          { icon:'✅', label:'Concluídos', val:rawEvents.filter(e=>e.done).length, sub:`de ${rawEvents.length}`, bg:'#FAEEDA', tc:'#633806' },
        ].map(w=>(
          <div key={w.label} onClick={w.onClick} style={{ background:w.bg, borderRadius:12, padding:'10px 13px', minWidth:78, flexShrink:0, cursor:w.onClick?'pointer':'default' }}>
            <div style={{ fontSize:14 }}>{w.icon}</div>
            <div style={{ fontSize:22, fontWeight:700, color:w.tc, lineHeight:1.1 }}>{w.val}</div>
            <div style={{ fontSize:9, color:w.tc, opacity:.7 }}>{w.sub}</div>
            <div style={{ fontSize:9, color:w.tc, opacity:.5 }}>{w.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', padding:'0 14px 8px', gap:5, flexShrink:0 }}>
        {['month','week','day'].map(v=>(
          <button key={v} onClick={()=>setView(v)} className={`pill${view===v?' on':''}`} style={{ fontSize:11, padding:'4px 11px' }}>
            {v==='month'?'Mês':v==='week'?'Semana':'Dia'}
          </button>
        ))}
        <div style={{ flex:1 }}/>
        <button onClick={()=>nav(-1)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:13 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:500, minWidth:88, textAlign:'center' }}>{MONTHS[month].slice(0,3)} {year}</span>
        <button onClick={()=>nav(1)}  style={{ background:'none', border:'0.5px solid #ddd', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:13 }}>›</button>
      </div>

      <div className="screen-scroll">
        {view==='month' && <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, minmax(0,1fr))', gap:1, marginBottom:0 }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:'center', fontSize:10, color:'#bbb', padding:'3px 0', boxSizing:'border-box', overflow:'hidden' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, minmax(0,1fr))', gap:1 }}>
            {Array.from({length:firstDay},(_,i)=>(
              <div key={`p${i}`} style={{ padding:'4px 2px', minHeight:36, textAlign:'center', fontSize:11, color:'#e0ddd8', overflow:'hidden', boxSizing:'border-box' }}>{prevDays-firstDay+1+i}</div>
            ))}
            {Array.from({length:daysInMonth},(_,i)=>{
              const d  = i + 1
              const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
              const evs     = evOn(ds)
              const isToday = ds === fmt(today)
              const isSel   = ds === sel
              const dayBg   = getDayColor(ds)
              return (
                <div key={d} onClick={()=>setSel(ds)} style={{
                  padding:'3px 2px', minHeight:36, cursor:'pointer', borderRadius:8,
                  background: isSel ? '#EEEDFE' : dayBg || 'transparent',
                  border: isToday ? '1.5px solid #534AB7' : '1.5px solid transparent',
                  overflow:'hidden', boxSizing:'border-box', minWidth:0
                }}>
                  <div style={{ textAlign:'center', fontSize:12, fontWeight:isToday?700:400, color:isToday?'#534AB7':'#1a1a18' }}>{d}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:1, padding:'0 1px' }}>
                    {evs.map((e,j)=>(
                      <div key={j} style={{
                        fontSize:7, background:e.color, color:'#fff', borderRadius:3,
                        padding:'1px 2px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
                        opacity: e.date < fmt(today) ? 0.6 : 1, lineHeight:1.3, maxWidth:'100%'
                      }}>{e._virtual?'🔁':''}{e.emoji||''}{e.title}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div className="section-label">{(()=>{ const d=new Date(sel+'T12:00'); return `${d.getDate()} de ${MONTHS[d.getMonth()]}` })()}</div>
              <button onClick={()=>setShowDayColorPicker(true)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:8, padding:'3px 10px', fontSize:11, cursor:'pointer', color:'#888' }}>🎨 Cor do dia</button>
            </div>
            {evOn(sel).length===0
              ? <div style={{ fontSize:13, color:'#bbb' }}>Nenhum compromisso</div>
              : evOn(sel).map(evRow)
            }
          </div>
        </>}

        {view==='week' && <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:12 }}>
            {weekDates.map((d,i)=>{
              const date=new Date(d+'T12:00'), isToday=d===fmt(today), isSel=d===sel
              const dayBg = getDayColor(d)
              return (
                <div key={d} onClick={()=>setSel(d)} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 2px', borderRadius:10, cursor:'pointer', background:isSel?'#EEEDFE':dayBg||'transparent', border:isToday?'1.5px solid #534AB7':'1.5px solid transparent' }}>
                  <span style={{ fontSize:9, color:'#bbb' }}>{DAYS[i]}</span>
                  <span style={{ fontSize:16, fontWeight:isToday?700:400, color:isToday?'#534AB7':'#1a1a18' }}>{date.getDate()}</span>
                  {evOn(d).length>0 && <div style={{ width:5, height:5, borderRadius:'50%', background:'#534AB7', marginTop:2 }}/>}
                </div>
              )
            })}
          </div>
          {weekDates.map(d=>{
            const evs=evOn(d); if(!evs.length) return null
            const date=new Date(d+'T12:00')
            return (
              <div key={d} style={{ marginBottom:10 }}>
                <div className="section-label">{DAYS[date.getDay()]}, {date.getDate()} {MONTHS[date.getMonth()].slice(0,3)}</div>
                {evs.map(evRow)}
              </div>
            )
          })}
        </>}

        {view==='day' && <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div className="section-label">{(()=>{ const d=new Date(sel+'T12:00'); return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}` })()}</div>
            <button onClick={()=>setShowDayColorPicker(true)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:8, padding:'3px 10px', fontSize:11, cursor:'pointer', color:'#888' }}>🎨 Cor</button>
          </div>
          {evOn(sel).length===0
            ? <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>Nenhum compromisso</div>
            : evOn(sel).map(evRow)
          }
        </>}

        <div className="add-row" onClick={openNew}>
          <span style={{fontSize:18}}>+</span><span>Novo compromisso</span>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem ? 'Editar compromisso' : 'Novo compromisso'}</div>
            <div className="form-group">
              <div style={{ display:'flex', gap:8 }}>
                <input type="text" placeholder="😀 Emoji" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{ width:80, flexShrink:0 }}/>
                <input type="text" placeholder="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus style={{ flex:1 }}/>
              </div>
              <div className="form-row">
                <div><label className="form-label">Data</label><input type="date" value={editItem ? editItem.date : sel} onChange={e=>{ if(!editItem) setSel(e.target.value) }}/></div>
                <div><label className="form-label">Hora</label><input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={form.allDay} onChange={e=>setForm({...form,allDay:e.target.checked})}/> Dia inteiro
              </label>
              <div>
                <label className="form-label">Repetição</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {REPEAT_OPTS.map(r=>(
                    <button key={r.v} onClick={()=>setForm({...form,repeat:r.v})} style={{
                      padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11,
                      background:form.repeat===r.v?'#534AB7':'#f0efe8', color:form.repeat===r.v?'#fff':'#888'
                    }}>{r.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Cor</label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
                  {COLORS.map(c=>(
                    <div key={c} onClick={()=>setEvColor(c)} style={{ width:24, height:24, borderRadius:'50%', background:c, cursor:'pointer', border:evColor===c?'3px solid #1a1a18':'3px solid transparent' }}/>
                  ))}
                  <input type="color" value={evColor} onChange={e=>setEvColor(e.target.value)} title="Cor personalizada" style={{ width:24, height:24, borderRadius:'50%', border:'none', cursor:'pointer', padding:0 }}/>
                </div>
              </div>
              <textarea placeholder="Nota (opcional)" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                style={{ resize:'none', height:60, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {showDayColorPicker && (
        <div className="modal-overlay" onClick={()=>setShowDayColorPicker(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Cor do dia {(()=>{ const d=new Date(sel+'T12:00'); return `${d.getDate()}/${d.getMonth()+1}` })()}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', padding:'8px 0' }}>
              {DAY_COLORS.map(c=>(
                <div key={c} onClick={()=>setDayBgColor(c)} style={{ width:40, height:40, borderRadius:10, background:c, cursor:'pointer', border:getDayColor(sel)===c?'2.5px solid #534AB7':'2.5px solid transparent' }}/>
              ))}
              <div onClick={()=>setDayBgColor(null)} style={{ width:40, height:40, borderRadius:10, background:'#f5f5f5', cursor:'pointer', border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#bbb' }}>✕</div>
            </div>
            <button className="btn-ghost" onClick={()=>setShowDayColorPicker(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
