import { useEffect, useState, useCallback, useRef } from 'react'
import { collection, query, onSnapshot,
         addDoc, updateDoc, deleteDoc,
         doc, serverTimestamp }              from 'firebase/firestore'
import { db }                               from './firebase.js'
import { useAuth }                          from './AuthContext.jsx'

export function useData(collName, scope = 'private') {
  const { user, group }     = useAuth()
  const [items,   setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const groupId = group?.id
  const userId  = user?.uid

  const basePath = scope === 'group'
    ? (groupId ? `groups/${groupId}/${collName}` : null)
    : (userId  ? `users/${userId}/${collName}`   : null)

  const basePathRef = useRef(basePath)
  useEffect(() => { basePathRef.current = basePath }, [basePath])

  useEffect(() => {
    if (!basePath) return
    setLoading(true)
    const unsub = onSnapshot(query(collection(db, basePath)), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('useData error:', collName, err)
      setLoading(false)
    })
    return unsub
  }, [basePath])

  const add = useCallback(async data => {
    if (!basePathRef.current) return
    return addDoc(collection(db, basePathRef.current), { ...data, _at: serverTimestamp() })
  }, [basePath])

  const update = useCallback(async (id, data) => {
    if (!basePathRef.current) return
    return updateDoc(doc(db, basePathRef.current, id), data)
  }, [basePath])

  const remove = useCallback(async id => {
    if (!basePathRef.current) return
    return deleteDoc(doc(db, basePathRef.current, id))
  }, [basePath])

  return { items, loading, add, update, remove }
}
