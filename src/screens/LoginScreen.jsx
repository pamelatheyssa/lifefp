import { useAuth } from '../AuthContext.jsx'

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink:0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function LoginScreen() {
  const { loginWithGoogle, loginError, processing, isConfigured } = useAuth()

  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100dvh', padding:'36px 28px',
      background:'#fff', overflowY:'auto'
    }}>
      <div style={{
        width:72, height:72, borderRadius:20, background:'#EEEDFE',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:36, marginBottom:18, flexShrink:0
      }}>📋</div>

      <h1 style={{ fontSize:26, fontWeight:700, marginBottom:6, textAlign:'center' }}>
        Life Planner
      </h1>
      <p style={{ fontSize:14, color:'#888', textAlign:'center', marginBottom:32, lineHeight:1.6 }}>
        Organize sua vida e família em um só lugar
      </p>

      {!isConfigured && (
        <div style={{
          width:'100%', background:'#FAEEDA', borderRadius:12,
          padding:'14px 16px', marginBottom:18, border:'1px solid #EF9F27'
        }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#633806', marginBottom:6 }}>
            ⚙️ Configure o Firebase primeiro
          </div>
          <div style={{ fontSize:12, color:'#633806', lineHeight:1.7 }}>
            Abra <code style={{ background:'rgba(255,255,255,.6)', padding:'1px 5px', borderRadius:4 }}>src/firebase.js</code> e
            substitua os valores <code style={{ background:'rgba(255,255,255,.6)', padding:'1px 5px', borderRadius:4 }}>COLE_AQUI...</code> pelas credenciais do Firebase.<br /><br />
            Veja o <strong>GUIA_INSTALACAO.md → Passos 3–7</strong>.
          </div>
        </div>
      )}

      {loginError && (
        <div style={{
          width:'100%', background:'#FCEBEB', borderRadius:12,
          padding:'14px 16px', marginBottom:18,
          border:'1px solid #F09595', whiteSpace:'pre-line'
        }}>
          <div style={{ fontSize:13, color:'#791F1F', lineHeight:1.7 }}>{loginError}</div>
        </div>
      )}

      <button onClick={loginWithGoogle} disabled={processing} style={{
        width:'100%', padding:'14px 20px',
        border:'1px solid #dadce0', borderRadius:12,
        background: processing ? '#f5f5f5' : '#fff',
        fontSize:15, fontWeight:500, cursor: processing ? 'default' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:12,
        color:'#3c4043', boxShadow: processing ? 'none' : '0 1px 3px rgba(0,0,0,.08)'
      }}>
        {processing
          ? <><svg width="18" height="18" viewBox="0 0 24 24" style={{ animation:'lp-spin .8s linear infinite', flexShrink:0 }}><style>{'@keyframes lp-spin{to{transform:rotate(360deg)}}'}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#ccc" strokeWidth="3"/><path d="M12 2 a10 10 0 0 1 10 10" fill="none" stroke="#534AB7" strokeWidth="3" strokeLinecap="round"/></svg> Redirecionando…</>
          : <><GoogleLogo /> Entrar com Google</>
        }
      </button>

      <p style={{ fontSize:11, color:'#ccc', textAlign:'center', marginTop:24, lineHeight:1.7 }}>
        Você será redirecionado para o Google.<br />
        Após o login, voltará automaticamente ao app.
      </p>
    </div>
  )
}
