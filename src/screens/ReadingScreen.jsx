import { useState } from 'react'
import { useData } from '../useData.js'

const GENRES = ['Autoajuda','Biografia','Fantasia','Ficção','História','Negócios','Não-ficção','Outros','Romance','Sci-Fi','Terror'].sort()

function StarRating({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} style={{ cursor:onChange?'pointer':'default', fontSize:16, color:n<=value?'#F0C040':'#ddd' }}
          onClick={()=>onChange&&onChange(n)}>{n<=value?'★':'☆'}</span>
      ))}
    </div>
  )
}

export default function ReadingScreen() {
  const { items: books, add, update, remove } = useData('books','private')
  const { items: collections, add: addCol, update: updateCol, remove: removeCol } = useData('bookCollections','private')

  const [tab,        setTab]        = useState('reading')
  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [showColMgr, setShowColMgr] = useState(false)
  const [editCol,    setEditCol]    = useState(null)
  const [newCol,     setNewCol]     = useState({ name:'', color:'#F57F17', emoji:'📦' })
  const emptyForm = { title:'', author:'', genre:'Romance', status:'toread', pages:'', rating:0, notes:'', collection:'', colOrder:'' }
  const [form,   setForm]   = useState(emptyForm)
  const [search, setSearch] = useState('')

  const filtered = books
    .filter(b => b.status === (tab==='reading'?'reading':tab==='toread'?'toread':'done'))
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || (b.author||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => a.title.localeCompare(b.title))

  const counts = {
    reading: books.filter(b=>b.status==='reading').length,
    toread:  books.filter(b=>b.status==='toread').length,
    done:    books.filter(b=>b.status==='done').length,
  }

  const openEdit = (book) => {
    setEditItem(book)
    setForm({ title:book.title, author:book.author||'', genre:book.genre, status:book.status, pages:String(book.pages||''), rating:book.rating||0, notes:book.notes||'', collection:book.collection||'', colOrder:String(book.colOrder||'') })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const data = { ...form, pages: parseInt(form.pages)||0, colOrder: parseInt(form.colOrder)||0 }
    if (editItem) {
      await update(editItem.id, data)
    } else {
      await add({ ...data, startedAt: form.status==='reading' ? new Date().toISOString().split('T')[0] : null })
    }
    setForm(emptyForm); setEditItem(null); setShowForm(false)
  }

  const saveEditCol = async () => {
    if (!editCol?.id) return
    await updateCol(editCol.id, { name:editCol.name, color:editCol.color, emoji:editCol.emoji||'📦' })
    setEditCol(null)
  }

  const colStyle = (c) => ({
    background: (c.color||'#F57F17')+'22',
    color: c.color||'#F57F17',
  })

  return (
    <div className="screen">
      {/* Add button at top */}
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>{ setEditItem(null); setForm(emptyForm); setShowForm(true) }} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Adicionar livro</button>
      </div>

      <div style={{ display:'flex', gap:8, padding:'10px 14px 0', flexShrink:0 }}>
        {[
          { id:'reading', label:'Lendo',     icon:'📖', bg:'#EEEDFE', tc:'#534AB7' },
          { id:'toread',  label:'Quero ler', icon:'🔖', bg:'#FAEEDA', tc:'#633806' },
          { id:'done',    label:'Lidos',     icon:'✅', bg:'#EAF3DE', tc:'#27500A' },
        ].map(s=>(
          <div key={s.id} onClick={()=>setTab(s.id)} style={{
            flex:1, background:s.bg, borderRadius:12, padding:'10px 8px',
            textAlign:'center', cursor:'pointer',
            border:tab===s.id?`2px solid ${s.tc}`:'2px solid transparent'
          }}>
            <div style={{ fontSize:18 }}>{s.icon}</div>
            <div style={{ fontSize:18, fontWeight:700, color:s.tc }}>{counts[s.id]}</div>
            <div style={{ fontSize:10, color:s.tc, opacity:.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'10px 14px 4px', flexShrink:0, display:'flex', gap:8 }}>
        <input type="search" placeholder="Buscar livros..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1 }}/>
        <button onClick={()=>setShowColMgr(true)} style={{
          background:'#f0efe8', border:'none', borderRadius:10, padding:'8px 12px',
          fontSize:12, color:'#888', cursor:'pointer', flexShrink:0
        }}>📚 Coleções</button>
      </div>

      <div className="screen-scroll">
        {filtered.length===0
          ? <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>
              {tab==='toread'?'Nenhum livro na fila':tab==='reading'?'Nenhum livro em leitura':'Nenhum livro concluído'}
            </div>
          : filtered.map(book=>{
            const col = collections.find(c=>c.name===book.collection)
            return (
              <div key={book.id} style={{ border:'0.5px solid #eee', borderRadius:12, padding:'14px', marginBottom:8, background:'#fff' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:48, height:68, borderRadius:6, flexShrink:0, background:'linear-gradient(135deg,#EEEDFE,#D0CCFF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📚</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1a1a18', lineHeight:1.3 }}>{book.title}</div>
                    {book.author&&<div style={{ fontSize:12, color:'#888', marginTop:2 }}>{book.author}</div>}
                    <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
                      <span className="tag tag-purple">{book.genre}</span>
                      {book.pages>0&&<span className="tag" style={{ background:'#f0efe8', color:'#888' }}>{book.pages} pág.</span>}
                      {book.collection&&(
                        <span className="tag" style={{ background:(col?.color||'#F57F17')+'22', color:col?.color||'#F57F17' }}>
                          {book.colOrder?`#${book.colOrder} · `:''}{col?.emoji||'📦'} {book.collection}
                        </span>
                      )}
                    </div>
                    {book.status==='done'&&book.rating>0&&(
                      <div style={{ marginTop:4 }}><StarRating value={book.rating}/></div>
                    )}
                    {book.notes&&<div style={{ fontSize:12, color:'#999', marginTop:4, fontStyle:'italic' }}>"{book.notes}"</div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {book.status!=='reading'&&(
                      <button onClick={()=>update(book.id,{status:'reading'})} style={{ background:'#EEEDFE', border:'none', borderRadius:6, padding:'4px 8px', fontSize:10, color:'#534AB7', cursor:'pointer', whiteSpace:'nowrap' }}>Lendo</button>
                    )}
                    {book.status!=='done'&&(
                      <button onClick={()=>update(book.id,{status:'done',finishedAt:new Date().toISOString().split('T')[0]})} style={{ background:'#EAF3DE', border:'none', borderRadius:6, padding:'4px 8px', fontSize:10, color:'#27500A', cursor:'pointer', whiteSpace:'nowrap' }}>Concluído</button>
                    )}
                    {book.status==='done'&&(
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(n=>(
                          <span key={n} onClick={()=>update(book.id,{rating:n})} style={{ fontSize:14, cursor:'pointer', color:n<=(book.rating||0)?'#F0C040':'#ddd' }}>★</span>
                        ))}
                      </div>
                    )}
                    <button onClick={()=>openEdit(book)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
                    <button onClick={()=>remove(book.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16 }}>×</button>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Add/Edit book modal */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem ? 'Editar livro' : 'Adicionar livro'}</div>
            <div className="form-group">
              <input type="text" placeholder="Título do livro" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus/>
              <input type="text" placeholder="Autor" value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/>
              <div className="form-row">
                <div>
                  <label className="form-label">Gênero</label>
                  <select value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})}>
                    {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Páginas</label>
                  <input type="number" placeholder="0" value={form.pages} onChange={e=>setForm({...form,pages:e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="form-label">Coleção (opcional)</label>
                <select value={form.collection} onChange={e=>setForm({...form,collection:e.target.value})}>
                  <option value="">— Nenhuma —</option>
                  {[...collections].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>(
                    <option key={c.id} value={c.name}>{c.emoji||'📦'} {c.name}</option>
                  ))}
                </select>
                {form.collection && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                    <label className="form-label" style={{ marginBottom:0, flexShrink:0 }}>Nº na coleção</label>
                    <input type="number" placeholder="Ex: 1, 2, 3..." value={form.colOrder} onChange={e=>setForm({...form,colOrder:e.target.value})} min="1" style={{ width:90 }}/>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Status</label>
                <div style={{ display:'flex', gap:4 }}>
                  {[{v:'toread',l:'Quero ler'},{v:'reading',l:'Lendo'},{v:'done',l:'Lido'}].map(s=>(
                    <button key={s.v} onClick={()=>setForm({...form,status:s.v})} style={{
                      flex:1, padding:'7px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12,
                      background:form.status===s.v?'#534AB7':'#f0efe8', color:form.status===s.v?'#fff':'#888'
                    }}>{s.l}</button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Notas, citações favoritas..." value={form.notes}
                onChange={e=>setForm({...form,notes:e.target.value})}
                style={{ resize:'none', height:64, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Collections manager */}
      {showColMgr && (
        <div className="modal-overlay" onClick={()=>{ setShowColMgr(false); setEditCol(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Coleções de livros</div>
            {[...collections].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>(
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 0', borderBottom:'0.5px solid #f0efe8' }}>
                {editCol?.id===c.id ? (
                  <>
                    <input type="text" value={editCol.emoji||''} onChange={e=>setEditCol({...editCol,emoji:e.target.value})}
                      style={{ width:44, textAlign:'center', fontSize:18 }} placeholder="📦"/>
                    <input type="text" value={editCol.name} onChange={e=>setEditCol({...editCol,name:e.target.value})} style={{ flex:1 }}/>
                    <input type="color" value={editCol.color||'#F57F17'} onChange={e=>setEditCol({...editCol,color:e.target.value})}
                      style={{ width:32, height:32, borderRadius:6, border:'none', cursor:'pointer', padding:2 }}/>
                    <button onClick={saveEditCol} style={{ background:'#534AB7', border:'none', borderRadius:8, padding:'5px 10px', color:'#fff', fontSize:12, cursor:'pointer' }}>✓</button>
                    <button onClick={()=>setEditCol(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:14 }}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize:18 }}>{c.emoji||'📦'}</span>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:c.color||'#F57F17', flexShrink:0 }}/>
                    <span style={{ flex:1, fontSize:14 }}>{c.name}</span>
                    <span style={{ fontSize:12, color:'#bbb', marginRight:4 }}>{books.filter(b=>b.collection===c.name).length} livros</span>
                    <button onClick={()=>setEditCol({...c})} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:13 }}>✏️</button>
                    <button onClick={()=>removeCol(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:14 }}>×</button>
                  </>
                )}
              </div>
            ))}
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, color:'#888', marginBottom:6, fontWeight:600 }}>Nova coleção</div>
              <div style={{ display:'flex', gap:6 }}>
                <input type="text" placeholder="📦" value={newCol.emoji} onChange={e=>setNewCol({...newCol,emoji:e.target.value})} style={{ width:50, textAlign:'center', fontSize:18 }}/>
                <input type="text" placeholder="Nome" value={newCol.name} onChange={e=>setNewCol({...newCol,name:e.target.value})} style={{ flex:1 }}/>
                <input type="color" value={newCol.color} onChange={e=>setNewCol({...newCol,color:e.target.value})}
                  style={{ width:36, height:36, borderRadius:6, border:'none', cursor:'pointer', padding:2 }}/>
                <button className="btn-primary" onClick={async()=>{
                  if(newCol.name.trim()){
                    await addCol({ name:newCol.name.trim(), color:newCol.color, emoji:newCol.emoji||'📦' })
                    setNewCol({ name:'', color:'#F57F17', emoji:'📦' })
                  }
                }} style={{ width:'auto', padding:'8px 14px' }}>+</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{ setShowColMgr(false); setEditCol(null) }} style={{ marginTop:10 }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
