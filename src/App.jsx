import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supa'
import Dashboard from './pages/Dashboard.jsx'
import Brands from './pages/Brands.jsx'
import Dispensaries from './pages/Dispensaries.jsx'
import Territories from './pages/Territories.jsx'
import Campaigns from './pages/Campaigns.jsx'
import MySettings from './pages/MySettings.jsx'
import Admin from './pages/Admin.jsx'

const headerFont = { fontFamily: 'Montserrat, Inter, system-ui, Arial, sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }
const bodyFont = { fontFamily: 'Inter, system-ui, Arial, sans-serif' }

export default function App(){
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('Dashboard')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => { setSession(s) })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(()=>{
    if(!session){ setProfile(null); return }
    (async()=>{
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      if(!error && data) setProfile(data)
    })()
  }, [session?.user?.id])

  const role = profile?.role
  const tabsByRole = {
    admin:              ['Dashboard','Admin','Brands','Dispensaries','Territories','Campaigns','My Settings'],
    activation_manager: ['Dashboard','Brands','Dispensaries','Territories','Campaigns','My Settings'],
    brand_rep:          ['Dashboard','Brands','Dispensaries','Campaigns','My Settings'],
    dispensary_rep:     ['Dashboard','My Settings'],
  }
  const tabs = tabsByRole[role] ?? ['Dashboard']

  async function signIn(e){
    e.preventDefault(); setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://brand-activation-seven.vercel.app' } // set to your prod URL
    })
    setSending(false)
    if(!error) setSent(true); else alert(error.message)
  }

  if(!session){
    return (
      <div className="container" style={bodyFont}>
        <div className="card pad" style={{maxWidth:520, margin:'15vh auto 0'}}>
          <div className="section-eyebrow" style={headerFont}>Trimmr</div>
          <h1 style={{...headerFont, marginTop:6}}>Sign In</h1>
          <form className="row" onSubmit={signIn}>
            <input className="input" type="email" required placeholder="you@trimmr.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <button className="btn accent" disabled={sending} type="submit">{sending?'Sending…':'Send magic link'}</button>
          </form>
          {sent && <div className="muted" style={{marginTop:8}}>Check your email for the link.</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={bodyFont}>
      <div className="row" style={{justifyContent:'space-between', marginBottom:6}}>
        <div className="row" style={{gap:10}}>
          <strong style={headerFont}>Brand Activation</strong>
          <span className="muted">({profile?.full_name || session.user.email})</span>
        </div>
        <div className="row">
          <button className="btn" onClick={()=>supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <nav className="tabs" role="tablist">
        {tabs.map(t => (
          <div
            key={t}
            className={'tab '+(t===tab?'active':'')}
            style={headerFont}
            onClick={()=>setTab(t)}
            role="tab"
            aria-selected={t===tab}
          >
            {t}
          </div>
        ))}
      </nav>

      <main>
        <Page tab={tab} profile={profile} />
      </main>
    </div>
  )
}

function Page({ tab, profile }){
  switch(tab){
    case 'Dashboard': return <Dashboard profile={profile} />
    case 'Brands': return <Brands />
    case 'Dispensaries': return <Dispensaries />
    case 'Territories': return <Territories />
    case 'Campaigns': return <Campaigns />
    case 'My Settings': return <MySettings />
    case 'Admin': return <Admin />
    default: return <Dashboard profile={profile} />
  }
}