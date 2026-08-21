import { useState } from 'react'
import { useData } from '../useData.js'
import { useAuth } from '../AuthContext.jsx'

const MONTHS   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_S = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CATS_IN  = ['Freelance','Investimentos','Outros','Presente','Renda extra','Salário'].sort()
const CATS_OUT = ['Alimentação','Assinaturas','Cartão','Contas','Educação','Emprestado','Lazer','Moradia','Outros','Roupas','Saúde','Transporte'].sort()
const CAT_ICONS = { Salário:'💼',Freelance:'💻','Renda extra':'💡',Investimentos:'📈',Presente:'🎁',Moradia:'🏠',Alimentação:'🛒',Transporte:'🚗',Saúde:'💊',Educação:'📚',Lazer:'🎬',Roupas:'👕',Contas:'⚡',Assinaturas:'📱',Cartão:'💳',Emprestado:'🤝',Outros:'📌' }
const fmtBRL  = v => 'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2})
const fmtDate = str => { const d=new Date(str+'T12:00'); return `${d.getDate()} ${MONTHS_S[d.getMonth()]}` }
const todayStr = () => new Date().toISOString().split('T')[0]
const ROW_COLORS = [
  {v:'#ffffff'},{v:'#FFF3E0'},{v:'#E8F5E9'},{v:'#E3F2FD'},
  {v:'#FCE4EC'},{v:'#EDE7F6'},{v:'#FFFDE7'},{v:'#F3E5F5'},{v:'#E0F7FA'},{v:'#FAFAFA'},
]

function buildCycles(cycleDay, year) {
  return Array.from({length:12},(_,m)=>{
    const start = new Date(year,m,cycleDay)
    const end   = new Date(year,m+1,cycleDay-1)
    return {
      key:   `${year}-${String(m+1).padStart(2,'0')}`,
      monthIndex: m,
      label: MONTHS[m],
      start: start.toISOString().split('T')[0],
      end:   end.toISOString().split('T')[0],
    }
  })
}

function txInCycle(t,cycle){ return t.date>=cycle.start && t.date<=cycle.end }

