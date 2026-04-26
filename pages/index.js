import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Head from "next/head"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session])

  return (
    <>
      <Head>
        <title>LinkedAlert — LinkedIn Post Monitor</title>
        <meta name="description" content="Get instant Telegram notifications when anyone posts about your keywords on LinkedIn." />
      </Head>

      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <a href="/" className="logo">Linked<span>Alert</span></a>
            <div className="nav-links">
              <button className="btn btn-primary" onClick={() => signIn('google')}>
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <div className="hero">
            <h1>LinkedIn posts.<br /><span>Instant alerts.</span></h1>
            <p>Monitor LinkedIn for any keyword or niche. Get notified on Telegram the moment a matching post goes live.</p>
            <div className="hero-btns">
              <button className="btn btn-primary" style={{fontSize:'16px', padding:'12px 28px'}} onClick={() => signIn('google')}>
                🔗 Sign in with Google — It's Free
              </button>
            </div>
            <p style={{marginTop:'16px', fontSize:'13px', color:'#9ca3af'}}>No credit card required • Setup in 5 minutes</p>
          </div>

          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Keyword monitoring</h3>
              <p>Track any keyword across all LinkedIn posts in real time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location filter</h3>
              <p>Filter posts by India, specific city, or any region.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Telegram alerts</h3>
              <p>Instant notification with post content and direct link.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Multiple monitors</h3>
              <p>Run multiple monitors for different keywords simultaneously.</p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{borderTop:'1px solid #e5e7eb', padding:'24px 0', textAlign:'center', color:'#9ca3af', fontSize:'13px'}}>
        <div className="container">
          <span>LinkedAlert © 2025 • Built for influencer agencies & sales teams</span>
        </div>
      </footer>
    </>
  )
}
