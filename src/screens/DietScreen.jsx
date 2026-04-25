import { useState } from 'react'
import { useData } from '../useData.js'

const FOOD_DB = [
  { name:'Amendoim torrado',        kcal100:567, carb:16.1, prot:25.8, fat:49.2 },
  { name:'Arroz branco cozido',     kcal100:130, carb:28.1, prot:2.7,  fat:0.3  },
  { name:'Arroz integral cozido',   kcal100:124, carb:25.8, prot:2.6,  fat:1.0  },
  { name:'Atum em água (lata)',     kcal100:109, carb:0,    prot:24.1, fat:0.9  },
  { name:'Aveia em flocos',         kcal100:394, carb:67.0, prot:14.0, fat:8.5  },
  { name:'Azeite de oliva',         kcal100:884, carb:0,    prot:0,    fat:100  },
  { name:'Banana nanica',           kcal100:92,  carb:23.8, prot:1.4,  fat:0.2  },
  { name:'Banana prata',            kcal100:98,  carb:26.0, prot:1.3,  fat:0.1  },
  { name:'Batata cozida',           kcal100:87,  carb:20.1, prot:1.9,  fat:0.1  },
  { name:'Batata-doce cozida',      kcal100:77,  carb:18.4, prot:1.4,  fat:0.1  },
  { name:'Carne bovina grelhada',   kcal100:219, carb:0,    prot:28.0, fat:12.0 },
  { name:'Castanha-do-pará',        kcal100:656, carb:12.3, prot:14.3, fat:67.0 },
  { name:'Cenoura crua',            kcal100:34,  carb:7.9,  prot:0.8,  fat:0.2  },
  { name:'Chocolate 70%',           kcal100:598, carb:46.0, prot:8.0,  fat:43.0 },
  { name:'Feijão carioca cozido',   kcal100:76,  carb:13.6, prot:4.8,  fat:0.5  },
  { name:'Feijão preto cozido',     kcal100:77,  carb:14.0, prot:4.5,  fat:0.5  },
  { name:'Frango cozido',           kcal100:153, carb:0,    prot:28.9, fat:3.7  },
  { name:'Frango grelhado',         kcal100:165, carb:0,    prot:31.0, fat:3.6  },
  { name:'Granola',                 kcal100:408, carb:65.0, prot:9.0,  fat:13.0 },
  { name:'Hambúrguer Big Mac',      kcal100:257, carb:23.5, prot:12.8, fat:12.0 },
  { name:'Hambúrguer artesanal',    kcal100:280, carb:8.0,  prot:18.0, fat:20.0 },
  { name:'Hambúrguer de frango',    kcal100:218, carb:14.0, prot:18.0, fat:9.0  },
  { name:'Iogurte YoPRO 15g prot',  kcal100:57,  carb:5.5,  prot:9.0,  fat:0.5  },
  { name:'Iogurte natural integral',kcal100:61,  carb:4.7,  prot:3.5,  fat:3.3  },
  { name:'Laranja',                 kcal100:47,  carb:11.7, prot:0.9,  fat:0.1  },
  { name:'Leite integral',          kcal100:61,  carb:4.8,  prot:3.2,  fat:3.2  },
  { name:'Macarrão cozido',         kcal100:131, carb:25.2, prot:4.9,  fat:1.1  },
  { name:'Mamão papaia',            kcal100:40,  carb:10.4, prot:0.5,  fat:0.1  },
  { name:'Manteiga',                kcal100:726, carb:0,    prot:0.6,  fat:82.0 },
  { name:'Maçã',                    kcal100:52,  carb:13.8, prot:0.3,  fat:0.2  },
  { name:'Ovo cozido',              kcal100:155, carb:1.1,  prot:13.0, fat:10.6 },
  { name:'Ovo frito sem óleo',      kcal100:196, carb:0.4,  prot:13.6, fat:15.3 },
  { name:'Ovo mexido',              kcal100:148, carb:1.6,  prot:9.7,  fat:11.2 },
  { name:'Pão de forma Pullman',    kcal100:267, carb:48.0, prot:8.5,  fat:4.8  },
  { name:'Pão de forma integral',   kcal100:253, carb:43.0, prot:9.4,  fat:4.6  },
  { name:'Pão de queijo',           kcal100:305, carb:50.0, prot:6.2,  fat:9.5  },
  { name:'Pão francês',             kcal100:300, carb:58.6, prot:9.4,  fat:3.1  },
  { name:'Patinho moído',           kcal100:170, carb:0,    prot:21.0, fat:9.5  },
  { name:'Presunto fatiado',        kcal100:145, carb:1.5,  prot:16.0, fat:8.5  },
  { name:'Queijo minas frescal',    kcal100:264, carb:3.2,  prot:17.4, fat:20.2 },
  { name:'Requeijão',               kcal100:255, carb:3.2,  prot:9.0,  fat:23.0 },
  { name:'Salada folhas verdes',    kcal100:20,  carb:3.0,  prot:1.5,  fat:0.3  },
  { name:'Salmão grelhado',         kcal100:208, carb:0,    prot:20.0, fat:13.0 },
  { name:'Tapioca',                 kcal100:358, carb:88.0, prot:0.2,  fat:0.1  },
  { name:'Tomate',                  kcal100:18,  carb:3.9,  prot:0.9,  fat:0.2  },
  { name:'Tortilha (wrap)',         kcal100:298, carb:49.0, prot:8.2,  fat:7.0  },
  { name:'Whey protein',            kcal100:375, carb:7.5,  prot:75.0, fat:5.0  },
]

