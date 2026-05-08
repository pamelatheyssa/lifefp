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

const MEALS_ORDER = ['Café da manhã','Lanche da manhã','Almoço','Lanche da tarde','Jantar','Ceia']
const MEAL_ICONS  = {'Café da manhã':'☀️','Lanche da manhã':'🍎','Almoço':'🍽️','Lanche da tarde':'🥪','Jantar':'🌙','Ceia':'⭐'}
const MONTHS_S    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function todayBrasilia() {
  const now = new Date(), offset = -3*60
  const local = new Date(now.getTime()+(offset-now.getTimezoneOffset())*60000)
  return local.toISOString().split('T')[0]
}

function calcFood(food, weightG) {
  const f = weightG/100
  return {
    cal:  Math.round(food.kcal100*f),
    carb: Math.round(food.carb*f*10)/10,
    prot: Math.round(food.prot*f*10)/10,
    fat:  Math.round(food.fat*f*10)/10,
  }
}

// Prescribed item structure:
// { meal, foodName, weightG, measure, options:[{foodName,weightG,measure}], cal,carb,prot,fat }

export default function DietScreen() {
  const { items:meals,     add,         update,       remove       } = useData('meals',          'private')
  const { items:goalDocs,  add:addGoal, update:updateGoal          } = useData('dietSettings',   'private')
  const { items:prescribed,add:addPres, update:updatePres, remove:removePres } = useData('dietPrescribed2','private')
  const { items:userFoods, add:addUserFood, remove:removeUserFood  } = useData('userFoods',      'private')

  const dietGoal  = goalDocs[0]?.goal  || 2000
  const dietCarbG = goalDocs[0]?.carbG || 0
  const dietProtG = goalDocs[0]?.protG || 0
  const dietFatG  = goalDocs[0]?.fatG  || 0

  const todayKey   = todayBrasilia()
  const todayMeals = meals.filter(m=>m.date===todayKey)
  const consumed   = todayMeals.reduce((s,m)=>s+(m.cal||0),0)
  const remain     = Math.max(0,dietGoal-consumed)
  const pct        = Math.min(100,Math.round(consumed/dietGoal*100))
  const barColor   = pct>=100?'#E24B4A':pct>=75?'#BA7517':'#4CAF50'
  const totalCarb  = todayMeals.reduce((s,m)=>s+(m.carb||0),0)
  const totalProt  = todayMeals.reduce((s,m)=>s+(m.prot||0),0)
  const totalFat   = todayMeals.reduce((s,m)=>s+(m.fat||0),0)

  const [subTab,       setSubTab]       = useState('prescribed')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal,      setNewGoal]      = useState(dietGoal)
  const [newCarbG,     setNewCarbG]     = useState(dietCarbG)
  const [newProtG,     setNewProtG]     = useState(dietProtG)
  const [newFatG,      setNewFatG]      = useState(dietFatG)

  // Extra food registration (manual/search)
  const [showAddExtra, setShowAddExtra] = useState(false)
  const [extraMeal,    setExtraMeal]    = useState('Almoço')
  const [extraMode,    setExtraMode]    = useState('search')
  const [search,       setSearch]       = useState('')
  const [selFood,      setSelFood]      = useState(null)
  const [weightG,      setWeightG]      = useState(100)
  const [customFood,   setCustomFood]   = useState({name:'',cal:'',carb:'',prot:'',fat:'',saveToDb:true})
  const [bevForm,      setBevForm]      = useState({name:'',ml:'',cal100ml:''})

  // Prescribed form
  const [showPresForm, setShowPresForm] = useState(false)
  const [editPresItem, setEditPresItem] = useState(null)
  const [presForm,     setPresForm]     = useState({
    meal:'Café da manhã', foodName:'', weightG:'', measure:'', options:[]
  })
  const [presSearch,   setPresSearch]   = useState('')
  const [presSelFood,  setPresSelFood]  = useState(null)
  // Options
  const [optSearch,    setOptSearch]    = useState('')
  const [optSelFood,   setOptSelFood]   = useState(null)
  const [optWeightG,   setOptWeightG]   = useState(100)
  const [optMeasure,   setOptMeasure]   = useState('')

  // Check modal
  const [checkModal,   setCheckModal]   = useState(null)
  const [checkChoice,  setCheckChoice]  = useState('main') // 'main' | optIndex
  const [checkOptSearch, setCheckOptSearch] = useState('')
  const [checkOptFood,   setCheckOptFood]   = useState(null)
  const [checkOptWeight, setCheckOptWeight] = useState(100)

  const allFoods = [
    ...FOOD_DB,
    ...userFoods.map(f=>({name:f.name,kcal100:f.kcal100||0,carb:f.carb||0,prot:f.prot||0,fat:f.fat||0,isCustom:true,id:f.id}))
  ].sort((a,b)=>a.name.localeCompare(b.name))

  // ── Prescribed check ──
  const isDone = (pId) => meals.some(m=>m.date===todayKey&&m.prescribedId===pId)

  const openCheck = (pItem) => {
    if (isDone(pItem.id)) {
      const ex = meals.find(m=>m.date===todayKey&&m.prescribedId===pItem.id)
      if (ex) remove(ex.id)
    } else {
      setCheckModal(pItem)
      setCheckChoice('main')
      setCheckOptSearch(''); setCheckOptFood(null); setCheckOptWeight(100)
    }
  }

  const confirmCheck = async () => {
    const p = checkModal
    let name, cal, carb, prot, fat
    if (checkChoice === 'main') {
      name  = p.foodName
      const c = calcFood({kcal100:p.cal100||0,carb:p.carb100||0,prot:p.prot100||0,fat:p.fat100||0}, p.weightG||100)
      cal=p.cal||c.cal; carb=p.carb||c.carb; prot=p.prot||c.prot; fat=p.fat||c.fat
    } else {
      const opt = p.options[checkChoice]
      name  = opt.foodName
      if (checkOptFood) {
        const c = calcFood(checkOptFood, checkOptWeight)
        cal=c.cal; carb=c.carb; prot=c.prot; fat=c.fat
      } else {
        const c = calcFood({kcal100:opt.cal100||0,carb:opt.carb100||0,prot:opt.prot100||0,fat:opt.fat100||0}, opt.weightG||100)
        cal=opt.cal||c.cal; carb=opt.carb||c.carb; prot=opt.prot||c.prot; fat=opt.fat||c.fat
      }
    }
    await add({ name, cal, carb, prot, fat, mealType:p.meal, date:todayKey, prescribedId:p.id })
    setCheckModal(null)
  }

  // ── Save prescribed item ──
  const savePrescribed = async () => {
    if (!presForm.foodName.trim() || !presForm.weightG) return
    const food = allFoods.find(f=>f.name===presForm.foodName)
    const calc = food ? calcFood(food, parseFloat(presForm.weightG)) : null
    const data = {
      meal:      presForm.meal,
      foodName:  presForm.foodName.trim(),
      weightG:   parseFloat(presForm.weightG)||0,
      measure:   presForm.measure.trim(),
      cal100:    food?.kcal100||0,
      carb100:   food?.carb||0,
      prot100:   food?.prot||0,
      fat100:    food?.fat||0,
      cal:       calc?.cal||0,
      carb:      calc?.carb||0,
      prot:      calc?.prot||0,
      fat:       calc?.fat||0,
      options:   presForm.options,
    }
    if (editPresItem) { await updatePres(editPresItem.id,data); setEditPresItem(null) }
    else await addPres(data)
    setPresForm({meal:'Café da manhã',foodName:'',weightG:'',measure:'',options:[]})
    setPresSearch(''); setPresSelFood(null); setShowPresForm(false)
  }

  const addOption = () => {
    if (!optSelFood) return
    const calc = calcFood(optSelFood, optWeightG)
    const opt  = { foodName:optSelFood.name, weightG:optWeightG, measure:optMeasure.trim(), cal100:optSelFood.kcal100, carb100:optSelFood.carb, prot100:optSelFood.prot, fat100:optSelFood.fat, ...calc }
    setPresForm(f=>({...f, options:[...f.options, opt]}))
    setOptSearch(''); setOptSelFood(null); setOptWeightG(100); setOptMeasure('')
  }

  const removeOption = (i) => setPresForm(f=>({...f, options:f.options.filter((_,j)=>j!==i)}))

  // ── Save extra food ──
  const saveExtra = async () => {
    if (extraMode==='beverage') {
      const ml=parseInt(bevForm.ml)||0, cal100=parseFloat(bevForm.cal100ml)||0
      if (!bevForm.name||!ml) return
      await add({name:`${bevForm.name} (${ml}ml)`,cal:Math.round(cal100*ml/100),carb:0,prot:0,fat:0,mealType:extraMeal,date:todayKey,isBeverage:true,ml})
      setBevForm({name:'',ml:'',cal100ml:''})
    } else if (extraMode==='custom') {
      const cal=parseInt(customFood.cal)||0,carb=parseFloat(customFood.carb)||0,prot=parseFloat(customFood.prot)||0,fat=parseFloat(customFood.fat)||0
      if (!customFood.name||!cal) return
      await add({name:customFood.name,cal,carb,prot,fat,mealType:extraMeal,date:todayKey})
      if (customFood.saveToDb) await addUserFood({name:customFood.name,kcal100:cal,carb,prot,fat})
      setCustomFood({name:'',cal:'',carb:'',prot:'',fat:'',saveToDb:true})
    } else {
      if (!selFood) return
      const c=calcFood(selFood,weightG)
      await add({name:`${selFood.name} (${weightG}g)`,...c,mealType:extraMeal,date:todayKey})
      setSelFood(null);setSearch('');setWeightG(100)
    }
    setShowAddExtra(false)
  }

  // History
  const cutoffStr = (()=>{const d=new Date();d.setDate(d.getDate()-90);return d.toISOString().split('T')[0]})()
  const histByDate={}
  meals.filter(m=>m.date>=cutoffStr&&m.date!==todayKey).forEach(m=>{
    if(!histByDate[m.date])histByDate[m.date]={cal:0,carb:0,prot:0,fat:0}
    histByDate[m.date].cal+=m.cal||0;histByDate[m.date].carb+=m.carb||0
    histByDate[m.date].prot+=m.prot||0;histByDate[m.date].fat+=m.fat||0
  })
  const histDays=Object.entries(histByDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,90)
  const fmtDate=ds=>{const d=new Date(ds+'T12:00');return `${d.getDate()} ${MONTHS_S[d.getMonth()]}`}

  // Group prescribed by meal
  const presByMeal = MEALS_ORDER
    .map(m=>({label:m,items:prescribed.filter(p=>p.meal===m)}))
    .filter(g=>g.items.length>0)

  // Today extra (non-prescribed) by meal
  const extraByMeal = MEALS_ORDER
    .map(m=>({label:m,items:todayMeals.filter(i=>!i.prescribedId&&i.mealType===m)}))
    .filter(g=>g.items.length>0)

  const preview = selFood ? calcFood(selFood,weightG) : null

  return (
    <div className="screen">

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:0,margin:'10px 14px 0',background:'#f0efe8',borderRadius:10,padding:3,flexShrink:0}}>
        {[{v:'prescribed',l:'📋 Dieta'},{v:'today',l:'🥗 Hoje'},{v:'history',l:'📅 Histórico'}].map(x=>(
          <button key={x.v} onClick={()=>setSubTab(x.v)} style={{
            flex:1,padding:'8px 4px',border:'none',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:500,
            background:subTab===x.v?'#fff':'transparent',color:subTab===x.v?'#1a1a18':'#999',
            boxShadow:subTab===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'
          }}>{x.l}</button>
        ))}
      </div>

      {/* ── DIETA PRESCRITA ── */}
      {subTab==='prescribed' && (
        <div className="screen-scroll">

          {/* Daily calorie summary bar */}
          <div style={{background:'#fff',borderRadius:14,padding:'12px 14px',marginTop:10,marginBottom:10,border:'0.5px solid #eee'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span style={{fontSize:12,color:'#888'}}>Consumido hoje</span>
              <span style={{fontSize:12,color:'#888'}}>{consumed} / {dietGoal} kcal</span>
            </div>
            <div style={{height:8,background:'#f0efe8',borderRadius:8,overflow:'hidden',marginBottom:8}}>
              <div style={{height:'100%',width:`${pct}%`,background:barColor,borderRadius:8,transition:'width .3s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div style={{display:'flex',gap:12}}>
                {[{l:'C',v:Math.round(totalCarb),c:'#BA7517'},{l:'P',v:Math.round(totalProt),c:'#27500A'},{l:'G',v:Math.round(totalFat),c:'#A32D2D'}].map(x=>(
                  <span key={x.l} style={{fontSize:11,color:x.c,fontWeight:600}}>{x.l}: {x.v}g</span>
                ))}
              </div>
              <span style={{fontSize:11,color:remain===0?'#E24B4A':'#4CAF50',fontWeight:600}}>
                {remain>0?`Faltam ${remain} kcal`:'Meta atingida! 🎉'}
              </span>
            </div>
          </div>

          {/* Add prescribed button */}
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button onClick={()=>{setEditPresItem(null);setPresForm({meal:'Café da manhã',foodName:'',weightG:'',measure:'',options:[]});setPresSearch('');setPresSelFood(null);setShowPresForm(true)}} style={{
              flex:1,padding:'10px',borderRadius:10,border:'none',background:'#534AB7',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'
            }}>＋ Adicionar à prescrição</button>
            <button onClick={()=>{setShowAddExtra(true);setExtraMeal('Almoço');setExtraMode('search');setSearch('');setSelFood(null)}} style={{
              padding:'10px 14px',borderRadius:10,border:'0.5px solid #534AB7',background:'#fff',color:'#534AB7',fontSize:13,cursor:'pointer'
            }}>＋ Extra</button>
          </div>

          {prescribed.length===0 ? (
            <div style={{textAlign:'center',color:'#bbb',padding:'40px 0',fontSize:13}}>
              Adicione os itens da sua dieta prescrita pela nutricionista
            </div>
          ) : presByMeal.map(group=>{
            const groupCal = group.items.reduce((s,i)=>s+(i.cal||0),0)
            const groupDone= group.items.filter(i=>isDone(i.id)).length
            return (
              <div key={group.label} style={{marginBottom:10,border:'0.5px solid #e4e2dc',borderRadius:14,overflow:'hidden',background:'#fff'}}>
                {/* Meal header */}
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'#f8f8f6',borderBottom:'0.5px solid #f0efe8'}}>
                  <span style={{fontSize:18}}>{MEAL_ICONS[group.label]||'🍽️'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#1a1a18'}}>{group.label}</div>
                    <div style={{fontSize:11,color:'#888'}}>{groupDone}/{group.items.length} concluídos · {groupCal} kcal</div>
                  </div>
                </div>

                {/* Food items */}
                {group.items.map(item=>{
                  const done = isDone(item.id)
                  const hasOpts = item.options && item.options.length>0
                  return (
                    <div key={item.id} style={{
                      display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',
                      borderBottom:'0.5px solid #f8f8f6',
                      background:done?'#F1F8E9':'#fff'
                    }}>
                      {/* Check circle */}
                      <div onClick={()=>openCheck(item)} style={{
                        width:28,height:28,borderRadius:'50%',flexShrink:0,cursor:'pointer',marginTop:2,
                        background:done?'#4CAF50':'#fff',
                        border:`2.5px solid ${done?'#4CAF50':'#ddd'}`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:14,color:'#fff',transition:'all .15s',boxShadow:done?'0 2px 6px rgba(76,175,80,.3)':'none'
                      }}>{done?'✓':''}</div>

                      {/* Info */}
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:done?'#888':'#1a1a18',textDecoration:done?'line-through':'none',marginBottom:2}}>
                          {item.foodName}
                        </div>
                        <div style={{fontSize:12,color:'#888',marginBottom:hasOpts?6:0}}>
                          {item.measure ? `${item.measure} ou ` : ''}{item.weightG}g
                          {item.cal>0 && <span style={{color:'#534AB7',marginLeft:8,fontWeight:600}}>{item.cal} kcal</span>}
                        </div>
                        {item.cal>0 && (
                          <div style={{fontSize:10,color:'#bbb'}}>C:{item.carb}g · P:{item.prot}g · G:{item.fat}g</div>
                        )}
                        {hasOpts && (
                          <div style={{marginTop:6,padding:'6px 8px',background:'#EEEDFE',borderRadius:8}}>
                            <div style={{fontSize:10,color:'#7F77DD',fontWeight:600,marginBottom:4}}>↕️ Substituições:</div>
                            {item.options.map((opt,oi)=>(
                              <div key={oi} style={{fontSize:12,color:'#534AB7',padding:'2px 0'}}>
                                • {opt.foodName} — {opt.measure?`${opt.measure} ou `:''}{opt.weightG}g{opt.cal?` · ${opt.cal} kcal`:''}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit/Delete */}
                      <div style={{display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
                        <button onClick={()=>{setEditPresItem(item);setPresForm({meal:item.meal,foodName:item.foodName,weightG:String(item.weightG),measure:item.measure||'',options:item.options||[]});setPresSearch(item.foodName);setPresSelFood(allFoods.find(f=>f.name===item.foodName)||null);setShowPresForm(true)}}
                          style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:13,padding:'2px'}}>✏️</button>
                        <button onClick={()=>removePres(item.id)}
                          style={{background:'none',border:'none',cursor:'pointer',color:'#eee',fontSize:16,padding:'2px'}}>×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Extra foods today */}
          {extraByMeal.length>0 && (
            <div style={{marginTop:4}}>
              <div className="section-label">Extras registrados hoje</div>
              {extraByMeal.map(g=>(
                <div key={g.label} style={{marginBottom:8,border:'0.5px solid #eee',borderRadius:12,overflow:'hidden',background:'#fff'}}>
                  <div style={{padding:'8px 12px',background:'#f8f8f6',fontSize:12,fontWeight:600,color:'#888',borderBottom:'0.5px solid #f0efe8'}}>
                    {MEAL_ICONS[g.label]||'🍽️'} {g.label}
                  </div>
                  {g.items.map(item=>(
                    <div key={item.id} style={{display:'flex',alignItems:'center',padding:'9px 12px',borderBottom:'0.5px solid #f8f8f6'}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,color:'#1a1a18'}}>{item.name}</div>
                        <div style={{fontSize:11,color:'#bbb'}}>C:{item.carb}g · P:{item.prot}g · G:{item.fat}g</div>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:'#534AB7',marginRight:8}}>{item.cal} kcal</span>
                      <button onClick={()=>remove(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18}}>×</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <button onClick={()=>setShowGoalForm(true)} style={{
            width:'100%',marginTop:8,padding:'10px',borderRadius:10,border:'0.5px solid #eee',
            background:'#fff',color:'#888',fontSize:12,cursor:'pointer'
          }}>⚙️ Editar metas nutricionais</button>
        </div>
      )}

      {/* ── HOJE (registro livre) ── */}
      {subTab==='today' && (
        <div className="screen-scroll">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,marginBottom:10}}>
            <div>
              <div style={{fontSize:24,fontWeight:800,color:'#1a1a18'}}>{consumed} <span style={{fontSize:13,fontWeight:400,color:'#888'}}>kcal</span></div>
              <div style={{fontSize:12,color:remain>0?'#4CAF50':'#E24B4A'}}>{remain>0?`Faltam ${remain} kcal`:'Meta atingida! 🎉'}</div>
            </div>
            <button onClick={()=>{setShowAddExtra(true);setExtraMeal('Almoço');setExtraMode('search');setSearch('');setSelFood(null)}} style={{
              background:'#534AB7',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',fontSize:13,cursor:'pointer',fontWeight:600
            }}>＋ Registrar</button>
          </div>
          {MEALS_ORDER.map(m=>{
            const items=todayMeals.filter(i=>i.mealType===m)
            const mCal =items.reduce((s,i)=>s+(i.cal||0),0)
            return (
              <div key={m} style={{marginBottom:8,border:'0.5px solid #eee',borderRadius:12,overflow:'hidden',background:'#fff'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'#f8f8f6',borderBottom:items.length>0?'0.5px solid #f0efe8':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:15}}>{MEAL_ICONS[m]||'🍽️'}</span>
                    <span style={{fontSize:13,fontWeight:600,color:'#1a1a18'}}>{m}</span>
                    {mCal>0&&<span style={{fontSize:11,color:'#888'}}>{mCal} kcal</span>}
                  </div>
                  <button onClick={()=>{setShowAddExtra(true);setExtraMeal(m);setExtraMode('search');setSearch('');setSelFood(null)}} style={{background:'#534AB7',border:'none',borderRadius:7,padding:'4px 11px',fontSize:12,color:'#fff',cursor:'pointer'}}>＋</button>
                </div>
                {items.map(item=>(
                  <div key={item.id} style={{display:'flex',alignItems:'center',padding:'9px 12px',borderBottom:'0.5px solid #f8f8f6'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:'#1a1a18'}}>{item.name}{item.prescribedId?' ✅':''}</div>
                      <div style={{fontSize:11,color:'#bbb'}}>C:{item.carb}g · P:{item.prot}g · G:{item.fat}g</div>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:'#534AB7',marginRight:8}}>{item.cal} kcal</span>
                    <button onClick={()=>remove(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18}}>×</button>
                  </div>
                ))}
                {items.length===0&&<div style={{padding:'8px 12px',fontSize:12,color:'#ddd',fontStyle:'italic'}}>Nenhum alimento</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {subTab==='history' && (
        <div className="screen-scroll">
          <div style={{fontSize:12,color:'#888',marginBottom:12,marginTop:8}}>Últimos 90 dias · meta: {dietGoal} kcal</div>
          {histDays.length===0
            ? <div style={{textAlign:'center',color:'#bbb',padding:'30px 0',fontSize:13}}>Nenhum registro ainda</div>
            : histDays.map(([date,totals])=>{
              const p=Math.min(100,Math.round(totals.cal/dietGoal*100))
              const hit=totals.cal>=dietGoal*0.8&&totals.cal<=dietGoal*1.2
              return (
                <div key={date} style={{padding:'10px 0',borderBottom:'0.5px solid #f0efe8'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3}}>
                    <div style={{width:46,fontSize:12,color:'#888',flexShrink:0}}>{fmtDate(date)}</div>
                    <div style={{flex:1}}>
                      <div style={{height:8,background:'#f0efe8',borderRadius:8,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${p}%`,background:hit?'#4CAF50':'#534AB7',borderRadius:8}}/>
                      </div>
                    </div>
                    <div style={{width:60,textAlign:'right',fontSize:12,fontWeight:600,color:hit?'#27500A':'#534AB7',flexShrink:0}}>{totals.cal} kcal</div>
                    <div style={{fontSize:14}}>{hit?'✅':'📊'}</div>
                  </div>
                  <div style={{display:'flex',gap:12,paddingLeft:56,fontSize:11,color:'#bbb'}}>
                    <span>C:{Math.round(totals.carb)}g</span><span>P:{Math.round(totals.prot)}g</span><span>G:{Math.round(totals.fat)}g</span>
                  </div>
                </div>
              )
            })
          }
        </div>
      )}

      {/* ── CHECK MODAL ── */}
      {checkModal && (
        <div className="modal-overlay" onClick={()=>setCheckModal(null)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">O que você comeu?</div>
            <div className="form-group">
              {/* Main option */}
              <div onClick={()=>setCheckChoice('main')} style={{
                display:'flex',alignItems:'center',gap:10,padding:'12px',borderRadius:10,cursor:'pointer',marginBottom:6,
                background:checkChoice==='main'?'#F1F8E9':'#f8f8f6',border:`1.5px solid ${checkChoice==='main'?'#4CAF50':'#eee'}`
              }}>
                <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${checkChoice==='main'?'#4CAF50':'#ddd'}`,background:checkChoice==='main'?'#4CAF50':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {checkChoice==='main'&&<span style={{fontSize:11,color:'#fff'}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{checkModal.foodName}</div>
                  <div style={{fontSize:12,color:'#888'}}>{checkModal.measure?`${checkModal.measure} ou `:''}{checkModal.weightG}g · {checkModal.cal} kcal</div>
                </div>
              </div>

              {/* Substitution options */}
              {(checkModal.options||[]).map((opt,oi)=>(
                <div key={oi} onClick={()=>{setCheckChoice(oi);setCheckOptSearch('');setCheckOptFood(null);setCheckOptWeight(opt.weightG||100)}} style={{
                  display:'flex',alignItems:'center',gap:10,padding:'12px',borderRadius:10,cursor:'pointer',marginBottom:6,
                  background:checkChoice===oi?'#EEEDFE':'#f8f8f6',border:`1.5px solid ${checkChoice===oi?'#534AB7':'#eee'}`
                }}>
                  <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${checkChoice===oi?'#534AB7':'#ddd'}`,background:checkChoice===oi?'#534AB7':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {checkChoice===oi&&<span style={{fontSize:11,color:'#fff'}}>✓</span>}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>↕️ {opt.foodName}</div>
                    <div style={{fontSize:12,color:'#888'}}>{opt.measure?`${opt.measure} ou `:''}{opt.weightG}g · {opt.cal} kcal</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>setCheckModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmCheck}>✓ Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PRESCRIBED FORM ── */}
      {showPresForm && (
        <div className="modal-overlay" onClick={()=>{setShowPresForm(false);setEditPresItem(null)}}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:'90vh',overflowY:'auto'}}>
            <div className="sheet-handle"/>
            <div className="sheet-title">{editPresItem?'Editar item':'Novo item prescrito'}</div>
            <div className="form-group">
              {/* Meal */}
              <div>
                <label className="form-label">Refeição</label>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {MEALS_ORDER.map(m=>(
                    <button key={m} onClick={()=>setPresForm(f=>({...f,meal:m}))} style={{padding:'5px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,background:presForm.meal===m?'#534AB7':'#f0efe8',color:presForm.meal===m?'#fff':'#888'}}>{m}</button>
                  ))}
                </div>
              </div>
              {/* Food search + manual option */}
              <div>
                <label className="form-label">Alimento</label>
                <input type="search" placeholder="Buscar no banco de alimentos..." value={presSearch}
                  onChange={e=>{setPresSearch(e.target.value);setPresSelFood(null);setPresForm(f=>({...f,foodName:e.target.value}))}}/>
                {presSearch && !presSelFood && (
                  <div style={{border:'0.5px solid #ddd',borderRadius:8,maxHeight:150,overflowY:'auto',marginTop:4}}>
                    {allFoods.filter(f=>f.name.toLowerCase().includes(presSearch.toLowerCase())).slice(0,8).map(f=>(
                      <div key={f.name} onClick={()=>{setPresSelFood(f);setPresSearch(f.name);setPresForm(pf=>({...pf,foodName:f.name}))}}
                        style={{padding:'8px 12px',cursor:'pointer',fontSize:13,borderBottom:'0.5px solid #f5f5f5',display:'flex',justifyContent:'space-between'}}>
                        <span>{f.name}</span><span style={{color:'#999',fontSize:11}}>{f.kcal100} kcal/100g</span>
                      </div>
                    ))}
                    {/* Always show manual option */}
                    <div onClick={()=>{
                      setPresSelFood({name:presSearch,kcal100:0,carb:0,prot:0,fat:0,isManual:true})
                      setPresForm(pf=>({...pf,foodName:presSearch}))
                    }} style={{padding:'8px 12px',cursor:'pointer',fontSize:13,color:'#534AB7',background:'#EEEDFE',fontWeight:600}}>
                      ✏️ Cadastrar "{presSearch}" manualmente
                    </div>
                  </div>
                )}
                {/* Manual calories input when food not in DB */}
                {presSelFood?.isManual && (
                  <div style={{background:'#EEEDFE',borderRadius:8,padding:'10px 12px',marginTop:6}}>
                    <div style={{fontSize:11,color:'#7F77DD',fontWeight:600,marginBottom:8}}>Informe os dados nutricionais (por 100g)</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[{l:'Kcal/100g',k:'kcal100'},{l:'Carb/100g',k:'carb'},{l:'Prot/100g',k:'prot'},{l:'Gord/100g',k:'fat'}].map(x=>(
                        <div key={x.k}>
                          <label className="form-label">{x.l}</label>
                          <input type="number" placeholder="0" value={presSelFood[x.k]||''}
                            onChange={e=>setPresSelFood(f=>({...f,[x.k]:parseFloat(e.target.value)||0}))}/>
                        </div>
                      ))}
                    </div>
                    <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,cursor:'pointer',marginTop:8}}>
                      <input type="checkbox" defaultChecked onChange={e=>{
                        if(e.target.checked) addUserFood({name:presSelFood.name,kcal100:presSelFood.kcal100||0,carb:presSelFood.carb||0,prot:presSelFood.prot||0,fat:presSelFood.fat||0})
                      }}/>
                      Salvar no banco de alimentos para usar depois
                    </label>
                  </div>
                )}
              </div>
              {/* Weight + measure */}
              <div className="form-row">
                <div>
                  <label className="form-label">Gramas</label>
                  <input type="number" placeholder="Ex: 51" value={presForm.weightG} min="1"
                    onChange={e=>setPresForm(f=>({...f,weightG:e.target.value}))}/>
                </div>
                <div>
                  <label className="form-label">Medida caseira (opcional)</label>
                  <input type="text" placeholder="Ex: 3 colheres de sopa" value={presForm.measure}
                    onChange={e=>setPresForm(f=>({...f,measure:e.target.value}))}/>
                </div>
              </div>
              {/* Preview calories */}
              {presSelFood && presSelFood.kcal100>0 && presForm.weightG && (
                <div style={{background:'#EEEDFE',borderRadius:8,padding:'10px 12px'}}>
                  {(()=>{const c=calcFood(presSelFood,parseFloat(presForm.weightG)||0);return(
                    <div style={{display:'flex',gap:14,fontSize:12,fontWeight:600}}>
                      <span style={{color:'#534AB7'}}>{c.cal} kcal</span>
                      <span style={{color:'#BA7517'}}>C:{c.carb}g</span>
                      <span style={{color:'#27500A'}}>P:{c.prot}g</span>
                      <span style={{color:'#A32D2D'}}>G:{c.fat}g</span>
                    </div>
                  )})()}
                </div>
              )}

              {/* Substitutions */}
              <div>
                <label className="form-label">Substituições</label>
                {presForm.options.map((opt,oi)=>(
                  <div key={oi} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',background:'#EEEDFE',borderRadius:8,marginBottom:4}}>
                    <div style={{flex:1,fontSize:12}}>
                      <span style={{fontWeight:600}}>{opt.foodName}</span>
                      <span style={{color:'#888'}}> · {opt.measure?`${opt.measure} ou `:''}{opt.weightG}g{opt.cal?` · ${opt.cal} kcal`:''}</span>
                    </div>
                    <button onClick={()=>removeOption(oi)} style={{background:'none',border:'none',cursor:'pointer',color:'#A32D2D',fontSize:14}}>×</button>
                  </div>
                ))}
                {/* Add substitution */}
                <div style={{background:'#f8f8f6',borderRadius:8,padding:'10px',marginTop:4}}>
                  <div style={{fontSize:11,color:'#888',fontWeight:600,marginBottom:6}}>+ Adicionar substituição</div>
                  <input type="search" placeholder="Buscar alimento..." value={optSearch}
                    onChange={e=>{setOptSearch(e.target.value);setOptSelFood(null)}}/>
                  {optSearch && !optSelFood && (
                    <div style={{border:'0.5px solid #ddd',borderRadius:8,maxHeight:120,overflowY:'auto',marginTop:4}}>
                      {allFoods.filter(f=>f.name.toLowerCase().includes(optSearch.toLowerCase())).slice(0,6).map(f=>(
                        <div key={f.name} onClick={()=>{setOptSelFood(f);setOptSearch(f.name)}}
                          style={{padding:'7px 12px',cursor:'pointer',fontSize:13,borderBottom:'0.5px solid #f5f5f5'}}>
                          {f.name}
                        </div>
                      ))}
                      <div onClick={()=>{setOptSelFood({name:optSearch,kcal100:0,carb:0,prot:0,fat:0});}}
                        style={{padding:'7px 12px',cursor:'pointer',fontSize:13,color:'#534AB7',borderTop:'0.5px solid #eee'}}>
                        + Usar "{optSearch}"
                      </div>
                    </div>
                  )}
                  {optSelFood && (
                    <div className="form-row" style={{marginTop:6}}>
                      <div>
                        <label className="form-label">Gramas</label>
                        <input type="number" value={optWeightG} min="1" onChange={e=>setOptWeightG(parseInt(e.target.value)||1)}/>
                      </div>
                      <div>
                        <label className="form-label">Medida caseira</label>
                        <input type="text" placeholder="Ex: 1 fatia" value={optMeasure} onChange={e=>setOptMeasure(e.target.value)}/>
                      </div>
                    </div>
                  )}
                  {optSelFood && (
                    <button onClick={addOption} style={{marginTop:6,background:'#534AB7',border:'none',borderRadius:8,padding:'7px 16px',color:'#fff',fontSize:12,cursor:'pointer'}}>
                      + Adicionar substituto
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>{setShowPresForm(false);setEditPresItem(null)}}>Cancelar</button>
              <button className="btn-primary" onClick={savePrescribed}>{editPresItem?'Salvar':'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EXTRA FOOD MODAL ── */}
      {showAddExtra && (
        <div className="modal-overlay" onClick={()=>setShowAddExtra(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-title">Registrar alimento extra</div>
            <div className="form-group">
              <div>
                <label className="form-label">Refeição</label>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {MEALS_ORDER.map(m=>(
                    <button key={m} onClick={()=>setExtraMeal(m)} style={{padding:'5px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,background:extraMeal===m?'#534AB7':'#f0efe8',color:extraMeal===m?'#fff':'#888'}}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:0,background:'#f0efe8',borderRadius:10,padding:3}}>
                {[{v:'search',l:'🔍 Buscar'},{v:'custom',l:'✏️ Manual'},{v:'beverage',l:'🥤 Bebida'}].map(x=>(
                  <button key={x.v} onClick={()=>setExtraMode(x.v)} style={{flex:1,padding:'7px',border:'none',borderRadius:8,cursor:'pointer',fontSize:12,background:extraMode===x.v?'#fff':'transparent',color:extraMode===x.v?'#1a1a18':'#999',boxShadow:extraMode===x.v?'0 1px 3px rgba(0,0,0,.1)':'none'}}>{x.l}</button>
                ))}
              </div>
              {extraMode==='search' && (
                <>
                  <input type="search" placeholder="Ex: arroz, frango..." value={search} onChange={e=>{setSearch(e.target.value);setSelFood(null)}} autoFocus/>
                  {search && !selFood && (
                    <div style={{border:'0.5px solid #ddd',borderRadius:8,maxHeight:180,overflowY:'auto'}}>
                      {allFoods.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).slice(0,10).map(f=>(
                        <div key={f.name} onClick={()=>{setSelFood(f);setSearch(f.name)}} style={{padding:'9px 12px',cursor:'pointer',fontSize:13,borderBottom:'0.5px solid #f5f5f5',display:'flex',justifyContent:'space-between'}}>
                          <span>{f.name}</span><span style={{color:'#999',fontSize:11}}>{f.kcal100} kcal/100g</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selFood && (
                    <>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <input type="number" value={weightG} min="1" onChange={e=>setWeightG(parseInt(e.target.value)||1)} style={{flex:1}}/>
                        <span style={{fontSize:12,color:'#888'}}>g</span>
                        {[50,100,150,200].map(w=>(<button key={w} onClick={()=>setWeightG(w)} style={{padding:'6px 8px',borderRadius:8,border:'0.5px solid #ddd',background:weightG===w?'#534AB7':'#f8f8f6',color:weightG===w?'#fff':'#888',fontSize:11,cursor:'pointer'}}>{w}</button>))}
                      </div>
                      {preview && (
                        <div style={{background:'#EEEDFE',borderRadius:8,padding:'10px 12px'}}>
                          <div style={{display:'flex',gap:14,fontSize:12,fontWeight:600}}>
                            <span style={{color:'#534AB7'}}>{preview.cal} kcal</span>
                            <span style={{color:'#BA7517'}}>C:{preview.carb}g</span>
                            <span style={{color:'#27500A'}}>P:{preview.prot}g</span>
                            <span style={{color:'#A32D2D'}}>G:{preview.fat}g</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {extraMode==='beverage' && (
                <>
                  <input type="text" placeholder="Nome da bebida" value={bevForm.name} onChange={e=>setBevForm({...bevForm,name:e.target.value})}/>
                  <div className="form-row">
                    <div><label className="form-label">Quantidade (ml)</label><input type="number" placeholder="200" value={bevForm.ml} onChange={e=>setBevForm({...bevForm,ml:e.target.value})}/></div>
                    <div><label className="form-label">Kcal/100ml</label><input type="number" placeholder="0" value={bevForm.cal100ml} onChange={e=>setBevForm({...bevForm,cal100ml:e.target.value})}/></div>
                  </div>
                </>
              )}
              {extraMode==='custom' && (
                <>
                  <input type="text" placeholder="Nome do alimento" value={customFood.name} onChange={e=>setCustomFood({...customFood,name:e.target.value})}/>
                  <div className="form-row">
                    <div><label className="form-label">Kcal</label><input type="number" placeholder="0" value={customFood.cal} onChange={e=>setCustomFood({...customFood,cal:e.target.value})}/></div>
                    <div><label className="form-label">Carb (g)</label><input type="number" placeholder="0" value={customFood.carb} onChange={e=>setCustomFood({...customFood,carb:e.target.value})}/></div>
                  </div>
                  <div className="form-row">
                    <div><label className="form-label">Prot (g)</label><input type="number" placeholder="0" value={customFood.prot} onChange={e=>setCustomFood({...customFood,prot:e.target.value})}/></div>
                    <div><label className="form-label">Gord (g)</label><input type="number" placeholder="0" value={customFood.fat} onChange={e=>setCustomFood({...customFood,fat:e.target.value})}/></div>
                  </div>
                  <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer'}}>
                    <input type="checkbox" checked={customFood.saveToDb} onChange={e=>setCustomFood({...customFood,saveToDb:e.target.checked})}/>
                    Salvar no banco de alimentos
                  </label>
                </>
              )}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>setShowAddExtra(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveExtra}>Adicionar</button>
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
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
                  {[1400,1600,1800,2000,2200,2500].map(v=>(
                    <button key={v} onClick={()=>setNewGoal(v)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,background:newGoal===v?'#534AB7':'#f0efe8',color:newGoal===v?'#fff':'#888'}}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div><label className="form-label">Carboidratos (g)</label><input type="number" value={newCarbG} onChange={e=>setNewCarbG(parseInt(e.target.value)||0)}/></div>
                <div><label className="form-label">Proteínas (g)</label><input type="number" value={newProtG} onChange={e=>setNewProtG(parseInt(e.target.value)||0)}/></div>
              </div>
              <div><label className="form-label">Gorduras (g)</label><input type="number" value={newFatG} onChange={e=>setNewFatG(parseInt(e.target.value)||0)} style={{width:'50%'}}/></div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-ghost" onClick={()=>setShowGoalForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={async()=>{
                const data={goal:newGoal,carbG:newCarbG,protG:newProtG,fatG:newFatG}
                if(goalDocs[0]) await updateGoal(goalDocs[0].id,data)
                else await addGoal(data)
                setShowGoalForm(false)
              }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
