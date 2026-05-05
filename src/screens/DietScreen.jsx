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

const MEALS_ORDER  = ['Café da manhã','Lanche da manhã','Almoço','Lanche da tarde','Jantar','Ceia']
const MEAL_ICONS   = {'Café da manhã':'☀️','Lanche da manhã':'🍎','Almoço':'🍽️','Lanche da tarde':'🥪','Jantar':'🌙','Ceia':'⭐'}
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

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

// Macro bar component
function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#888', marginBottom:2 }}>
        <span>{label}</span><span style={{ fontWeight:600, color }}>{value}g</span>
      </div>
      <div style={{ height:5, background:'#f0efe8', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width .3s' }}/>
      </div>
    </div>
  )
}

export default function DietScreen() {
  const { items: meals,      add,          update,        remove       } = useData('meals',          'private')
  const { items: goalDocs,   add: addGoal, update: updateGoal          } = useData('dietSettings',   'private')
  const { items: prescribed, add: addPres, update: updatePres, remove: removePres } = useData('dietPrescribed','private')
  const { items: userFoods,  add: addUserFood, remove: removeUserFood  } = useData('userFoods',      'private')

  const dietGoal    = goalDocs[0]?.goal || 2000
  const dietCarbG   = goalDocs[0]?.carbG  || 0
  const dietProtG   = goalDocs[0]?.protG  || 0
  const dietFatG    = goalDocs[0]?.fatG   || 0
  const setDietGoal = async (val, extras) => {
    const data = { goal: val, ...extras }
    if (goalDocs[0]) await updateGoal(goalDocs[0].id, data)
    else             await addGoal(data)
  }

  const todayKey   = todayBrasilia()
  const todayMeals = meals.filter(m => m.date === todayKey)
  const consumed   = todayMeals.reduce((s,m)=>s+(m.cal||0),0)
  const remain     = Math.max(0, dietGoal - consumed)
  const pct        = Math.min(100, Math.round(consumed / dietGoal * 100))
  const barColor   = pct>=100?'#E24B4A':pct>=75?'#BA7517':'#4CAF50'
  const totalCarb  = todayMeals.reduce((s,m)=>s+(m.carb||0),0)
  const totalProt  = todayMeals.reduce((s,m)=>s+(m.prot||0),0)
  const totalFat   = todayMeals.reduce((s,m)=>s+(m.fat||0),0)

  const [subTab,       setSubTab]       = useState('today')
  const [showForm,     setShowForm]     = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [formMeal,     setFormMeal]     = useState('Almoço')
  const [mode,         setMode]         = useState('search')
  const [search,       setSearch]       = useState('')
  const [selFood,      setSelFood]      = useState(null)
  const [weightG,      setWeightG]      = useState(100)
  const [newGoal,      setNewGoal]      = useState(dietGoal)
  const [newCarbG,     setNewCarbG]     = useState(dietCarbG)
  const [newProtG,     setNewProtG]     = useState(dietProtG)
  const [newFatG,      setNewFatG]      = useState(dietFatG)
  const [customFood,   setCustomFood]   = useState({ name:'', cal:'', carb:'', prot:'', fat:'', saveToDb:true })
  const [bevForm,      setBevForm]      = useState({ name:'', ml:'', cal100ml:'' })

  // Prescribed
  const [showPresForm,   setShowPresForm]   = useState(false)
  const [presForm,       setPresForm]       = useState({ meal:'Café da manhã', text:'', options:'', cal:'' })
  const [editPresItem,   setEditPresItem]   = useState(null)
  const [presSearch,     setPresSearch]     = useState('')
  const [presSelFood,    setPresSelFood]    = useState(null)
  const [presWeightG,    setPresWeightG]    = useState(100)
  const [expandedItem,   setExpandedItem]   = useState(null) // presItem id with substitutions open
  const [checkModal,     setCheckModal]     = useState(null) // presItem to confirm check

  const allFoods = [
    ...FOOD_DB,
    ...userFoods.map(f=>({ name:f.name, kcal100:f.kcal100||0, carb:f.carb||0, prot:f.prot||0, fat:f.fat||0, isCustom:true, id:f.id }))
  ].sort((a,b)=>a.name.localeCompare(b.name))

  const filtered = allFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const preview  = selFood ? calcFood(selFood, weightG) : null

  const openAddForMeal = (mealLabel) => {
    setEditItem(null); setFormMeal(mealLabel)
    setMode('search'); setSearch(''); setSelFood(null); setWeightG(100)
    setShowForm(true)
  }

  const save = async () => {
    if (editItem) {
      await update(editItem.id, { mealType: formMeal, date: todayKey })
      setEditItem(null); setShowForm(false); return
    }
    if (mode === 'beverage') {
      const ml = parseInt(bevForm.ml)||0; const cal100 = parseFloat(bevForm.cal100ml)||0
      if (!bevForm.name || !ml) return
      await add({ name:`${bevForm.name} (${ml}ml)`, cal:Math.round(cal100*ml/100), carb:0, prot:0, fat:0, mealType:formMeal, date:todayKey, isBeverage:true, ml })
      setBevForm({ name:'', ml:'', cal100ml:'' })
    } else if (mode === 'custom') {
      const cal=parseInt(customFood.cal)||0, carb=parseFloat(customFood.carb)||0, prot=parseFloat(customFood.prot)||0, fat=parseFloat(customFood.fat)||0
      if (!customFood.name||!cal) return
      await add({ name:customFood.name, cal, carb, prot, fat, mealType:formMeal, date:todayKey })
      if (customFood.saveToDb) await addUserFood({ name:customFood.name, kcal100:cal, carb, prot, fat })
      setCustomFood({ name:'', cal:'', carb:'', prot:'', fat:'', saveToDb:true })
    } else {
      if (!selFood) return
      const calc = calcFood(selFood, weightG)
      await add({ name:`${selFood.name} (${weightG}g)`, ...calc, mealType:formMeal, date:todayKey })
      setSelFood(null); setSearch(''); setWeightG(100)
    }
    setShowForm(false)
  }

  // Prescribed check — opens modal to ask which substitution
  const openCheckModal = (pItem) => {
    const done = meals.some(m => m.date === todayKey && m.prescribedId === pItem.id)
    if (done) {
      // Uncheck
      const existing = meals.find(m => m.date === todayKey && m.prescribedId === pItem.id)
      if (existing) remove(existing.id)
    } else {
      setCheckModal(pItem)
    }
  }

  const confirmCheck = async (pItem, chosenText, chosenFood, chosenWeight) => {
    let cal=pItem.cal||0, carb=pItem.carb||0, prot=pItem.prot||0, fat=pItem.fat||0
    if (chosenFood && chosenWeight) {
      const c = calcFood(chosenFood, chosenWeight)
      cal=c.cal; carb=c.carb; prot=c.prot; fat=c.fat
    }
    await add({ name: chosenText||pItem.text, cal, carb, prot, fat, mealType:pItem.meal, date:todayKey, prescribedId:pItem.id })
    setCheckModal(null)
  }

  const savePrescribed = async () => {
    if (!presForm.text.trim()) return
    const calc = presSelFood ? calcFood(presSelFood, presWeightG) : null
    const data = {
      meal: presForm.meal, text: presForm.text.trim(), options: presForm.options?.trim()||'',
      cal:  calc?calc.cal:(parseInt(presForm.cal)||0),
      carb: calc?calc.carb:0, prot: calc?calc.prot:0, fat: calc?calc.fat:0,
    }
    if (editPresItem) { await updatePres(editPresItem.id, data); setEditPresItem(null) }
    else await addPres(data)
    setPresForm({ meal:'Café da manhã', text:'', options:'', cal:'' })
    setPresSearch(''); setPresSelFood(null); setPresWeightG(100); setShowPresForm(false)
  }

  // History
  const cutoffStr = (() => { const d=new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0] })()
  const histByDate = {}
  meals.filter(m=>m.date>=cutoffStr&&m.date!==todayKey).forEach(m=>{
    if (!histByDate[m.date]) histByDate[m.date]={cal:0,carb:0,prot:0,fat:0}
    histByDate[m.date].cal+=m.cal||0; histByDate[m.date].carb+=m.carb||0
    histByDate[m.date].prot+=m.prot||0; histByDate[m.date].fat+=m.fat||0
  })
  const histDays = Object.entries(histByDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,90)
  const fmtDate  = ds => { const d=new Date(ds+'T12:00'); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` }

  // Prescribed grouped by meal
  const prescribedByMeal = MEALS_ORDER
    .map(m => ({ label:m, items: prescribed.filter(p=>p.meal===m) }))
    .filter(g => g.items.length > 0)

  // Today meals grouped by meal
  const mealGroups = MEALS_ORDER
    .map(m => ({ label:m, items: todayMeals.filter(i=>i.mealType===m) }))

  // Check modal state
  const [checkSub,      setCheckSub]      = useState('main')  // 'main' or index of option
  const [checkSubFood,  setCheckSubFood]  = useState(null)
  const [checkSubWeight,setCheckSubWeight]= useState(100)
  const [checkSubSearch,setCheckSubSearch]= useState('')

  return (
    <div className="screen">

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:0, margin:'10px 14px 0', background:'#f0efe8', borderRadius:10, padding:3, flexShrink:0 }}>
        {[{v:'today',l:'🥗 Hoje'},{v:'prescribed',l:'📋 Dieta'},{v:'history',l:'📅 Histórico'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{
            flex:1, padding:'8px 4px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500,
            background:subTab===x.v?'#fff':'transparent', color:subTab===x.v?'#1a1a18':'#999',
            boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
          }}>{x.l}</button>
        ))}
      </div>

      {/* ── HOJE ── */}
      {subTab === 'today' && (
        <div className="screen-scroll">

          {/* Calorie ring summary */}
          <div style={{ background:'#fff', borderRadius:16, padding:'14px', marginTop:10, marginBottom:10, border:'0.5px solid #eee' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {/* Circle */}
              <div style={{ position:'relative', width:70, height:70, flexShrink:0 }}>
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="28" fill="none" stroke="#f0efe8" strokeWidth="7"/>
                  <circle cx="35" cy="35" r="28" fill="none" stroke={barColor} strokeWidth="7"
                    strokeDasharray={`${2*Math.PI*28*pct/100} ${2*Math.PI*28*(1-pct/100)}`}
                    strokeLinecap="round" transform="rotate(-90 35 35)" style={{ transition:'stroke-dasharray .4s' }}/>
                </svg>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:14, fontWeight:800, color:'#1a1a18', lineHeight:1 }}>{pct}%</span>
                </div>
              </div>
              {/* Numbers */}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:26, fontWeight:800, color:'#1a1a18', lineHeight:1 }}>{consumed}</div>
                    <div style={{ fontSize:10, color:'#888' }}>de {dietGoal} kcal</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:700, color: remain===0?'#E24B4A':'#4CAF50' }}>{remain}</div>
                    <div style={{ fontSize:10, color:'#888' }}>restante</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <MacroBar label="Carb" value={Math.round(totalCarb)} max={dietCarbG||200} color="#BA7517"/>
                  <MacroBar label="Prot" value={Math.round(totalProt)} max={dietProtG||150} color="#27500A"/>
                  <MacroBar label="Gord" value={Math.round(totalFat)}  max={dietFatG||70}  color="#A32D2D"/>
                </div>
              </div>
            </div>
            <button onClick={()=>{ setNewGoal(dietGoal); setNewCarbG(dietCarbG); setNewProtG(dietProtG); setNewFatG(dietFatG); setShowGoalForm(true) }}
              style={{ background:'#f8f8f6', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#888', cursor:'pointer', marginTop:8 }}>
              ✏️ Editar metas
            </button>
          </div>

          {/* Meal sections */}
          {mealGroups.map(g => {
            const mCal = g.items.reduce((s,i)=>s+(i.cal||0),0)
            return (
              <div key={g.label} style={{ marginBottom:8, border:'0.5px solid #eee', borderRadius:12, overflow:'hidden', background:'#fff' }}>
                {/* Meal header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'#f8f8f6', borderBottom: g.items.length>0?'0.5px solid #f0efe8':'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{MEAL_ICONS[g.label]||'🍽️'}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{g.label}</span>
                    {mCal > 0 && <span style={{ fontSize:11, color:'#888' }}>{mCal} kcal</span>}
                  </div>
                  <button onClick={()=>openAddForMeal(g.label)} style={{ background:'#534AB7', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, color:'#fff', cursor:'pointer', fontWeight:600 }}>＋</button>
                </div>
                {/* Food items */}
                {g.items.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', padding:'9px 12px', borderBottom:'0.5px solid #f8f8f6' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#1a1a18' }}>{item.name}{item.isBeverage?' 🥤':''}{item.prescribedId?' ✅':''}</div>
                      <div style={{ fontSize:11, color:'#bbb', marginTop:1 }}>
                        {item.isBeverage ? `${item.ml}ml` : `C:${item.carb}g · P:${item.prot}g · G:${item.fat}g`}
                      </div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:'#534AB7', marginRight:8 }}>{item.cal} kcal</span>
                    <button onClick={()=>remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:18, padding:'2px' }}>×</button>
                  </div>
                ))}
                {g.items.length === 0 && (
                  <div style={{ padding:'10px 12px', fontSize:12, color:'#ccc', fontStyle:'italic' }}>
                    Nenhum alimento — toque em ＋ para adicionar
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── DIETA PRESCRITA ── */}
      {subTab === 'prescribed' && (
        <div className="screen-scroll">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, marginTop:8 }}>
            <div style={{ fontSize:12, color:'#888' }}>Toque no alimento para ver substituições</div>
            <button onClick={()=>{ setEditPresItem(null); setPresForm({meal:'Café da manhã',text:'',options:'',cal:''}); setShowPresForm(true) }} style={{
              background:'#534AB7', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', fontSize:12, cursor:'pointer'
            }}>＋ Adicionar</button>
          </div>

          {prescribed.length === 0 ? (
            <div style={{ textAlign:'center', color:'#bbb', padding:'30px 0', fontSize:13 }}>
              Adicione os itens da sua dieta prescrita
            </div>
          ) : prescribedByMeal.map(group => (
            <div key={group.label} style={{ marginBottom:12, border:'0.5px solid #eee', borderRadius:12, overflow:'hidden', background:'#fff' }}>
              {/* Meal header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#f8f8f6', borderBottom:'0.5px solid #f0efe8' }}>
                <span style={{ fontSize:16 }}>{MEAL_ICONS[group.label]||'🍽️'}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{group.label}</span>
                <span style={{ fontSize:11, color:'#888', marginLeft:'auto' }}>
                  {group.items.reduce((s,i)=>s+(i.cal||0),0)} kcal prescritas
                </span>
              </div>

              {/* Items */}
              {group.items.map(item => {
                const done     = meals.some(m => m.date === todayKey && m.prescribedId === item.id)
                const expanded = expandedItem === item.id
                const subs     = item.options ? item.options.split(',').map(s=>s.trim()).filter(Boolean) : []
                return (
                  <div key={item.id}>
                    {/* Main item row */}
                    <div style={{
                      display:'flex', alignItems:'flex-start', gap:10, padding:'12px',
                      background: done ? '#F1F8E9' : '#fff',
                      borderBottom: expanded ? 'none' : '0.5px solid #f8f8f6'
                    }}>
                      {/* Check circle */}
                      <div onClick={()=>openCheckModal(item)} style={{
                        width:26, height:26, borderRadius:'50%', flexShrink:0, cursor:'pointer', marginTop:1,
                        background: done?'#4CAF50':'#fff',
                        border:`2px solid ${done?'#4CAF50':'#ddd'}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:13, color:'#fff', transition:'all .15s'
                      }}>{done?'✓':''}</div>

                      {/* Text — tap to expand subs */}
                      <div style={{ flex:1 }} onClick={()=>subs.length>0 ? setExpandedItem(expanded?null:item.id) : null}>
                        <div style={{ fontSize:14, fontWeight:500, color: done?'#888':'#1a1a18', textDecoration: done?'line-through':'none' }}>
                          {item.text}
                          {subs.length > 0 && <span style={{ fontSize:11, color:'#534AB7', marginLeft:6 }}>{expanded?'▲':'▼'} {subs.length} sub</span>}
                        </div>
                        {item.cal > 0 && (
                          <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                            {item.cal} kcal · C:{item.carb}g · P:{item.prot}g · G:{item.fat}g
                          </div>
                        )}
                      </div>

                      {/* Edit/delete */}
                      <button onClick={()=>{ setEditPresItem(item); setPresForm({meal:item.meal,text:item.text,options:item.options||'',cal:String(item.cal||'')}); setShowPresForm(true) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:13, padding:'2px' }}>✏️</button>
                      <button onClick={()=>removePres(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#eee', fontSize:16, padding:'2px' }}>×</button>
                    </div>

                    {/* Substitutions panel */}
                    {expanded && subs.length > 0 && (
                      <div style={{ background:'#EEEDFE', padding:'8px 12px 10px 48px', borderBottom:'0.5px solid #f0efe8' }}>
                        <div style={{ fontSize:11, color:'#7F77DD', fontWeight:600, marginBottom:6 }}>↕️ Substituições</div>
                        {subs.map((sub,si)=>(
                          <div key={si} style={{ fontSize:13, color:'#534AB7', padding:'4px 0', borderBottom:si<subs.length-1?'0.5px solid #d0cef8':'none' }}>
                            • {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── HISTÓRICO ── */}
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
                      <div style={{ height:'100%', width:`${p}%`, background:hit?'#4CAF50':'#534AB7', borderRadius:8 }}/>
                    </div>
                  </div>
                  <div style={{ width:60, textAlign:'right', fontSize:12, fontWeight:600, color:hit?'#27500A':'#534AB7', flexShrink:0 }}>{totals.cal} kcal</div>
                  <div style={{ fontSize:14 }}>{hit?'✅':'📊'}</div>
                </div>
                <div style={{ display:'flex', gap:12, paddingLeft:56, fontSize:11, color:'#bbb' }}>
                  <span>C:{Math.round(totals.carb)}g</span><span>P:{Math.round(totals.prot)}g</span><span>G:{Math.round(totals.fat)}g</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CHECK MODAL — qual substitição foi usada? ── */}
      {checkModal && (
        <div className="modal-overlay" onClick={()=>setCheckModal(null)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">O que você comeu?</div>
            <div className="form-group">
              <div style={{ fontSize:13, color:'#888', marginBottom:8 }}>Selecione o que foi consumido:</div>

              {/* Main option */}
              <div onClick={()=>setCheckSub('main')} style={{
                display:'flex', alignItems:'center', gap:10, padding:'12px', borderRadius:10, cursor:'pointer', marginBottom:6,
                background: checkSub==='main'?'#F1F8E9':'#f8f8f6', border:`1.5px solid ${checkSub==='main'?'#4CAF50':'#eee'}`
              }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${checkSub==='main'?'#4CAF50':'#ddd'}`, background:checkSub==='main'?'#4CAF50':'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {checkSub==='main'&&<span style={{ fontSize:10, color:'#fff' }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{checkModal.text}</div>
                  {checkModal.cal>0&&<div style={{ fontSize:11, color:'#888' }}>{checkModal.cal} kcal</div>}
                </div>
              </div>

              {/* Substitution options */}
              {checkModal.options && checkModal.options.split(',').map((sub,si) => (
                <div key={si} onClick={()=>{ setCheckSub(si); setCheckSubFood(null); setCheckSubSearch('') }} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'12px', borderRadius:10, cursor:'pointer', marginBottom:6,
                  background: checkSub===si?'#EEEDFE':'#f8f8f6', border:`1.5px solid ${checkSub===si?'#534AB7':'#eee'}`
                }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${checkSub===si?'#534AB7':'#ddd'}`, background:checkSub===si?'#534AB7':'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {checkSub===si&&<span style={{ fontSize:10, color:'#fff' }}>✓</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>↕️ {sub.trim()}</div>
                    <div style={{ fontSize:11, color:'#888' }}>Substituição</div>
                  </div>
                </div>
              ))}

              {/* If a substitution is selected, offer to look up calories */}
              {checkSub !== 'main' && (
                <div style={{ background:'#f8f8f6', borderRadius:8, padding:'10px', marginTop:4 }}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:6 }}>Calcular calorias desta substituição (opcional)</div>
                  <input type="search" placeholder="Buscar no banco de alimentos..." value={checkSubSearch}
                    onChange={e=>{ setCheckSubSearch(e.target.value); setCheckSubFood(null) }}/>
                  {checkSubSearch && !checkSubFood && (
                    <div style={{ border:'0.5px solid #ddd', borderRadius:8, maxHeight:140, overflowY:'auto', marginTop:4 }}>
                      {allFoods.filter(f=>f.name.toLowerCase().includes(checkSubSearch.toLowerCase())).slice(0,6).map(f=>(
                        <div key={f.name} onClick={()=>{ setCheckSubFood(f); setCheckSubSearch(f.name) }}
                          style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, borderBottom:'0.5px solid #f5f5f5', display:'flex', justifyContent:'space-between' }}>
                          <span>{f.name}</span><span style={{ color:'#999', fontSize:11 }}>{f.kcal100} kcal/100g</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {checkSubFood && (
                    <div style={{ marginTop:6 }}>
                      <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                        <input type="number" value={checkSubWeight} min="1" onChange={e=>setCheckSubWeight(parseInt(e.target.value)||1)} style={{ width:80 }}/>
                        <span style={{ fontSize:12, color:'#888' }}>g</span>
                        {[50,100,150,200].map(w=>(
                          <button key={w} onClick={()=>setCheckSubWeight(w)} style={{ padding:'5px 8px', borderRadius:8, border:'0.5px solid #ddd', background:checkSubWeight===w?'#534AB7':'#f8f8f6', color:checkSubWeight===w?'#fff':'#888', fontSize:11, cursor:'pointer' }}>{w}</button>
                        ))}
                      </div>
                      {(() => { const c=calcFood(checkSubFood,checkSubWeight); return (
                        <div style={{ display:'flex', gap:10, fontSize:12, fontWeight:600 }}>
                          <span style={{ color:'#534AB7' }}>{c.cal} kcal</span>
                          <span style={{ color:'#BA7517' }}>C:{c.carb}g</span>
                          <span style={{ color:'#27500A' }}>P:{c.prot}g</span>
                          <span style={{ color:'#A32D2D' }}>G:{c.fat}g</span>
                        </div>
                      )})()}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>setCheckModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={()=>{
                const subText = checkSub==='main' ? checkModal.text : checkModal.options.split(',')[checkSub]?.trim()||checkModal.text
                confirmCheck(checkModal, subText, checkSub!=='main'?checkSubFood:null, checkSub!=='main'?checkSubWeight:null)
              }}>✓ Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER FOOD MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>{ setShowForm(false); setEditItem(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editItem?'Editar':'Adicionar alimento'} · {formMeal}</div>
            <div className="form-group">
              {!editItem && (
                <div style={{ display:'flex', gap:0, background:'#f0efe8', borderRadius:10, padding:3 }}>
                  {[{v:'search',l:'🔍 Buscar'},{v:'custom',l:'✏️ Manual'},{v:'beverage',l:'🥤 Bebida'}].map(x=>(
                    <button key={x.v} onClick={()=>setMode(x.v)} style={{ flex:1, padding:'7px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, background:mode===x.v?'#fff':'transparent', color:mode===x.v?'#1a1a18':'#999', boxShadow:mode===x.v?'0 1px 3px rgba(0,0,0,.1)':'none' }}>{x.l}</button>
                  ))}
                </div>
              )}
              {!editItem && mode==='search' && (
                <>
                  <input type="search" placeholder="Ex: arroz, frango..." value={search} onChange={e=>{ setSearch(e.target.value); setSelFood(null) }} autoFocus/>
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
                  <input type="text" placeholder="Nome da bebida" value={bevForm.name} onChange={e=>setBevForm({...bevForm,name:e.target.value})}/>
                  <div className="form-row">
                    <div><label className="form-label">Quantidade (ml)</label><input type="number" placeholder="200" value={bevForm.ml} onChange={e=>setBevForm({...bevForm,ml:e.target.value})}/></div>
                    <div><label className="form-label">Kcal por 100ml</label><input type="number" placeholder="0" value={bevForm.cal100ml} onChange={e=>setBevForm({...bevForm,cal100ml:e.target.value})}/></div>
                  </div>
                  {bevForm.ml && <div style={{ fontSize:12, color:'#534AB7', background:'#EEEDFE', padding:'8px 12px', borderRadius:8 }}>
                    {parseInt(bevForm.ml)||0}ml · {Math.round((parseFloat(bevForm.cal100ml)||0)*(parseInt(bevForm.ml)||0)/100)} kcal
                  </div>}
                </>
              )}
              {!editItem && mode==='custom' && (
                <>
                  <input type="text" placeholder="Nome do alimento" value={customFood.name} onChange={e=>setCustomFood({...customFood,name:e.target.value})} autoFocus/>
                  <div className="form-row">
                    <div><label className="form-label">Calorias (kcal)</label><input type="number" placeholder="0" value={customFood.cal} onChange={e=>setCustomFood({...customFood,cal:e.target.value})}/></div>
                    <div><label className="form-label">Carb. (g)</label><input type="number" placeholder="0" value={customFood.carb} onChange={e=>setCustomFood({...customFood,carb:e.target.value})}/></div>
                  </div>
                  <div className="form-row">
                    <div><label className="form-label">Proteína (g)</label><input type="number" placeholder="0" value={customFood.prot} onChange={e=>setCustomFood({...customFood,prot:e.target.value})}/></div>
                    <div><label className="form-label">Gordura (g)</label><input type="number" placeholder="0" value={customFood.fat} onChange={e=>setCustomFood({...customFood,fat:e.target.value})}/></div>
                  </div>
                  <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                    <input type="checkbox" checked={customFood.saveToDb} onChange={e=>setCustomFood({...customFood,saveToDb:e.target.checked})}/>
                    Salvar no banco de alimentos
                  </label>
                  {userFoods.length > 0 && (
                    <div style={{ background:'#f8f8f6', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:6 }}>Meus alimentos salvos</div>
                      {userFoods.map(f=>(
                        <div key={f.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0', borderBottom:'0.5px solid #f0efe8' }}>
                          <span style={{ flex:1, fontSize:12 }}>{f.name}</span>
                          <span style={{ fontSize:11, color:'#888' }}>{f.kcal100} kcal/100g</span>
                          <button onClick={()=>removeUserFood(f.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:14 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowForm(false); setEditItem(null) }}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{editItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESCRIBED FORM MODAL ── */}
      {showPresForm && (
        <div className="modal-overlay" onClick={()=>{ setShowPresForm(false); setEditPresItem(null); setPresSearch(''); setPresSelFood(null) }}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editPresItem?'Editar item':'Novo item prescrito'}</div>
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
              <textarea placeholder="Substituições separadas por vírgula (ex: Atum, Salmão)" value={presForm.options} onChange={e=>setPresForm({...presForm,options:e.target.value})}
                style={{ resize:'none', height:56, padding:'8px 10px', border:'0.5px solid #ddd', borderRadius:8, fontSize:13 }}/>
              <div style={{ background:'#f8f8f6', borderRadius:8, padding:'10px' }}>
                <label className="form-label">Calcular calorias pelo banco (opcional)</label>
                <input type="search" placeholder="Buscar alimento..." value={presSearch} onChange={e=>{ setPresSearch(e.target.value); setPresSelFood(null) }}/>
                {presSearch && !presSelFood && (
                  <div style={{ border:'0.5px solid #ddd', borderRadius:8, maxHeight:140, overflowY:'auto', marginTop:4 }}>
                    {allFoods.filter(f=>f.name.toLowerCase().includes(presSearch.toLowerCase())).slice(0,8).map(f=>(
                      <div key={f.name} onClick={()=>{ setPresSelFood(f); setPresSearch(f.name) }}
                        style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, borderBottom:'0.5px solid #f5f5f5', display:'flex', justifyContent:'space-between' }}>
                        <span>{f.name}</span><span style={{ color:'#999', fontSize:11 }}>{f.kcal100} kcal/100g</span>
                      </div>
                    ))}
                  </div>
                )}
                {presSelFood && (
                  <div style={{ marginTop:6 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <input type="number" value={presWeightG} min="1" onChange={e=>setPresWeightG(parseInt(e.target.value)||1)} style={{ flex:1 }}/>
                      {[50,100,150,200].map(w=>(
                        <button key={w} onClick={()=>setPresWeightG(w)} style={{ padding:'6px 8px', borderRadius:8, border:'0.5px solid #ddd', background:presWeightG===w?'#534AB7':'#f8f8f6', color:presWeightG===w?'#fff':'#888', fontSize:11, cursor:'pointer' }}>{w}g</button>
                      ))}
                    </div>
                    {(()=>{ const c=calcFood(presSelFood,presWeightG); return (
                      <div style={{ display:'flex', gap:12, marginTop:6, fontSize:12, fontWeight:600 }}>
                        <span style={{ color:'#534AB7' }}>{c.cal} kcal</span>
                        <span style={{ color:'#BA7517' }}>C:{c.carb}g</span>
                        <span style={{ color:'#27500A' }}>P:{c.prot}g</span>
                        <span style={{ color:'#A32D2D' }}>G:{c.fat}g</span>
                      </div>
                    )})()}
                  </div>
                )}
                {!presSelFood && (
                  <div style={{ marginTop:6 }}>
                    <label className="form-label">Ou informe manualmente</label>
                    <input type="number" placeholder="0" value={presForm.cal} onChange={e=>setPresForm({...presForm,cal:e.target.value})}/>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>{ setShowPresForm(false); setEditPresItem(null); setPresSearch(''); setPresSelFood(null) }}>Cancelar</button>
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
            <div className="sheet-title">Metas nutricionais</div>
            <div className="form-group">
              <div><label className="form-label">Calorias (kcal/dia)</label>
                <input type="number" value={newGoal} onChange={e=>setNewGoal(parseInt(e.target.value)||2000)}/>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                  {[1400,1600,1800,2000,2200,2500].map(v=>(
                    <button key={v} onClick={()=>setNewGoal(v)} style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, background:newGoal===v?'#534AB7':'#f0efe8', color:newGoal===v?'#fff':'#888' }}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div><label className="form-label">Carboidratos (g)</label><input type="number" placeholder="0" value={newCarbG} onChange={e=>setNewCarbG(parseInt(e.target.value)||0)}/></div>
                <div><label className="form-label">Proteínas (g)</label><input type="number" placeholder="0" value={newProtG} onChange={e=>setNewProtG(parseInt(e.target.value)||0)}/></div>
              </div>
              <div><label className="form-label">Gorduras (g)</label><input type="number" placeholder="0" value={newFatG} onChange={e=>setNewFatG(parseInt(e.target.value)||0)} style={{ width:'50%' }}/></div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" onClick={()=>setShowGoalForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={async()=>{ await setDietGoal(newGoal,{carbG:newCarbG,protG:newProtG,fatG:newFatG}); setShowGoalForm(false) }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
