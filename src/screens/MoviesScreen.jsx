import { useState } from 'react'
import { useData } from '../useData.js'

const GENRES = ['Ação','Animação','Aventura','Besteirol','Comédia','Comédia romântica','Crime','Documentário','Drama','Fantasia','Romance','Sci-Fi','Terror','Thriller','Outros'].sort()
const PLATFORMS = ['Amazon Prime','Apple TV+','Cinema','Crunchyroll','Disney+','Globoplay','HBO Max','Netflix','Outro','YouTube'].sort()

export default function MoviesScreen() {
  const { items: titles, add, update, remove } = useData('movies','private')
  const [tab,      setTab]      = useState('watchlist')
  const [typeF,    setTypeF]    = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [search,   setSearch]   = useState('')
  const emptyForm = { title:'', type:'movie', genre:'Ação', status:'watchlist', platform:'', seasons:'', rating:0, notes:'', coverUrl:'', emoji:'' }
  const [form, setForm] = useState(emptyForm)

  const filtered = titles
    .filter(t => t.status === (tab==='watchlist'?'watchlist':tab==='watching'?'watching':'done'))
    .filter(t => typeF==='all' || t.type===typeF)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => a.title.localeCompare(b.title))

  const counts = {
    watchlist: titles.filter(t=>t.status==='watchlist').length,
    watching:  titles.filter(t=>t.status==='watching').length,
    done:      titles.filter(t=>t.status==='done').length,
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ title:item.title, type:item.type, genre:item.genre, status:item.status, platform:item.platform||'', seasons:item.seasons||'', rating:item.rating||0, notes:item.notes||'', coverUrl:item.coverUrl||'', emoji:item.emoji||'' })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    if (editItem) await update(editItem.id, form)
    else await add(form)
    setForm(emptyForm); setEditItem(null); setShowForm(false)
  }

  const typeIcon = t => t==='movie'?'🎬':t==='series'?'📺':'🎞️'

  return (
    <div className="screen">
      {/* Add button at top */}
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>{ setEditItem(null); setForm(emptyForm); setShowForm(true) }} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Adicionar título</button>
      </div>

      <div style={{ display:'flex', gap:8, padding:'10px 14px 0', flexShrink:0 }}>
        {[
          { id:'watchlist', label:'Quero ver',  icon:'🔖', bg:'#FAEEDA', tc:'#633806' },
          { id:'watching',  label:'Assistindo', icon:'▶️', bg:'#EEEDFE', tc:'#534AB7' },
          { id:'done',      label:'Assistidos', icon:'✅', bg:'#EAF3DE', tc:'#27500A' },
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

      <div style={{ padding:'8px 14px 4px', display:'flex', gap:6, flexShrink:0 }}>
        {[{v:'all',l:'Tudo'},{v:'movie',l:'🎬 Filmes'},{v:'series',l:'📺 Séries'}].map(x=>(
          <button key={x.v} onClick={()=>setTypeF(x.v)} style={{
            padding:'4px 12px', borderRadius:20, border:'0.5px solid #ddd',
            background:typeF===x.v?'#534AB7':'#fff', color:typeF===x.v?'#fff':'#888',
            fontSize:12, cursor:'pointer'
          }}>{x.l}</button>
        ))}
      </div>
      <div style={{ padding:'0 14px 4px', flexShrink:0 }}>
        <input type="search" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="screen-scroll">
        {filtered.length===0
          ? <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>Lista vazia</div>
          : filtered.map(item=>(
            <div key={item.id} style={{ border:'0.5px solid #eee', borderRadius:12, padding:'14px', marginBottom:8, background:'#fff' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <div style={{ width:48, height:68, borderRadius:8, flexShrink:0, overflow:'hidden', background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                  {item.coverUrl ? <img src={item.coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (item.emoji || typeIcon(item.type))}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, lineHeight:1.3 }}>{item.title}</div>
                  <div style={{ display:'flex', gap:5, marginTop:4, flexWrap:'wrap' }}>
                    <span className="tag tag-purple">{item.genre}</span>
                    {item.platform&&<span className="tag" style={{ background:'#f0efe8', color:'#888' }}>{item.platform}</span>}
                    {item.type==='series'&&item.seasons&&<span className="tag" style={{ background:'#f0efe8', color:'#888' }}>{item.seasons} temp.</span>}
                  </div>
                  {item.status==='done'&&item.rating>0&&(
                    <div style={{ display:'flex', gap:1, marginTop:4 }}>
                      {[1,2,3,4,5].map(n=><span key={n} style={{ fontSize:13, color:n<=item.rating?'#F0C040':'#ddd' }}>★</span>)}
                    </div>
                  )}
                  {item.notes&&<div style={{ fontSize:12, color:'#999', marginTop:4, fontStyle:'italic' }}>"{item.notes}"</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {item.status!=='watching'&&item.status!=='done'&&(
                    <button onClick={()=>update(item.id,{status:'watching'})} style={{ background:'#EEEDFE', border:'none', borderRadius:6, padding:'4px 8px', fontSize:10, color:'#534AB7', cursor:'pointer' }}>Assistindo</button>
                  )}
                  {item.status!=='done'&&(
                    <button onClick={()=>update(item.id,{status:'done'})} style={{ background:'#EAF3DE', border:'none', borderRadius:6, padding:'4px 8px', fontSize:10, color:'#27500A', cursor:'pointer' }}>Concluído</button>
                  )}
                  {item.status==='done'&&(
                    <div style={{ display:'flex', gap:1 }}>
                      {[1,2,3,4,5].map(n=><span key={n} onClick={()=>update(item.id,{rating:n})} style={{ fontSize:14, cursor:'pointer', color:n<=(item.rating||0)?'#F0C040':'#ddd' }}>★</span>)}
                    </div>
                  )}
                  <button onClick={()=>openEdit(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
                  <button onClick={()=>remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16 }}>×</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem ? 'Editar título' : 'Adicionar título'}</div>
            <div className="form-group">
              <div style={{ display:'flex', gap:8 }}>
                <input type="text" placeholder="😀" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{ width:60 }}/>
                <input type="text" placeholder="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus style={{ flex:1 }}/>
              </div>
              <input type="text" placeholder="URL da capa (opcional)" value={form.coverUrl} onChange={e=>setForm({...form,coverUrl:e.target.value})}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, background:'#f0efe8', borderRadius:10, padding:3 }}>
                {[{v:'movie',l:'🎬 Filme'},{v:'series',l:'📺 Série'}].map(x=>(
                  <button key={x.v} onClick={()=>setForm({...form,type:x.v})} style={{
                    padding:'8px', border:'none', borderRadius:8, cursor:'pointer', fontSize:13,
                    background:form.type===x.v?'#fff':'transparent', color:form.type===x.v?'#1a1a18':'#999',
                    boxShadow:form.type===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
                  }}>{x.l}</button>
                ))}
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Gênero</label>
                  <select value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})}>
                    {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Plataforma</label>
                  <select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
                    <option value="">Nenhuma</option>
                    {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {form.type==='series'&&(
                <input type="number" placeholder="Nº de temporadas" value={form.seasons} onChange={e=>setForm({...form,seasons:e.target.value})}/>
              )}
              <div>
                <label className="form-label">Status</label>
                <div style={{ display:'flex', gap:4 }}>
                  {[{v:'watchlist',l:'Quero ver'},{v:'watching',l:'Assistindo'},{v:'done',l:'Assistido'}].map(s=>(
                    <button key={s.v} onClick={()=>setForm({...form,status:s.v})} style={{
                      flex:1, padding:'7px 4px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11,
                      background:form.status===s.v?'#534AB7':'#f0efe8', color:form.status===s.v?'#fff':'#888'
                    }}>{s.l}</button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Notas..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
                style={{ resize:'none', height:56, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
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
