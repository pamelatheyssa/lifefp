import { useState, useEffect } from 'react'
import { useAuth }              from './AuthContext.jsx'
import { useData }              from './useData.js'
import LoginScreen              from './screens/LoginScreen.jsx'
import CalendarScreen           from './screens/CalendarScreen.jsx'
import TasksScreen              from './screens/TasksScreen.jsx'
import DietScreen               from './screens/DietScreen.jsx'
import FinanceScreen            from './screens/FinanceScreen.jsx'
import AnnualScreen             from './screens/AnnualScreen.jsx'
import HabitsScreen             from './screens/HabitsScreen.jsx'
import ReadingScreen            from './screens/ReadingScreen.jsx'
import MoviesScreen             from './screens/MoviesScreen.jsx'
import GroupMoviesScreen        from './screens/GroupMoviesScreen.jsx'
import ChoresScreen             from './screens/ChoresScreen.jsx'
import WishlistScreen           from './screens/WishlistScreen.jsx'
import WaterScreen              from './screens/WaterScreen.jsx'
import CustomTabScreen          from './screens/CustomTabScreen.jsx'
import ProfileModal             from './components/ProfileModal.jsx'
import NewTabModal              from './components/NewTabModal.jsx'

const BUILTIN_TABS = [
  { id:'calendar',    label:'Calendário',     icon:'📅', scope:'group'   },
  { id:'tasks',       label:'Tarefas',        icon:'✅', scope:'private' },
  { id:'diet',        label:'Dieta',          icon:'🥗', scope:'private' },
  { id:'water',       label:'Água',           icon:'💧', scope:'private' },
  { id:'finance',     label:'Finanças',       icon:'💰', scope:'group'   },
  { id:'annual',      label:'Anual',          icon:'📊', scope:'group'   },
  { id:'habits',      label:'Hábitos',        icon:'🎯', scope:'private' },
  { id:'reading',     label:'Leitura',        icon:'📚', scope:'private' },
  { id:'movies',      label:'Filmes',         icon:'🎬', scope:'private' },
  { id:'groupmovies', label:'Filmes do Grupo',icon:'🍿', scope:'group'   },
  { id:'chores',      label:'Tarefas Casa',   icon:'🧹', scope:'group'   },
  { id:'wishlist',    label:'Wishlist',       icon:'🛍️', scope:'private' },
]

const SCREENS = {
  calendar:    <CalendarScreen />,
  tasks:       <TasksScreen />,
  diet:        <DietScreen />,
  water:       <WaterScreen />,
  finance:     <FinanceScreen />,
  annual:      <AnnualScreen />,
  habits:      <HabitsScreen />,
  reading:     <ReadingScreen />,
  movies:      <MoviesScreen />,
  groupmovies: <GroupMoviesScreen />,
  chores:      <ChoresScreen />,
  wishlist:    <WishlistScreen />,
}

const S_TABS      = 'lp_visible_tabs'
const S_CUSTOM    = 'lp_custom_tabs'
const S_MY_LABELS = 'lp_tab_labels'
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def } catch { return def } }

