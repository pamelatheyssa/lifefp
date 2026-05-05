import { useData } from '../useData.js'
const MONTHS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
function fmtBRL(v){return 'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:0})}

export default function AnnualScreen() {
  const { items: transactions } = useData('transactions','group')
  const { items: sobrasData }   = useData('financeSobras','group')
  const year = new Date().getFullYear()
  const curM = new Date().getMonth()

  const monthly = Array.from({length:12},(_,i)=>{
    const key = `${year}-${String(i+1).padStart(2,'0')}`
    const mt  = transactions.filter(t=>{ const d=new Date(t.date+'T12:00'); return d.getFullYear()===year && d.getMonth()===i })
    const inc = mt.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount,0)
    const exp = mt.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount,0)
    const sob = sobrasData.find(d=>d.monthKey===key)
    const inv = sob ? (parseFloat(sob.sobrou)||0)*0.2 : 0
    return { inc, exp, bal:inc-exp, inv, count:mt.length }
  })

  const totInc = monthly.reduce((s,m)=>s+m.inc,0)
  const totExp = monthly.reduce((s,m)=>s+m.exp,0)
  const totInv = monthly.reduce((s,m)=>s+m.inv,0)
  const maxVal = Math.max(...monthly.map(m=>Math.max(m.inc,m.exp,m.inv)),1)

  const catSpend={}
  transactions
    .filter(t=>{ const d=new Date(t.date+'T12:00'); return d.getFullYear()===year && t.type==='out' })
    .forEach(t=>{ catSpend[t.category]=(catSpend[t.category]||0)+t.amount })
  const topCats=Object.entries(catSpend).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div className="screen"><div className="screen-scroll">
      <div style={{fontSize:16,fontWeight:600,marginBottom:12}}>Resumo {year}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,marginBottom:14}}>
        {[
          {bg:'#EAF3DE',tc:'#27500A',lc:'#3B6D11',label:'ENTRADAS', val:fmtBRL(totInc)},
          {bg:'#FCEBEB',tc:'#791F1F',lc:'#A32D2D',label:'SAÍDAS',   val:fmtBRL(totExp)},
          {bg:'#EEEDFE',tc:'#3C3489',lc:'#534AB7',label:'INVESTIDO', val:fmtBRL(totInv)},
          {bg:totInc-totExp>=0?'#EAF3DE':'#FCEBEB',tc:totInc-totExp>=0?'#27500A':'#791F1F',lc:'#534AB7',label:'SALDO',val:(totInc-totExp>=0?'+':'-')+fmtBRL(totInc-totExp)}
        ].map(x=>(
          <div key={x.label} style={{background:x.bg,borderRadius:12,padding:'10px 8px'}}>
            <div style={{fontSize:9,color:x.lc,fontWeight:600}}>{x.label}</div>
            <div style={{fontSize:12,fontWeight:700,color:x.tc,marginTop:2}}>{x.val}</div>
          </div>
        ))}
      </div>
      <div className="section-label">Por mês</div>
      <div style={{display:'flex',gap:12,marginBottom:8,flexWrap:'wrap'}}>
        {[{c:'#639922',l:'Entradas'},{c:'#E24B4A',l:'Saídas'},{c:'#534AB7',l:'Investido'}].map(x=>(
          <div key={x.l} style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:x.c}}/>
            <span style={{fontSize:11,color:'#888'}}>{x.l}</span>
          </div>
        ))}
      </div>
      {monthly.map((m,i)=>(
        <div key={i} style={{marginBottom:10,opacity:m.count===0&&m.inv===0?0.35:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:30,fontSize:12,fontWeight:i===curM?600:400,color:i===curM?'#534AB7':'#888'}}>{MONTHS[i]}</span>
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:2}}>
              <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.round(m.inc/maxVal*100)}%`,background:'#639922',borderRadius:20}}/>
              </div>
              <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.round(m.exp/maxVal*100)}%`,background:'#E24B4A',borderRadius:20}}/>
              </div>
              <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.round(m.inv/maxVal*100)}%`,background:'#534AB7',borderRadius:20}}/>
              </div>
            </div>
            <span style={{width:70,textAlign:'right',fontSize:12,fontWeight:600,color:m.bal>=0?'#27500A':'#A32D2D'}}>
              {m.count===0&&m.inv===0?'—':(m.bal>=0?'+':'-')+fmtBRL(m.bal)}
            </span>
          </div>
          {m.inv>0&&<div style={{paddingLeft:38,fontSize:10,color:'#534AB7',marginTop:1}}>💼 {fmtBRL(m.inv)}</div>}
        </div>
      ))}
      {topCats.length>0&&<>
        <div className="section-label" style={{marginTop:10}}>Maiores gastos</div>
        {topCats.map(([cat,amt],i)=>(
          <div key={cat} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',border:'0.5px solid #eee',borderRadius:10,background:'#fff',marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{width:22,height:22,borderRadius:6,background:'#FCEBEB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#A32D2D'}}>{i+1}</span>
              <span style={{fontSize:13,fontWeight:500}}>{cat}</span>
            </div>
            <span style={{fontSize:13,fontWeight:600,color:'#A32D2D'}}>R$ {amt.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
          </div>
        ))}
      </>}
    </div></div>
  )
}
