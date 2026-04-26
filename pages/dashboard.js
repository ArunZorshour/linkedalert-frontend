import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import axios from "axios"

const API = "/api/proxy"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [view, setView] = useState('monitors')
  const [monitors, setMonitors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', keywords: [], location: 'India',
    interval_minutes: 15, telegram_token: '',
    telegram_chat_id: '', linkedin_cookie: ''
  })
  const [kwInput, setKwInput] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status])

  useEffect(() => {
    if (session?.user?.id) {
      fetchMonitors()
      fetchAlerts()
    }
  }, [session])

  async function fetchMonitors() {
    try {
      const r = await axios.get(`${API}/monitors/${session.user.id}`)
      setMonitors(r.data)
    } catch(e) { console.log(e) }
  }

  async function fetchAlerts() {
    try {
      const r = await axios.get(`${API}/alerts/${session.user.id}`)
      setAlerts(r.data)
    } catch(e) { console.log(e) }
  }

  function addKw() {
    if (kwInput.trim() && !form.keywords.includes(kwInput.trim())) {
      setForm({...form, keywords: [...form.keywords, kwInput.trim()]})
      setKwInput('')
    }
  }

  function removeKw(i) {
    setForm({...form, keywords: form.keywords.filter((_,idx)=>idx!==i)})
  }

  async function createMonitor(e) {
    e.preventDefault()
    setError('')
    if (!form.telegram_token || !form.telegram_chat_id || !form.linkedin_cookie) {
      setError('Telegram Token, Chat ID aur LinkedIn Cookie zaroori hain!')
      return
    }
    if (form.keywords.length === 0) {
      setError('Kam se kam ek keyword add karo!')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API}/monitors`, { ...form, user_id: session.user.id })
      setSuccess('Monitor start ho gaya! Telegram check karo 🎉')
      setForm({ name: '', keywords: [], location: 'India', interval_minutes: 15, telegram_token: '', telegram_chat_id: '', linkedin_cookie: '' })
      fetchMonitors()
      setTimeout(() => { setView('monitors'); setSuccess('') }, 2000)
    } catch(e) {
      setError('Error creating monitor. Please try again.')
    }
    setLoading(false)
  }

  async function stopMonitor(id) {
    await axios.delete(`${API}/monitors/${id}`)
    fetchMonitors()
  }

  if (status === 'loading') return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontSize:'14px',color:'#6b7280'}}>Loading...</div>

  return (
    <>
      <Head><title>Dashboard — LinkedAlert</title></Head>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <a href="/" className="logo">Linked<span>Alert</span></a>
            <div className="nav-links">
              <span style={{fontSize:'14px', color:'#6b7280'}}>{session?.user?.name}</span>
              <button className="btn btn-outline" onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard">
        <aside className="sidebar">
          <div style={{marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #e5e7eb'}}>
            <div style={{fontSize:'13px', fontWeight:'600', color:'#6b7280', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Menu</div>
          </div>
          {[
            { id:'monitors', label:'My Monitors', icon:'📡' },
            { id:'create', label:'New Monitor', icon:'➕' },
            { id:'alerts', label:'Recent Alerts', icon:'🔔' },
          ].map(item => (
            <a key={item.id} className={`sidebar-link ${view===item.id?'active':''}`} href="#" onClick={e=>{e.preventDefault();setView(item.id)}}>
              <span style={{fontSize:'16px'}}>{item.icon}</span> {item.label}
            </a>
          ))}
        </aside>

        <main className="main-content">
          {view === 'monitors' && (
            <>
              <div className="page-title">My Monitors</div>
              <div className="metrics-grid">
                <div className="metric-card"><div className="metric-val">{monitors.filter(m=>m.status==='active').length}</div><div className="metric-label">Active monitors</div></div>
                <div className="metric-card"><div className="metric-val">{alerts.length}</div><div className="metric-label">Total alerts</div></div>
                <div className="metric-card"><div className="metric-val">{monitors.reduce((a,m)=>a+(m.posts_found||0),0)}</div><div className="metric-label">Posts found</div></div>
              </div>
              {monitors.length === 0 ? (
                <div className="card">
                  <div className="empty">
                    <div style={{fontSize:'32px'}}>📡</div>
                    <p>No monitors yet.</p>
                    <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={()=>setView('create')}>Create your first monitor</button>
                  </div>
                </div>
              ) : monitors.map(m => (
                <div key={m.id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{m.name}</div>
                      <div style={{fontSize:'12px', color:'#6b7280', marginTop:'4px'}}>Every {m.interval_minutes} min • {m.location}</div>
                    </div>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                      <span className={`status ${m.status}`}><span className="status-dot"></span>{m.status}</span>
                      {m.status === 'active' && <button className="btn btn-danger" style={{fontSize:'12px', padding:'4px 12px'}} onClick={()=>stopMonitor(m.id)}>Stop</button>}
                    </div>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                    {m.keywords.map(k=><span key={k} className="tag">{k}</span>)}
                  </div>
                </div>
              ))}
            </>
          )}

          {view === 'create' && (
            <>
              <div className="page-title">Create New Monitor</div>
              {success && <div style={{background:'#d1fae5', color:'#059669', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px'}}>{success}</div>}
              {error && <div style={{background:'#fee2e2', color:'#dc2626', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px'}}>{error}</div>}
              <form onSubmit={createMonitor}>
                <div className="card">
                  <div className="card-title" style={{marginBottom:'16px'}}>Basic settings</div>
                  <div className="form-group">
                    <label className="form-label">Monitor name</label>
                    <input className="form-input" placeholder="e.g. Influencer leads India" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Keywords</label>
                    <div style={{display:'flex', gap:'8px'}}>
                      <input className="form-input" placeholder="Add keyword..." value={kwInput} onChange={e=>setKwInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addKw())} />
                      <button type="button" className="btn btn-outline" onClick={addKw}>Add</button>
                    </div>
                    <div style={{marginTop:'8px', display:'flex', flexWrap:'wrap'}}>
                      {form.keywords.map((k,i)=><span key={i} className="tag">{k}<span className="tag-x" onClick={()=>removeKw(i)}>×</span></span>)}
                    </div>
                    <div style={{marginTop:'10px', fontSize:'12px', color:'#6b7280'}}>Quick add:</div>
                    <div style={{marginTop:'4px'}}>
                      {['influencer marketing India','looking for influencer','brand collaboration','content creator required','UGC creator India'].map(s=>(
                        <span key={s} style={{display:'inline-block', fontSize:'12px', padding:'3px 10px', border:'1px solid #e5e7eb', borderRadius:'99px', margin:'3px', cursor:'pointer', color:'#6b7280'}} onClick={()=>{if(!form.keywords.includes(s))setForm({...form,keywords:[...form.keywords,s]})}}>+ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Scan every (minutes)</label>
                      <input className="form-input" type="number" min="5" max="60" value={form.interval_minutes} onChange={e=>setForm({...form,interval_minutes:parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title" style={{marginBottom:'4px'}}>Telegram notifications</div>
                  <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'16px'}}>Create a bot via @BotFather on Telegram, then get your Chat ID from @userinfobot</p>
                  <div className="form-group">
                    <label className="form-label">Bot Token</label>
                    <input className="form-input" placeholder="1234567890:ABCdef..." value={form.telegram_token} onChange={e=>setForm({...form,telegram_token:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chat ID</label>
                    <input className="form-input" placeholder="725538300" value={form.telegram_chat_id} onChange={e=>setForm({...form,telegram_chat_id:e.target.value})} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-title" style={{marginBottom:'4px'}}>LinkedIn connection</div>
                  <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'16px'}}>Open LinkedIn in Chrome → F12 → Application → Cookies → copy li_at value</p>
                  <div className="form-group">
                    <label className="form-label">LinkedIn li_at Cookie</label>
                    <input className="form-input" placeholder="Your li_at cookie value..." value={form.linkedin_cookie} onChange={e=>setForm({...form,linkedin_cookie:e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'14px', fontSize:'15px', justifyContent:'center'}} disabled={loading}>
                  {loading ? 'Creating...' : '🚀 Start Monitor'}
                </button>
              </form>
            </>
          )}

          {view === 'alerts' && (
            <>
              <div className="page-title">Recent Alerts</div>
              {alerts.length === 0 ? (
                <div className="card"><div className="empty"><div style={{fontSize:'32px'}}>🔔</div><p>No alerts yet. Create a monitor to start receiving notifications.</p></div></div>
              ) : alerts.map((a,i) => (
                <div key={i} className="alert-item">
                  <div className="alert-name">{a.name || 'Unknown'}</div>
                  <div className="alert-post">{a.post_text}</div>
                  <div className="alert-footer">
                    <span className="kw-badge">Keyword: {a.keyword}</span>
                    <span className="alert-time">{new Date(a.created_at).toLocaleString('en-IN')}</span>
                    {a.post_url && <a className="alert-link" href={a.post_url} target="_blank">View post →</a>}
                  </div>
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    </>
  )
}