function AppInner() {
  const { user } = useAuth()
  const params   = new URLSearchParams(window.location.search)

  const { items: groupLabelDocs, add: addGroupLabel, update: updateGroupLabel } = useData('tabLabels', 'group')
  const groupLabels = Object.fromEntries(groupLabelDocs.map(d => [d.tabId, d.label]))

  const [activeTab,   setActiveTab]   = useState(params.get('tab') || 'calendar')
  const [visibleTabs, setVisibleTabs] = useState(() => load(S_TABS, ['calendar','tasks','diet','water','finance','habits']))
  const [customTabs,  setCustomTabs]  = useState(() => load(S_CUSTOM, []))
  const [myLabels,    setMyLabels]    = useState(() => load(S_MY_LABELS, {}))
  const [showProfile, setShowProfile] = useState(false)
  const [showNewTab,  setShowNewTab]  = useState(false)
  const [showTabMgr,  setShowTabMgr]  = useState(false)
  const [renamingTab, setRenamingTab] = useState(null)
  const [renameVal,   setRenameVal]   = useState('')
  const [renameScope, setRenameScope] = useState('personal')

  useEffect(() => { localStorage.setItem(S_TABS,      JSON.stringify(visibleTabs)) }, [visibleTabs])
  useEffect(() => { localStorage.setItem(S_CUSTOM,    JSON.stringify(customTabs))  }, [customTabs])
  useEffect(() => { localStorage.setItem(S_MY_LABELS, JSON.stringify(myLabels))    }, [myLabels])

  const allTabs     = [...BUILTIN_TABS, ...customTabs.map(t => ({ ...t, custom:true }))]
  const resolveLabel = (t) => myLabels[t.id] || groupLabels[t.id] || t.label
  const navTabs     = allTabs.filter(t => visibleTabs.includes(t.id))
  const curMeta     = allTabs.find(t => t.id === activeTab) || { label:'Life Planner', scope:'private' }

  const getScreen = id => {
    if (SCREENS[id]) return SCREENS[id]
    const ct = customTabs.find(t => t.id === id)
    return ct ? <CustomTabScreen tab={ct} /> : null
  }

  const addCustomTab = tab => {
    const nt = { ...tab, id:'custom_'+Date.now() }
    setCustomTabs(p => [...p, nt])
    setVisibleTabs(p => [...p, nt.id])
    setActiveTab(nt.id)
  }

  const removeCustomTab = id => {
    setCustomTabs(p => p.filter(t => t.id !== id))
    setVisibleTabs(p => p.filter(t => t !== id))
    if (activeTab === id) setActiveTab('calendar')
  }

  const toggleVisible = id =>
    setVisibleTabs(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  const startRename = (t) => {
    setRenamingTab(t.id)
    setRenameVal(myLabels[t.id] || groupLabels[t.id] || t.label)
    setRenameScope('personal')
  }

  const confirmRename = async () => {
    if (!renamingTab || !renameVal.trim()) { setRenamingTab(null); return }
    if (renameScope === 'group') {
      const existing = groupLabelDocs.find(d => d.tabId === renamingTab)
      if (existing) await updateGroupLabel(existing.id, { label: renameVal.trim() })
      else          await addGroupLabel({ tabId: renamingTab, label: renameVal.trim() })
      setMyLabels(prev => { const n={...prev}; delete n[renamingTab]; return n })
    } else {
      setMyLabels(prev => ({ ...prev, [renamingTab]: renameVal.trim() }))
    }
    setRenamingTab(null)
  }

  const resetLabel = async (id) => {
    setMyLabels(prev => { const n={...prev}; delete n[id]; return n })
    const existing = groupLabelDocs.find(d => d.tabId === id)
    if (existing) await updateGroupLabel(existing.id, { label: '' })
  }

  const hasOverride = (t) => !!(myLabels[t.id] || groupLabels[t.id])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh' }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:'0.5px solid #e4e2dc', background:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:15, fontWeight:700, color:curMeta.scope==='group'?'#534AB7':'#1a1a18' }}>
            {resolveLabel(curMeta)}
          </span>
          <span className={`privacy-badge ${curMeta.scope}`}>
            {curMeta.scope==='group'?'👥 Grupo':'🔒 Privado'}
          </span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setShowTabMgr(true)} style={{ background:'none', border:'0.5px solid #e4e2dc', borderRadius:8, padding:'5px 9px', cursor:'pointer', fontSize:12, color:'#888' }}>⚙️ Abas</button>
          <button onClick={() => setShowProfile(true)} style={{ width:32, height:32, borderRadius:'50%', overflow:'hidden', border:'none', cursor:'pointer', padding:0, background:'#EEEDFE', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <span style={{ fontSize:13, fontWeight:600, color:'#3C3489' }}>{user.displayName?.[0]?.toUpperCase()}</span>
            }
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflow:'hidden' }}>
        {getScreen(activeTab)}
      </div>

      <nav style={{ display:'flex', borderTop:'0.5px solid #e4e2dc', background:'#fff', flexShrink:0, overflowX:'auto', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        {navTabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex:'0 0 auto', minWidth:56, display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'7px 6px 5px', background:'transparent', border:'none', cursor:'pointer', borderTop:activeTab===t.id?'2px solid #534AB7':'2px solid transparent' }}>
            <span style={{ fontSize:17 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:500, color:activeTab===t.id?'#534AB7':'#bbb', whiteSpace:'nowrap' }}>{resolveLabel(t)}</span>
          </button>
        ))}
        <button onClick={() => setShowNewTab(true)} style={{ flex:'0 0 auto', minWidth:48, display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'7px 6px 5px', background:'transparent', border:'none', cursor:'pointer', borderTop:'2px solid transparent' }}>
          <span style={{ fontSize:17 }}>＋</span>
          <span style={{ fontSize:9, color:'#ccc' }}>Nova</span>
        </button>
      </nav>

      {showTabMgr && (
        <div className="modal-overlay" onClick={() => { setShowTabMgr(false); setRenamingTab(null) }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Gerenciar abas</div>
            {allTabs.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0', borderBottom:'0.5px solid #f0efe8' }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  {renamingTab === t.id ? (
                    <div>
                      <input type="text" value={renameVal} onChange={e=>setRenameVal(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&confirmRename()} autoFocus
                        style={{ width:'100%', fontSize:13, padding:'5px 8px', marginBottom:6 }}/>
                      {t.scope === 'group' && (
                        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                          {[{v:'personal',l:'Só pra mim'},{v:'group',l:'Para o grupo inteiro'}].map(s=>(
                            <button key={s.v} onClick={()=>setRenameScope(s.v)} style={{
                              flex:1, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11,
                              background:renameScope===s.v?'#534AB7':'#f0efe8', color:renameScope===s.v?'#fff':'#888'
                            }}>{s.l}</button>
                          ))}
                        </div>
                      )}
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={confirmRename} style={{ flex:1, background:'#534AB7', border:'none', borderRadius:8, padding:'7px', color:'#fff', fontSize:12, cursor:'pointer' }}>✓ Salvar</button>
                        <button onClick={()=>setRenamingTab(null)} style={{ background:'none', border:'0.5px solid #ddd', borderRadius:8, padding:'7px 12px', cursor:'pointer', color:'#888', fontSize:12 }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{resolveLabel(t)}</div>
                      {groupLabels[t.id] && !myLabels[t.id] && (
                        <span style={{ fontSize:9, color:'#534AB7', background:'#EEEDFE', padding:'1px 5px', borderRadius:8 }}>grupo</span>
                      )}
                      {myLabels[t.id] && (
                        <span style={{ fontSize:9, color:'#888', background:'#f0efe8', padding:'1px 5px', borderRadius:8 }}>pessoal</span>
                      )}
                      <button onClick={()=>startRename(t)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:12 }}>✏️</button>
                      {hasOverride(t) && (
                        <button onClick={()=>resetLabel(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:10 }}>↩</button>
                      )}
                    </div>
                  )}
                  <span className={`privacy-badge ${t.scope}`}>{t.scope==='group'?'👥 Grupo':'🔒 Privado'}</span>
                </div>
                {t.custom && (
                  <button onClick={() => removeCustomTab(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:12 }}>Excluir</button>
                )}
                <div onClick={() => toggleVisible(t.id)} style={{ width:44, height:24, borderRadius:12, cursor:'pointer', background:visibleTabs.includes(t.id)?'#534AB7':'#e0ddd8', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:visibleTabs.includes(t.id)?23:3, transition:'left .2s' }}/>
                </div>
              </div>
            ))}
            <button className="btn-ghost" onClick={() => { setShowTabMgr(false); setRenamingTab(null) }} style={{ marginTop:14 }}>Fechar</button>
          </div>
        </div>
      )}

      {showNewTab  && <NewTabModal  onClose={() => setShowNewTab(false)}  onSave={addCustomTab} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', fontSize:32 }}>📋</div>
  )
  if (!user) return <LoginScreen />
  return <AppInner />
}
