import { useState, useEffect } from 'react'
import { useData } from '../useData.js'

const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const EMOJI_OPTIONS = ['🏃','📚','💧','🧘','😴','🥗','✍️','🎯','💊','🎵','🧹','🐕','💻','🙏','🚴','🏊','🌿','📵','🍎','🧠','🫀','🌅','🧴','🪥','💪','🎨','🛌','🏋️','🚶','🧪','🤸','🎻','🧘‍♀️','🌊','🍵']
const FREQ_OPTIONS = [
  {label:'Todo dia',  value:7},
  {label:'6x / sem', value:6},
  {label:'5x / sem', value:5},
  {label:'4x / sem', value:4},
  {label:'3x / sem', value:3},
  {label:'2x / sem', value:2},
  {label:'1x / sem', value:1},
]
const HABIT_COLORS = ['#534AB7','#0F6E56','#D85A30','#BA7517','#D4537E','#185FA5','#639922','#E24B4A','#1D9E75','#993C1D','#7C6FAF','#7BAFC4','#6B8F5E','#A0A0A0','#D9899B']

function getWeekDates() {
  const today = new Date()
  const dow = today.getDay()
  return Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-dow+i); return d.toISOString().split('T')[0] })
}
const todayStr = () => new Date().toISOString().split('T')[0]

// ms until next Sunday 00:00
function msUntilSundayMidnight() {
  const now = new Date()
  const daysUntilSun = (7 - now.getDay()) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilSun)
  next.setHours(0, 0, 0, 0)
  return next.getTime() - now.getTime()
}