export default function FinanceScreen({
  scope='group',
  txCollection='transactions',
  settingsCollection='financeSettings',
  trackerCollection='financeTracker',
  trackerSettingsCollection='financeTrackerSettings',
  sobrasCollection='financeSobras'
}) {
  const { group } = useAuth()
  const { items:transactions, add, update, remove }                         = useData(txCollection,              scope)
  const { items:cycleDocs,    add:addCycle,  update:updateCycle }           = useData(settingsCollection,         scope)
  const { items:trackerRows,  add:addRow,    update:updateRow, remove:removeRow } = useData(trackerCollection,        scope)
  const { items:sobrasData,   add:addSobra,  update:updateSobra }                 = useData(sobrasCollection,          scope)
  const { items:trackerSettings, add:addTrSet, update:updateTrSet }               = useData(trackerSettingsCollection, scope)
  const { items:cycleNames,   add:addCName,  update:updateCName }                 = useData(settingsCollection+'Names', scope)

  const cycleDay    = cycleDocs[0]?.cycleDay || 1
  const setCycleDay = async v => {
    if (cycleDocs[0]) await updateCycle(cycleDocs[0].id,{cycleDay:v})
    else              await addCycle({cycleDay:v})
  }

  const members = group?.members || []
  const year    = new Date().getFullYear()
  const cycles  = buildCycles(cycleDay, year)
  const today   = todayStr()
  const curCycle= cycles.find(c=>today>=c.start&&today<=c.end)||cycles[new Date().getMonth()]

  const [subTab,    setSubTab]    = useState('transactions')
  const [showForm,  setShowForm]  = useState(false)
  const [showCycle, setShowCycle] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [form,      setForm]      = useState({type:'out',desc:'',amount:'',date:todayStr(),category:'Outros',responsible:''})
  const [newCycle,  setNewCycle]  = useState(cycleDay)
  const [expandedTx,  setExpandedTx]  = useState({[curCycle?.key]:true})
  const [expandedTr,  setExpandedTr]  = useState({[curCycle?.key]:true})
  const [editCName,   setEditCName]   = useState(null)
  const [cNameVal,    setCNameVal]    = useState('')
  const [editRowId,   setEditRowId]   = useState(null)
  const [newRowForm,  setNewRowForm]  = useState({date:'',text:'',amount:'',color:'#ffffff'})
  const [trTitleEdit, setTrTitleEdit] = useState(false)
  const [trTitle,     setTrTitle]     = useState('')

  const savedTitle = trackerSettings[0]?.title||'Controle do Cartão'

  const getCName = key => cycleNames.find(c=>c.cycleKey===key)?.name||''
  const saveCName = async (key,name) => {
    const ex = cycleNames.find(c=>c.cycleKey===key)
    if (ex) await updateCName(ex.id,{name})
    else    await addCName({cycleKey:key,name})
    setEditCName(null)
  }

  const cycleLabel = c => {
    const n    = getCName(c.key)
    const base = cycleDay===1 ? MONTHS[c.monthIndex] : `${fmtDate(c.start)} – ${fmtDate(c.end)}`
    return n ? `${n} (${base})` : base
  }

  const openEdit = t => {
    setEditItem(t)
    setForm({type:t.type,desc:t.desc,amount:String(t.amount),date:t.date,category:t.category,responsible:t.responsible||''})
    setShowForm(true)
  }

  const save = async () => {
    const amt = parseFloat(form.amount)
    if (!form.desc||!amt) return
    if (editItem) await update(editItem.id,{...form,amount:amt})
    else          await add({...form,amount:amt})
    setForm({type:'out',desc:'',amount:'',date:todayStr(),category:'Outros',responsible:''})
    setEditItem(null); setShowForm(false)
  }

  const saveRow = async cycleKey => {
    if (!newRowForm.text.trim()&&!newRowForm.amount) return
    await addRow({...newRowForm,amount:parseFloat(newRowForm.amount)||0,cycleKey})
    setNewRowForm({date:'',text:'',amount:'',color:'#ffffff'})
  }

  const saveTrTitle = async () => {
    const t = trTitle.trim()||'Controle do Cartão'
    if (trackerSettings[0]) await updateTrSet(trackerSettings[0].id,{title:t})
    else                    await addTrSet({title:t})
    setTrTitleEdit(false)
  }

  return (
    <div className="screen">
      {subTab==='transactions' && (
        <div style={{padding:'10px 14px 0',flexShrink:0}}>
          <button onClick={()=>{setEditItem(null);setForm({type:'out',desc:'',amount:'',date:todayStr(),category:'Outros',responsible:''});setShowForm(true)}} style={{width:'100%',padding:'11px',borderRadius:12,border:'none',background:'#534AB7',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>＋ Nova transação</button>
        </div>
      )}

      <div style={{display:'flex',gap:0,margin:'10px 14px 0',background:'#f0efe8',borderRadius:10,padding:3,flexShrink:0}}>
        {[{v:'transactions',l:'💰 Transações'},{v:'tracker',l:'📋 Controle'},{v:'sobras',l:'💸 Sobras'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{flex:1,padding:'8px 4px',border:'none',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:500,background:subTab===x.v?'#fff':'transparent',color:subTab===x.v?'#1a1a18':'#999',boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'}}>{x.l}</button>
        ))}
      </div>

      {/* TRANSACTIONS */}
      {subTab==='transactions' && (
        <div className="screen-scroll">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8,marginTop:6}}>
            <button onClick={()=>setShowCycle(true)} style={{background:'#f0efe8',border:'none',borderRadius:8,padding:'5px 12px',fontSize:11,color:'#555',cursor:'pointer'}}>📅 Ciclo: dia {cycleDay}</button>
          </div>
          {[...cycles].reverse().map(cycle=>{
            const txs = transactions.filter(t=>txInCycle(t,cycle))
            if (!txs.length) return null
            const inc  = txs.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount,0)
            const exp  = txs.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount,0)
            const bal  = inc-exp
            const open = expandedTx[cycle.key]!==false
            const isCur= cycle.key===curCycle?.key
            const name = getCName(cycle.key)
            return (
              <div key={cycle.key} style={{marginBottom:10,border:'0.5px solid #e4e2dc',borderRadius:12,overflow:'hidden'}}>
                <div style={{background:isCur?'#534AB7':'#f0efe8',padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
                  {editCName===cycle.key ? (
                    <>
                      <input value={cNameVal} onChange={e=>setCNameVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveCName(cycle.key,cNameVal)} autoFocus placeholder="Nome do ciclo" style={{flex:1,fontSize:12,padding:'4px 8px',borderRadius:6}}/>
                      <button onClick={()=>saveCName(cycle.key,cNameVal)} style={{background:'#534AB7',border:'none',borderRadius:6,padding:'4px 10px',color:'#fff',fontSize:11,cursor:'pointer'}}>✓</button>
                      <button onClick={()=>setEditCName(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:14}}>✕</button>
                    </>
                  ) : (
                    <>
                      <div style={{flex:1,cursor:'pointer'}} onClick={()=>setExpandedTx(p=>({...p,[cycle.key]:!open}))}>
                        <div style={{fontSize:13,fontWeight:700,color:isCur?'#fff':'#1a1a18'}}>{name||cycleLabel(cycle)}</div>
                        {name&&<div style={{fontSize:10,color:isCur?'#fff9':'#888'}}>{fmtDate(cycle.start)} – {fmtDate(cycle.end)}</div>}
                        <div style={{fontSize:11,color:isCur?'#fff9':'#888',marginTop:1}}>
                          ↑{fmtBRL(inc)} · ↓{fmtBRL(exp)} · <span style={{fontWeight:600,color:bal>=0?(isCur?'#a5d6a7':'#27500A'):'#E24B4A'}}>{bal>=0?'+':''}{fmtBRL(bal)}</span>
                        </div>
                      </div>
                      <button onClick={()=>{setEditCName(cycle.key);setCNameVal(name)}} style={{background:'none',border:'none',cursor:'pointer',color:isCur?'#fff9':'#bbb',fontSize:12,padding:'0 4px'}}>✏️</button>
                      <span onClick={()=>setExpandedTx(p=>({...p,[cycle.key]:!open}))} style={{color:isCur?'#fff9':'#888',cursor:'pointer',fontSize:12,padding:'0 4px'}}>{open?'▲':'▼'}</span>
                    </>
                  )}
                </div>
                {open&&(
                  <div>
                    {[...txs].sort((a,b)=>{const dc=a.date.localeCompare(b.date);return dc!==0?dc:(a.desc||'').localeCompare(b.desc||'')}).map(t=>(
                      <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderBottom:'0.5px solid #f0efe8'}}>
                        <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:t.type==='in'?'#EAF3DE':'#FCEBEB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{CAT_ICONS[t.category]||(t.type==='in'?'↑':'↓')}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500}}>{t.desc}</div>
                          <div style={{fontSize:11,color:'#bbb'}}>{fmtDate(t.date)} · {t.category}{t.responsible?' · '+t.responsible:''}</div>
                        </div>
                        <span style={{fontSize:13,fontWeight:600,color:t.type==='in'?'#27500A':'#A32D2D'}}>{t.type==='in'?'+':'-'}{fmtBRL(t.amount)}</span>
                        <button onClick={()=>openEdit(t)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:13}}>✏️</button>
                        <button onClick={()=>remove(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* TRACKER */}
      {subTab==='tracker' && (
        <div className="screen-scroll">
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8,marginBottom:10}}>
            {trTitleEdit ? (
              <>
                <input value={trTitle} onChange={e=>setTrTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveTrTitle()} autoFocus style={{flex:1,fontWeight:700,fontSize:14}}/>
                <button onClick={saveTrTitle} style={{background:'#534AB7',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',fontSize:12,cursor:'pointer'}}>✓</button>
                <button onClick={()=>setTrTitleEdit(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#888'}}>✕</button>
              </>
            ) : (
              <>
                <div style={{flex:1,fontWeight:700,fontSize:14,color:'#1a1a18'}}>{savedTitle}</div>
                <button onClick={()=>{setTrTitle(savedTitle);setTrTitleEdit(true)}} style={{background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:14}}>✏️</button>
              </>
            )}
          </div>
          {[...cycles].reverse().map(cycle=>{
            const rows   = trackerRows.filter(r=>(r.cycleKey||curCycle?.key)===cycle.key)
            const total  = rows.reduce((s,r)=>s+(parseFloat(r.amount)||0),0)
            const open   = expandedTr[cycle.key]!==false
            const isCur  = cycle.key===curCycle?.key
            const name   = getCName(cycle.key)
            const pending= rows.some(r=>!r.checked)
            // Always show current cycle; show past cycles if they have data
            if (!rows.length&&!isCur) return null
            return (
              <div key={cycle.key} style={{marginBottom:10,border:'0.5px solid #e4e2dc',borderRadius:12,overflow:'hidden'}}>
                <div style={{background:isCur?'#534AB7':'#f0efe8',padding:'10px 12px',display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>setExpandedTr(p=>({...p,[cycle.key]:!open}))}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:isCur?'#fff':'#1a1a18'}}>
                      {name||cycleLabel(cycle)}
                      {pending&&<span style={{marginLeft:8,fontSize:10,background:'#E24B4A',color:'#fff',borderRadius:10,padding:'2px 7px'}}>pendente</span>}
                    </div>
                    <div style={{fontSize:11,color:isCur?'#fff9':'#888',marginTop:1}}>Total: {fmtBRL(total)}</div>
                  </div>
                  <span style={{color:isCur?'#fff9':'#888',fontSize:12}}>{open?'▲':'▼'}</span>
                </div>
                {open&&(
                  <>
                    {isCur&&(
                      <div style={{background:'#EEEDFE',padding:'10px 12px',borderBottom:'0.5px solid #ddd'}}>
                        <div style={{fontSize:11,color:'#534AB7',fontWeight:600,marginBottom:6}}>＋ Nova linha</div>
                        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
                          <input type="text" placeholder="DD/MM" value={newRowForm.date} onChange={e=>setNewRowForm({...newRowForm,date:e.target.value})} style={{width:70,flexShrink:0}}/>
                          <input type="text" placeholder="Descrição" value={newRowForm.text} onChange={e=>setNewRowForm({...newRowForm,text:e.target.value})} style={{flex:1,minWidth:100}}/>
                          <input type="number" placeholder="R$ 0" step="0.01" value={newRowForm.amount} onChange={e=>setNewRowForm({...newRowForm,amount:e.target.value})} style={{width:90,flexShrink:0}}/>
                        </div>
                        <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap'}}>
                          {ROW_COLORS.map(c=>(
                            <div key={c.v} onClick={()=>setNewRowForm({...newRowForm,color:c.v})} style={{width:20,height:20,borderRadius:5,background:c.v,cursor:'pointer',border:newRowForm.color===c.v?'2.5px solid #534AB7':'1.5px solid #ddd'}}/>
                          ))}
                          <button onClick={()=>saveRow(cycle.key)} style={{background:'#534AB7',border:'none',borderRadius:8,padding:'6px 14px',color:'#fff',fontSize:12,cursor:'pointer',marginLeft:'auto'}}>Adicionar</button>
                        </div>
                      </div>
                    )}
                    <div style={{display:'grid',gridTemplateColumns:'55px 1fr 85px 28px',background:'#534AB7',padding:'7px 10px'}}>
                      {['Data','Descrição','Valor','✓'].map(h=><div key={h} style={{fontSize:10,fontWeight:700,color:'#fff',textAlign:h==='Valor'||h==='✓'?'right':'left'}}>{h}</div>)}
                    </div>
                    {[...rows].sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(parseFloat(b.amount)||0)-(parseFloat(a.amount)||0)).map(row=>(
                      <div key={row.id} style={{display:'grid',gridTemplateColumns:'55px 1fr 85px 28px',background:!row.checked?(row.color==='#ffffff'||!row.color?'#FFF8E1':row.color):(row.color||'#fff'),padding:'8px 10px',borderBottom:'0.5px solid #e4e2dc',alignItems:'center',borderLeft:!row.checked?'3px solid #BA7517':'3px solid transparent'}}>
                        {editRowId===row.id ? (
                          <>
                            <input type="text" defaultValue={row.date} id={`rd-${row.id}`} style={{fontSize:11,padding:'3px',border:'0.5px solid #ccc',borderRadius:4}}/>
                            <input type="text" defaultValue={row.text} id={`rt-${row.id}`} style={{fontSize:12,padding:'3px',border:'0.5px solid #ccc',borderRadius:4,margin:'0 4px'}}/>
                            <input type="number" defaultValue={row.amount} id={`ra-${row.id}`} style={{fontSize:12,padding:'3px',border:'0.5px solid #ccc',borderRadius:4,textAlign:'right'}}/>
                            <div style={{display:'flex',flexDirection:'column',gap:2,alignItems:'flex-end'}}>
                              <button onClick={async()=>{await updateRow(row.id,{date:document.getElementById(`rd-${row.id}`).value,text:document.getElementById(`rt-${row.id}`).value,amount:parseFloat(document.getElementById(`ra-${row.id}`).value)||0});setEditRowId(null)}} style={{background:'#534AB7',border:'none',borderRadius:4,padding:'2px 6px',color:'#fff',fontSize:10,cursor:'pointer'}}>✓</button>
                              <button onClick={()=>setEditRowId(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:12}}>✕</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{fontSize:11,color:'#888'}}>{row.date||'—'}</div>
                            <div style={{fontSize:13,textDecoration:row.checked?'line-through':'none',color:row.checked?'#bbb':'#1a1a18',display:'flex',alignItems:'center',gap:4}}>
                              <span style={{flex:1}}>{row.text}</span>
                              <button onClick={()=>setEditRowId(row.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11,padding:0}}>✏️</button>
                              <button onClick={()=>removeRow(row.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:14,padding:0}}>×</button>
                            </div>
                            <div style={{fontSize:13,fontWeight:600,textAlign:'right',color:row.checked?'#bbb':'#1a1a18',textDecoration:row.checked?'line-through':'none'}}>{row.amount>0?fmtBRL(row.amount):'—'}</div>
                            <div style={{textAlign:'right'}}>
                              <div onClick={()=>updateRow(row.id,{checked:!row.checked})} style={{width:20,height:20,borderRadius:4,border:'1.5px solid #ccc',background:row.checked?'#534AB7':'#fff',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}}>{row.checked?'✓':''}</div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div style={{display:'grid',gridTemplateColumns:'55px 1fr 85px 28px',background:'#f0efe8',padding:'9px 10px',borderTop:'2px solid #534AB7'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#534AB7',gridColumn:'1/3'}}>TOTAL</div>
                      <div style={{fontSize:13,fontWeight:800,color:'#534AB7',textAlign:'right'}}>{fmtBRL(total)}</div>
                      <div/>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* SOBRAS */}
      {subTab==='sobras' && (
        <div className="screen-scroll">
          <div style={{fontSize:12,color:'#888',marginBottom:12,marginTop:8}}>Controle de sobras por ciclo · percentuais editáveis</div>
          {[...cycles].reverse().map(cycle=>{
            const key  = cycle.key
            const doc  = sobrasData.find(d=>d.monthKey===key)||{}
            const sv   = async (f,v)=>{ if(doc.id) await updateSobra(doc.id,{[f]:v}); else await addSobra({monthKey:key,[f]:v}) }
            const sob  = parseFloat(doc.sobrou)||0
            const pg   = parseFloat(doc.pctGasto)||50
            const pl   = parseFloat(doc.pctLivre)||30
            const pi   = parseFloat(doc.pctInvest)||20
            const tot  = pg+pl+pi
            const isOpen = doc.open!==false
            const isCur  = key===curCycle?.key
            const name   = getCName(key)
            return (
              <div key={key} style={{marginBottom:10,border:'0.5px solid #eee',borderRadius:12,overflow:'hidden'}}>
                <div onClick={async()=>{if(doc.id)await updateSobra(doc.id,{open:!isOpen});else await addSobra({monthKey:key,open:false})}}
                  style={{background:isCur?'#534AB7':'#888',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{name||cycleLabel(cycle)}</span>
                    {sob>0&&<span style={{fontSize:11,color:'#fff9',marginLeft:8}}>Sobrou: {fmtBRL(sob)}</span>}
                  </div>
                  <span style={{color:'#fff9',fontSize:12}}>{isOpen?'▲':'▼'}</span>
                </div>
                {isOpen&&(
                  <div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',padding:'10px 12px',background:'#FCEBEB',alignItems:'center',borderBottom:'0.5px solid #eee'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'#791F1F'}}>Sobrou neste ciclo</span>
                      <input type="number" placeholder="R$ 0" defaultValue={doc.sobrou||''} onBlur={e=>sv('sobrou',parseFloat(e.target.value)||0)} style={{textAlign:'right',fontWeight:700,fontSize:13,border:'none',background:'transparent',color:'#791F1F',width:'100%'}}/>
                    </div>
                    <div style={{padding:'10px 12px',background:'#f8f8f6',borderBottom:'0.5px solid #eee'}}>
                      <div style={{fontSize:11,color:'#888',fontWeight:600,marginBottom:8}}>
                        Distribuição: {pg}% + {pl}% + {pi}% = <span style={{color:tot===100?'#27500A':'#E24B4A',fontWeight:700}}>{tot}%</span>
                        {tot!==100&&<span style={{color:'#E24B4A'}}> ⚠️ deve somar 100%</span>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                        {[{l:'% Gastos',f:'pctGasto',v:pg,c:'#534AB7'},{l:'% Livres',f:'pctLivre',v:pl,c:'#27500A'},{l:'% Invest.',f:'pctInvest',v:pi,c:'#3C3489'}].map(x=>(
                          <div key={x.f} style={{textAlign:'center'}}>
                            <div style={{fontSize:10,color:x.c,fontWeight:600,marginBottom:4}}>{x.l}</div>
                            <input type="number" min="0" max="100" defaultValue={x.v} onBlur={e=>sv(x.f,parseFloat(e.target.value)||0)} style={{width:'100%',textAlign:'center',fontWeight:700,fontSize:14,border:'0.5px solid #ddd',borderRadius:8,padding:'5px'}}/>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',padding:'8px 12px',background:'#EEEDFE',alignItems:'center',borderBottom:'0.5px solid #eee'}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#3C3489'}}>{pg}% para gastos</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#3C3489',textAlign:'right'}}>{fmtBRL(sob*pg/100)}</span>
                    </div>
                    <div style={{padding:'8px 12px',background:'#EAF3DE',borderBottom:'0.5px solid #eee'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <span style={{fontSize:12,fontWeight:600,color:'#27500A'}}>{pl}% livres</span>
                        <span style={{fontSize:13,fontWeight:700,color:'#27500A'}}>{fmtBRL(sob*pl/100)}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                        {[{label:'→ Pâmela',field:'livres30Pamela'},{label:'→ Filipe',field:'livres30Filipe'}].map(r=>(
                          <div key={r.field} style={{display:'flex',alignItems:'center',gap:4}}>
                            <span style={{fontSize:11,color:'#3B6D11',flex:1}}>{r.label}</span>
                            <input type="number" placeholder="R$ 0" defaultValue={doc[r.field]||''} onBlur={e=>sv(r.field,parseFloat(e.target.value)||0)} style={{width:70,textAlign:'right',fontSize:11,border:'0.5px solid #a5d6a7',borderRadius:6,padding:'3px 5px'}}/>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{padding:'8px 12px',background:'#EEEDFE'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600,color:'#3C3489'}}>{pi}% investimento</span>
                        <span style={{fontSize:13,fontWeight:700,color:'#3C3489'}}>{fmtBRL(sob*pi/100)}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:11,color:'#7F77DD'}}>Onde foi:</span>
                        <input type="text" placeholder="Ex: Tesouro Direto..." defaultValue={doc.investDest||''} onBlur={e=>sv('investDest',e.target.value)} style={{flex:1,fontSize:11,border:'0.5px solid #9B99C4',borderRadius:6,padding:'4px 8px',background:'#fff'}}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* TRANSACTION FORM */}
      {showForm&&(
        <div className="modal-overlay" onClick={()=>{setShowForm(false);setEditItem(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar transação':'Nova transação'}</div>
            <div className="form-group">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,background:'#f0efe8',borderRadius:10,padding:3}}>
                {['out','in'].map(v=>(
                  <button key={v} onClick={()=>setForm({...form,type:v,category:'Outros'})} style={{padding:'8px',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:500,background:form.type===v?'#fff':'transparent',color:form.type===v?'#1a1a18':'#999',boxShadow:form.type===v?'0 1px 3px rgba(0,0,0,.1)':'none'}}>{v==='in'?'↑ Entrada':'↓ Saída'}</button>
                ))}
              </div>
              <input type="text" placeholder="Descrição" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
              <input type="number" placeholder="Valor (R$)" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              <div className="form-row">
                <div><label className="form-label">Categoria</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {(form.type==='in'?CATS_IN:CATS_OUT).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Data</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
                </div>
              </div>
              {members.length>0&&(
                <div><label className="form-label">Responsável</label>
                  <select value={form.responsible} onChange={e=>setForm({...form,responsible:e.target.value})}>
                    <option value="">— Nenhum —</option>
                    {members.map(m=><option key={m.uid} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>{setShowForm(false);setEditItem(null)}}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CYCLE DAY MODAL */}
      {showCycle&&(
        <div className="modal-overlay" onClick={()=>setShowCycle(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Início do ciclo financeiro</div>
            <div className="form-group">
              <input type="number" min="1" max="28" value={newCycle} onChange={e=>setNewCycle(parseInt(e.target.value)||1)}/>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[1,5,10,15,20,25].map(d=>(
                  <button key={d} onClick={()=>setNewCycle(d)} style={{padding:'5px 14px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,background:newCycle===d?'#534AB7':'#f0efe8',color:newCycle===d?'#fff':'#888'}}>Dia {d}</button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>setShowCycle(false)}>Cancelar</button>
              <button className="btn-primary" onClick={async()=>{await setCycleDay(newCycle);setShowCycle(false)}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
