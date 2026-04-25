import { useState } from 'react'
import { useData } from '../useData.js'

const DEFAULT_CATS = [
  { name:'Tecnologia', color:'#534AB7' },
  { name:'Roupas',     color:'#C2185B' },
  { name:'Casa',       color:'#F57F17' },
  { name:'Livros',     color:'#2E7D32' },
  { name:'Games',      color:'#6A1B9A' },
  { name:'Beleza',     color:'#AD1457' },
  { name:'Esporte',    color:'#1565C0' },
  { name:'Viagem',     color:'#00695C' },
  { name:'Alimentação',color:'#558B2F' },
  { name:'Outros',     color:'#616161' },
]

const PRIORITIES = [
  { v:'alta',  l:'Alta',  bg:'#FCEBEB', tc:'#A32D2D' },
  { v:'média', l:'Média', bg:'#FAEEDA', tc:'#633806' },
  { v:'baixa', l:'Baixa', bg:'#EAF3DE', tc:'#27500A' },
]

function fmtBRL(v) {
  if (!v && v!==0) return ''
  return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2})
}

export default function WishlistScreen() {
  const { items: wishes, add, update, remove } = useData('wishlist','private')
  const { items: catDocs, add: addCat, update: updateCat, remove: removeCat } = useData('wishlistCategories','private')

  const cats = catDocs.length > 0 ? catDocs : DEFAULT_CATS
  const catColorMap = Object.fromEntries(cats.map(c=>[c.name, c.color]))
  const catNames = cats.map(c=>c.name).sort()

  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [showCatMgr, setShowCatMgr] = useState(false)
  const [editCat,    setEditCat]    = useState(null)
  const [newCatName,  setNewCatName]  = useState('')
  const [newCatColor, setNewCatColor] = useState('#888888')
  const [filterCat,  setFilterCat]  = useState('Todas')
  const [filterPri,  setFilterPri]  = useState('todas')
  const [search,     setSearch]     = useState('')
  const emptyForm = { name:'', category:'Tecnologia', priority:'média', price:'', link:'', notes:'', bought:false }
  const [form, setForm] = useState(emptyForm)

  const pending  = wishes.filter(w=>!w.bought)
  const bought   = wishes.filter(w=>w.bought)
  const totalVal = pending.reduce((s,w)=>s+(parseFloat(w.price)||0),0)
  const filterCats = ['Todas',...new Set(wishes.map(w=>w.category))].sort((a,b)=>a==='Todas'?-1:a.localeCompare(b))

  const filtered = wishes
    .filter(w=>!w.bought)
    .filter(w=>filterCat==='Todas'||w.category===filterCat)
    .filter(w=>filterPri==='todas'||w.priority===filterPri)
    .filter(w=>w.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{const po={alta:0,média:1,baixa:2};return (po[a.priority]??1)-(po[b.priority]??1)})

  const openEdit = (item) => {
    setEditItem(item)
    setForm({name:item.name,category:item.category,priority:item.priority,price:String(item.price||''),link:item.link||'',notes:item.notes||'',bought:item.bought})
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (editItem) await update(editItem.id,{...form,price:parseFloat(form.price)||0})
    else await add({...form,price:parseFloat(form.price)||0,bought:false})
    setForm(emptyForm); setEditItem(null); setShowForm(false)
  }

  const addNewCat = async () => {
    if (!newCatName.trim()) return
    if (catDocs.length===0) for (const c of DEFAULT_CATS) await addCat(c)
    await addCat({name:newCatName.trim(),color:newCatColor})
    setNewCatName(''); setNewCatColor('#888888')
  }
  const saveEditCat = async () => {
    if (!editCat?.id) return
    await updateCat(editCat.id,{name:editCat.name,color:editCat.color})
    setEditCat(null)
  }

  const priTag = p => {
    const x=PRIORITIES.find(x=>x.v===p)||PRIORITIES[1]
    return <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:x.bg,color:x.tc,fontWeight:500}}>{x.l}</span>
  }

  return (
    <div className="screen">
      <div style={{padding:'10px 14px 0',flexShrink:0}}>
        <button onClick={()=>{setEditItem(null);setForm(emptyForm);setShowForm(true)}} style={{width:'100%',padding:'11px',borderRadius:12,border:'none',background:'#534AB7',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          ＋ Adicionar à wishlist
        </button>
      </div>

      <div style={{display:'flex',gap:8,padding:'10px 14px 0',flexShrink:0}}>
        <div style={{flex:1,background:'#EEEDFE',borderRadius:12,padding:'10px'}}>
          <div style={{fontSize:11,color:'#7F77DD',fontWeight:600}}>Itens</div>
          <div style={{fontSize:22,fontWeight:700,color:'#3C3489'}}>{pending.length}</div>
        </div>
        <div style={{flex:2,background:'#FAEEDA',borderRadius:12,padding:'10px'}}>
          <div style={{fontSize:11,color:'#854F0B',fontWeight:600}}>Valor estimado</div>
          <div style={{fontSize:18,fontWeight:700,color:'#633806'}}>{fmtBRL(totalVal)}</div>
          <div style={{fontSize:10,color:'#854F0B',opacity:.7}}>{bought.length} comprado{bought.length!==1?'s':''}</div>
        </div>
        <button onClick={()=>setShowCatMgr(true)} style={{background:'#f0efe8',border:'none',borderRadius:12,padding:'10px',fontSize:12,color:'#888',cursor:'pointer',flexShrink:0}}>🎨<br/>Cats</button>
      </div>

      <div style={{padding:'8px 14px 0',flexShrink:0}}>
        <input type="search" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:6}}/>
        <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:4}}>
          {filterCats.map(c=>(
            <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'4px 12px',borderRadius:20,border:'0.5px solid #e4e2dc',background:filterCat===c?'#534AB7':'#fff',color:filterCat===c?'#fff':'#888',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{c}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:5,marginTop:4}}>
          {[{v:'todas',l:'Todas'},...PRIORITIES.map(p=>({v:p.v,l:p.l}))].map(p=>(
            <button key={p.v} onClick={()=>setFilterPri(p.v)} style={{padding:'4px 12px',borderRadius:20,border:'0.5px solid #e4e2dc',background:filterPri===p.v?'#534AB7':'#fff',color:filterPri===p.v?'#fff':'#888',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{p.l}</button>
          ))}
        </div>
      </div>

      <div className="screen-scroll">
        {filtered.length===0
          ? <div style={{textAlign:'center',color:'#bbb',padding:'30px 0',fontSize:13}}>Nenhum item encontrado</div>
          : filtered.map(item=>{
            const catColor = catColorMap[item.category]||'#888'
            return (
              <div key={item.id} style={{border:'0.5px solid #eee',borderRadius:12,padding:'14px',marginBottom:8,background:'#fff',borderLeft:`3px solid ${catColor}`}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:'#1a1a18'}}>{item.name}</div>
                    <div style={{display:'flex',gap:5,marginTop:4,flexWrap:'wrap',alignItems:'center'}}>
                      {priTag(item.priority)}
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:catColor+'22',color:catColor,fontWeight:500}}>{item.category}</span>
                      {item.price>0&&<span style={{fontSize:13,fontWeight:700,color:catColor}}>{fmtBRL(item.price)}</span>}
                    </div>
                    {item.notes&&<div style={{fontSize:12,color:'#999',marginTop:4}}>{item.notes}</div>}
                    {item.link&&<a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:11,color:'#534AB7',display:'block',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🔗 Ver produto</a>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
                    <button onClick={()=>update(item.id,{bought:true})} style={{background:'#EAF3DE',border:'none',borderRadius:8,padding:'6px 10px',fontSize:11,color:'#27500A',cursor:'pointer',whiteSpace:'nowrap'}}>✓ Comprei!</button>
                    <button onClick={()=>openEdit(item)} style={{background:'#f0efe8',border:'none',borderRadius:8,padding:'6px 10px',fontSize:11,color:'#555',cursor:'pointer'}}>✏️ Editar</button>
                    <button onClick={()=>remove(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:16,textAlign:'center'}}>×</button>
                  </div>
                </div>
              </div>
            )
          })
        }

        {bought.length>0&&(
          <details style={{marginTop:12}}>
            <summary style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.05em',cursor:'pointer',marginBottom:8,listStyle:'none',display:'flex',alignItems:'center',gap:6}}>✅ Comprados ({bought.length}) ▼</summary>
            {bought.map(item=>(
              <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'0.5px solid #f0efe8',opacity:.6}}>
                <span style={{fontSize:18}}>✅</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,textDecoration:'line-through',color:'#888'}}>{item.name}</div>
                  {item.price>0&&<div style={{fontSize:11,color:'#bbb'}}>{fmtBRL(item.price)}</div>}
                </div>
                <button onClick={()=>update(item.id,{bought:false})} style={{background:'none',border:'0.5px solid #ddd',borderRadius:6,padding:'4px 8px',fontSize:10,color:'#888',cursor:'pointer'}}>Desfazer</button>
                <button onClick={()=>remove(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:16}}>×</button>
              </div>
            ))}
          </details>
        )}
      </div>

      {showForm&&(
        <div className="modal-overlay" onClick={()=>{setShowForm(false);setEditItem(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar item':'Novo item na wishlist'}</div>
            <div className="form-group">
              <input type="text" placeholder="Nome do item" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoFocus/>
              <div className="form-row">
                <div>
                  <label className="form-label">Categoria</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {catNames.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Prioridade</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                    {PRIORITIES.map(p=><option key={p.v} value={p.v}>{p.l}</option>)}
                  </select>
                </div>
              </div>
              <input type="number" placeholder="Preço estimado (R$)" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
              <input type="text" placeholder="Link do produto (opcional)" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/>
              <textarea placeholder="Notas..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:'none',height:56,padding:'8px 10px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>{setShowForm(false);setEditItem(null)}}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {showCatMgr&&(
        <div className="modal-overlay" onClick={()=>{setShowCatMgr(false);setEditCat(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Categorias da wishlist</div>
            {cats.map(c=>(
              <div key={c.id||c.name} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'0.5px solid #f0efe8'}}>
                {editCat?.id===c.id?(
                  <>
                    <input type="text" value={editCat.name} onChange={e=>setEditCat({...editCat,name:e.target.value})} style={{flex:1}}/>
                    <input type="color" value={editCat.color} onChange={e=>setEditCat({...editCat,color:e.target.value})} style={{width:32,height:32,borderRadius:6,border:'none',cursor:'pointer',padding:2}}/>
                    <button onClick={saveEditCat} style={{background:'#534AB7',border:'none',borderRadius:8,padding:'5px 10px',color:'#fff',fontSize:12,cursor:'pointer'}}>✓</button>
                    <button onClick={()=>setEditCat(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:14}}>✕</button>
                  </>
                ):(
                  <>
                    <div style={{width:12,height:12,borderRadius:'50%',background:c.color,flexShrink:0}}/>
                    <span style={{flex:1,fontSize:14}}>{c.name}</span>
                    <button onClick={()=>setEditCat({...c})} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:13}}>✏️</button>
                    {c.id&&<button onClick={()=>removeCat(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#E24B4A',fontSize:14}}>×</button>}
                  </>
                )}
              </div>
            ))}
            <div style={{marginTop:12,display:'flex',gap:6}}>
              <input type="text" placeholder="Nova categoria" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{flex:1}}/>
              <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} style={{width:36,height:36,borderRadius:6,border:'none',cursor:'pointer',padding:2}}/>
              <button className="btn-primary" onClick={addNewCat} style={{width:'auto',padding:'8px 14px'}}>+</button>
            </div>
            <button className="btn-ghost" onClick={()=>{setShowCatMgr(false);setEditCat(null)}} style={{marginTop:10}}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
