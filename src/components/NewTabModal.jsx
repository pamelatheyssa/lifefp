import { useState } from 'react'

const EMOJI_OPTIONS = [
  '📝','📌','🗒️','💡','🌟','🎨','🏋️','🌍','✈️','🎮',
  '🧪','🐾','🌱','🍕','🎸','📷','🧘','🏠','💼','🎁',
  '🔬','🏆','🎯','🌊','🎤','🧩','💰','📊','🗓️','🔖',
]

export default function NewTabModal({ onClose, onSave }) {
  const [form, setForm] = useState({ label:'', icon:'📝', scope:'private' })
  const [error, setError] = useState('')

  const save = () => {
    if (!form.label.trim()) { setError('Dê um nome à aba.'); return }
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="sheet-title">Nova aba personalizada</div>

        <div className="form-group">
          {/* Name */}
          <div>
            <label className="form-label">Nome da aba</label>
            <input type="text" placeholder="Ex: Receitas, Projetos, Viagens..."
              value={form.label}
              onChange={e => { setForm({...form, label:e.target.value}); setError('') }}
              autoFocus/>
            {error && <div style={{ fontSize:12, color:'#E24B4A', marginTop:4 }}>{error}</div>}
          </div>

          {/* Icon */}
          <div>
            <label className="form-label">Ícone</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
              {EMOJI_OPTIONS.map(e => (
                <div key={e} onClick={() => setForm({...form, icon:e})} style={{
                  width:38, height:38, borderRadius:8, display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:20,
                  cursor:'pointer',
                  background: form.icon===e ? '#EEEDFE' : '#f0efe8',
                  border: form.icon===e ? '1.5px solid #534AB7' : '1.5px solid transparent'
                }}>{e}</div>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="form-label">Visibilidade</label>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:6 }}>
              {[
                { v:'private', icon:'🔒', title:'Privada', desc:'Só você vê e edita' },
                { v:'group',   icon:'👥', title:'Do grupo', desc:'Todos do grupo podem ver e editar' },
              ].map(s => (
                <div key={s.v} onClick={() => setForm({...form, scope:s.v})} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderRadius:10, cursor:'pointer',
                  border: form.scope===s.v ? '1.5px solid #534AB7' : '0.5px solid #e4e2dc',
                  background: form.scope===s.v ? '#EEEDFE' : '#fff'
                }}>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color: form.scope===s.v?'#534AB7':'#1a1a18' }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{s.desc}</div>
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    <div style={{
                      width:20, height:20, borderRadius:'50%',
                      border: form.scope===s.v ? '5px solid #534AB7' : '1.5px solid #ccc',
                      transition:'all .15s'
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{
          display:'flex', alignItems:'center', gap:8, padding:'12px',
          background:'#f8f8f5', borderRadius:10, marginBottom:14
        }}>
          <span style={{ fontSize:22 }}>{form.icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>{form.label || 'Nome da aba'}</div>
            <div style={{ fontSize:11, color:'#888' }}>{form.scope==='group'?'👥 Compartilhada':'🔒 Privada'}</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={save}>Criar aba</button>
        </div>
      </div>
    </div>
  )
}
