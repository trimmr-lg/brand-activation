import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

function cls(...xs){ return xs.filter(Boolean).join(' ') }
function todayIso(){ return new Date().toISOString().slice(0,10) }

export default function App(){
  const [session,setSession] = useState(null)
  const [profile,setProfile] = useState(null)
  const [tab,setTab] = useState('Events')

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session||null))
    const { data: sub } = supabase.auth.onAuthStateChange((_evt,sess)=>setSession(sess))
    return ()=>sub?.subscription.unsubscribe()
  },[])

  useEffect(()=>{ (async()=>{
    if(!session){ setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if(!data){
      await supabase.from('profiles').upsert({ id: session.user.id, full_name: session.user.email?.split('@')[0] })
      const { data: p2 } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(p2)
    } else setProfile(data)
  })() },[session])

  if(!session) return <Auth/>
  if(!profile) return <div className="container">Loading profile…</div>

  return (
    <div>
      <div className="topbar"><div className="topbar-inner">
        <div><strong>Trimmr — Brand Activation</strong></div>
        <div className="row"><span className="tab">role: {profile.role}</span><button className="btn outline sm" onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
      </div></div>
      <div className="container">
        <div className="tabs">
          {['Events','Campaigns','Dispensaries','Directory','Notifications','Admin'].map(t =>
            <div key={t} className={cls('tab', t===tab && 'active')} onClick={()=>setTab(t)}>{t}</div>
          )}
        </div>
        {tab==='Events' && <div className="card pad">Events screen (connects to Supabase)</div>}
        {tab!=='Events' && <div className="card pad">{tab} — placeholder</div>}
      </div>
    </div>
  )
}

function Auth(){
  const [email,setEmail] = useState('')
  const [sent,setSent] = useState(false)
  async function signIn(e){ e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin } })
    if(!error) setSent(true); else alert(error.message)
  }
  return (
    <div className="container" style={{maxWidth:420, marginTop:80}}>
      <div className="card pad">
        <div style={{fontSize:18, fontWeight:600, marginBottom:8}}>Sign in</div>
        <div className="muted" style={{fontSize:14, marginBottom:12}}>We’ll email you a magic link to sign in.</div>
        <form onSubmit={signIn} className="row">
          <input className="input" type="email" required placeholder="you@trimmr.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn" type="submit">Send magic link</button>
        </form>
        {sent && <div className="muted" style={{fontSize:12, marginTop:8}}>Check your inbox.</div>}
      </div>
    </div>
  )
}
