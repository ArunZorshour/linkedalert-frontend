import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import axios from "axios"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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
          {view === 'moni
