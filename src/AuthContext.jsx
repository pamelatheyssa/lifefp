import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged }                             from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, arrayUnion }    from 'firebase/firestore'
import { auth, db, loginWithGoogle, getLoginResult,
         logout, isConfigured }                          from './firebase.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null)
  const [group,      setGroup]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [loginError, setLoginError] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    console.log('🔄 Verificando redirect result...')

    getLoginResult()
      .then(result => {
        console.log('✅ Redirect result:', result)
      })
      .catch(err => {
        console.error('❌ Redirect error code:', err.code)
        console.error('❌ Redirect error full:', err)
        setLoginError(friendlyError(err.code))
        setLoading(false)
      })

    const unsub = onAuthStateChanged(auth, async u => {
      console.log('👤 Auth state changed:', u?.email ?? 'null')
      setProcessing(false)
      setUser(u)
      if (u) { setLoginError(null); await ensureGroup(u) }
      else   { setGroup(null); setLoading(false) }
    })

    return unsub
  }, [])

  async function ensureGroup(u) {
    try {
      const userRef  = doc(db, 'users', u.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists() && userSnap.data().groupId) {
        const gid       = userSnap.data().groupId
        const groupSnap = await getDoc(doc(db, 'groups', gid))
        if (groupSnap.exists()) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() })
          setLoading(false); return
        }
      }

      const invRef  = doc(db, 'invites', u.email)
      const invSnap = await getDoc(invRef)
      if (invSnap.exists() && !invSnap.data().used) {
        const gid       = invSnap.data().groupId
        const groupSnap = await getDoc(doc(db, 'groups', gid))
        if (groupSnap.exists()) {
          const member = { uid:u.uid, name:u.displayName, email:u.email, photo:u.photoURL }
          await updateDoc(doc(db, 'groups', gid), { members: arrayUnion(member) })
          await setDoc(userRef, { groupId:gid, name:u.displayName, email:u.email }, { merge:true })
          await setDoc(invRef, { used:true }, { merge:true })
          setGroup({ id:gid, ...groupSnap.data(), members:[...groupSnap.data().members, member] })
          setLoading(false); return
        }
      }

      const gid    = u.uid + '_group'
      const member = { uid:u.uid, name:u.displayName, email:u.email, photo:u.photoURL }
      await setDoc(doc(db, 'groups', gid), {
        name:     (u.displayName||'Meu') + "'s Grupo",
        adminUid: u.uid,
        members:  [member]
      }, { merge:true })
      await setDoc(userRef, { groupId:gid, name:u.displayName, email:u.email }, { merge:true })
      setGroup({ id:gid, name:(u.displayName||'Meu')+"'s Grupo", adminUid:u.uid, members:[member] })
    } catch (err) {
      setLoginError('Erro ao carregar dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
  setLoginError(null); setProcessing(true)
  try {
    const result = await loginWithGoogle()
    if (result?.user) {
      setUser(result.user)
      await ensureGroup(result.user)
    }
  } catch (err) {
    setLoginError(friendlyError(err.code))
    setProcessing(false)
  }
}

  async function inviteMember(email) {
    if (!group) return { error: 'Sem grupo ativo' }
    try {
      await setDoc(doc(db, 'invites', email.toLowerCase()), {
        groupId: group.id, invitedBy: user.email, used: false
      }, { merge:true })
      return { ok: true }
    } catch (err) { return { error: err.message } }
  }

  return (
    <AuthCtx.Provider value={{
      user, group, loading, loginError, processing,
      isConfigured, loginWithGoogle: handleLogin, logout, inviteMember
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

function friendlyError(code) {
  const m = {
    'auth/unauthorized-domain':   '❌ Domínio não autorizado.\nFirebase → Authentication → Settings → Authorized domains → adicione o domínio do seu site.',
    'auth/operation-not-allowed': '❌ Login com Google não está ativado.\nFirebase → Authentication → Sign-in method → Google → Ativar.',
    'auth/invalid-api-key':       '❌ API Key inválida. Verifique o src/firebase.js.',
    'auth/network-request-failed':'❌ Sem conexão com a internet.',
  }
  return m[code] ?? `❌ Erro: ${code}`
}
