import { useState } from 'react'
import { useData } from '../useData.js'

const MONTHS_S = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function fmtDate(ds) {
  if (!ds) return '—'
  const d = new Date(ds + 'T12:00')
  return `${d.getDate()} ${MONTHS_S[d.getMonth()]} ${d.getFullYear()}`
}

function expiryStatus(ds) {
  if (!ds) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(ds + 'T12:00')
  const diff  = Math.ceil((exp - today) / 86400000)
  if (diff < 0)   return { label:'Vencido', color:'#E24B4A', bg:'#FCEBEB' }
  if (diff <= 30)  return { label:`Vence em ${diff}d`, color:'#BA7517', bg:'#FAEEDA' }
  if (diff <= 90)  return { label:`Vence em ${diff}d`, color:'#639922', bg:'#EAF3DE' }
  return { label:`Vence em ${fmtDate(ds)}`, color:'#888', bg:'#f0efe8' }
}

const EMPTY = { name:'', composition:'', expiry:'', purpose:'', qty:'', unit:'comprimidos', notes:'' }
const UNITS = ['comprimidos','cápsulas','ml','frascos','bisnagas','sachês','unidades']

export default function MedsScreen() {
  const { items:meds, add, update, remove } = useData('medications','private')

  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [search,     setSearch]     = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [filter,     setFilter]     = useState('all') // 'all' | 'expiring' | 'expired'

  const openNew = () => { setEditItem(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = m => {
    setEditItem(m)
    setForm({ name:m.name, composition:m.composition||'', expiry:m.expiry||'', purpose:m.purpose||'', qty:String(m.qty||''), unit:m.unit||'comprimidos', notes:m.notes||'' })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    const data = { ...form, qty: parseInt(form.qty)||0 }
    if (editItem) await update(editItem.id, data)
    else          await add(data)
    setForm(EMPTY); setEditItem(null); setShowForm(false)
  }

  const changeQty = async (med, delta) => {
    const newQty = Math.max(0, (med.qty||0) + delta)
    await update(med.id, { qty: newQty })
  }

  const today = new Date(); today.setHours(0,0,0,0)

  const filtered = meds
    .filter(m => {
      if (search) return m.name.toLowerCase().includes(search.toLowerCase()) || (m.composition||'').toLowerCase().includes(search.toLowerCase())
      return true
    })
    .filter(m => {
      if (filter === 'expired')  return m.expiry && new Date(m.expiry+'T12:00') < today
      if (filter === 'expiring') return m.expiry && new Date(m.expiry+'T12:00') >= today && Math.ceil((new Date(m.expiry+'T12:00')-today)/86400000) <= 90
      return true
    })
    .sort((a,b) => {
      if (!a.expiry && !b.expiry) return a.name.localeCompare(b.name)
      if (!a.expiry) return 1
      if (!b.expiry) return -1
      return a.expiry.localeCompare(b.expiry)
    })

  const expiredCount  = meds.filter(m=>m.expiry&&new Date(m.expiry+'T12:00')<today).length
  const expiringCount = meds.filter(m=>{ if(!m.expiry)return false; const d=new Date(m.expiry+'T12:00'); const diff=Math.ceil((d-today)/86400000); return diff>=0&&diff<=90 }).length

  return (
    <div className="screen">
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={openNew} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Adicionar medicamento</button>
      </div>

      {/* Search */}
      <div style={{ padding:'8px 14px 0', flexShrink:0 }}>
        <input type="search" placeholder="🔍 Buscar por nome ou composição..." value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'0.5px solid #ddd', fontSize:13 }}/>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:6, padding:'8px 14px 0', flexShrink:0 }}>
        {[
          {v:'all',     l:`Todos (${meds.length})`},
          {v:'expiring',l:`⚠️ Vencendo (${expiringCount})`, show: expiringCount>0},
          {v:'expired', l:`❌ Vencidos (${expiredCount})`,  show: expiredCount>0},
        ].filter(x=>x.show!==false).map(x=>(
          <button key={x.v} onClick={()=>setFilter(x.v)} style={{
            padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:500,
            background:filter===x.v?'#534AB7':'#f0efe8', color:filter===x.v?'#fff':'#888'
          }}>{x.l}</button>
        ))}
      </div>

      <div className="screen-scroll">
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', color:'#bbb', padding:'40px 0', fontSize:13 }}>
            {meds.length === 0 ? 'Nenhum medicamento cadastrado ainda' : 'Nenhum resultado encontrado'}
          </div>
        )}

        {filtered.map(med => {
          const status   = expiryStatus(med.expiry)
          const expanded = expandedId === med.id
          const lowStock = med.qty > 0 && med.qty <= 5

          return (
            <div key={med.id} style={{
              marginBottom:8, borderRadius:12, overflow:'hidden',
              border: status?.color==='#E24B4A' ? '1px solid #E24B4A44' : '0.5px solid #e4e2dc',
              background:'#fff'
            }}>
              {/* Main row */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer' }}
                onClick={()=>setExpandedId(expanded ? null : med.id)}>
                {/* Icon */}
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background: status?.bg || '#EEEDFE',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20
                }}>💊</div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1a1a18' }}>{med.name}</div>
                  {med.composition && (
                    <div style={{ fontSize:11, color:'#888', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{med.composition}</div>
                  )}
                  <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
                    {status && (
                      <span style={{ fontSize:10, fontWeight:600, color:status.color, background:status.bg, padding:'2px 7px', borderRadius:10 }}>{status.label}</span>
                    )}
                    {med.qty !== undefined && med.qty !== '' && (
                      <span style={{ fontSize:10, fontWeight:600, color:lowStock?'#E24B4A':'#534AB7', background:lowStock?'#FCEBEB':'#EEEDFE', padding:'2px 7px', borderRadius:10 }}>
                        {med.qty} {med.unit||'un'}
                        {lowStock ? ' ⚠️' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Qty controls */}
                <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                  <button onClick={e=>{e.stopPropagation();changeQty(med,-1)}} style={{
                    width:28, height:28, borderRadius:8, border:'0.5px solid #ddd', background:'#f8f8f6',
                    fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#E24B4A'
                  }}>−</button>
                  <button onClick={e=>{e.stopPropagation();changeQty(med,+1)}} style={{
                    width:28, height:28, borderRadius:8, border:'0.5px solid #ddd', background:'#f8f8f6',
                    fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#27500A'
                  }}>＋</button>
                </div>

                <span style={{ color:'#ccc', fontSize:12, flexShrink:0 }}>{expanded?'▲':'▼'}</span>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div style={{ padding:'0 14px 14px', borderTop:'0.5px solid #f0efe8' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
                    {med.purpose && (
                      <div style={{ gridColumn:'1/3', background:'#EEEDFE', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'#7F77DD', fontWeight:600, marginBottom:2 }}>Para que serve</div>
                        <div style={{ fontSize:13, color:'#1a1a18' }}>{med.purpose}</div>
                      </div>
                    )}
                    {med.composition && (
                      <div style={{ background:'#f8f8f6', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'#888', fontWeight:600, marginBottom:2 }}>Composição</div>
                        <div style={{ fontSize:12, color:'#1a1a18' }}>{med.composition}</div>
                      </div>
                    )}
                    {med.expiry && (
                      <div style={{ background: status?.bg||'#f8f8f6', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color: status?.color||'#888', fontWeight:600, marginBottom:2 }}>Validade</div>
                        <div style={{ fontSize:12, color:'#1a1a18' }}>{fmtDate(med.expiry)}</div>
                      </div>
                    )}
                    {med.notes && (
                      <div style={{ gridColumn:'1/3', background:'#f8f8f6', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'#888', fontWeight:600, marginBottom:2 }}>Observações</div>
                        <div style={{ fontSize:12, color:'#1a1a18' }}>{med.notes}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <button onClick={()=>openEdit(med)} style={{
                      flex:1, padding:'9px', borderRadius:10, border:'0.5px solid #534AB7',
                      background:'#fff', color:'#534AB7', fontSize:13, cursor:'pointer', fontWeight:500
                    }}>✏️ Editar</button>
                    <button onClick={()=>{ if(window.confirm(`Excluir ${med.name}?`)) remove(med.id) }} style={{
                      padding:'9px 16px', borderRadius:10, border:'none',
                      background:'#FCEBEB', color:'#E24B4A', fontSize:13, cursor:'pointer', fontWeight:500
                    }}>🗑 Excluir</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem ? 'Editar medicamento' : 'Novo medicamento'}</div>
            <div className="form-group">
              <div>
                <label className="form-label">Nome do medicamento *</label>
                <input type="text" placeholder="Ex: Losartana 50mg" value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})} autoFocus/>
              </div>
              <div>
                <label className="form-label">Composição / Princípio ativo</label>
                <input type="text" placeholder="Ex: Losartana potássica 50mg" value={form.composition}
                  onChange={e=>setForm({...form,composition:e.target.value})}/>
              </div>
              <div>
                <label className="form-label">Para que serve</label>
                <textarea placeholder="Ex: Controle da pressão arterial" value={form.purpose}
                  onChange={e=>setForm({...form,purpose:e.target.value})}
                  style={{ resize:'none', height:64, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Data de validade</label>
                  <input type="date" value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})}/>
                </div>
                <div>
                  <label className="form-label">Quantidade</label>
                  <input type="number" placeholder="0" min="0" value={form.qty}
                    onChange={e=>setForm({...form,qty:e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="form-label">Unidade</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {UNITS.map(u=>(
                    <button key={u} onClick={()=>setForm({...form,unit:u})} style={{
                      padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11,
                      background:form.unit===u?'#534AB7':'#f0efe8', color:form.unit===u?'#fff':'#888'
                    }}>{u}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Observações</label>
                <textarea placeholder="Ex: Tomar em jejum, guardar na geladeira..." value={form.notes}
                  onChange={e=>setForm({...form,notes:e.target.value})}
                  style={{ resize:'none', height:56, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
