"use client";
import { useEffect,useRef,useState } from "react";
import { ArrowUp,Plus,Brain,Clock3,Command,ExternalLink,LoaderCircle,PanelLeftClose,Sparkles,Search,ChevronDown } from "lucide-react";
type Source={title:string;url:string;snippet:string;publishedAt?:string};
type Message={role:"user"|"assistant";content:string;sources?:Source[]};
type Conversation={id:string;title:string;updatedAt:string};
const examples=[
 {tag:"TEMPORAL RESEARCH",text:"On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?"},
 {tag:"HISTORICAL RECALL",text:"What did I ask you on 3 November? Is your answer still correct today?"},
 {tag:"PRICE TRACKING",text:"Last Tuesday I asked you about Postgres hosting. Has any pricing changed since?"},
 {tag:"FRESH RESEARCH",text:"Compare the latest pricing and notable product updates for Neon, Supabase, and Railway."}
];
export default function Workspace(){
 const [messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [conversationId,setConversationId]=useState<string>(),[view,setView]=useState<"chat"|"memory">("chat");
 const [memory,setMemory]=useState<{runs:any[];evidence:any[]}|null>(null),[conversations,setConversations]=useState<Conversation[]>([]);
 const [mobileNav,setMobileNav]=useState(false);const endRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{void loadConversations();},[]);
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
 async function loadConversations(){try{const r=await fetch("/api/conversations");if(r.ok){const d=await r.json();setConversations(d.conversations||[]);}}catch{}}
 async function send(text=input){
  if(!text.trim()||busy)return;setError("");setView("chat");setInput("");
  const next=[...messages,{role:"user" as const,content:text}];setMessages(next);setBusy(true);
  try{
   const res=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text,conversationId})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Request failed");
   setConversationId(data.conversationId);setMessages([...next,{role:"assistant",content:data.answer,sources:data.sources||[]}]);void loadConversations();
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong");}
  finally{setBusy(false);}
 }
 async function openMemory(){setView("memory");setMobileNav(false);try{const r=await fetch("/api/memory");const d=await r.json();if(!r.ok)throw new Error(d.error);setMemory(d);}catch(e){setError(e instanceof Error?e.message:"Could not load memory");}}
 function newChat(){setMessages([]);setConversationId(undefined);setInput("");setError("");setView("chat");setMobileNav(false);}
 async function openConversation(id:string){try{const r=await fetch("/api/conversations/"+id);if(!r.ok)return;const d=await r.json();setConversationId(id);setMessages(d.messages||[]);setView("chat");setMobileNav(false);}catch{}}
 return <div className="shell">
  {mobileNav?<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>:null}
  <aside className={"sidebar "+(mobileNav?"sidebar-open":"")}>
   <div className="brand"><div className="brand-mark">R</div><div><div className="brand-name">RECALL</div><div className="brand-sub">RESEARCH THAT REMEMBERS</div></div></div>
   <button className="new-chat" onClick={newChat}><Plus size={15}/> New research thread</button>
   <div><div className="side-label">WORKSPACE</div>
    <button className={"nav-item "+(view==="chat"?"active":"")} onClick={()=>{setView("chat");setMobileNav(false);}}><Command size={15}/> Research chat</button>
    <button className={"nav-item "+(view==="memory"?"active":"")} onClick={openMemory}><Brain size={15}/> Memory & history</button>
    <button className="nav-item" onClick={openMemory}><Clock3 size={15}/> Research timeline</button>
   </div>
   <div><div className="side-label">RECENT THREADS</div>
    {conversations.slice(0,7).map(c=><button key={c.id} className="thread-link" onClick={()=>openConversation(c.id)} title={c.title}>{c.title}</button>)}
    {!conversations.length?<div className="side-empty">Your research threads will appear here.</div>:null}
   </div>
   <div><div className="side-label">YOUR AGENT</div><div className="nav-item"><span className="dot"/> Web search enabled</div><div className="nav-item"><span className="dot"/> Persistent memory</div></div>
   <div className="side-foot"><strong>Built for continuity.</strong><p>Historical evidence stays distinct from today's findings. Every answer can become context for the next question.</p></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="crumb"><button className="mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><PanelLeftClose size={17}/></button>Workspace <span className="slash">/</span> {view==="memory"?"Memory & history":"Research chat"}</div><div className="status"><span className="dot"/> Agent ready <ChevronDown size={12}/></div></header>
   <section className="content">
    {view==="memory"?<><div className="eyebrow">YOUR RESEARCH MEMORY</div><h1 className="memory-heading">A record of what you explored.</h1><p className="memory-intro">Past conversations, research runs, and source observations are retained separately so new findings never rewrite history.</p>
      <div className="panel"><h3>Research runs <span>{memory?.runs?.length||0}</span></h3>{!memory?<div className="empty">Loading memory…</div>:memory.runs.length?memory.runs.map(r=><div className="memory-row" key={r.id}><span>{r.query}</span><span className="memory-date">{new Date(r.startedAt).toLocaleDateString()}</span></div>):<div className="empty">No research runs saved yet. Start a research thread to build your timeline.</div>}</div>
      <div className="panel"><h3>Evidence observations <span>{memory?.evidence?.length||0}</span></h3>{!memory?<div className="empty">Loading evidence…</div>:memory.evidence.length?memory.evidence.map(e=><div className="memory-row" key={e.id}><a href={e.url} target="_blank" rel="noreferrer">{e.title}</a><span className="memory-date">Observed {new Date(e.observedAt).toLocaleDateString()}</span></div>):<div className="empty">No evidence captured yet.</div>}</div>
     </>:<>{messages.length===0?<><div className="hero"><div className="eyebrow"><Sparkles size={12}/> YOUR STATEFUL RESEARCH AGENT</div><h1>Don't just search.<br/><span>Remember.</span></h1><p>RECALL connects what you asked yesterday with what's true today. Research with continuity, evidence, and a memory that gets more useful over time.</p></div>
       <div className="prompt-grid">{examples.map(p=><button className="prompt-card" key={p.tag} onClick={()=>send(p.text)}><small>{p.tag}</small><span>{p.text}</span><ArrowUp size={13}/></button>)}</div>
      </>:<div className="messages">{messages.map((m,i)=><div className={"message "+m.role} key={i}><div className="avatar">{m.role==="user"?"Y":"R"}</div><div className="message-body"><div className="message-role">{m.role==="user"?"YOU":"RECALL"}</div><div className="message-text">{m.content}</div>{m.sources?.length?<div className="source-wrap"><div className="source-heading"><Search size={11}/> SOURCES CHECKED</div><div className="source-list">{m.sources.map((s,j)=><a className="source" key={s.url+j} href={s.url} target="_blank" rel="noreferrer"><b>[{j+1}]</b>{s.title}<ExternalLink size={10}/></a>)}</div></div>:null}</div></div>)}{busy?<div className="message"><div className="avatar">R</div><div className="message-body"><div className="message-role">RECALL</div><div className="typing"><LoaderCircle size={13}/> Checking memory and researching…</div></div></div>:null}<div ref={endRef}/></div>}</>}
    {view==="chat"?<><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send();}}} placeholder="Ask what changed, revisit a previous question, or start fresh research…"/><div className="composer-bottom"><span className="hint">ENTER to send · SHIFT + ENTER for a new line</span><button className="send" disabled={!input.trim()||busy} onClick={()=>void send()}>{busy?"Working":"Research"} <ArrowUp size={14}/></button></div></div>{error?<div className="error">{error}</div>:null}<div className="fineprint">RECALL can make mistakes. Verify important decisions against linked primary sources.</div></>:null}
   </section>
  </main>
 </div>;
}