export default function HabitsScreen() {
  const { items: habits, add, update, remove } = useData('habits','private')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name:'', emoji:'🏃', freq:5, color:'#534AB7' })
  const weekDates = getWeekDates()
  const t0 = todayStr()

  // Every Sunday midnight: remove checkins older than 8 weeks
  useEffect(() => {
    let timer
    const schedule = () => {
      timer = setTimeout(async () => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 56)
        const cutoffStr = cutoff.toISOString().split('T')[0]
        for (const habit of habits) {
          const cleaned = (habit.checkins||[]).filter(d => d >= cutoffStr)
          if (cleaned.length !== (habit.checkins||[]).length) {
            await update(habit.id, { checkins: cleaned })
          }
        }
        schedule()
      }, msUntilSundayMidnight())
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  const totalPossible = habits.reduce((s,h)=>s+h.freq,0)
  const totalDone     = habits.reduce((s,h)=>{
    const wc=(h.checkins||[]).filter(d=>weekDates.includes(d)).length
    return s+Math.min(wc,h.freq)
  },0)
  const weekPct = totalPossible>0 ? Math.min(100,Math.round(totalDone/totalPossible*100)) : 0
  const barColor = weekPct===100?'#639922':weekPct>=60?'#BA7517':'#534AB7'

  const toggleCheckin = async (habit, date) => {
    const checkins = habit.checkins||[]
    const has = checkins.includes(date)
    await update(habit.id, { checkins: has ? checkins.filter(d=>d!==date) : [...checkins, date] })
  }

  const getStreak = (habit) => {
    let streak=0, d=new Date(t0)
    while(true){
      const ds=d.toISOString().split('T')[0]
      if((habit.checkins||[]).includes(ds)){streak++;d.setDate(d.getDate()-1)}else break
    }
    return streak
  }

  const openNew = () => {
    setEditItem(null); setForm({ name:'', emoji:'🏃', freq:5, color:'#534AB7' }); setShowForm(true)
  }

  const openEdit = (habit) => {
    setEditItem(habit)
    setForm({ name:habit.name, emoji:habit.emoji||'🏃', freq:habit.freq, color:habit.color||'#534AB7' })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (editItem) {
      await update(editItem.id, { name:form.name, emoji:form.emoji, freq:form.freq, color:form.color })
    } else {
      await add({ ...form, checkins:[] })
    }
    setForm({ name:'', emoji:'🏃', freq:5, color:'#534AB7' })
    setEditItem(null); setShowForm(false)
  }

  return (
    <div className="screen">
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={openNew} style={{ width:'100%', padding:'11px', borderRadius:12, border:'none', background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          ＋ Novo hábito
        </button>
      </div>

      <div className="screen-scroll">
        <div style={{ background:'#EEEDFE', borderRadius:16, padding:'16px', marginBottom:14, marginTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, color:'#7F77DD', fontWeight:600 }}>Progresso semanal</div>
              <div style={{ fontSize:38, fontWeight:700, color:'#3C3489', lineHeight:1.1 }}>{weekPct}%</div>
              <div style={{ fontSize:12, color:'#7F77DD' }}>{totalDone} de {totalPossible} check-ins</div>
            </div>
            <div style={{ fontSize:32 }}>{weekPct===100?'🏆':weekPct>=60?'🔥':'💪'}</div>
          </div>
          <div className="progress-wrap" style={{ marginBottom:10 }}>
            <div className="progress-fill" style={{ width:`${weekPct}%`, background:barColor }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {weekDates.map((d,i)=>{
              const isToday = d===t0
              const cnt = habits.filter(h=>(h.checkins||[]).includes(d)).length
              return (
                <div key={d} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                  <span style={{ fontSize:9, color:isToday?'#534AB7':'#9B99C4', fontWeight:isToday?600:400 }}>{DAYS_SHORT[i]}</span>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:cnt>0?'#534AB7':'rgba(83,74,183,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:cnt>0?'#fff':'#9B99C4', border:isToday?'2px solid #534AB7':'2px solid transparent' }}>{cnt>0?cnt:''}</div>
                </div>
              )
            })}
          </div>
        </div>

        {habits.length===0
          ? <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>Adicione seus primeiros hábitos!</div>
          : [...habits].sort((a,b)=>a.name.localeCompare(b.name)).map(habit=>{
            const todayDone = (habit.checkins||[]).includes(t0)
            const weekDone  = (habit.checkins||[]).filter(d=>weekDates.includes(d)).length
            const wpct      = Math.min(100, Math.round(weekDone/habit.freq*100))
            const streak    = getStreak(habit)
            const hColor    = habit.color || '#534AB7'
            return (
              <div key={habit.id} style={{ border:`1.5px solid ${hColor}33`, borderRadius:12, padding:'14px', marginBottom:8, background:'#fff', borderLeft:`3px solid ${hColor}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{habit.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:hColor }}>{habit.name}</div>
                    <div style={{ fontSize:11, color:'#bbb' }}>
                      {FREQ_OPTIONS.find(f=>f.value===habit.freq)?.label||`${habit.freq}x/sem`}
                      {streak>0&&<span style={{ marginLeft:8, color:'#D85A30' }}>🔥 {streak} dias</span>}
                    </div>
                  </div>
                  <button onClick={()=>openEdit(habit)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
                  <div onClick={()=>toggleCheckin(habit,t0)} style={{ width:36, height:36, borderRadius:'50%', cursor:'pointer', background:todayDone?hColor:'#f0efe8', border:todayDone?'none':`1.5px solid ${hColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:todayDone?'#fff':'#bbb', transition:'all .15s' }}>{todayDone?'✓':'○'}</div>
                  <button onClick={()=>remove(habit.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18 }}>×</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:8 }}>
                  {weekDates.map((d,i)=>{
                    const done = (habit.checkins||[]).includes(d)
                    const isToday = d===t0
                    return (
                      <div key={d} onClick={()=>toggleCheckin(habit,d)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, cursor:'pointer' }}>
                        <span style={{ fontSize:8, color:'#ccc' }}>{DAYS_SHORT[i][0]}</span>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:done?hColor:'#f5f4f0', border:isToday?`1.5px solid ${hColor}`:'1.5px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:done?'#fff':'#bbb' }}>{done?'✓':''}</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div className="progress-wrap">
                      <div className="progress-fill" style={{ width:`${wpct}%`, background:wpct===100?'#639922':wpct>=60?'#BA7517':hColor }}/>
                    </div>
                  </div>
                  <span style={{ fontSize:11, color:'#888', minWidth:30 }}>{weekDone}/{habit.freq}</span>
                </div>
              </div>
            )
          })
        }
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>{setShowForm(false);setEditItem(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar hábito':'Novo hábito'}</div>
            <div className="form-group">
              <input type="text" placeholder="Nome do hábito" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoFocus/>
              <div>
                <label className="form-label">Ícone</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {EMOJI_OPTIONS.map(e=>(
                    <div key={e} onClick={()=>setForm({...form,emoji:e})} style={{ width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,cursor:'pointer', background:form.emoji===e?'#EEEDFE':'#f0efe8', border:form.emoji===e?'1.5px solid #534AB7':'1.5px solid transparent' }}>{e}</div>
                  ))}
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                    <span style={{ fontSize:11, color:'#888' }}>ou digite:</span>
                    <input type="text" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{ width:50, textAlign:'center', fontSize:18 }}/>
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Cor</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4, alignItems:'center' }}>
                  {HABIT_COLORS.map(c=>(
                    <div key={c} onClick={()=>setForm({...form,color:c})} style={{ width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer', border:form.color===c?'3px solid #1a1a18':'3px solid transparent' }}/>
                  ))}
                  <input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{ width:24,height:24,borderRadius:'50%',border:'none',cursor:'pointer',padding:0 }}/>
                </div>
              </div>
              <div>
                <label className="form-label">Frequência semanal</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                  {FREQ_OPTIONS.map(f=>(
                    <button key={f.value} onClick={()=>setForm({...form,freq:f.value})} style={{ padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:form.freq===f.value?form.color:'#f0efe8', color:form.freq===f.value?'#fff':'#888' }}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{setShowForm(false);setEditItem(null)}}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
