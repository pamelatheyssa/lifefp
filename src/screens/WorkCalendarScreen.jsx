import { useState, useMemo } from 'react'
import { useData } from '../useData.js'

// ── Cores VBA convertidas para hex ───────────────────────────────────────────
const COLOR = {
  feriado:    '#66FF66', // verde neon
  feriadoTJ:  '#FF0099', // rosa neon
  vilani:     '#CC9999', // rosa
  pamela:     '#CC99CC', // roxo
  presencialPB: '#993399', // presencial+balcão pâmela
  presencialP:  '#9900CC', // só presencial pâmela
  balcaoP:      '#999999', // só balcão pâmela
  familia:    '#669966',
  trabalho:   '#66CCFF',
  amigos:     '#CC6699',
}

const DAYS_SHORT  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS_LONG = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_S    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function fmt(date) { return date.toISOString().split('T')[0] }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d }
function isWeekday(date) { const d = date.getDay(); return d>=1&&d<=5 }

function fmtDisplay(ds) {
  const d = new Date(ds+'T12:00')
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function getDayColor(ds, dayData, people) {
  if (!dayData) return null
  if (dayData.feriadoTJ) return COLOR.feriadoTJ
  if (dayData.feriado)   return COLOR.feriado

  // Check Pâmela rules
  const pamelaPresencial = (dayData.presencial||[]).some(p=>p.nome.toLowerCase().includes('pâmela')||p.nome.toLowerCase().includes('pamela'))
  const pamelaBalcao     = (dayData.balcao||[]).some(p=>p.nome.toLowerCase().includes('pâmela')||p.nome.toLowerCase().includes('pamela'))
  if (pamelaPresencial && pamelaBalcao) return COLOR.presencialPB
  if (pamelaPresencial)                 return COLOR.presencialP
  if (pamelaBalcao)                     return COLOR.balcaoP

  // Check Vilaní folga
  const vilaniFolga = [...(dayData.folgaCartorio||[]), ...(dayData.folgaGabinete||[])].some(p=>p.toLowerCase().includes('vilaní')||p.toLowerCase().includes('vilani'))
  if (vilaniFolga) return COLOR.vilani

  // Check Pâmela folga
  const pamelaFolga = [...(dayData.folgaCartorio||[]), ...(dayData.folgaGabinete||[])].some(p=>p.toLowerCase().includes('pâmela')||p.toLowerCase().includes('pamela'))
  if (pamelaFolga) return COLOR.pamela

  return null
}

export default function WorkCalendarScreen() {
  // Data collections
  const { items: dayDocs,    add: addDay,    update: updateDay    } = useData('workCalDays',    'private')
  const { items: peopleDocs, add: addPerson, update: updatePerson, remove: removePerson } = useData('workCalPeople',  'private')
  const { items: birthdays,  add: addBday,   update: updateBday,   remove: removeBday   } = useData('workCalBdays',   'private')
  const { items: holidays,   add: addHoliday,update: updateHoliday,remove: removeHoliday} = useData('workCalHolidays','private')
  // Group calendar events (to also post there)
  const { add: addGroupEvent } = useData('events', 'group')

  const today   = new Date(); today.setHours(0,0,0,0)
  const todayDs = fmt(today)

  const [view,     setView]     = useState('month')   // 'month' | 'week'
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [weekStart,setWeekStart]= useState(() => { const d=new Date(today); d.setDate(d.getDate()-d.getDay()+1); return fmt(d) })
  const [selDate,  setSelDate]  = useState(todayDs)
  const [activePanel, setActivePanel] = useState(null) // 'day'|'people'|'birthdays'|'holidays'

  // Day editor state
  const [dayForm,  setDayForm]  = useState(null) // current day being edited

  // People state
  const [showPeopleModal, setShowPeopleModal] = useState(false)
  const [personForm,      setPersonForm]      = useState({ name:'', color:'#534AB7', area:'cartorio' })
  const [editPersonId,    setEditPersonId]    = useState(null)

  // Birthday state
  const [showBdayModal, setShowBdayModal] = useState(false)
  const [bdayForm,      setBdayForm]      = useState({ name:'', date:'', group:'familia', remind:false })
  const [editBdayId,    setEditBdayId]    = useState(null)

  // Holiday state
  const [showHolModal,  setShowHolModal]  = useState(false)
  const [holForm,       setHolForm]       = useState({ name:'', date:'', type:'feriado', repeat:false })
  const [editHolId,     setEditHolId]     = useState(null)

  // Day panel
  const [showDayPanel,  setShowDayPanel]  = useState(false)
  const [editingDay,    setEditingDay]    = useState(null) // ds
  const [df, setDf] = useState({
    feriado:false, feriadoTJ:false, feriadoName:'',
    presencial:[], balcao:[], folgaCartorio:[], folgaGabinete:[],
    note:'', alsoGroup:false,
  })

  // Quick add to presencial/balcao
  const [addPres,  setAddPres]  = useState('')
  const [addPresH, setAddPresH] = useState('')
  const [addBal,   setAddBal]   = useState('')
  const [addFolC,  setAddFolC]  = useState('')
  const [addFolG,  setAddFolG]  = useState('')

  // Helper: get doc for a date
  const getDayDoc = ds => dayDocs.find(d=>d.date===ds)

  const openDayEditor = (ds) => {
    const doc = getDayDoc(ds)
    setEditingDay(ds)
    setDf({
      feriado:       doc?.feriado||false,
      feriadoTJ:     doc?.feriadoTJ||false,
      feriadoName:   doc?.feriadoName||'',
      presencial:    doc?.presencial||[],
      balcao:        doc?.balcao||[],
      folgaCartorio: doc?.folgaCartorio||[],
      folgaGabinete: doc?.folgaGabinete||[],
      note:          doc?.note||'',
      alsoGroup:     false,
    })
    setAddPres(''); setAddPresH(''); setAddBal(''); setAddFolC(''); setAddFolG('')
    setShowDayPanel(true)
  }

  const saveDayDoc = async (data) => {
    const doc = getDayDoc(editingDay)
    if (doc) await updateDay(doc.id, { ...data, date: editingDay })
    else     await addDay({ ...data, date: editingDay })
    if (data.alsoGroup && data.note) {
      await addGroupEvent({ title: data.note, date: editingDay, color:'#534AB7', allDay:true, done:false })
    }
  }

  const commitDay = async () => {
    await saveDayDoc(df)
    setShowDayPanel(false)
  }

  // People helpers
  const savedPeople = peopleDocs.sort((a,b)=>a.name.localeCompare(b.name))
  const savePerson  = async () => {
    if (!personForm.name.trim()) return
    if (editPersonId) await updatePerson(editPersonId, personForm)
    else              await addPerson(personForm)
    setPersonForm({ name:'', color:'#534AB7', area:'cartorio' }); setEditPersonId(null); setShowPeopleModal(false)
  }

  // Birthday helpers
  const saveBday = async () => {
    if (!bdayForm.name.trim()||!bdayForm.date) return
    if (editBdayId) await updateBday(editBdayId, bdayForm)
    else            await addBday(bdayForm)
    setBdayForm({ name:'', date:'', group:'familia', remind:false }); setEditBdayId(null); setShowBdayModal(false)
  }

  // Holiday helpers
  const saveHoliday = async () => {
    if (!holForm.name.trim()||!holForm.date) return
    if (editHolId) await updateHoliday(editHolId, holForm)
    else           await addHoliday(holForm)
    setHolForm({ name:'', date:'', type:'feriado', repeat:false }); setEditHolId(null); setShowHolModal(false)
  }

  // Merge holidays + birthdays into date map
  const specialDays = useMemo(() => {
    const map = {}
    holidays.forEach(h => {
      const key = h.repeat ? h.date.slice(5) : h.date // MM-DD or YYYY-MM-DD
      if (!map[key]) map[key] = []
      map[key].push({ ...h, _type:'holiday' })
    })
    birthdays.forEach(b => {
      const key = b.date.slice(5) // MM-DD repeats every year
      if (!map[key]) map[key] = []
      map[key].push({ ...b, _type:'birthday' })
    })
    return map
  }, [holidays, birthdays])

  const getSpecialForDate = (ds) => {
    const mmdd = ds.slice(5)
    return [...(specialDays[ds]||[]), ...(specialDays[mmdd]||[])]
  }

  // ── Month grid ──────────────────────────────────────────────────────────────
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()

  const navigateMonth = (dir) => {
    let m = month+dir, y = year
    if (m<0){m=11;y--} if (m>11){m=0;y++}
    setMonth(m); setYear(y)
  }

  const navigateWeek = (dir) => {
    const d = new Date(weekStart+'T12:00')
    d.setDate(d.getDate()+dir*7)
    setWeekStart(fmt(d))
  }

  // Week days Mon-Fri
  const weekDays = useMemo(() => {
    const start = new Date(weekStart+'T12:00')
    return Array.from({length:5},(_,i)=>{ const d=new Date(start); d.setDate(d.getDate()+i); return fmt(d) })
  }, [weekStart])

  const renderDayCell = (ds, dayNum) => {
    const doc      = getDayDoc(ds)
    const specials = getSpecialForDate(ds)
    const isToday  = ds===todayDs
    const isSel    = ds===selDate
    const bgColor  = getDayColor(ds, doc, savedPeople)
    const isWeekd  = isWeekday(new Date(ds+'T12:00'))

    // holiday from holidays collection
    const holEntry = holidays.find(h=>h.date===ds||(h.repeat&&h.date.slice(5)===ds.slice(5)))
    if (holEntry && !doc) {
      // show holiday color on day bg
    }

    return (
      <div key={ds} onClick={()=>{ setSelDate(ds); openDayEditor(ds) }} style={{
        padding:'3px 2px', minHeight:44, cursor:'pointer', borderRadius:8, position:'relative',
        background: bgColor ? bgColor+'55' : isSel ? '#EEEDFE' : 'transparent',
        border: isToday ? '1.5px solid #534AB7' : isSel ? '1.5px solid #9B99C4' : '1.5px solid transparent',
        minWidth:0, boxSizing:'border-box', overflow:'hidden'
      }}>
        <div style={{ textAlign:'center', fontSize:12, fontWeight:isToday?700:400, color:isToday?'#534AB7':'#1a1a18' }}>{dayNum}</div>
        {/* Holiday dot */}
        {holEntry && <div style={{ width:6, height:6, borderRadius:'50%', background: holEntry.type==='feriadoTJ'?COLOR.feriadoTJ:COLOR.feriado, margin:'0 auto 1px' }}/>}
        {/* Birthday dots */}
        {specials.filter(s=>s._type==='birthday').slice(0,2).map((b,i)=>(
          <div key={i} style={{ fontSize:6, background:COLOR[b.group]||'#888', color:'#fff', borderRadius:3, padding:'1px 2px', marginBottom:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>🎂{b.name.split(' ')[0]}</div>
        ))}
        {/* Presencial mini */}
        {doc?.presencial?.slice(0,1).map((p,i)=>(
          <div key={i} style={{ fontSize:6, background: p.color||'#534AB7', color:'#fff', borderRadius:3, padding:'1px 2px', marginBottom:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{p.nome}</div>
        ))}
        {(doc?.presencial||[]).length>1 && <div style={{ fontSize:6, color:'#888', textAlign:'center' }}>+{doc.presencial.length-1}</div>}
      </div>
    )
  }

  // ── Week view ──────────────────────────────────────────────────────────────
  const renderWeekView = () => (
    <div style={{ overflowX:'auto', flex:1 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4, minWidth:500, padding:'0 2px' }}>
        {/* Headers */}
        {weekDays.map(ds=>{
          const d      = new Date(ds+'T12:00')
          const isT    = ds===todayDs
          const holE   = holidays.find(h=>h.date===ds||(h.repeat&&h.date.slice(5)===ds.slice(5)))
          const bgC    = getDayColor(ds, getDayDoc(ds), savedPeople)
          return (
            <div key={ds} onClick={()=>openDayEditor(ds)} style={{
              background: bgC?bgC+'44': isT?'#EEEDFE':'#f8f8f6', borderRadius:10, padding:'8px 6px',
              border: isT?'1.5px solid #534AB7':'1px solid #e4e2dc', cursor:'pointer', minWidth:0
            }}>
              <div style={{ fontSize:10, color:'#888', fontWeight:600, marginBottom:2 }}>{DAYS_SHORT[d.getDay()]}</div>
              <div style={{ fontSize:15, fontWeight:700, color:isT?'#534AB7':'#1a1a18', marginBottom:6 }}>{fmtDisplay(ds)}</div>
              {holE && <div style={{ fontSize:10, fontWeight:600, color:holE.type==='feriadoTJ'?COLOR.feriadoTJ:COLOR.feriado, marginBottom:4 }}>{holE.name}</div>}
              {renderWeekSection(ds,'presencial','Presencial','#E3F2FD','#0277BD')}
              {renderWeekSection(ds,'balcao','Balcão Virtual','#E8F5E9','#27500A')}
              {renderFolgaSection(ds)}
              {(() => {
                const bdays = getSpecialForDate(ds).filter(s=>s._type==='birthday')
                if (!bdays.length) return null
                return (
                  <div style={{ marginTop:4 }}>
                    {bdays.map((b,i)=>(
                      <div key={i} style={{ fontSize:9, background:COLOR[b.group]+'33', color:COLOR[b.group], borderRadius:4, padding:'2px 4px', marginBottom:2, fontWeight:600 }}>🎂 {b.name}</div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderWeekSection = (ds, field, label, bg, color) => {
    const doc  = getDayDoc(ds)
    const list = doc?.[field]||[]
    if (!list.length) return <div style={{ fontSize:9, color:'#bbb', marginBottom:4 }}>{label}: —</div>
    return (
      <div style={{ marginBottom:4 }}>
        <div style={{ fontSize:9, fontWeight:700, color, marginBottom:2 }}>{label}</div>
        {list.map((p,i)=>(
          <div key={i} style={{ fontSize:9, color: p.color||color, fontWeight:500 }}>
            {p.nome}{p.horario?` · ${p.horario}`:''}
          </div>
        ))}
      </div>
    )
  }

  const renderFolgaSection = (ds) => {
    const doc = getDayDoc(ds)
    const c   = doc?.folgaCartorio||[]
    const g   = doc?.folgaGabinete||[]
    if (!c.length&&!g.length) return null
    return (
      <div style={{ marginBottom:4 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'#888', marginBottom:2 }}>Folga/Lic/Férias</div>
        {c.length>0&&<div style={{ fontSize:9, color:'#888' }}>Cartório: {c.join(', ')}</div>}
        {g.length>0&&<div style={{ fontSize:9, color:'#888' }}>Gabinete: {g.join(', ')}</div>}
      </div>
    )
  }

  // ── Selected day detail ────────────────────────────────────────────────────
  const renderSelectedDay = () => {
    const doc      = getDayDoc(selDate)
    const specials = getSpecialForDate(selDate)
    const holE     = holidays.find(h=>h.date===selDate||(h.repeat&&h.date.slice(5)===selDate.slice(5)))
    const d        = new Date(selDate+'T12:00')
    const dayColor = getDayColor(selDate, doc, savedPeople)

    return (
      <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #e4e2dc', padding:'12px 14px', marginTop:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#1a1a18' }}>
              {d.getDate()} de {MONTHS_LONG[d.getMonth()]} · {DAYS_SHORT[d.getDay()]}
            </div>
            {dayColor && <div style={{ width:20, height:6, borderRadius:3, background:dayColor, marginTop:3 }}/>}
          </div>
          <button onClick={()=>openDayEditor(selDate)} style={{ background:'#534AB7', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', fontSize:12, cursor:'pointer' }}>✏️ Editar dia</button>
        </div>

        {holE && <div style={{ background: holE.type==='feriadoTJ'?COLOR.feriadoTJ+'33':COLOR.feriado+'33', borderRadius:8, padding:'6px 10px', marginBottom:8, fontSize:13, fontWeight:600, color: holE.type==='feriadoTJ'?'#CC0077':'#006600' }}>
          {holE.type==='feriadoTJ'?'🏛️ Feriado TJDFT':'🟢 Feriado'}: {holE.name}
        </div>}

        {specials.filter(s=>s._type==='birthday').map((b,i)=>(
          <div key={i} style={{ background:COLOR[b.group]+'22', borderRadius:8, padding:'6px 10px', marginBottom:6, fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16 }}>🎂</span>
            <span style={{ fontWeight:600, color:COLOR[b.group] }}>{b.name}</span>
            <span style={{ fontSize:10, color:'#888', background:COLOR[b.group]+'33', padding:'2px 6px', borderRadius:10 }}>{b.group==='familia'?'Família':b.group==='trabalho'?'Trabalho':'Amigos'}</span>
          </div>
        ))}

        {doc?.presencial?.length>0 && (
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#0277BD', marginBottom:4 }}>👔 Presencial</div>
            {doc.presencial.map((p,i)=>(
              <div key={i} style={{ fontSize:13, color:p.color||'#1a1a18', fontWeight:500 }}>{p.nome}{p.horario?` · ${p.horario}`:''}</div>
            ))}
          </div>
        )}
        {doc?.balcao?.length>0 && (
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#27500A', marginBottom:4 }}>💻 Balcão Virtual</div>
            {doc.balcao.map((p,i)=>(
              <div key={i} style={{ fontSize:13, color:p.color||'#1a1a18', fontWeight:500 }}>{p.nome}</div>
            ))}
          </div>
        )}
        {(doc?.folgaCartorio?.length>0||doc?.folgaGabinete?.length>0) && (
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#888', marginBottom:4 }}>🏖️ Folga / Licença / Férias</div>
            {doc?.folgaCartorio?.length>0&&<div style={{ fontSize:12, color:'#888' }}>Cartório: {doc.folgaCartorio.join(', ')}</div>}
            {doc?.folgaGabinete?.length>0&&<div style={{ fontSize:12, color:'#888' }}>Gabinete: {doc.folgaGabinete.join(', ')}</div>}
          </div>
        )}
        {doc?.note&&<div style={{ fontSize:12, color:'#888', background:'#f8f8f6', borderRadius:8, padding:'6px 10px' }}>📝 {doc.note}</div>}
        {!doc&&!holE&&specials.length===0&&<div style={{ fontSize:12, color:'#bbb', textAlign:'center', padding:'8px 0' }}>Nenhum registro para este dia</div>}
      </div>
    )
  }

  return (
    <div className="screen">
      {/* Top controls */}
      <div style={{ padding:'10px 14px 0', flexShrink:0, display:'flex', gap:6 }}>
        <button onClick={()=>setShowPeopleModal(true)} style={{ flex:1, padding:'8px', borderRadius:10, border:'0.5px solid #ddd', background:'#fff', fontSize:12, cursor:'pointer', color:'#534AB7', fontWeight:600 }}>👥 Pessoas</button>
        <button onClick={()=>setShowBdayModal(true)} style={{ flex:1, padding:'8px', borderRadius:10, border:'0.5px solid #ddd', background:'#fff', fontSize:12, cursor:'pointer', color:COLOR.amigos, fontWeight:600 }}>🎂 Aniversários</button>
        <button onClick={()=>setShowHolModal(true)} style={{ flex:1, padding:'8px', borderRadius:10, border:'0.5px solid #ddd', background:'#fff', fontSize:12, cursor:'pointer', color:'#006600', fontWeight:600 }}>📅 Feriados</button>
      </div>

      {/* View toggle + navigation */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px 0', flexShrink:0 }}>
        <div style={{ display:'flex', background:'#f0efe8', borderRadius:8, padding:2, flexShrink:0 }}>
          {[{v:'month',l:'Mês'},{v:'week',l:'Semana'}].map(x=>(
            <button key={x.v} onClick={()=>setView(x.v)} style={{ padding:'5px 12px', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:500, background:view===x.v?'#fff':'transparent', color:view===x.v?'#1a1a18':'#999' }}>{x.l}</button>
          ))}
        </div>
        {view==='month' ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'center' }}>
            <button onClick={()=>navigateMonth(-1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#534AB7' }}>‹</button>
            <span style={{ fontSize:14, fontWeight:700 }}>{MONTHS_LONG[month]} {year}</span>
            <button onClick={()=>navigateMonth(1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#534AB7' }}>›</button>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'center' }}>
            <button onClick={()=>navigateWeek(-1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#534AB7' }}>‹</button>
            <span style={{ fontSize:12, fontWeight:700 }}>{fmtDisplay(weekDays[0])} – {fmtDisplay(weekDays[4])}</span>
            <button onClick={()=>navigateWeek(1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#534AB7' }}>›</button>
          </div>
        )}
      </div>

      <div className="screen-scroll">
        {view==='month' && (
          <>
            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(0,1fr))', gap:1, marginBottom:0, marginTop:6 }}>
              {DAYS_SHORT.map(d=><div key={d} style={{ textAlign:'center', fontSize:10, color:'#bbb', padding:'2px 0' }}>{d}</div>)}
            </div>
            {/* Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(0,1fr))', gap:1 }}>
              {Array.from({length:firstDay},(_,i)=>(
                <div key={`p${i}`} style={{ padding:'4px 2px', minHeight:44, textAlign:'center', fontSize:11, color:'#e0ddd8' }}>{prevDays-firstDay+1+i}</div>
              ))}
              {Array.from({length:daysInMonth},(_,i)=>{
                const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`
                return renderDayCell(ds, i+1)
              })}
            </div>
            {renderSelectedDay()}
          </>
        )}
        {view==='week' && (
          <>
            {renderWeekView()}
            {renderSelectedDay()}
          </>
        )}
      </div>

      {/* ── DAY EDITOR PANEL ── */}
      {showDayPanel && editingDay && (
        <div className="modal-overlay" onClick={()=>setShowDayPanel(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{ maxHeight:'92vh', overflowY:'auto' }}>
            <div className="sheet-handle"/>
            <div className="sheet-title">
              {(() => { const d=new Date(editingDay+'T12:00'); return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} · ${DAYS_SHORT[d.getDay()]}` })()}
            </div>
            <div className="form-group">

              {/* Feriado toggles */}
              <div style={{ display:'flex', gap:8 }}>
                {[{f:'feriado',l:'🟢 Feriado',c:COLOR.feriado},{f:'feriadoTJ',l:'🏛️ Feriado TJDFT',c:COLOR.feriadoTJ}].map(x=>(
                  <button key={x.f} onClick={()=>setDf(p=>({...p,[x.f]:!p[x.f],feriadoTJ:x.f==='feriadoTJ'?!p[x.f]:p.feriadoTJ,feriado:x.f==='feriado'?!p[x.f]:p.feriado}))} style={{
                    flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${df[x.f]?x.c:'#eee'}`,
                    background:df[x.f]?x.c+'33':'#f8f8f6', fontSize:12, cursor:'pointer', fontWeight:df[x.f]?700:400, color:df[x.f]?x.c:'#888'
                  }}>{x.l}</button>
                ))}
              </div>
              {(df.feriado||df.feriadoTJ) && (
                <input type="text" placeholder="Nome do feriado" value={df.feriadoName} onChange={e=>setDf(p=>({...p,feriadoName:e.target.value}))}/>
              )}

              {/* Presencial */}
              <div>
                <label className="form-label">👔 Presencial</label>
                {df.presencial.map((p,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 8px', background:'#E3F2FD', borderRadius:8, marginBottom:4 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:p.color||'#534AB7', flexShrink:0 }}/>
                    <span style={{ flex:1, fontSize:13, color:p.color||'#1a1a18' }}>{p.nome}{p.horario?` · ${p.horario}`:''}</span>
                    <button onClick={()=>setDf(p2=>({...p2,presencial:p2.presencial.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:14 }}>×</button>
                  </div>
                ))}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {/* Quick add from saved people */}
                  {savedPeople.filter(p=>!df.presencial.find(x=>x.nome===p.name)).map(p=>(
                    <button key={p.id} onClick={()=>setDf(prev=>({...prev,presencial:[...prev.presencial,{nome:p.name,color:p.color,horario:'12h às 19h'}]}))}
                      style={{ padding:'4px 10px', borderRadius:20, border:`1px solid ${p.color||'#ddd'}`, background:p.color+'22', color:p.color||'#534AB7', fontSize:11, cursor:'pointer' }}>+ {p.name}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <input type="text" placeholder="Nome" value={addPres} onChange={e=>setAddPres(e.target.value)} style={{ flex:1 }}/>
                  <input type="text" placeholder="Horário (ex: 12h às 19h)" value={addPresH} onChange={e=>setAddPresH(e.target.value)} style={{ flex:1 }}/>
                  <button onClick={()=>{ if(!addPres.trim()) return; setDf(p=>({...p,presencial:[...p.presencial,{nome:addPres.trim(),horario:addPresH.trim(),color:'#0277BD'}]})); setAddPres(''); setAddPresH('') }}
                    style={{ background:'#0277BD', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, cursor:'pointer' }}>+</button>
                </div>
              </div>

              {/* Balcão */}
              <div>
                <label className="form-label">💻 Balcão Virtual</label>
                {df.balcao.map((p,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 8px', background:'#E8F5E9', borderRadius:8, marginBottom:4 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:p.color||'#27500A', flexShrink:0 }}/>
                    <span style={{ flex:1, fontSize:13, color:p.color||'#1a1a18' }}>{p.nome}</span>
                    <button onClick={()=>setDf(p2=>({...p2,balcao:p2.balcao.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:14 }}>×</button>
                  </div>
                ))}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {savedPeople.filter(p=>!df.balcao.find(x=>x.nome===p.name)).map(p=>(
                    <button key={p.id} onClick={()=>setDf(prev=>({...prev,balcao:[...prev.balcao,{nome:p.name,color:p.color}]}))}
                      style={{ padding:'4px 10px', borderRadius:20, border:`1px solid ${p.color||'#ddd'}`, background:p.color+'22', color:p.color||'#27500A', fontSize:11, cursor:'pointer' }}>+ {p.name}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <input type="text" placeholder="Nome" value={addBal} onChange={e=>setAddBal(e.target.value)} style={{ flex:1 }}/>
                  <button onClick={()=>{ if(!addBal.trim()) return; setDf(p=>({...p,balcao:[...p.balcao,{nome:addBal.trim(),color:'#27500A'}]})); setAddBal('') }}
                    style={{ background:'#27500A', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, cursor:'pointer' }}>+</button>
                </div>
              </div>

              {/* Folga Cartório */}
              <div>
                <label className="form-label">🏖️ Folga / Licença / Férias — Cartório</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                  {df.folgaCartorio.map((n,i)=>(
                    <span key={i} style={{ fontSize:12, background:'#f0efe8', borderRadius:20, padding:'3px 10px', display:'flex', alignItems:'center', gap:4 }}>
                      {n}<button onClick={()=>setDf(p=>({...p,folgaCartorio:p.folgaCartorio.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:12, padding:0 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <input type="text" placeholder="Nome" value={addFolC} onChange={e=>setAddFolC(e.target.value)} style={{ flex:1 }}/>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {savedPeople.map(p=>(
                      <button key={p.id} onClick={()=>{ if(!df.folgaCartorio.includes(p.name)) setDf(prev=>({...prev,folgaCartorio:[...prev.folgaCartorio,p.name]})) }}
                        style={{ padding:'4px 8px', borderRadius:20, border:`1px solid ${p.color||'#ddd'}`, background:p.color+'22', color:p.color||'#888', fontSize:10, cursor:'pointer' }}>{p.name}</button>
                    ))}
                  </div>
                  <button onClick={()=>{ if(!addFolC.trim()) return; setDf(p=>({...p,folgaCartorio:[...p.folgaCartorio,addFolC.trim()]})); setAddFolC('') }}
                    style={{ background:'#888', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, cursor:'pointer' }}>+</button>
                </div>
              </div>

              {/* Folga Gabinete */}
              <div>
                <label className="form-label">🏖️ Folga / Licença / Férias — Gabinete</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                  {df.folgaGabinete.map((n,i)=>(
                    <span key={i} style={{ fontSize:12, background:'#f0efe8', borderRadius:20, padding:'3px 10px', display:'flex', alignItems:'center', gap:4 }}>
                      {n}<button onClick={()=>setDf(p=>({...p,folgaGabinete:p.folgaGabinete.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:12, padding:0 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <input type="text" placeholder="Nome" value={addFolG} onChange={e=>setAddFolG(e.target.value)} style={{ flex:1 }}/>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {savedPeople.map(p=>(
                      <button key={p.id} onClick={()=>{ if(!df.folgaGabinete.includes(p.name)) setDf(prev=>({...prev,folgaGabinete:[...prev.folgaGabinete,p.name]})) }}
                        style={{ padding:'4px 8px', borderRadius:20, border:`1px solid ${p.color||'#ddd'}`, background:p.color+'22', color:p.color||'#888', fontSize:10, cursor:'pointer' }}>{p.name}</button>
                    ))}
                  </div>
                  <button onClick={()=>{ if(!addFolG.trim()) return; setDf(p=>({...p,folgaGabinete:[...p.folgaGabinete,addFolG.trim()]})); setAddFolG('') }}
                    style={{ background:'#888', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, cursor:'pointer' }}>+</button>
                </div>
              </div>

              {/* Note + also group */}
              <div>
                <label className="form-label">📝 Observação</label>
                <input type="text" placeholder="Anotação livre..." value={df.note} onChange={e=>setDf(p=>({...p,note:e.target.value}))}/>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={df.alsoGroup} onChange={e=>setDf(p=>({...p,alsoGroup:e.target.checked}))}/>
                Também adicionar ao calendário do grupo
              </label>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>setShowDayPanel(false)}>Cancelar</button>
              <button className="btn-primary" onClick={commitDay}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PEOPLE MODAL ── */}
      {showPeopleModal && (
        <div className="modal-overlay" onClick={()=>{ setShowPeopleModal(false); setEditPersonId(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Pessoas cadastradas</div>
            <div className="form-group">
              {savedPeople.map(p=>(
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'0.5px solid #f0efe8' }}>
                  <div style={{ width:14, height:14, borderRadius:'50%', background:p.color||'#534AB7', flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:13 }}>{p.name}</span>
                  <span style={{ fontSize:10, color:'#888', background:'#f0efe8', padding:'2px 8px', borderRadius:10 }}>{p.area}</span>
                  <button onClick={()=>{ setPersonForm({name:p.name,color:p.color,area:p.area}); setEditPersonId(p.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13 }}>✏️</button>
                  <button onClick={()=>removePerson(p.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16 }}>×</button>
                </div>
              ))}
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:8 }}>+ Nova pessoa</div>
                <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <input type="text" placeholder="Nome" value={personForm.name} onChange={e=>setPersonForm(p=>({...p,name:e.target.value}))} style={{ flex:1 }}/>
                  <input type="color" value={personForm.color} onChange={e=>setPersonForm(p=>({...p,color:e.target.value}))} style={{ width:40, height:36, borderRadius:8, border:'none', cursor:'pointer', padding:2 }}/>
                </div>
                <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                  {['cartorio','gabinete'].map(a=>(
                    <button key={a} onClick={()=>setPersonForm(p=>({...p,area:a}))} style={{ flex:1, padding:'6px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, background:personForm.area===a?'#534AB7':'#f0efe8', color:personForm.area===a?'#fff':'#888' }}>{a==='cartorio'?'Cartório':'Gabinete'}</button>
                  ))}
                </div>
                <button onClick={savePerson} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background:'#534AB7', color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600 }}>{editPersonId?'Salvar alteração':'+ Adicionar'}</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{ setShowPeopleModal(false); setEditPersonId(null) }} style={{ marginTop:8 }}>Fechar</button>
          </div>
        </div>
      )}

      {/* ── BIRTHDAY MODAL ── */}
      {showBdayModal && (
        <div className="modal-overlay" onClick={()=>{ setShowBdayModal(false); setEditBdayId(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">🎂 Aniversários</div>
            <div className="form-group">
              {['familia','trabalho','amigos'].map(g=>{
                const list = birthdays.filter(b=>b.group===g).sort((a,b)=>a.date.slice(5).localeCompare(b.date.slice(5)))
                if (!list.length) return null
                return (
                  <div key={g} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:COLOR[g], marginBottom:4 }}>{g==='familia'?'👨‍👩‍👧 Família':g==='trabalho'?'💼 Trabalho':'👫 Amigos'}</div>
                    {list.map(b=>(
                      <div key={b.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'0.5px solid #f0efe8' }}>
                        <span style={{ flex:1, fontSize:13 }}>{b.name}</span>
                        <span style={{ fontSize:11, color:'#888' }}>{b.date.slice(5).split('-').reverse().join('/')}</span>
                        {b.remind&&<span style={{ fontSize:10, color:'#534AB7' }}>🔔</span>}
                        <button onClick={()=>{ setBdayForm({name:b.name,date:b.date,group:b.group,remind:b.remind||false}); setEditBdayId(b.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13 }}>✏️</button>
                        <button onClick={()=>removeBday(b.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16 }}>×</button>
                      </div>
                    ))}
                  </div>
                )
              })}
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:8 }}>+ Novo aniversário</div>
                <input type="text" placeholder="Nome" value={bdayForm.name} onChange={e=>setBdayForm(p=>({...p,name:e.target.value}))}/>
                <input type="date" value={bdayForm.date} onChange={e=>setBdayForm(p=>({...p,date:e.target.value}))}/>
                <div style={{ display:'flex', gap:6 }}>
                  {[{v:'familia',l:'👨‍👩‍👧 Família'},{v:'trabalho',l:'💼 Trabalho'},{v:'amigos',l:'👫 Amigos'}].map(x=>(
                    <button key={x.v} onClick={()=>setBdayForm(p=>({...p,group:x.v}))} style={{ flex:1, padding:'6px 4px', borderRadius:8, border:`1.5px solid ${bdayForm.group===x.v?COLOR[x.v]:'#eee'}`, background:bdayForm.group===x.v?COLOR[x.v]+'22':'#f8f8f6', color:COLOR[x.v], fontSize:11, cursor:'pointer', fontWeight:bdayForm.group===x.v?700:400 }}>{x.l}</button>
                  ))}
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                  <input type="checkbox" checked={bdayForm.remind} onChange={e=>setBdayForm(p=>({...p,remind:e.target.checked}))}/>
                  🔔 Lembrete com 1 semana de antecedência
                </label>
                <button onClick={saveBday} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background:COLOR[bdayForm.group], color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600, marginTop:4 }}>{editBdayId?'Salvar':'+ Adicionar'}</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{ setShowBdayModal(false); setEditBdayId(null) }} style={{ marginTop:8 }}>Fechar</button>
          </div>
        </div>
      )}

      {/* ── HOLIDAYS MODAL ── */}
      {showHolModal && (
        <div className="modal-overlay" onClick={()=>{ setShowHolModal(false); setEditHolId(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">📅 Feriados</div>
            <div className="form-group">
              {[...holidays].sort((a,b)=>a.date.localeCompare(b.date)).map(h=>(
                <div key={h.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'0.5px solid #f0efe8' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:h.type==='feriadoTJ'?COLOR.feriadoTJ:COLOR.feriado, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13 }}>{h.name}</div>
                    <div style={{ fontSize:10, color:'#888' }}>{h.date}{h.repeat?' · repete todo ano':''} · {h.type==='feriadoTJ'?'TJDFT':'Geral'}</div>
                  </div>
                  <button onClick={()=>{ setHolForm({name:h.name,date:h.date,type:h.type,repeat:h.repeat||false}); setEditHolId(h.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13 }}>✏️</button>
                  <button onClick={()=>removeHoliday(h.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16 }}>×</button>
                </div>
              ))}
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:8 }}>+ Novo feriado</div>
                <input type="text" placeholder="Nome do feriado" value={holForm.name} onChange={e=>setHolForm(p=>({...p,name:e.target.value}))}/>
                <input type="date" value={holForm.date} onChange={e=>setHolForm(p=>({...p,date:e.target.value}))}/>
                <div style={{ display:'flex', gap:6 }}>
                  {[{v:'feriado',l:'🟢 Feriado',c:COLOR.feriado},{v:'feriadoTJ',l:'🏛️ Feriado TJDFT',c:COLOR.feriadoTJ}].map(x=>(
                    <button key={x.v} onClick={()=>setHolForm(p=>({...p,type:x.v}))} style={{ flex:1, padding:'7px', borderRadius:8, border:`1.5px solid ${holForm.type===x.v?x.c:'#eee'}`, background:holForm.type===x.v?x.c+'33':'#f8f8f6', color:x.c, fontSize:12, cursor:'pointer', fontWeight:holForm.type===x.v?700:400 }}>{x.l}</button>
                  ))}
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                  <input type="checkbox" checked={holForm.repeat} onChange={e=>setHolForm(p=>({...p,repeat:e.target.checked}))}/>
                  Repetir todo ano
                </label>
                <button onClick={saveHoliday} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background:'#534AB7', color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600, marginTop:4 }}>{editHolId?'Salvar':'+ Adicionar'}</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{ setShowHolModal(false); setEditHolId(null) }} style={{ marginTop:8 }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
