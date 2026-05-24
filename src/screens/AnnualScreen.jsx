import { useState } from 'react'
import { useData } from '../useData.js'

const MONTHS  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_S= ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
function fmtBRL(v){return 'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:0})}
const fmtDate = str => { const d=new Date(str+'T12:00'); return `${d.getDate()} ${MONTHS_S[d.getMonth()]}` }

function buildCycles(cycleDay, year) {
  return Array.from({length:12},(_,m)=>{
    const start = new Date(year,m,cycleDay)
    const end   = new Date(year,m+1,cycleDay-1)
    return {
      key:   `${year}-${String(m+1).padStart(2,'0')}`,
      monthIndex: m,
      start: start.toISOString().split('T')[0],
      end:   end.toISOString().split('T')[0],
    }
  })
}

export default function AnnualScreen() {
  const { items: transactions } = useData('transactions','group')
  const { items: sobrasData }   = useData('financeSobras','group')
  const { items: cycleDocs }    = useData('financeSettings','group')
  const { items: cycleNames }   = useData('financeSettingsNames','group')

  const year     = new Date().getFullYear()
  const curM     = new Date().getMonth()
  const today    = new Date().toISOString().split('T')[0]
  const cycleDay = cycleDocs[0]?.cycleDay || 1
  const cycles   = buildCycles(cycleDay, year)
  const curCycle = cycles.find(c=>today>=c.start&&today<=c.end)||cycles[curM]

  const getCName = key => cycleNames.find(c=>c.cycleKey===key)?.name||''

  const cycleLabel = c => {
    const name = getCName(c.key)
    const base = cycleDay===1
      ? MONTHS[c.monthIndex]
      : `${fmtDate(c.start)} – ${fmtDate(c.end)}`
    return name ? `${name}` : MONTHS_S[c.monthIndex]
  }

  const monthly = cycles.map(cycle => {
    const mt  = transactions.filter(t=>t.date>=cycle.start&&t.date<=cycle.end)
    const inc = mt.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount,0)
    const exp = mt.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount,0)
    const sob = sobrasData.find(d=>d.monthKey===cycle.key)||{}
    const pi  = parseFloat(sob.pctInvest)||20
    const inv = (parseFloat(sob.sobrou)||0)*pi/100
    return { cycle, inc, exp, bal:inc-exp, inv, count:mt.length }
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
          {bg:totInc-totExp>=0?'#EAF3DE':'#FCEBEB',tc:totInc-totExp>=0?'#27500A':'#791F1F',lc:'#534AB7',label:'SALDO',val:(totInc-totExp>=0?'+':'-')+fmtBRL(Math.abs(totInc-totExp))}
        ].map(x=>(
          <div key={x.label} style={{background:x.bg,borderRadius:12,padding:'10px 8px'}}>
            <div style={{fontSize:9,color:x.lc,fontWeight:600}}>{x.label}</div>
            <div style={{fontSize:12,fontWeight:700,color:x.tc,marginTop:2}}>{x.val}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Por ciclo</div>
      <div style={{display:'flex',gap:12,marginBottom:8,flexWrap:'wrap'}}>
        {[{c:'#639922',l:'Entradas'},{c:'#E24B4A',l:'Saídas'},{c:'#534AB7',l:'Investido'}].map(x=>(
          <div key={x.l} style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:x.c}}/>
            <span style={{fontSize:11,color:'#888'}}>{x.l}</span>
          </div>
        ))}
      </div>

      {monthly.map(({cycle,inc,exp,bal,inv,count},i)=>{
        const isCur = cycle.key===curCycle?.key
        const name  = getCName(cycle.key)
        const sublabel = cycleDay>1 ? `${fmtDate(cycle.start)} – ${fmtDate(cycle.end)}` : ''
        return (
          <div key={cycle.key} style={{marginBottom:12,opacity:count===0&&inv===0?0.35:1,padding:'8px 10px',borderRadius:10,background:isCur?'#EEEDFE':'transparent',border:isCur?'0.5px solid #534AB7':'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:36,flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:isCur?700:400,color:isCur?'#534AB7':'#888'}}>{name||MONTHS_S[i]}</div>
                {sublabel&&<div style={{fontSize:9,color:'#bbb'}}>{sublabel}</div>}
              </div>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:2}}>
                <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.round(inc/maxVal*100)}%`,background:'#639922',borderRadius:20}}/>
                </div>
                <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.round(exp/maxVal*100)}%`,background:'#E24B4A',borderRadius:20}}/>
                </div>
                <div style={{height:7,background:'#f0efe8',borderRadius:20,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.round(inv/maxVal*100)}%`,background:'#534AB7',borderRadius:20}}/>
                </div>
              </div>
              <span style={{width:70,textAlign:'right',fontSize:12,fontWeight:600,color:bal>=0?'#27500A':'#A32D2D'}}>
                {count===0&&inv===0?'—':(bal>=0?'+':'-')+fmtBRL(Math.abs(bal))}
              </span>
            </div>
            {inv>0&&<div style={{paddingLeft:44,fontSize:10,color:'#534AB7',marginTop:1}}>💼 {fmtBRL(inv)}</div>}
          </div>
        )
      })}

      {topCats.length>0&&<>
        <div className="section-label" style={{marginTop:10}}>Maiores gastos do ano</div>
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
