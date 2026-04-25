import { useState, useEffect, useRef } from 'react'
import { useData } from '../useData.js'

// Retorna a data atual no fuso de Brasília (UTC-3) como YYYY-MM-DD
function todayBrasilia() {
  const now = new Date()
  // Brasília = UTC-3
  const offset = -3 * 60
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000)
  return local.toISOString().split('T')[0]
}

// Ms até meia-noite de Brasília
function msUntilBrasilianMidnight() {
  const now = new Date()
  const offset = -3 * 60
  const localNow = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000)
  const tomorrow = new Date(localNow)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime() - localNow.getTime()
}

const SIZES = [50, 100, 200, 400, 500]
const ALERT_STYLES = [
  { v:'sound',   l:'Som + vibrar' },
  { v:'vibrate', l:'Só vibrar'    },
  { v:'silent',  l:'Silencioso'   },
]
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function WaterCup({ amount, filled, partial, onClick }) {
  return (
    <div onClick={onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'pointer' }}>
      <div style={{
        width:44, height:54, borderRadius:'4px 4px 10px 10px',
        background: filled?'#4FC3F7':partial?'#B3E5FC':'#E3F2FD',
        border:`2px solid ${filled?'#0288D1':'#90CAF9'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, transition:'all .2s',
        boxShadow: filled?'0 2px 8px rgba(2,136,209,.3)':'none'
      }}>
        {filled?'💧':partial?'🫧':''}
      </div>
      <span style={{ fontSize:9, color:filled?'#0288D1':'#90CAF9', fontWeight:600 }}>{amount}ml</span>
    </div>
  )
}

export default function WaterScreen() {
  const { items: entries, add, remove }                                              = useData('water',         'private')
  const { items: settingsDocs, add: addSettings, update: updateSettings }            = useData('waterSettings', 'private')

  const settings         = settingsDocs[0] || {}
  const goal             = settings.goal             || 2000
  const reminderInterval = settings.reminderInterval || 60
  const selectedSize     = settings.defaultSize      || 200
  const alertStyle       = settings.alertStyle       || 'sound'

  const [subTab,       setSubTab]       = useState('today') // 'today' | 'history'
  const [showSettings, setShowSettings] = useState(false)
  const [tempGoal,     setTempGoal]     = useState(goal)
  const [tempInterval, setTempInterval] = useState(reminderInterval)
  const [tempSize,     setTempSize]     = useState(selectedSize)
  const [tempAlert,    setTempAlert]    = useState(alertStyle)
  const timerRef    = useRef(null)
  const midnightRef = useRef(null)

  const todayKey     = todayBrasilia()
  const todayEntries = entries.filter(e => e.date === todayKey)
  const consumed     = todayEntries.reduce((s, e) => s + e.amount, 0)
  const pct          = Math.min(100, Math.round(consumed / goal * 100))
  const totalCups    = Math.ceil(goal / selectedSize)
  const filledCups   = Math.floor(consumed / selectedSize)
  const partialPct   = (consumed % selectedSize) / selectedSize

  // Reminder timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (consumed >= goal) return
      if (alertStyle === 'vibrate' || alertStyle === 'sound') {
        if ('vibrate' in navigator) navigator.vibrate([300, 100, 300])
      }
      if (alertStyle !== 'silent' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('💧 Hora de beber água!', {
          body: `Você bebeu ${consumed}ml de ${goal}ml hoje.`,
          icon: '/icon-192.png', tag: 'water-reminder'
        })
      }
    }, reminderInterval * 60 * 1000)
    return () => clearInterval(timerRef.current)
  }, [reminderInterval, consumed, goal, alertStyle])

  // Midnight reset — just re-renders because todayKey changes
  useEffect(() => {
    const schedule = () => {
      const ms = msUntilBrasilianMidnight()
      midnightRef.current = setTimeout(() => {
        // Force re-render by doing nothing — React will recompute todayKey
        schedule()
      }, ms)
    }
    schedule()
    return () => clearTimeout(midnightRef.current)
  }, [])

  const addWater = async (amount) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' })
    await add({ amount, date: todayKey, time })
  }

  const saveSettings = async () => {
    const data = { goal:tempGoal, reminderInterval:tempInterval, defaultSize:tempSize, alertStyle:tempAlert }
    if (settingsDocs[0]) await updateSettings(settingsDocs[0].id, data)
    else await addSettings(data)
    setShowSettings(false)
  }

  const requestNotif = async () => {
    if ('Notification' in window) await Notification.requestPermission()
  }

  // History: last 90 days grouped by date
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const historyByDate = {}
  entries
    .filter(e => e.date >= cutoffStr && e.date !== todayKey)
    .forEach(e => {
      if (!historyByDate[e.date]) historyByDate[e.date] = 0
      historyByDate[e.date] += e.amount
    })
  const historyDays = Object.entries(historyByDate)
    .sort((a,b) => b[0].localeCompare(a[0]))
    .slice(0, 90)

  const fmtDate = (ds) => {
    const d = new Date(ds + 'T12:00')
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
  }

  return (
    <div className="screen">
      {/* Quick add at top */}
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6 }}>
          {SIZES.map(s => (
            <button key={s} onClick={() => addWater(s)} style={{
              flex:1, padding:'10px 2px', borderRadius:12, border:'none',
              cursor:'pointer', background:'#E3F2FD', color:'#0277BD', fontSize:11, fontWeight:700
            }}>+{s}ml</button>
          ))}
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ display:'flex', gap:0, margin:'10px 14px 0', background:'#f0efe8', borderRadius:10, padding:3, flexShrink:0 }}>
        {[{v:'today',l:'💧 Hoje'},{v:'history',l:'📅 Histórico'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{
            flex:1, padding:'8px', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500,
            background:subTab===x.v?'#fff':'transparent', color:subTab===x.v?'#1a1a18':'#999',
            boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
          }}>{x.l}</button>
        ))}
      </div>

      {subTab === 'today' && (
        <div className="screen-scroll">
          {/* Main widget */}
          <div style={{ background:'linear-gradient(135deg,#E3F2FD,#B3E5FC)', borderRadius:20, padding:'20px', marginBottom:16, marginTop:10, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#0277BD', fontWeight:600, marginBottom:4 }}>Água hoje</div>
            <div style={{ fontSize:48, fontWeight:800, color:'#01579B', lineHeight:1 }}>{consumed}</div>
            <div style={{ fontSize:14, color:'#0288D1', marginBottom:12 }}>de {goal} ml · {pct}%</div>
            <div style={{ background:'rgba(255,255,255,.5)', borderRadius:12, height:12, marginBottom:16, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'#0288D1', borderRadius:12, transition:'width .4s' }}/>
            </div>
            <div style={{ fontSize:32, marginBottom:4 }}>{pct>=100?'🎉':pct>=75?'💪':pct>=50?'😊':pct>=25?'😐':'😅'}</div>
            <div style={{ fontSize:12, color:'#0277BD' }}>
              {pct>=100 ? 'Meta atingida! Parabéns!' : `Faltam ${goal-consumed}ml para a meta`}
            </div>
          </div>

          {/* Cups */}
          <div style={{ marginBottom:16 }}>
            <div className="section-label">Copos ({filledCups}/{totalCups})</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', padding:'8px 0' }}>
              {Array.from({ length: totalCups }, (_, i) => {
                const filled  = i < filledCups
                const partial = i === filledCups && partialPct > 0
                return (
                  <WaterCup key={i} amount={selectedSize} filled={filled} partial={partial}
                    onClick={() => {
                      if (filled && todayEntries.length > 0) {
                        const last = [...todayEntries].reverse().find(e => e.amount === selectedSize)
                        if (last) remove(last.id)
                      } else if (!filled) {
                        addWater(selectedSize)
                      }
                    }}
                  />
                )
              })}
            </div>
            <div style={{ textAlign:'center', fontSize:11, color:'#90CAF9', marginTop:4 }}>
              Toque para adicionar · toque cheio para desfazer
            </div>
          </div>

          {/* Log */}
          {todayEntries.length > 0 && (
            <div>
              <div className="section-label">Registro de hoje</div>
              {[...todayEntries].reverse().map(e => (
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid #f0efe8' }}>
                  <span style={{ fontSize:16 }}>💧</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#0288D1' }}>{e.amount}ml</span>
                    {e.time && <span style={{ fontSize:11, color:'#bbb', marginLeft:8 }}>{e.time}</span>}
                  </div>
                  <button onClick={() => remove(e.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18 }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="add-row" onClick={() => setShowSettings(true)}>
            <span style={{ fontSize:16 }}>⚙️</span><span>Configurações de água</span>
          </div>
        </div>
      )}

      {subTab === 'history' && (
        <div className="screen-scroll">
          <div style={{ fontSize:12, color:'#888', marginBottom:12, marginTop:8 }}>
            Últimos 90 dias · meta: {goal}ml/dia
          </div>
          {historyDays.length === 0 ? (
            <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>
              Nenhum registro ainda
            </div>
          ) : historyDays.map(([date, total]) => {
            const p   = Math.min(100, Math.round(total / goal * 100))
            const hit = total >= goal
            return (
              <div key={date} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'0.5px solid #f0efe8' }}>
                <div style={{ width:46, fontSize:12, color:'#888', flexShrink:0 }}>{fmtDate(date)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ height:8, background:'#f0efe8', borderRadius:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${p}%`, background: hit?'#0288D1':'#90CAF9', borderRadius:8 }}/>
                  </div>
                </div>
                <div style={{ width:60, textAlign:'right', fontSize:12, fontWeight:600, color: hit?'#0277BD':'#90CAF9', flexShrink:0 }}>
                  {total}ml
                </div>
                <div style={{ fontSize:14 }}>{hit?'✅':'○'}</div>
              </div>
            )
          })}
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Configurações de água</div>
            <div className="form-group">
              <div>
                <label className="form-label">Meta diária (ml)</label>
                <input type="number" value={tempGoal} onChange={e=>setTempGoal(parseInt(e.target.value)||2000)}/>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                  {[1500,2000,2500,3000,3500].map(v=>(
                    <button key={v} onClick={()=>setTempGoal(v)} style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:tempGoal===v?'#0288D1':'#f0efe8', color:tempGoal===v?'#fff':'#888' }}>{v}ml</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Tamanho padrão do copo</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {SIZES.map(s=>(
                    <button key={s} onClick={()=>setTempSize(s)} style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:tempSize===s?'#0288D1':'#f0efe8', color:tempSize===s?'#fff':'#888' }}>{s}ml</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Lembrete a cada (minutos)</label>
                <input type="number" value={tempInterval} min="15" max="240" onChange={e=>setTempInterval(parseInt(e.target.value)||60)}/>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                  {[30,60,90,120].map(v=>(
                    <button key={v} onClick={()=>setTempInterval(v)} style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:tempInterval===v?'#0288D1':'#f0efe8', color:tempInterval===v?'#fff':'#888' }}>{v}min</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Tipo de alerta</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {ALERT_STYLES.map(s=>(
                    <button key={s.v} onClick={()=>setTempAlert(s.v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:tempAlert===s.v?'#0288D1':'#f0efe8', color:tempAlert===s.v?'#fff':'#888' }}>{s.l}</button>
                  ))}
                </div>
              </div>
              {'Notification' in window && Notification.permission !== 'granted' && (
                <button onClick={requestNotif} style={{ background:'#E3F2FD', border:'none', borderRadius:10, padding:'10px', fontSize:13, color:'#0277BD', cursor:'pointer', width:'100%' }}>
                  🔔 Ativar notificações
                </button>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={() => setShowSettings(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveSettings}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
