import { useState } from 'react'
import { useData } from '../useData.js'
import { useAuth } from '../AuthContext.jsx'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CATS_IN  = ['Freelance','Investimentos','Outros','Presente','Renda extra','Salário'].sort()
const CATS_OUT = ['Alimentação','Assinaturas','Cartão','Contas','Educação','Emprestado','Lazer','Moradia','Outros','Roupas','Saúde','Transporte'].sort()
const CAT_ICONS = { Salário:'💼',Freelance:'💻','Renda extra':'💡',Investimentos:'📈',Presente:'🎁',Moradia:'🏠',Alimentação:'🛒',Transporte:'🚗',Saúde:'💊',Educação:'📚',Lazer:'🎬',Roupas:'👕',Contas:'⚡',Assinaturas:'📱',Cartão:'💳',Emprestado:'🤝',Outros:'📌' }
const fmtBRL = v => 'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2})
const fmtDate = str => { const d=new Date(str+'T12:00'); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}` }
const todayStr = () => new Date().toISOString().split('T')[0]

const ROW_COLORS = [
  { v:'#ffffff', l:'Branco' },
  { v:'#FFF3E0', l:'Laranja' },
  { v:'#E8F5E9', l:'Verde' },
  { v:'#E3F2FD', l:'Azul' },
  { v:'#FCE4EC', l:'Rosa' },
  { v:'#EDE7F6', l:'Roxo' },
  { v:'#FFFDE7', l:'Amarelo' },
  { v:'#F3E5F5', l:'Lilás' },
  { v:'#E0F7FA', l:'Ciano' },
  { v:'#FAFAFA', l:'Cinza' },
]

export default function FinanceScreen() {
  const { group } = useAuth()
  const { items: transactions, add, update, remove }           = useData('transactions', 'group')
  const { items: cycleDocs,    add: addCycle, update: updateCycle } = useData('financeSettings', 'group')
  const { items: trackerRows,  add: addRow,   update: updateRow, remove: removeRow } = useData('financeTracker', 'private')

  const cycleDay = cycleDocs[0]?.cycleDay || 1
  const setCycleDay = async v => {
    if (cycleDocs[0]) await updateCycle(cycleDocs[0].id, { cycleDay: v })
    else await addCycle({ cycleDay: v })
  }

  const members = group?.members || []

  const [subTab,    setSubTab]    = useState('transactions') // 'transactions' | 'tracker'
  const [showForm,  setShowForm]  = useState(false)
  const [showCycle, setShowCycle] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [form, setForm] = useState({ type:'out', desc:'', amount:'', date:todayStr(), category:'Outros', responsible:'' })
  const [newCycle, setNewCycle] = useState(cycleDay)

  // Tracker state
  const [trackerTitle, setTrackerTitle] = useState('')
  const [showTrackerTitleEdit, setShowTrackerTitleEdit] = useState(false)
  const { items: trackerSettings, add: addTrackerSettings, update: updateTrackerSettings } = useData('financeTrackerSettings', 'private')
  const savedTitle = trackerSettings[0]?.title || 'Controle do Cartão'
  const [newRowForm, setNewRowForm] = useState({ date:'', text:'', amount:'', color:'#ffffff', checked:false })
  const [editRowId, setEditRowId] = useState(null)

  const income   = transactions.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount,0)
  const expenses = transactions.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount,0)
  const balance  = income - expenses

  const openEdit = (t) => {
    setEditItem(t)
    setForm({ type:t.type, desc:t.desc, amount:String(t.amount), date:t.date, category:t.category, responsible:t.responsible||'' })
    setShowForm(true)
  }

  const save = async () => {
    const amt = parseFloat(form.amount)
    if (!form.desc||!amt) return
    if (editItem) await update(editItem.id, { ...form, amount:amt })
    else await add({ ...form, amount:amt })
    setForm({ type:'out', desc:'', amount:'', date:todayStr(), category:'Outros', responsible:'' })
    setEditItem(null); setShowForm(false)
  }

  const spendByCat = {}
  transactions.filter(t=>t.type==='out').forEach(t=>{spendByCat[t.category]=(spendByCat[t.category]||0)+t.amount})
  const topCats = Object.entries(spendByCat).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const maxCat  = Math.max(...topCats.map(c=>c[1]),1)

  const periodLabel = () => {
    const now=new Date(), y=now.getFullYear(), m=now.getMonth()
    if (cycleDay===1) return `${MONTHS[m]} ${y}`
    const start=new Date(y,m,cycleDay)
    if (start>now) start.setMonth(start.getMonth()-1)
    const end=new Date(start); end.setMonth(end.getMonth()+1); end.setDate(end.getDate()-1)
    return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0,3)} – ${end.getDate()} ${MONTHS[end.getMonth()].slice(0,3)}`
  }

  const trackerTotal = trackerRows.reduce((s,r)=>s+(parseFloat(r.amount)||0),0)

  const saveRow = async () => {
    if (!newRowForm.text.trim() && !newRowForm.amount) return
    await addRow({ ...newRowForm, amount: parseFloat(newRowForm.amount)||0 })
    setNewRowForm({ date:'', text:'', amount:'', color:'#ffffff', checked:false })
  }

  const saveTitle = async () => {
    const t = trackerTitle.trim() || 'Controle do Cartão'
    if (trackerSettings[0]) await updateTrackerSettings(trackerSettings[0].id, { title: t })
    else await addTrackerSettings({ title: t })
    setShowTrackerTitleEdit(false)
  }

  return (
    <div className="screen">
      {/* Add button at top */}
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>{ setEditItem(null); setForm({ type:'out', desc:'', amount:'', date:todayStr(), category:'Outros', responsible:'' }); setShowForm(true) }} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Nova transação</button>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ display:'flex', gap:0, margin:'10px 14px 0', background:'#f0efe8', borderRadius:10, padding:3, flexShrink:0 }}>
        {[{v:'transactions',l:'💰 Transações'},{v:'tracker',l:'📋 Controle'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{
            flex:1, padding:'8px', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500,
            background:subTab===x.v?'#fff':'transparent', color:subTab===x.v?'#1a1a18':'#999',
            boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
          }}>{x.l}</button>
        ))}
      </div>

      {subTab === 'transactions' && (
        <div className="screen-scroll">
          <div style={{ background:balance>=0?'#EAF3DE':'#FCEBEB', borderRadius:16, padding:'16px', marginBottom:12, marginTop:10 }}>
            <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Saldo · {periodLabel()}</div>
            <div style={{ fontSize:38, fontWeight:700, color:balance>=0?'#27500A':'#791F1F', lineHeight:1.1 }}>{fmtBRL(balance)}</div>
            <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{balance>=0?'positivo':'negativo'}</div>
            <button onClick={()=>setShowCycle(true)} style={{ background:'rgba(0,0,0,.06)', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#555', cursor:'pointer', marginTop:8 }}>📅 Ciclo: dia {cycleDay}</button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            <div style={{ background:'#EAF3DE', borderRadius:12, padding:'12px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#3B6D11', marginBottom:4 }}>↑ Entradas</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#27500A' }}>{fmtBRL(income)}</div>
            </div>
            <div style={{ background:'#FCEBEB', borderRadius:12, padding:'12px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#A32D2D', marginBottom:4 }}>↓ Saídas</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#791F1F' }}>{fmtBRL(expenses)}</div>
            </div>
          </div>

          {topCats.length>0 && <>
            <div className="section-label">Por categoria</div>
            {topCats.map(([cat,amt])=>(
              <div key={cat} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span>{CAT_ICONS[cat]||'📌'} {cat}</span>
                  <span style={{ fontWeight:500 }}>{fmtBRL(amt)}</span>
                </div>
                <div className="progress-wrap"><div className="progress-fill" style={{ width:`${Math.round(amt/maxCat*100)}%`, background:'#E24B4A' }}/></div>
              </div>
            ))}
          </>}

          <div className="section-label" style={{ marginTop:12 }}>Transações</div>
          {[...transactions].reverse().map(t=>(
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'0.5px solid #f0efe8' }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:t.type==='in'?'#EAF3DE':'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{CAT_ICONS[t.category]||(t.type==='in'?'↑':'↓')}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{t.desc}</div>
                <div style={{ fontSize:11, color:'#bbb' }}>{fmtDate(t.date)} · {t.category}{t.responsible?' · '+t.responsible:''}</div>
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:t.type==='in'?'#27500A':'#A32D2D' }}>{t.type==='in'?'+':'-'} {fmtBRL(t.amount)}</span>
              <button onClick={()=>openEdit(t)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
              <button onClick={()=>remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'tracker' && (
        <div className="screen-scroll">
          {/* Title row */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, marginBottom:8 }}>
            {showTrackerTitleEdit ? (
              <>
                <input type="text" value={trackerTitle} onChange={e=>setTrackerTitle(e.target.value)}
                  placeholder={savedTitle} autoFocus style={{ flex:1, fontWeight:700, fontSize:14 }}/>
                <button onClick={saveTitle} style={{ background:'#534AB7', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, cursor:'pointer' }}>✓</button>
                <button onClick={()=>setShowTrackerTitleEdit(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}>✕</button>
              </>
            ) : (
              <>
                <div style={{ flex:1, fontWeight:700, fontSize:14, color:'#1a1a18' }}>{savedTitle}</div>
                <button onClick={()=>{ setTrackerTitle(savedTitle); setShowTrackerTitleEdit(true) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:14 }}>✏️</button>
              </>
            )}
          </div>

          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 90px 32px', gap:0, background:'#534AB7', borderRadius:'8px 8px 0 0', padding:'8px 10px' }}>
            {['Data','Descrição','Valor','✓'].map(h=>(
              <div key={h} style={{ fontSize:11, fontWeight:700, color:'#fff', textAlign:h==='Valor'||h==='✓'?'right':'left' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {[...trackerRows].sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(row=>(
            <div key={row.id} style={{ display:'grid', gridTemplateColumns:'60px 1fr 90px 32px', gap:0, background:row.color||'#fff', padding:'8px 10px', borderBottom:'0.5px solid #e4e2dc', alignItems:'center' }}>
              {editRowId===row.id ? (
                <>
                  <input type="text" defaultValue={row.date} id={`rd-${row.id}`} style={{ fontSize:11, padding:'3px', border:'0.5px solid #ccc', borderRadius:4 }} placeholder="DD/MM"/>
                  <input type="text" defaultValue={row.text} id={`rt-${row.id}`} style={{ fontSize:12, padding:'3px', border:'0.5px solid #ccc', borderRadius:4, margin:'0 4px' }}/>
                  <input type="number" defaultValue={row.amount} id={`ra-${row.id}`} style={{ fontSize:12, padding:'3px', border:'0.5px solid #ccc', borderRadius:4, textAlign:'right' }}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'flex-end' }}>
                    <button onClick={async()=>{
                      await updateRow(row.id,{
                        date: document.getElementById(`rd-${row.id}`).value,
                        text: document.getElementById(`rt-${row.id}`).value,
                        amount: parseFloat(document.getElementById(`ra-${row.id}`).value)||0,
                      })
                      setEditRowId(null)
                    }} style={{ background:'#534AB7', border:'none', borderRadius:4, padding:'2px 6px', color:'#fff', fontSize:10, cursor:'pointer' }}>✓</button>
                    <button onClick={()=>setEditRowId(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:12 }}>✕</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:11, color:'#888' }}>{row.date||'—'}</div>
                  <div style={{ fontSize:13, color:'#1a1a18', textDecoration:row.checked?'line-through':'none', color:row.checked?'#bbb':'#1a1a18', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ flex:1 }}>{row.text}</span>
                    <button onClick={()=>setEditRowId(row.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:12, padding:0 }}>✏️</button>
                    <button onClick={()=>removeRow(row.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:14, padding:0 }}>×</button>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a1a18', textAlign:'right', textDecoration:row.checked?'line-through':'none' }}>
                    {row.amount>0?fmtBRL(row.amount):'—'}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div onClick={()=>updateRow(row.id,{checked:!row.checked})} style={{
                      width:20, height:20, borderRadius:4, border:'1.5px solid #ccc',
                      background:row.checked?'#534AB7':'#fff', cursor:'pointer',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, color:'#fff'
                    }}>{row.checked?'✓':''}</div>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Total row */}
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 90px 32px', gap:0, background:'#f0efe8', padding:'10px', borderRadius:'0 0 8px 8px', borderTop:'2px solid #534AB7' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#534AB7', gridColumn:'1/3' }}>TOTAL</div>
            <div style={{ fontSize:14, fontWeight:800, color:'#534AB7', textAlign:'right' }}>{fmtBRL(trackerTotal)}</div>
            <div/>
          </div>

          {/* Add new row */}
          <div style={{ marginTop:14, background:'#fff', borderRadius:12, border:'0.5px solid #eee', padding:'12px' }}>
            <div style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:8 }}>Nova linha</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
              <input type="text" placeholder="Data (ex: 20/03)" value={newRowForm.date} onChange={e=>setNewRowForm({...newRowForm,date:e.target.value})} style={{ width:100, flexShrink:0 }}/>
              <input type="text" placeholder="Descrição" value={newRowForm.text} onChange={e=>setNewRowForm({...newRowForm,text:e.target.value})} style={{ flex:1, minWidth:120 }}/>
              <input type="number" placeholder="R$ 0,00" step="0.01" value={newRowForm.amount} onChange={e=>setNewRowForm({...newRowForm,amount:e.target.value})} style={{ width:100, flexShrink:0 }}/>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ fontSize:11, color:'#888' }}>Cor da linha:</div>
              {ROW_COLORS.map(c=>(
                <div key={c.v} onClick={()=>setNewRowForm({...newRowForm,color:c.v})} style={{
                  width:22, height:22, borderRadius:6, background:c.v, cursor:'pointer',
                  border:newRowForm.color===c.v?'2.5px solid #534AB7':'1.5px solid #ddd'
                }}/>
              ))}
              <input type="color" value={newRowForm.color} onChange={e=>setNewRowForm({...newRowForm,color:e.target.value})}
                style={{ width:22, height:22, borderRadius:6, border:'none', cursor:'pointer', padding:0 }}/>
              <button className="btn-primary" onClick={saveRow} style={{ width:'auto', padding:'8px 18px', marginLeft:'auto' }}>＋ Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem ? 'Editar transação' : 'Nova transação'}</div>
            <div className="form-group">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, background:'#f0efe8', borderRadius:10, padding:3 }}>
                {['out','in'].map(v=>(
                  <button key={v} onClick={()=>setForm({...form,type:v,category:'Outros'})} style={{
                    padding:'8px', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500,
                    background:form.type===v?'#fff':'transparent', color:form.type===v?'#1a1a18':'#999',
                    boxShadow:form.type===v?'0 1px 3px rgba(0,0,0,.1)':'none'
                  }}>{v==='in'?'↑ Entrada':'↓ Saída'}</button>
                ))}
              </div>
              <input type="text" placeholder="Descrição" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
              <input type="number" placeholder="Valor (R$)" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              <div className="form-row">
                <div>
                  <label className="form-label">Categoria</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {(form.type==='in'?CATS_IN:CATS_OUT).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Data</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
                </div>
              </div>
              {members.length > 0 && (
                <div>
                  <label className="form-label">Responsável</label>
                  <select value={form.responsible} onChange={e=>setForm({...form,responsible:e.target.value})}>
                    <option value="">— Nenhum —</option>
                    {members.map(m=><option key={m.uid} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle modal */}
      {showCycle && (
        <div className="modal-overlay" onClick={()=>setShowCycle(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Início do ciclo financeiro</div>
            <div className="form-group">
              <input type="number" min="1" max="28" value={newCycle} onChange={e=>setNewCycle(parseInt(e.target.value)||1)}/>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[1,5,10,15,20,25].map(d=>(
                  <button key={d} onClick={()=>setNewCycle(d)} style={{
                    padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12,
                    background:newCycle===d?'#534AB7':'#f0efe8', color:newCycle===d?'#fff':'#888'
                  }}>Dia {d}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>setShowCycle(false)}>Cancelar</button>
              <button className="btn-primary" onClick={async()=>{await setCycleDay(newCycle);setShowCycle(false)}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
