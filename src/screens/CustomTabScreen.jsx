import { useState } from 'react'
import { useData } from '../useData.js'

export default function CustomTabScreen({ tab }) {
  const scope = tab.scope || 'private'
  const { items, add, update, remove } = useData(`custom_${tab.id}`, scope)
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')

  const save = async () => {
    if (!text.trim()) return
    await add({ text: text.trim(), done: false })
    setText('')
    setShowForm(false)
  }

  const startEdit = (item) => {
    setEditId(item.id)
    setEditText(item.text)
  }

  const saveEdit = async () => {
    if (!editText.trim()) return
    await update(editId, { text: editText.trim() })
    setEditId(null)
  }

  const pending = items.filter(i => !i.done)
  const done    = items.filter(i =>  i.done)

  return (
    <div className="screen">
      <div className="screen-scroll">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontSize:28 }}>{tab.icon}</span>
          <div>
            <div style={{ fontSize:16, fontWeight:600 }}>{tab.label}</div>
            <span className={`privacy-badge ${scope}`}>
              {scope==='group' ? '👥 Compartilhado com o grupo' : '🔒 Privado'}
            </span>
          </div>
        </div>

        {pending.length === 0 && done.length === 0 && (
          <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>
            Nenhum item ainda. Adicione o primeiro!
          </div>
        )}

        {pending.map(item => (
          <div key={item.id} style={{
            display:'flex', alignItems:'flex-start', gap:10,
            padding:'11px 0', borderBottom:'0.5px solid #f0efe8'
          }}>
            <div className={`check-square ${item.done?'done':''}`}
              onClick={() => update(item.id, { done:!item.done })}
              style={{ marginTop:2 }}>
              {item.done ? '✓' : ''}
            </div>
            {editId === item.id ? (
              <div style={{ flex:1, display:'flex', gap:6 }}>
                <input type="text" value={editText} onChange={e=>setEditText(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&saveEdit()} autoFocus style={{ flex:1 }}/>
                <button className="btn-primary" onClick={saveEdit} style={{ width:'auto', padding:'6px 12px' }}>✓</button>
              </div>
            ) : (
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color: item.done?'#bbb':'#1a1a18', textDecoration:item.done?'line-through':'none' }}>
                  {item.text}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              {editId !== item.id && (
                <button onClick={() => startEdit(item)} style={{
                  background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14
                }}>✏️</button>
              )}
              <button onClick={() => remove(item.id)} style={{
                background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18
              }}>×</button>
            </div>
          </div>
        ))}

        {done.length > 0 && (
          <details style={{ marginTop:12 }}>
            <summary style={{
              fontSize:12, fontWeight:600, color:'#888', textTransform:'uppercase',
              letterSpacing:'.05em', cursor:'pointer', marginBottom:8,
              listStyle:'none', display:'flex', alignItems:'center', gap:6
            }}>
              Concluídos ({done.length}) ▼
            </summary>
            {done.map(item => (
              <div key={item.id} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 0', borderBottom:'0.5px solid #f0efe8', opacity:.6
              }}>
                <div className="check-square done" onClick={() => update(item.id, { done:false })}>✓</div>
                <div style={{ flex:1, fontSize:13, textDecoration:'line-through', color:'#888' }}>{item.text}</div>
                <button onClick={() => remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16 }}>×</button>
              </div>
            ))}
          </details>
        )}

        {showForm ? (
          <div style={{ marginTop:12, display:'flex', gap:8 }}>
            <input type="text" placeholder="Novo item..." value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key==='Enter' && save()}
              autoFocus style={{ flex:1 }}/>
            <button className="btn-primary" onClick={save} style={{ width:'auto', padding:'10px 16px' }}>Salvar</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setText('') }} style={{ width:'auto', padding:'10px 12px' }}>✕</button>
          </div>
        ) : (
          <div className="add-row" onClick={() => setShowForm(true)}>
            <span style={{ fontSize:18 }}>+</span><span>Novo item</span>
          </div>
        )}
      </div>
    </div>
  )
}
