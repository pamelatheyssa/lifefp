import { useState } from 'react'
import { useAuth }   from '../AuthContext.jsx'
import { doc, updateDoc, arrayRemove, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

export default function ProfileModal({ onClose }) {
  const { user, group, logout, inviteMember } = useAuth()
  const [tab,         setTab]         = useState('group')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg,   setInviteMsg]   = useState(null)
  const [groupName,   setGroupName]   = useState(group?.name || '')
  const [editingName, setEditingName] = useState(false)
  const [saving,      setSaving]      = useState(false)

  const isAdmin = group?.adminUid === user?.uid
  const members = group?.members  || []

  const initials = (name='') =>
    name.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('') || '?'

  const COLORS = [
    {bg:'#EEEDFE',tc:'#3C3489'},{bg:'#EAF3DE',tc:'#27500A'},
    {bg:'#FAEEDA',tc:'#633806'},{bg:'#E1F5EE',tc:'#085041'},
    {bg:'#FBEAF0',tc:'#72243E'},
  ]

  // ── Renomear grupo ──────────────────────────────────────────────────────────
  const saveGroupName = async () => {
    if (!groupName.trim() || !group) return
    setSaving(true)
    try {
      await updateDoc(doc(db,'groups',group.id), { name: groupName.trim() })
      setEditingName(false)
    } catch(e) { alert('Erro ao salvar: '+e.message) }
    setSaving(false)
  }

  // ── Remover membro ──────────────────────────────────────────────────────────
  const removeMember = async (member) => {
    if (!isAdmin) return
    if (member.uid === user.uid) { alert('Transfira a administração antes de se remover.'); return }
    if (!window.confirm(`Remover ${member.name} do grupo?`)) return
    setSaving(true)
    try {
      await updateDoc(doc(db,'groups',group.id), { members: arrayRemove(member) })
      await setDoc(doc(db,'users',member.uid), { groupId: null }, { merge:true })
      alert(`${member.name} removido. Mudança efetiva no próximo login dele.`)
    } catch(e) { alert('Erro: '+e.message) }
    setSaving(false)
  }

  // ── Transferir admin ────────────────────────────────────────────────────────
  const transferAdmin = async (member) => {
    if (!isAdmin) return
    if (!window.confirm(`Transferir administração para ${member.name}?`)) return
    setSaving(true)
    try {
      await updateDoc(doc(db,'groups',group.id), { adminUid: member.uid })
      alert(`${member.name} agora é administrador.`)
    } catch(e) { alert('Erro: '+e.message) }
    setSaving(false)
  }

  // ── Sair do grupo ───────────────────────────────────────────────────────────
  const leaveGroup = async () => {
    if (isAdmin && members.length > 1) {
      alert('Você é admin. Transfira a administração antes de sair.')
      return
    }
    if (!window.confirm('Sair do grupo? Você perderá acesso ao calendário e finanças compartilhados.')) return
    setSaving(true)
    try {
      const me = members.find(m => m.uid === user.uid)
      if (me) await updateDoc(doc(db,'groups',group.id), { members: arrayRemove(me) })
      await setDoc(doc(db,'users',user.uid), { groupId: null }, { merge:true })
      alert('Você saiu do grupo. Recarregue o app.')
      window.location.reload()
    } catch(e) { alert('Erro: '+e.message) }
    setSaving(false)
  }

  // ── Convidar ────────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) { setInviteMsg({ok:false,text:'Digite um e-mail válido.'}); return }
    if (members.some(m => m.email?.toLowerCase()===email)) {
      setInviteMsg({ok:false,text:'Esse e-mail já é membro.'}); return
    }
    const res = await inviteMember(email)
    setInviteMsg(res?.ok
      ? {ok:true,  text:`✅ Convite enviado para ${email}. Quando fizer login no app, entrará no grupo automaticamente.`}
      : {ok:false, text:'❌ '+(res?.error||'Erro ao enviar.')}
    )
    if (res?.ok) setInviteEmail('')
    setTimeout(() => setInviteMsg(null), 7000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>

        {/* Header do usuário */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{
            width:52,height:52,borderRadius:'50%',overflow:'hidden',
            background:'#EEEDFE',flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center'
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <span style={{fontSize:18,fontWeight:700,color:'#3C3489'}}>{initials(user?.displayName)}</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:600}}>{user?.displayName}</div>
            <div style={{fontSize:12,color:'#888'}}>{user?.email}</div>
            <div style={{fontSize:11,color:'#bbb',marginTop:2}}>
              {isAdmin?'👑 Admin':'👤 Membro'} · {group?.name}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display:'grid',gridTemplateColumns:'1fr 1fr',background:'#f0efe8',
          borderRadius:10,padding:3,marginBottom:16
        }}>
          {[{v:'group',l:'👥 Grupo'},{v:'account',l:'⚙️ Conta'}].map(t=>(
            <button key={t.v} onClick={()=>setTab(t.v)} style={{
              padding:'8px',border:'none',borderRadius:8,cursor:'pointer',
              fontSize:13,fontWeight:500,
              background:tab===t.v?'#fff':'transparent',
              color:tab===t.v?'#1a1a18':'#999',
              boxShadow:tab===t.v?'0 1px 3px rgba(0,0,0,.1)':'none'
            }}>{t.l}</button>
          ))}
        </div>

        {/* ── TAB: GRUPO ─────────────────────────────────────────────────── */}
        {tab==='group' && <>

          {/* Nome do grupo */}
          <div style={{marginBottom:16}}>
            <div className="section-label" style={{marginBottom:8}}>Nome do grupo</div>
            {editingName ? (
              <div style={{display:'flex',gap:8}}>
                <input type="text" value={groupName}
                  onChange={e=>setGroupName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&saveGroupName()} autoFocus style={{flex:1}}/>
                <button className="btn-primary" onClick={saveGroupName} disabled={saving}
                  style={{width:'auto',padding:'9px 14px'}}>{saving?'…':'Salvar'}</button>
                <button className="btn-ghost" onClick={()=>{setEditingName(false);setGroupName(group?.name||'')}}
                  style={{width:'auto',padding:'9px 12px'}}>✕</button>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:15,fontWeight:600}}>{group?.name}</span>
                {isAdmin && (
                  <button onClick={()=>setEditingName(true)} style={{
                    background:'none',border:'0.5px solid #e4e2dc',borderRadius:7,
                    padding:'5px 10px',fontSize:12,color:'#888',cursor:'pointer'
                  }}>✏️ Renomear</button>
                )}
              </div>
            )}
          </div>

          {/* Membros */}
          <div className="section-label" style={{marginBottom:8}}>Membros ({members.length})</div>

          {members.map((member,i) => {
            const col       = COLORS[i%COLORS.length]
            const isMe      = member.uid===user?.uid
            const isThisAdm = member.uid===group?.adminUid
            return (
              <div key={member.uid} style={{
                display:'flex',alignItems:'center',gap:10,
                padding:'11px 0',borderBottom:'0.5px solid #f0efe8'
              }}>
                <div style={{
                  width:38,height:38,borderRadius:'50%',overflow:'hidden',
                  background:col.bg,display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:13,fontWeight:600,color:col.tc,flexShrink:0
                }}>
                  {member.photo
                    ? <img src={member.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : initials(member.name)
                  }
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500}}>
                    {member.name} {isMe&&<span style={{fontSize:10,color:'#888'}}>(você)</span>}
                  </div>
                  <div style={{fontSize:11,color:'#bbb',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {member.email}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
                  <span style={{
                    fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:500,
                    background:isThisAdm?'#EEEDFE':'#f0efe8',
                    color:isThisAdm?'#534AB7':'#888'
                  }}>{isThisAdm?'👑 Admin':'Membro'}</span>
                  {isAdmin && !isMe && (
                    <div style={{display:'flex',gap:4}}>
                      {!isThisAdm && (
                        <button onClick={()=>transferAdmin(member)} title="Tornar admin" style={{
                          background:'#EEEDFE',border:'none',borderRadius:6,
                          padding:'4px 7px',fontSize:11,color:'#534AB7',cursor:'pointer'
                        }}>👑</button>
                      )}
                      <button onClick={()=>removeMember(member)} title="Remover" style={{
                        background:'#FCEBEB',border:'none',borderRadius:6,
                        padding:'4px 7px',fontSize:11,color:'#A32D2D',cursor:'pointer'
                      }}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Convidar */}
          <div style={{marginTop:16,background:'#f8f8f5',borderRadius:12,padding:'14px'}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Convidar novo membro</div>
            <div style={{fontSize:12,color:'#999',marginBottom:10,lineHeight:1.5}}>
              A pessoa entra no grupo automaticamente ao fazer login com o e-mail convidado.
            </div>
            <div style={{display:'flex',gap:8}}>
              <input type="email" placeholder="email@gmail.com" value={inviteEmail}
                onChange={e=>setInviteEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleInvite()}
                style={{flex:1,fontSize:13}}/>
              <button className="btn-primary" onClick={handleInvite}
                style={{width:'auto',padding:'9px 14px',fontSize:13}}>Convidar</button>
            </div>
            {inviteMsg && (
              <div style={{
                marginTop:8,fontSize:12,lineHeight:1.5,padding:'8px 10px',borderRadius:8,
                background:inviteMsg.ok?'#EAF3DE':'#FCEBEB',
                color:inviteMsg.ok?'#27500A':'#791F1F'
              }}>{inviteMsg.text}</div>
            )}
          </div>

          {/* Sair do grupo */}
          {(!isAdmin || members.length===1) && (
            <button onClick={leaveGroup} disabled={saving} style={{
              width:'100%',marginTop:14,padding:'11px',
              background:'#FCEBEB',border:'none',borderRadius:10,
              cursor:'pointer',fontSize:13,color:'#A32D2D',fontWeight:500
            }}>Sair do grupo</button>
          )}

          {/* Nota de privacidade */}
          <div style={{
            marginTop:14,padding:'11px 12px',borderRadius:10,
            background:'#f0efe8',fontSize:12,color:'#888',lineHeight:1.7
          }}>
            🔒 <strong>Privado</strong> (só você): tarefas, dieta, hábitos, leitura, filmes, wishlist.<br/>
            👥 <strong>Grupo</strong> (todos veem): calendário, finanças.
          </div>
        </>}

        {/* ── TAB: CONTA ─────────────────────────────────────────────────── */}
        {tab==='account' && <>
          <div style={{marginBottom:16}}>
            <div className="section-label" style={{marginBottom:10}}>Conta Google vinculada</div>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px',background:'#f8f8f5',borderRadius:10}}>
              <div style={{
                width:40,height:40,borderRadius:'50%',overflow:'hidden',
                background:'#EEEDFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0
              }}>
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:15,fontWeight:700,color:'#3C3489'}}>{initials(user?.displayName)}</span>
                }
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>{user?.displayName}</div>
                <div style={{fontSize:12,color:'#888'}}>{user?.email}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:'#bbb',marginTop:8,lineHeight:1.6}}>
              Para alterar nome ou foto, acesse myaccount.google.com. As mudanças aparecem no próximo login.
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div className="section-label" style={{marginBottom:10}}>Informações do grupo</div>
            <div style={{fontSize:13,color:'#888',lineHeight:1.9}}>
              <strong>Grupo:</strong> {group?.name}<br/>
              <strong>Membros:</strong> {members.length}<br/>
              <strong>Sua função:</strong> {isAdmin?'Administrador':'Membro'}<br/>
              <strong>ID:</strong> <span style={{fontFamily:'monospace',fontSize:11,color:'#bbb'}}>{group?.id}</span>
            </div>
          </div>

          <button onClick={logout} style={{
            width:'100%',padding:'12px',background:'#FCEBEB',border:'none',
            borderRadius:10,cursor:'pointer',fontSize:14,color:'#A32D2D',fontWeight:500
          }}>Sair da conta</button>
        </>}

        <button onClick={onClose} className="btn-ghost" style={{marginTop:10}}>Fechar</button>
      </div>
    </div>
  )
}