const MEALS_ORDER   = ['Café da manhã','Lanche da manhã','Almoço','Lanche da tarde','Jantar','Ceia']
const MONTHS_SHORT  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

// Brasília = UTC-3
function todayBrasilia() {
  const now    = new Date()
  const offset = -3 * 60
  const local  = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000)
  return local.toISOString().split('T')[0]
}

function calcFood(food, weightG) {
  const f = weightG / 100
  return {
    cal:  Math.round(food.kcal100 * f),
    carb: Math.round(food.carb * f * 10) / 10,
    prot: Math.round(food.prot * f * 10) / 10,
    fat:  Math.round(food.fat  * f * 10) / 10,
  }
}

export default function DietScreen() {
  const { items: meals,       add,          update,           remove          } = useData('meals',           'private')
  const { items: goalDocs,    add: addGoal, update: updateGoal                } = useData('dietSettings',    'private')
  const { items: prescribed,  add: addPres, update: updatePres, remove: removePres } = useData('dietPrescribed', 'private')

  const dietGoal   = goalDocs[0]?.goal || 2000
  const setDietGoal = async (val) => {
    if (goalDocs[0]) await updateGoal(goalDocs[0].id, { goal: val })
    else             await addGoal({ goal: val })
  }

  const todayKey   = todayBrasilia()
  const todayMeals = meals.filter(m => m.date === todayKey)
  const consumed   = todayMeals.reduce((s, m) => s + (m.cal||0), 0)
  const remain     = Math.max(0, dietGoal - consumed)
  const pct        = Math.min(100, Math.round(consumed / dietGoal * 100))
  const barColor   = pct>=100?'#E24B4A':pct>=75?'#BA7517':'#534AB7'
  const totalCarb  = todayMeals.reduce((s,m)=>s+(m.carb||0),0)
  const totalProt  = todayMeals.reduce((s,m)=>s+(m.prot||0),0)
  const totalFat   = todayMeals.reduce((s,m)=>s+(m.fat||0),0)

  // Sub-tabs
  const [subTab, setSubTab] = useState('today') // 'today' | 'prescribed' | 'history'

  // Today tab state
  const [showForm,     setShowForm]     = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [mode,         setMode]         = useState('search') // 'search' | 'custom' | 'beverage'
  const [search,       setSearch]       = useState('')
  const [selFood,      setSelFood]      = useState(null)
  const [weightG,      setWeightG]      = useState(100)
  const [mealType,     setMealType]     = useState('Almoço')
  const [newGoal,      setNewGoal]      = useState(dietGoal)
  const [customFood,   setCustomFood]   = useState({ name:'', cal:'', carb:'', prot:'', fat:'' })
  const [bevForm,      setBevForm]      = useState({ name:'', ml:'', cal100ml:'' })

  // Prescribed diet state
  const [showPresForm,  setShowPresForm]  = useState(false)
  const [presForm,      setPresForm]      = useState({ meal:'Café da manhã', text:'', options:'' })
  const [editPresItem,  setEditPresItem]  = useState(null)

  const filtered = FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const preview  = selFood ? calcFood(selFood, weightG) : null

  const openEdit = (item) => {
    setEditItem(item); setMealType(item.mealType); setShowForm(true)
  }

  const save = async () => {
    if (editItem) {
      await update(editItem.id, { mealType, date: todayKey })
      setEditItem(null); setShowForm(false); return
    }
    if (mode === 'beverage') {
      const ml     = parseInt(bevForm.ml) || 0
      const cal100 = parseFloat(bevForm.cal100ml) || 0
      if (!bevForm.name || !ml) return
      const cal = Math.round(cal100 * ml / 100)
      await add({ name:`${bevForm.name} (${ml}ml)`, cal, carb:0, prot:0, fat:0, mealType, date:todayKey, isBeverage:true, ml })
      setBevForm({ name:'', ml:'', cal100ml:'' })
    } else if (mode === 'custom') {
      const cal = parseInt(customFood.cal) || 0
      if (!customFood.name || !cal) return
      await add({ name:customFood.name, cal, carb:parseFloat(customFood.carb)||0, prot:parseFloat(customFood.prot)||0, fat:parseFloat(customFood.fat)||0, mealType, date:todayKey })
      setCustomFood({ name:'', cal:'', carb:'', prot:'', fat:'' })
    } else {
      if (!selFood) return
      const calc = calcFood(selFood, weightG)
      await add({ name:`${selFood.name} (${weightG}g)`, ...calc, mealType, date:todayKey })
      setSelFood(null); setSearch(''); setWeightG(100)
    }
    setShowForm(false)
  }

  // Mark prescribed meal as done today
  const markPrescribedDone = async (pItem) => {
    const alreadyDone = meals.some(m => m.date === todayKey && m.prescribedId === pItem.id)
    if (alreadyDone) {
      const existing = meals.find(m => m.date === todayKey && m.prescribedId === pItem.id)
      if (existing) await remove(existing.id)
    } else {
      await add({
        name: pItem.text,
        cal:  pItem.cal || 0,
        carb: pItem.carb || 0,
        prot: pItem.prot || 0,
        fat:  pItem.fat  || 0,
        mealType: pItem.meal,
        date: todayKey,
        prescribedId: pItem.id,
      })
    }
  }

  const savePrescribed = async () => {
    if (!presForm.text.trim()) return
    if (editPresItem) {
      await updatePres(editPresItem.id, { meal:presForm.meal, text:presForm.text.trim(), options:presForm.options.trim(), cal:parseInt(presForm.cal)||0 })
      setEditPresItem(null)
    } else {
      await addPres({ meal:presForm.meal, text:presForm.text.trim(), options:presForm.options.trim(), cal:parseInt(presForm.cal)||0 })
    }
    setPresForm({ meal:'Café da manhã', text:'', options:'', cal:'' })
    setShowPresForm(false)
  }

  const mealGroups = MEALS_ORDER
    .map(m => ({ label:m, items:todayMeals.filter(i=>i.mealType===m) }))
    .filter(g => g.items.length > 0)

  // History
  const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate()-90)
  const cutoffStr  = cutoffDate.toISOString().split('T')[0]
  const histByDate = {}
  meals.filter(m => m.date >= cutoffStr && m.date !== todayKey).forEach(m => {
    if (!histByDate[m.date]) histByDate[m.date] = { cal:0, carb:0, prot:0, fat:0 }
    histByDate[m.date].cal  += m.cal  || 0
    histByDate[m.date].carb += m.carb || 0
    histByDate[m.date].prot += m.prot || 0
    histByDate[m.date].fat  += m.fat  || 0
  })
  const histDays = Object.entries(histByDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,90)
  const fmtDate  = ds => { const d=new Date(ds+'T12:00'); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` }

  const prescribedByMeal = MEALS_ORDER.map(m => ({
    label: m,
    items: prescribed.filter(p => p.meal === m)
  })).filter(g => g.items.length > 0)

  return (
    <div className="screen">
      <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
        <button onClick={()=>{ setEditItem(null); setShowForm(true) }} style={{
          width:'100%', padding:'11px', borderRadius:12, border:'none',
          background:'#534AB7', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer'
        }}>＋ Registrar alimento</button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:0, margin:'10px 14px 0', background:'#f0efe8', borderRadius:10, padding:3, flexShrink:0 }}>
        {[{v:'today',l:'🥗 Hoje'},{v:'prescribed',l:'📋 Prescrito'},{v:'history',l:'📅 Histórico'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{
            flex:1, padding:'7px 4px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500,
            background:subTab===x.v?'#fff':'transparent', color:subTab===x.v?'#1a1a18':'#999',
            boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
          }}>{x.l}</button>
        ))}
      </div>

      {/* ── TODAY ── */}
      {subTab === 'today' && (
        <div className="screen-scroll">
          <div style={{ background:'#EEEDFE', borderRadius:16, padding:'16px', marginBottom:12, marginTop:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontSize:11, color:'#7F77DD', fontWeight:600 }}>Calorias hoje</div>
                <div style={{ fontSize:38, fontWeight:700, color:'#3C3489', lineHeight:1.1 }}>{consumed}</div>
                <div style={{ fontSize:12, color:'#7F77DD' }}>de {dietGoal} kcal</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'#7F77DD' }}>Restante</div>
                <div style={{ fontSize:26, fontWeight:700, color:remain===0?'#A32D2D':'#3B6D11' }}>{remain}</div>
                <div style={{ fontSize:10, color:'#7F77DD' }}>kcal disponíveis</div>
              </div>
            </div>
            <div className="progress-wrap"><div className="progress-fill" style={{ width:`${pct}%`, background:barColor }}/></div>
            <button onClick={()=>setShowGoalForm(true)} style={{ background:'rgba(83,74,183,.15)', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#534AB7', cursor:'pointer', marginTop:8 }}>
              ✏️ Meta: {dietGoal} kcal
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            {[{label:'Carb.',val:Math.round(totalCarb),bg:'#FAEEDA',tc:'#633806'},{label:'Prot.',val:Math.round(totalProt),bg:'#EAF3DE',tc:'#27500A'},{label:'Gord.',val:Math.round(totalFat),bg:'#FCEBEB',tc:'#791F1F'}].map(m=>(
              <div key={m.label} style={{ background:m.bg, borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:m.tc }}>{m.val}g</div>
                <div style={{ fontSize:10, color:m.tc, opacity:.8 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {mealGroups.length===0
            ? <div style={{ textAlign:'center', color:'#bbb', padding:'20px 0', fontSize:13 }}>Nenhum alimento registrado hoje</div>
            : mealGroups.map(g=>(
              <div key={g.label} style={{ marginBottom:12 }}>
                <div className="section-label">{g.label} · {g.items.reduce((s,i)=>s+(i.cal||0),0)} kcal</div>
                {g.items.map(item=>(
                  <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', border:'0.5px solid #eee', borderRadius:8, background:'#fff', marginBottom:4 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#1a1a18' }}>{item.name}{item.isBeverage?' 🥤':''}</div>
                      <div style={{ fontSize:11, color:'#bbb' }}>
                        {item.isBeverage ? `${item.ml}ml` : `C:${item.carb}g · P:${item.prot}g · G:${item.fat}g`}
                        {item.prescribedId ? ' · ✅ prescrito' : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#534AB7' }}>{item.cal} kcal</span>
                      <button onClick={()=>openEdit(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
                      <button onClick={()=>remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}

      {/* ── PRESCRIBED ── */}
      {subTab === 'prescribed' && (
        <div className="screen-scroll">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, marginTop:8 }}>
            <div style={{ fontSize:13, color:'#888' }}>Dieta prescrita pela nutricionista</div>
            <button onClick={()=>{ setEditPresItem(null); setPresForm({meal:'Café da manhã',text:'',options:'',cal:''}); setShowPresForm(true) }} style={{
              background:'#534AB7', border:'none', borderRadius:10, padding:'7px 14px',
              color:'#fff', fontSize:12, cursor:'pointer'
            }}>＋ Adicionar</button>
          </div>

          {prescribed.length === 0 ? (
            <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>
              Adicione os itens da sua dieta prescrita
            </div>
          ) : prescribedByMeal.map(group => (
            <div key={group.label} style={{ marginBottom:14 }}>
              <div className="section-label">{group.label}</div>
              {group.items.map(item => {
                const done = meals.some(m => m.date === todayKey && m.prescribedId === item.id)
                return (
                  <div key={item.id} style={{
                    display:'flex', alignItems:'flex-start', gap:10, padding:'12px',
                    border:'0.5px solid #eee', borderRadius:10, background: done?'#EAF3DE':'#fff', marginBottom:6
                  }}>
                    <div onClick={()=>markPrescribedDone(item)} style={{
                      width:22, height:22, borderRadius:6, flexShrink:0, cursor:'pointer', marginTop:1,
                      background: done?'#27500A':'#fff',
                      border:`1.5px solid ${done?'#27500A':'#ccc'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, color:'#fff'
                    }}>{done?'✓':''}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, textDecoration:done?'line-through':'none', color:done?'#888':'#1a1a18' }}>{item.text}</div>
                      {item.options && <div style={{ fontSize:12, color:'#888', marginTop:2 }}>Opções: {item.options}</div>}
                      {item.cal > 0 && <div style={{ fontSize:11, color:'#534AB7', marginTop:2 }}>{item.cal} kcal</div>}
                    </div>
                    <button onClick={()=>{ setEditPresItem(item); setPresForm({meal:item.meal,text:item.text,options:item.options||'',cal:String(item.cal||'')}); setShowPresForm(true) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:14 }}>✏️</button>
                    <button onClick={()=>removePres(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18 }}>×</button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY ── */}
      {subTab === 'history' && (
        <div className="screen-scroll">
          <div style={{ fontSize:12, color:'#888', marginBottom:12, marginTop:8 }}>Últimos 90 dias · meta: {dietGoal} kcal</div>
          {histDays.length === 0 ? (
            <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>Nenhum registro ainda</div>
          ) : histDays.map(([date, totals]) => {
            const p   = Math.min(100, Math.round(totals.cal / dietGoal * 100))
            const hit = totals.cal >= dietGoal * 0.8 && totals.cal <= dietGoal * 1.2
            return (
              <div key={date} style={{ padding:'10px 0', borderBottom:'0.5px solid #f0efe8' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <div style={{ width:46, fontSize:12, color:'#888', flexShrink:0 }}>{fmtDate(date)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:8, background:'#f0efe8', borderRadius:8, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${p}%`, background: hit?'#639922':'#534AB7', borderRadius:8 }}/>
                    </div>
                  </div>
                  <div style={{ width:60, textAlign:'right', fontSize:12, fontWeight:600, color:hit?'#27500A':'#534AB7', flexShrink:0 }}>
                    {totals.cal} kcal
                  </div>
                  <div style={{ fontSize:14 }}>{hit?'✅':'📊'}</div>
                </div>
                <div style={{ display:'flex', gap:12, paddingLeft:56, fontSize:11, color:'#bbb' }}>
                  <span>C:{Math.round(totals.carb)}g</span>
                  <span>P:{Math.round(totals.prot)}g</span>
                  <span>G:{Math.round(totals.fat)}g</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── REGISTER FOOD MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar refeição':'Registrar alimento'}</div>
            <div className="form-group">
              <div>
                <label className="form-label">Refeição</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {MEALS_ORDER.map(m=>(
                    <button key={m} onClick={()=>setMealType(m)} style={{ padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, background:mealType===m?'#534AB7':'#f0efe8', color:mealType===m?'#fff':'#888' }}>{m}</button>
                  ))}
                </div>
              </div>

              {!editItem && (
                <div style={{ display:'flex', gap:0, background:'#f0efe8', borderRadius:10, padding:3 }}>
                  {[{v:'search',l:'🔍 Buscar'},{v:'custom',l:'✏️ Manual'},{v:'beverage',l:'🥤 Bebida'}].map(x=>(
                    <button key={x.v} onClick={()=>setMode(x.v)} style={{ flex:1, padding:'7px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, background:mode===x.v?'#fff':'transparent', color:mode===x.v?'#1a1a18':'#999', boxShadow:mode===x.v?'0 1px 3px rgba(0,0,0,.1)':'none' }}>{x.l}</button>
                  ))}
                </div>
              )}

              {!editItem && mode==='search' && (
                <>
                  <input type="search" placeholder="Ex: arroz, frango..." value={search} onChange={e=>{ setSearch(e.target.value); setSelFood(null) }}/>
                  {search && !selFood && filtered.length>0 && (
                    <div style={{ border:'0.5px solid #ddd', borderRadius:8, maxHeight:180, overflowY:'auto' }}>
                      {filtered.slice(0,10).map(f=>(
                        <div key={f.name} onClick={()=>{ setSelFood(f); setSearch(f.name) }} style={{ padding:'9px 12px', cursor:'pointer', fontSize:13, borderBottom:'0.5px solid #f5f5f5', display:'flex', justifyContent:'space-between' }}>
                          <span>{f.name}</span><span style={{ color:'#999', fontSize:11 }}>{f.kcal100} kcal/100g</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selFood && (
                    <>
                      <div>
                        <label className="form-label">Peso (gramas)</label>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <input type="number" value={weightG} min="1" max="2000" onChange={e=>setWeightG(parseInt(e.target.value)||1)} style={{ flex:1 }}/>
                          <div style={{ display:'flex', gap:4 }}>
                            {[50,100,150,200].map(w=>(
                              <button key={w} onClick={()=>setWeightG(w)} style={{ padding:'6px 8px', borderRadius:8, border:'0.5px solid #ddd', background:weightG===w?'#534AB7':'#f8f8f6', color:weightG===w?'#fff':'#888', fontSize:11, cursor:'pointer' }}>{w}g</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {preview && (
                        <div style={{ background:'#EEEDFE', borderRadius:10, padding:'12px' }}>
                          <div style={{ fontSize:11, color:'#7F77DD', marginBottom:8, fontWeight:600 }}>Cálculo para {weightG}g</div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6 }}>
                            {[{label:'Kcal',val:preview.cal,color:'#534AB7'},{label:'Carb.',val:preview.carb+'g',color:'#BA7517'},{label:'Prot.',val:preview.prot+'g',color:'#27500A'},{label:'Gord.',val:preview.fat+'g',color:'#A32D2D'}].map(x=>(
                              <div key={x.label} style={{ textAlign:'center' }}>
                                <div style={{ fontSize:16, fontWeight:700, color:x.color }}>{x.val}</div>
                                <div style={{ fontSize:10, color:'#9B99C4' }}>{x.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {!editItem && mode==='beverage' && (
                <>
                  <input type="text" placeholder="Nome da bebida (ex: Suco de laranja)" value={bevForm.name} onChange={e=>setBevForm({...bevForm,name:e.target.value})}/>
                  <div className="form-row">
                    <div><label className="form-label">Quantidade (ml)</label><input type="number" placeholder="200" value={bevForm.ml} onChange={e=>setBevForm({...bevForm,ml:e.target.value})}/></div>
                    <div><label className="form-label">Kcal por 100ml</label><input type="number" placeholder="0 se zero" value={bevForm.cal100ml} onChange={e=>setBevForm({...bevForm,cal100ml:e.target.value})}/></div>
                  </div>
                  {bevForm.ml && <div style={{ fontSize:12, color:'#534AB7', background:'#EEEDFE', padding:'8px 12px', borderRadius:8 }}>
                    {parseInt(bevForm.ml)||0}ml · {Math.round((parseFloat(bevForm.cal100ml)||0)*(parseInt(bevForm.ml)||0)/100)} kcal
                  </div>}
                </>
              )}

              {!editItem && mode==='custom' && (
                <>
                  <input type="text" placeholder="Nome do alimento" value={customFood.name} onChange={e=>setCustomFood({...customFood,name:e.target.value})}/>
                  <div className="form-row">
                    <div><label className="form-label">Calorias (kcal)</label><input type="number" placeholder="0" value={customFood.cal} onChange={e=>setCustomFood({...customFood,cal:e.target.value})}/></div>
                    <div><label className="form-label">Carb. (g)</label><input type="number" placeholder="0" value={customFood.carb} onChange={e=>setCustomFood({...customFood,carb:e.target.value})}/></div>
                  </div>
                  <div className="form-row">
                    <div><label className="form-label">Proteína (g)</label><input type="number" placeholder="0" value={customFood.prot} onChange={e=>setCustomFood({...customFood,prot:e.target.value})}/></div>
                    <div><label className="form-label">Gordura (g)</label><input type="number" placeholder="0" value={customFood.fat} onChange={e=>setCustomFood({...customFood,fat:e.target.value})}/></div>
                  </div>
                </>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>
                {editItem ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESCRIBED FORM MODAL ── */}
      {showPresForm && (
        <div className="modal-overlay" onClick={()=>{ setShowPresForm(false); setEditPresItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editPresItem?'Editar item prescrito':'Novo item prescrito'}</div>
            <div className="form-group">
              <div>
                <label className="form-label">Refeição</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {MEALS_ORDER.map(m=>(
                    <button key={m} onClick={()=>setPresForm({...presForm,meal:m})} style={{ padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, background:presForm.meal===m?'#534AB7':'#f0efe8', color:presForm.meal===m?'#fff':'#888' }}>{m}</button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Ex: Frango grelhado + arroz + salada" value={presForm.text} onChange={e=>setPresForm({...presForm,text:e.target.value})} autoFocus/>
              <textarea placeholder="Opções (ex: pode substituir por atum)" value={presForm.options} onChange={e=>setPresForm({...presForm,options:e.target.value})}
                style={{ resize:'none', height:56, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
              <div><label className="form-label">Calorias estimadas (opcional)</label>
                <input type="number" placeholder="0" value={presForm.cal} onChange={e=>setPresForm({...presForm,cal:e.target.value})}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowPresForm(false); setEditPresItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={savePrescribed}>{editPresItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GOAL MODAL ── */}
      {showGoalForm && (
        <div className="modal-overlay" onClick={()=>setShowGoalForm(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Meta diária de calorias</div>
            <div className="form-group">
              <input type="number" value={newGoal} onChange={e=>setNewGoal(parseInt(e.target.value)||2000)}/>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[1400,1600,1800,2000,2200,2500,2800,3000].map(v=>(
                  <button key={v} onClick={()=>setNewGoal(v)} style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:newGoal===v?'#534AB7':'#f0efe8', color:newGoal===v?'#fff':'#888' }}>{v}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>setShowGoalForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={async()=>{ await setDietGoal(newGoal); setShowGoalForm(false) }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
