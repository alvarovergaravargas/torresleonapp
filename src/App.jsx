import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Users, FolderKanban, Receipt, ChevronLeft, ChevronRight, ChevronDown, Bell, Search, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle, ArrowRight, Calendar, Building2, FileWarning, Phone, Mail, MapPin, CircleDollarSign, Menu, X, Info, Plus, Save, UserCircle, ShieldCheck, LogOut, MessageSquare, Hash, Banknote, FileText, Target, UserPlus, NotebookPen, Monitor, Tablet, Smartphone, User, Pencil, MessageCircle, Upload, FileSpreadsheet, ShieldAlert, GripVertical, ClipboardList, Flag, Lock, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import googleSheetsService from './api/googleSheetsService';


const TEAM=["Hanna Castillo","Álvaro Vergara","Ricardo Torres","Christopher Duarte","Linssi Torres"];
const RESPONSABLES=[
  {nombre:"Hanna Castillo",email:"hanni.1186@gmail.com"},
  {nombre:"Álvaro Vergara",email:"aovv.26@gmail.com"},
  {nombre:"Ricardo Torres",email:"ricardomanueltorresgonzalez4@gmail.com"},
  {nombre:"Christopher Duarte",email:"procotorresleon@gmail.com"},
  {nombre:"Linssi Torres",email:"torresleoninversiones@gmail.com"},
];
const WEBHOOK_TAREAS="https://hook.us1.make.com/2cxly0d9diq4nmdvmgsdcgi4ipdbvpfi";
const PROJECT_TYPES=["Construcción","Remodelación","Techado","Impermeabilización","Demolición","Cimentación","Puentes","Urbanismo","Estructuras","Consultoría","Otro"];
const KCOLS=[{id:"Pendiente",color:"#c4a265",bg:"bg-[#c4a265]/10"},{id:"En Proceso",color:"#3b82f6",bg:"bg-blue-500/10"},{id:"Terminado",color:"#22c55e",bg:"bg-emerald-500/10"},{id:"Atrasado",color:"#ef4444",bg:"bg-red-500/10"}];
const PRIOS=["Baja","Media","Alta","Crítica"];
const prioClr=p=>({"Baja":"bg-slate-500/15 text-slate-500","Media":"bg-sky-500/15 text-sky-600 dark:text-sky-400","Alta":"bg-amber-500/15 text-amber-600 dark:text-amber-400","Crítica":"bg-red-500/15 text-red-500"}[p]||"bg-slate-500/15 text-slate-500");

const RM={
  admin:{l:"Administrador",d:"Acceso completo",user:"User Adm",avatar:"UA",pass:"admin2026"},
  crm:{l:"Gestión CRM",d:"Clientes y bitácora",user:"User CRM",avatar:"UC",pass:"crm2026"},
  cobros:{l:"Cartera / Cobros",d:"Facturación y cobros",user:"User GDC",avatar:"UG",pass:"cobros2026"}
};
const parseMoney = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/USD|US\$|\$/gi, "")
    .replace(/B\//gi, "")
    .replace(/\./g, (m, offset, str) => {
      // Remove thousands separator only when comma is decimal marker
      return str.includes(",") && /^\d{1,3}(\.\d{3})+,\d+$/.test(str) ? "" : ".";
    });

  let normalized = cleaned;

  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+(,\d+)?$/.test(cleaned) && cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

const $ = (n) =>
  new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseMoney(n));

const fd = (d) => {
  if (!d) return "—";

  try {
    if (typeof d === "string") {
      const value = d.trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T12:00:00`).toLocaleDateString("es-PA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [mm, dd, yyyy] = value.split("/");
        return new Date(`${yyyy}-${mm}-${dd}T12:00:00`).toLocaleDateString("es-PA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("es-PA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    const parsed = new Date(d);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-PA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return "—";
  } catch {
    return "—";
  }
};
const bg=e=>({"Cliente Activo":"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",Prospecto:"bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",Cotizando:"bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20","En Litigio/Moroso":"bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",Ejecución:"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",Suspendido:"bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",Entregado:"bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20","En Planificación":"bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",Pagado:"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",Pendiente:"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20","En Disputa Técnica":"bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/20","Pago Parcial":"bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"}[e]||"bg-slate-500/15 text-slate-500 border-slate-500/20")+" border";
const compSt=(c,prjs,facs)=>{if(c.estado_relacion==="Prospecto"&&!prjs.some(p=>p.id_cliente===c.id_cliente))return"Prospecto";const cp=prjs.filter(p=>p.id_cliente===c.id_cliente);if(cp.some(p=>p.estado_obra==="Cotizando"))return"Cotizando";const ff=facs||[];const hasMora=ff.some(f=>{const pr=cp.find(p=>p.id_proyecto===f.id_proyecto);return pr&&f.dias_mora>0&&f.estado_cobro!=="Pagado";});if(hasMora||c.estado_relacion==="En Litigio/Moroso")return"En Litigio/Moroso";if(cp.some(p=>["Ejecución","Entregado","En Planificación"].includes(p.estado_obra)))return"Cliente Activo";return c.estado_relacion;};
const gC=(b,a,prjs)=>b.id_cliente?a.find(c=>c.id_cliente===b.id_cliente):b.id_proyecto?a.find(c=>c.id_cliente===(prjs||[]).find(p=>p.id_proyecto===b.id_proyecto)?.id_cliente):null;
const gP=(b,prjs)=>b.id_proyecto?(prjs||[]).find(p=>p.id_proyecto===b.id_proyecto):null;
const iM={Llamada:Phone,Email:Mail,"Visita a Obra":MapPin,WhatsApp:MessageSquare};

function Toast({ts,rm}){return<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">{ts.map(t=><div key={t.id} style={{animation:"sU .3s ease-out"}} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm ${t.y==="success"?"bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200":"bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-200"}`}>{t.y==="success"?<CheckCircle size={16}/>:<XCircle size={16}/>}{t.m}<button onClick={()=>rm(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={14}/></button></div>)}</div>;}
function KPI({title,value,sub,icon:I,ac="brand"}){const cls={brand:"bg-[#c4a265]/10 text-[#c4a265]",emerald:"bg-emerald-500/10 text-emerald-500",red:"bg-red-500/10 text-red-500",amber:"bg-amber-500/10 text-amber-500",sky:"bg-sky-500/10 text-sky-500",orange:"bg-orange-500/10 text-orange-500",violet:"bg-violet-500/10 text-violet-500"};const[b2,tx]=(cls[ac]||"").split(" ");return<div className="cd p-4 lg:p-5 hover:shadow-lg transition-all"><div className="flex items-start justify-between mb-2"><span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">{title}</span><div className={`p-2 rounded-xl ${b2}`}><I size={17} className={tx}/></div></div><div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{value}</div>{sub&&<div className="text-[11px] text-slate-500 mt-1">{sub}</div>}</div>;}
function Mod({open,close,title,children,w}){if(!open)return null;return<div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={close}><div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/><div className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl w-full ${w?"max-w-2xl":"max-w-lg"} max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/40 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl"><h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2><button onClick={close} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button></div><div className="p-5">{children}</div></div></div>;}
function Inp({l,v,ch,type="text",ph,opts,ta,req,disabled}){const b=`w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-[#c4a265]/50 focus:ring-1 focus:ring-[#c4a265]/20 transition-all${disabled?" opacity-50 cursor-not-allowed":""}`;return<div><label className="block text-xs font-semibold text-slate-500 mb-1.5">{l}{req&&<span className="text-red-400 ml-0.5">*</span>}</label>{opts?<select value={v} onChange={e=>ch(e.target.value)} disabled={disabled} className={b}>{opts.map(o=>typeof o==="object"?<option key={o.v} value={o.v}>{o.l}</option>:<option key={o} value={o}>{o}</option>)}</select>:ta?<textarea value={v} onChange={e=>ch(e.target.value)} disabled={disabled} className={`${b} h-24 resize-none`} placeholder={ph}/>:<input type={type} value={v} onChange={e=>ch(e.target.value)} disabled={disabled} className={b} placeholder={ph}/>}</div>;}

function RefBtn({onClick,loading}){return<button onClick={onClick} disabled={loading} title="Refrescar datos" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${loading?"bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700/30 cursor-not-allowed":"bg-slate-100 dark:bg-slate-800/60 text-slate-500 border-slate-200 dark:border-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/60"}`}><RefreshCw size={13} className={loading?"animate-spin":""}/>{loading?"Actualizando...":"Refrescar"}</button>;}

function DeleteConfirm({label,onConfirm,onCancel}){const[step,sStep]=useState(1);return<Mod open close={onCancel} title={step===1?"Eliminar registro":"Confirmar eliminación"}>{step===1?<><div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30"><AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5"/><div><p className="text-sm font-semibold text-red-700 dark:text-red-300">¿Eliminar este registro?</p><p className="text-xs text-red-600 dark:text-red-400 mt-1 break-words">{label}</p><p className="text-xs text-slate-500 mt-2">El registro quedará oculto en la app pero se conservará en la base de datos como historial.</p></div></div><div className="flex justify-end gap-3 mt-5"><button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button><button onClick={()=>sStep(2)} className="px-5 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-semibold">Eliminar</button></div></>:<><div className="flex items-start gap-3 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/40"><AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"/><div><p className="text-sm font-bold text-red-800 dark:text-red-300">¿Confirmas la eliminación?</p><p className="text-xs text-red-700 dark:text-red-400 mt-1">Esta operación no se puede deshacer desde la aplicación. El registro permanecerá en Google Sheets como historial.</p></div></div><div className="flex justify-end gap-3 mt-5"><button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-colors">No, volver</button><button onClick={onConfirm} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"><Trash2 size={14}/>Eliminar definitivamente</button></div></>}</Mod>;}

function RoleSel({setRole}){
  const[step,sStep]=useState("select");
  const[selected,sSel]=useState(null);
  const[pass,sPass]=useState("");
  const[err,sErr]=useState("");
  const[showPass,sShowPass]=useState(false);
  const inputRef=useRef(null);

  const pickRole=(k)=>{sSel(k);sStep("login");sPass("");sErr("");setTimeout(()=>inputRef.current?.focus(),100);};
  const goBack=()=>{sStep("select");sSel(null);sPass("");sErr("");};
  const tryLogin=(e)=>{
    e&&e.preventDefault();
    if(!selected)return;
    if(pass===RM[selected].pass){setRole(selected);}
    else{sErr("Contraseña incorrecta");sPass("");setTimeout(()=>inputRef.current?.focus(),50);}
  };

  return<div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f6f1] dark:bg-[#0b1120]">
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4a265] to-[#8b6f3a] flex items-center justify-center mb-3 shadow-lg"><span className="text-2xl font-black text-white">TL</span></div>
        <div className="text-xl font-bold text-slate-800 dark:text-white">TorresLeón</div>
        <div className="text-[11px] text-[#c4a265] tracking-[.25em] uppercase font-semibold">Ingeniería & Gestión</div>
      </div>

      {step==="select"&&<div className="cd p-6 shadow-xl">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Selecciona tu perfil</h2>
        <p className="text-xs text-slate-500 mb-5">Elige el tipo de acceso para continuar.</p>
        <div className="space-y-3">{Object.entries(RM).map(([k,v])=><button key={k} onClick={()=>pickRole(k)} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-800/30 hover:border-[#c4a265]/40 hover:bg-[#c4a265]/5 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#c4a265]/10 flex items-center justify-center"><ShieldCheck size={20} className="text-[#c4a265]"/></div>
          <div className="text-left flex-1"><div className="text-sm font-semibold text-slate-800 dark:text-white">{v.l}</div><div className="text-[11px] text-slate-500">{v.d}</div></div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-[#c4a265]"/>
        </button>)}</div>
      </div>}

      {step==="login"&&selected&&<form onSubmit={tryLogin} className="cd p-6 shadow-xl">
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#c4a265] mb-4 transition-colors"><ChevronLeft size={14}/>Cambiar perfil</button>
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-[#c4a265]/5 border border-[#c4a265]/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4a265] to-[#8b6f3a] flex items-center justify-center text-sm font-bold text-white">{RM[selected].avatar}</div>
          <div><div className="text-sm font-semibold text-slate-800 dark:text-white">{RM[selected].user}</div><div className="text-[11px] text-[#c4a265]">{RM[selected].l}</div></div>
        </div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contraseña</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input ref={inputRef} type={showPass?"text":"password"} value={pass} onChange={e=>{sPass(e.target.value);if(err)sErr("");}} className={`w-full bg-slate-50 dark:bg-slate-800/60 border rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-1 transition-all ${err?"border-red-400 focus:border-red-500 focus:ring-red-500/20":"border-slate-200 dark:border-slate-700/40 focus:border-[#c4a265]/50 focus:ring-[#c4a265]/20"}`} placeholder="Ingresa tu contraseña" autoComplete="current-password"/>
          <button type="button" onClick={()=>sShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
        </div>
        {err&&<div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-500"><AlertTriangle size={12}/>{err}</div>}
        <button type="submit" disabled={!pass} className="w-full mt-5 py-3 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">Iniciar sesión<ArrowRight size={15}/></button>
      </form>}
    </div>
  </div>;
}

function Sidebar({col,setCol,view,setView,mob,setMob,role}){const nav=useMemo(()=>[{id:"dash-crm",l:"Dashboard CRM",i:Users,r:["admin","crm"]},{id:"dash-cobros",l:"Dashboard Cobros",i:Receipt,r:["admin","cobros"]},{id:"clientes",l:"Clientes",i:UserCircle,r:["admin","crm"]},{id:"proyectos",l:"Proyectos",i:FolderKanban,r:["admin","crm","cobros"]},{id:"cobros",l:"Cartera",i:Banknote,r:["admin","cobros"]},{id:"tareas",l:"Tareas",i:ClipboardList,r:["admin","crm","cobros"]},{id:"bitacora",l:"Bitácora CRM",i:NotebookPen,r:["admin","crm"]}].filter(n=>n.r.includes(role)),[role]);
  const detailParent={"c360":"clientes","p360":"proyectos"};const effectiveView=detailParent[view]||view;
  const inner=<div className="flex flex-col h-full"><div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700/40 ${col&&!mob?"justify-center":""}`}><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4a265] to-[#8b6f3a] flex items-center justify-center shrink-0 shadow"><span className="text-xs font-black text-white">TL</span></div>{(!col||mob)&&<div><div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">TorresLeón</div><div className="text-[9px] text-[#c4a265] tracking-[.15em] uppercase font-semibold">Ingeniería & Gestión</div></div>}</div><nav className="flex-1 py-3 px-2 space-y-0.5">{nav.map(n=>{const a=effectiveView===n.id;return<button key={n.id} onClick={()=>{setView(n.id);setMob(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a?"bg-[#c4a265]/10 text-[#c4a265]":"text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/30"} ${col&&!mob?"justify-center":""}`}><n.i size={18}/>{(!col||mob)&&<span>{n.l}</span>}</button>;})}</nav>{(!col||mob)&&<div className="mx-3 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/20"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/><span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{RM[role].l}</span></div><div className="text-[10px] text-slate-400 mt-0.5">Google Sheets <span className="text-emerald-500">conectado</span></div></div>}<button onClick={()=>{setCol(!col);setMob(false);}} className="hidden lg:flex items-center justify-center py-3 border-t border-slate-200 dark:border-slate-700/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{col?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button></div>;
  return<><aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/40 z-40 transition-all duration-300 ${col?"w-[68px]":"w-[230px]"}`}>{inner}</aside>{mob&&<div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={()=>setMob(false)}/>}<aside className={`lg:hidden fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/40 z-50 transition-transform duration-300 ${mob?"translate-x-0":"-translate-x-full"}`}><button onClick={()=>setMob(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>{inner}</aside></>;
}

function NotifPanel({notifs,setView,close}){
  const tipoIcon={critico:AlertTriangle,alerta:Clock};
  const tipoStyle={critico:"bg-red-500/10 text-red-500",alerta:"bg-amber-500/10 text-amber-500"};
  const catMeta={tareas:{l:"Tareas",I:ClipboardList},cobros:{l:"Cobros",I:Banknote},crm:{l:"CRM",I:Users}};
  const cats=["cobros","tareas","crm"];
  const critCount=notifs.filter(n=>n.tipo==="critico").length;
  return(
    <div className="absolute top-full right-0 mt-2 w-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-2xl z-[90] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/40">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-slate-500"/>
          <span className="text-sm font-bold text-slate-800 dark:text-white">Alertas</span>
        </div>
        <div className="flex items-center gap-1.5">
          {critCount>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">{critCount} crítica{critCount!==1?"s":""}</span>}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{notifs.length} total</span>
        </div>
      </div>
      <div className="max-h-[440px] overflow-y-auto">
        {notifs.length===0?(
          <div className="py-12 text-center">
            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400 opacity-60"/>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Todo en orden</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sin alertas pendientes</p>
          </div>
        ):(
          cats.map(cat=>{
            const items=notifs.filter(n=>n.cat===cat);
            if(!items.length)return null;
            const{l,I}=catMeta[cat];
            return(
              <div key={cat}>
                <div className="px-4 py-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/20 sticky top-0">
                  <I size={11} className="text-slate-400"/>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 flex-1">{l}</span>
                  <span className="text-[10px] font-bold text-slate-400">{items.length}</span>
                </div>
                {items.map(n=>{
                  const TI=tipoIcon[n.tipo]||Info;
                  return(
                    <button key={n.id} onClick={()=>{setView(n.nav);close();}}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/15 text-left transition-colors group">
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tipoStyle[n.tipo]||"bg-slate-500/10 text-slate-400"}`}>
                        <TI size={13}/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#c4a265] transition-colors">{n.titulo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.det}</p>
                      </div>
                      <ArrowRight size={12} className="mt-1.5 shrink-0 text-slate-300 group-hover:text-[#c4a265] transition-colors"/>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
      {notifs.length>0&&(
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30">
          <p className="text-[10px] text-slate-400 text-center">Haz clic en una alerta para ir a la sección</p>
        </div>
      )}
    </div>
  );
}

function Topbar({setMob,role,setRole,vm,setVm,notifs,setView}){const[panel,sPanel]=useState(false);const npRef=useRef(null);useEffect(()=>{const h=e=>{if(npRef.current&&!npRef.current.contains(e.target))sPanel(false);};document.addEventListener("mousedown",h);document.addEventListener("touchstart",h);return()=>{document.removeEventListener("mousedown",h);document.removeEventListener("touchstart",h);};},[]);return<header className="fixed top-0 right-0 left-0 z-30 h-14 flex items-center justify-between px-3 lg:px-5 bg-white/80 backdrop-blur-xl border-b border-slate-200"><div className="flex items-center gap-2"><button onClick={()=>setMob(true)} className="lg:hidden p-2 -ml-1 text-slate-400"><Menu size={20}/></button><div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 w-[200px]"><Search size={14} className="text-slate-400"/><input className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" placeholder="Buscar..."/></div></div><div className="flex items-center gap-1"><div className="hidden sm:flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200">{[[" mobile",Smartphone],["tablet",Tablet],["desktop",Monitor]].map(([id,I])=><button key={id} onClick={()=>setVm(id.trim())} className={`p-1.5 rounded-md transition-all ${vm===id.trim()?"bg-white shadow-sm text-[#c4a265]":"text-slate-400"}`}><I size={14}/></button>)}</div><div className="relative" ref={npRef}><button onClick={()=>sPanel(p=>!p)} className={`relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${panel?"bg-slate-100 dark:bg-slate-800/60 text-[#c4a265]":"text-slate-400"}`}><Bell size={16}/>{notifs.length>0&&<span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full ${notifs.some(n=>n.tipo==="critico")?"bg-red-500":"bg-amber-400"} text-[9px] font-bold text-white flex items-center justify-center`}>{Math.min(notifs.length,99)}</span>}</button>{panel&&<NotifPanel notifs={notifs} setView={setView} close={()=>sPanel(false)}/>}</div><div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700/40"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c4a265] to-[#8b6f3a] flex items-center justify-center text-xs font-bold text-white">{RM[role].avatar}</div><div className="hidden md:block"><div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{RM[role].user}</div><div className="text-[10px] text-slate-400">{RM[role].l}</div></div></div><button onClick={()=>setRole(null)} title="Cerrar sesión" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400"><LogOut size={15}/></button></div></header>;}

const ttS={background:"var(--tt-bg)",border:"1px solid var(--tt-border)",borderRadius:12,fontSize:12,color:"var(--tt-text)"};

function DashCRM({cls,crm,prjs,onRefresh,refreshing}){const a=cls.filter(c=>c.estado_relacion==="Cliente Activo").length,m=cls.filter(c=>c.estado_relacion==="En Litigio/Moroso").length,p=cls.filter(c=>c.estado_relacion==="Prospecto").length,co=cls.filter(c=>c.estado_relacion==="Cotizando").length;const pie=[{name:"Activos",value:a,color:"#22c55e"},{name:"Morosos",value:m,color:"#ef4444"},{name:"Prospectos",value:p,color:"#38bdf8"},{name:"Cotizando",value:co,color:"#a78bfa"}];const rec=[...crm].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto)).slice(0,6);
  return<div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Dashboard CRM</h1><p className="text-sm text-slate-500 mt-0.5">Gestión de relaciones — {new Date().toLocaleDateString("es-PA",{day:"numeric",month:"long",year:"numeric"})}</p></div><RefBtn onClick={onRefresh} loading={refreshing}/></div><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><KPI title="Clientes Activos" value={a} sub={`de ${cls.length}`} icon={Users} ac="emerald"/><KPI title="En Litigio" value={m} icon={AlertTriangle} ac="red"/><KPI title="Prospectos" value={p} icon={Target} ac="sky"/><KPI title="Cotizando" value={co} icon={FileText} ac="violet"/></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Distribución</h3><ResponsiveContainer width="100%" height={170}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">{pie.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={ttS}/></PieChart></ResponsiveContainer><div className="flex flex-wrap gap-3 mt-2 justify-center">{pie.map(d=><div key={d.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/><span className="text-[11px] text-slate-500">{d.name} ({d.value})</span></div>)}</div></div>
      <div className="cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Tipo</h3><ResponsiveContainer width="100%" height={170}><BarChart data={[{n:"B2B",c:cls.filter(c=>c.tipo_cliente==="B2B").length},{n:"B2C",c:cls.filter(c=>c.tipo_cliente==="B2C").length}]} barSize={36}><CartesianGrid strokeDasharray="3 3" stroke="var(--grid)"/><XAxis dataKey="n" tick={{fill:"var(--ax)",fontSize:12}}/><YAxis tick={{fill:"var(--ax)",fontSize:11}}/><Tooltip contentStyle={ttS}/><Bar dataKey="c" fill="#c4a265" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>
      <div className="cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">En Riesgo</h3><div className="space-y-2">{cls.filter(c=>c.estado_relacion==="En Litigio/Moroso").slice(0,5).map(c=><div key={c.id_cliente} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10"><div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-[11px] font-bold text-red-500">{(c.razon_social_nombre||"?")[0]}</div><div className="min-w-0"><div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{c.razon_social_nombre}</div><div className="text-[10px] text-slate-500">{c.contacto_principal}</div></div></div>)}</div></div></div>
    <div className="cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Actividad Reciente</h3><div className="space-y-2.5">{rec.map(b=>{const I=iM[b.tipo_contacto]||Info;const pry=gP(b,prjs);const cli=gC(b,cls,prjs);const co2=!b.id_proyecto&&b.id_cliente;return<div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/15"><div className="w-9 h-9 rounded-lg bg-[#c4a265]/10 flex items-center justify-center shrink-0"><I size={15} className="text-[#c4a265]"/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{b.tipo_contacto}</span><span className="text-[11px] text-slate-500">{fd(b.fecha_contacto)}</span>{co2&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 border border-violet-500/15 inline-flex items-center gap-0.5"><User size={8}/>Cliente</span>}{pry&&<span className="text-[11px] text-[#c4a265]/70">{pry.nombre_proyecto}</span>}</div><p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>{fd(b.promesa_pago)}</div>}</div></div>;})}</div></div></div>;}

function DashCob({cls,prjs,facs,onRefresh,refreshing}){
  const pe = facs.filter(f => f.estado_cobro === "Pendiente");
  const di = facs.filter(f => f.estado_cobro === "En Disputa Técnica");
  const pa = facs.filter(f => f.estado_cobro === "Pago Parcial");
  const tc = facs.filter(f => f.estado_cobro !== "Pagado").reduce((s, f) => s + parseMoney(f.monto_facturado), 0);
  const tm = facs.filter(f => Number(f.dias_mora || 0) > 0).reduce((s, f) => s + parseMoney(f.monto_facturado), 0);
  const td = di.reduce((s, f) => s + parseMoney(f.monto_facturado), 0);
  const ur = [...facs].filter(f => f.estado_cobro !== "Pagado" && Number(f.dias_mora || 0) > 0).sort((a, b) => Number(b.dias_mora || 0) - Number(a.dias_mora || 0));
  const pd = [
    { name: "Pendiente", value: pe.reduce((s, f) => s + parseMoney(f.monto_facturado), 0), color: "#f59e0b" },
    { name: "Disputa", value: td, color: "#f97316" },
    { name: "Parcial", value: pa.reduce((s, f) => s + parseMoney(f.monto_facturado), 0), color: "#eab308" }
  ];
  return<div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Dashboard de Cobros</h1><p className="text-sm text-slate-500">Control de cartera</p></div><RefBtn onClick={onRefresh} loading={refreshing}/></div><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><KPI title="Cartera" value={$(tc)} sub={`${facs.filter(f=>f.estado_cobro!=="Pagado").length} facturas`} icon={CircleDollarSign} ac="brand"/><KPI title="En Mora" value={$(tm)} sub={`${facs.filter(f=>f.dias_mora>0).length} vencidas`} icon={AlertTriangle} ac="red"/><KPI title="Disputa" value={$(td)} sub={`${di.length}`} icon={FileWarning} ac="orange"/><KPI title="Pendiente" value={$(pe.reduce((s,f)=>s+parseMoney(f.monto_facturado),0))} sub={`${pe.length}`} icon={Clock} ac="amber"/></div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4"><div className="lg:col-span-2 cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Composición</h3><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={pd} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">{pd.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>$(v)} contentStyle={ttS}/></PieChart></ResponsiveContainer><div className="flex flex-wrap gap-3 mt-2 justify-center">{pd.map(d=><div key={d.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/><span className="text-[11px] text-slate-500">{d.name}</span></div>)}</div></div>
      <div className="lg:col-span-3 cd p-5"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Facturas con Mora</h3><div className="space-y-2">{ur.slice(0,5).map(f=>{const pr=prjs.find(p=>p.id_proyecto===f.id_proyecto);const cl=pr?cls.find(c=>c.id_cliente===pr.id_cliente):null;return<div key={f.id_factura} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/20"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.dias_mora>60?"bg-red-500/15":"bg-amber-500/15"}`}><Clock size={16} className={f.dias_mora>60?"text-red-500":"text-amber-500"}/></div><div className="flex-1 min-w-0"><div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{f.id_factura} — {cl?.razon_social_nombre||"—"}</div><div className="text-[11px] text-slate-500 truncate">{f.hitos_concepto}</div></div><div className="text-right shrink-0"><div className="text-sm font-bold text-slate-900 dark:text-white">{$(f.monto_facturado)}</div><div className={`text-[10px] font-semibold ${f.dias_mora>60?"text-red-500":"text-amber-500"}`}>{f.dias_mora}d</div></div></div>;})}</div></div></div></div>;}

function ClV({cls,setCls,toast,crm,setCrm,prjs,setView,setSelC,facs,onRefresh,refreshing}){const[se,sSe]=useState("");const[fe,sFe]=useState("Todos");const[sf,sSf]=useState(false);const[ec,sEc]=useState(null);const[sb,sSb]=useState(null);const[pendingDel,sPendingDel]=useState(null);
  const clsC=cls.filter(c=>String(c.status||"").trim().toLowerCase()!=="eliminado").map(c=>({...c,_st:compSt(c,prjs)}));
  // New client form
  const em={tipo_cliente:"B2B",razon_social_nombre:"",ruc_cedula:"",contacto_principal:"",telefono_whatsapp:"+507 ",email_facturacion:"",estado_relacion:"Prospecto",prospectado_por:"",seguimiento_por:"",comentarios:""};const[fm,sFm]=useState(em);const u=(k,v)=>sFm(p=>({...p,[k]:v}));
  const sv=async()=>{if(!fm.comentarios?.trim()){toast("Los comentarios son obligatorios","error");return;}try{const newId=`CLI-${String(cls.length+1).padStart(3,"0")}`;const payload={...fm,id_cliente:newId,razon_social_nombre:fm.razon_social_nombre.trim()||"Prospecto "+newId};await googleSheetsService.createRegistro("Clientes",payload);setCls(p=>[...p,payload]);toast("Cliente creado");sFm(em);sSf(false);}catch(error){console.error("Error creando cliente:",error);toast("No se pudo guardar el cliente","error");}};
  // Edit client form
  const[ef,sEf]=useState(null);
  const openEdit=(c)=>{sEf({...c});sEc(c.id_cliente);};
  const saveEdit=async()=>{if(!ef)return;try{await googleSheetsService.updateRegistro("Clientes",ef.id_cliente,ef);setCls(p=>p.map(c=>c.id_cliente===ec?{...ef}:c));toast("Cliente actualizado");sEc(null);sEf(null);}catch(error){console.error("Error actualizando cliente:",error);toast("No se pudo actualizar el cliente","error");}};
  const ue=(k,v)=>sEf(p=>({...p,[k]:v}));
  const softDeleteClient=async()=>{if(!pendingDel)return;try{const now=new Date().toISOString().slice(0,10);const c=cls.find(x=>x.id_cliente===pendingDel);if(!c){sPendingDel(null);return;}await googleSheetsService.updateRegistro("Clientes",pendingDel,{...c,status:"eliminado",deleted_at:now,updated_at:now});setCls(p=>p.filter(x=>x.id_cliente!==pendingDel));toast("Cliente eliminado");}catch(error){console.error("Error eliminando cliente:",error);toast("No se pudo eliminar el cliente","error");}finally{sPendingDel(null);}};
  // Inline bitácora form
  const[bf,sBf]=useState({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});
  const saveBit=async()=>{if(!bf.n){toast("Agrega una nota","error");return;}const nueva={id_interaccion:`INT-${String(crm.length+1).padStart(3,"0")}`,id_proyecto:"",id_cliente:sb,fecha_contacto:bf.fc,tipo_contacto:bf.tc,notas_acuerdos:bf.n,promesa_pago:bf.pp};try{await googleSheetsService.createRegistro("CRM",nueva);setCrm(p=>[nueva,...p]);toast("Interacción registrada");sBf({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});sSb(null);}catch(error){console.error("Error registrando interacción:",error);toast("No se pudo guardar la interacción","error");}};
  const fl=clsC.filter(c=>(c.razon_social_nombre+c.ruc_cedula+c.contacto_principal).toLowerCase().includes(se.toLowerCase())&&(fe==="Todos"||c._st===fe));
  const isPorC=(s)=>s==="Prospecto"||s==="Cotizando";
  const bitCli=sb?crm.filter(b=>b.id_cliente===sb):[];
  const sbCli=sb?cls.find(c=>c.id_cliente===sb):null;
  return<div className="space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1><p className="text-sm text-slate-500">{cls.length} registrados</p></div><div className="flex items-center gap-2"><RefBtn onClick={onRefresh} loading={refreshing}/><button onClick={()=>sSf(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-sm font-semibold"><UserPlus size={16}/>Nuevo</button></div></div>
    <div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700/30"><Search size={15} className="text-slate-400"/><input value={se} onChange={e=>sSe(e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none w-full" placeholder="Buscar..."/></div><div className="flex gap-1.5 flex-wrap">{["Todos","Prospecto","Cotizando","Cliente Activo","En Litigio/Moroso"].map(e=><button key={e} onClick={()=>sFe(e)} className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap ${fe===e?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20":"bg-white dark:bg-slate-800/40 text-slate-500 border border-slate-200 dark:border-slate-700/30"}`}>{e}</button>)}</div></div>
    {/* Mobile cards */}
    <div className="lg:hidden space-y-2">{fl.map(c=>{const cp=prjs.filter(p=>p.id_cliente===c.id_cliente);return<div key={c.id_cliente} onClick={()=>{setView("c360");setSelC(c.id_cliente);}} className="cd p-4 cursor-pointer hover:border-[#c4a265]/30 transition-all"><div className="flex items-start justify-between mb-1"><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.razon_social_nombre}</div><div className="text-[11px] text-slate-500">{c.contacto_principal}</div></div><div className="flex items-center gap-1.5 shrink-0 ml-2"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${bg(c._st)}`}>{c._st}</span><button onClick={(e)=>{e.stopPropagation();sPendingDel(c.id_cliente);}} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={11}/></button></div></div><div className="flex items-center gap-3 mt-1"><span className="text-[11px] text-slate-500">{c.ruc_cedula}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/40 text-slate-500">{cp.length} proy.</span></div></div>})}</div>
    {/* Desktop table */}
    <div className="hidden lg:block cd overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700/30">{["Empresa","RUC","Tipo","Contacto","Proyectos","Estado",""].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-slate-400">{h}</th>)}</tr></thead><tbody>{fl.map(c=>{const cp=prjs.filter(p=>p.id_cliente===c.id_cliente);return<tr key={c.id_cliente} onClick={()=>{setView("c360");setSelC(c.id_cliente);}} className="border-b border-slate-100 dark:border-slate-700/15 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"><td className="px-4 py-3"><div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.razon_social_nombre}</div>{c.prospectado_por&&<div className="text-[10px] text-sky-500 mt-0.5">Prospectado: {c.prospectado_por}{c.seguimiento_por?` • Seg: ${c.seguimiento_por}`:""}</div>}<div className="text-[10px] text-slate-400 mt-0.5">{c.telefono_whatsapp} • {c.email_facturacion}</div></td><td className="px-4 py-3 text-xs text-slate-500 font-mono">{c.ruc_cedula}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.tipo_cliente==="B2B"?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/15":"bg-violet-500/10 text-violet-500 border border-violet-500/15"}`}>{c.tipo_cliente}</span></td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{c.contacto_principal}</td><td className="px-4 py-3 text-center"><span className={`text-xs font-bold ${cp.length>0?"text-[#c4a265]":"text-slate-400"}`}>{cp.length}</span></td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bg(c._st)}`}>{c._st}</span></td><td className="px-4 py-2" onClick={e=>e.stopPropagation()}><div className="flex gap-1"><button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-[#c4a265]" title="Editar"><Pencil size={13}/></button><button onClick={()=>sSb(c.id_cliente)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-500" title="Bitácora"><MessageSquare size={13}/></button><button onClick={()=>sPendingDel(c.id_cliente)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500" title="Eliminar"><Trash2 size={13}/></button></div></td></tr>})}</tbody></table></div></div>
    {/* NEW CLIENT MODAL */}
    <Mod open={sf} close={()=>sSf(false)} title="Nuevo Cliente" w><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Inp l="Razón Social / Nombre" v={fm.razon_social_nombre} ch={v=>u("razon_social_nombre",v)} ph="Constructora ABC (opcional)"/><Inp l="RUC / Cédula" v={fm.ruc_cedula} ch={v=>u("ruc_cedula",v)} ph="155698-1-12345 DV 12 (opcional)"/><Inp l="Tipo" v={fm.tipo_cliente} ch={v=>u("tipo_cliente",v)} opts={["B2B","B2C"]}/><Inp l="Contacto" v={fm.contacto_principal} ch={v=>u("contacto_principal",v)} ph="Nombre"/><Inp l="Teléfono" v={fm.telefono_whatsapp} ch={v=>u("telefono_whatsapp",v)} ph="+507 6XXX-XXXX"/><Inp l="Email" v={fm.email_facturacion} ch={v=>u("email_facturacion",v)} type="email" ph="correo@empresa.com"/><div className="sm:col-span-2"><Inp l="Estado" v={fm.estado_relacion} ch={v=>u("estado_relacion",v)} opts={["Prospecto","Cotizando","Cliente Activo","En Litigio/Moroso"]}/></div>{isPorC(fm.estado_relacion)&&<><Inp l="Prospectado por" v={fm.prospectado_por} ch={v=>u("prospectado_por",v)} opts={["","...seleccionar",...TEAM]}/><Inp l="Seguimiento por" v={fm.seguimiento_por} ch={v=>u("seguimiento_por",v)} opts={["","...seleccionar",...TEAM]}/></>}<div className="sm:col-span-2"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-500/20 mb-1"><p className="text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5"><Info size={12} className="shrink-0 mt-0.5"/>Los campos de nombre y RUC son opcionales para prospectos. Completa los comentarios con el contexto del contacto.</p></div><Inp l="Comentarios" v={fm.comentarios} ch={v=>u("comentarios",v)} ta ph="Ej: Referido por X. Interesado en remodelación de oficina. Próximo paso: llamar el lunes." req/></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sSf(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={sv} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Guardar</button></div></Mod>
    {/* EDIT CLIENT MODAL */}
    <Mod open={!!ec} close={()=>{sEc(null);sEf(null);}} title="Modificar Cliente" w>{ef&&<><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Inp l="Razón Social / Nombre" v={ef.razon_social_nombre} ch={v=>ue("razon_social_nombre",v)} req/><Inp l="RUC / Cédula" v={ef.ruc_cedula} ch={v=>ue("ruc_cedula",v)} req/><Inp l="Tipo" v={ef.tipo_cliente} ch={v=>ue("tipo_cliente",v)} opts={["B2B","B2C"]}/><Inp l="Contacto" v={ef.contacto_principal} ch={v=>ue("contacto_principal",v)}/><Inp l="Teléfono" v={ef.telefono_whatsapp} ch={v=>ue("telefono_whatsapp",v)}/><Inp l="Email" v={ef.email_facturacion} ch={v=>ue("email_facturacion",v)} type="email"/><div className="sm:col-span-2"><Inp l="Estado de Relación" v={ef.estado_relacion} ch={v=>ue("estado_relacion",v)} opts={["Prospecto","Cotizando","Cliente Activo","En Litigio/Moroso"]}/></div>{isPorC(ef.estado_relacion)&&<><Inp l="Prospectado por" v={ef.prospectado_por||""} ch={v=>ue("prospectado_por",v)} opts={["","...seleccionar",...TEAM]}/><Inp l="Seguimiento por" v={ef.seguimiento_por||""} ch={v=>ue("seguimiento_por",v)} opts={["","...seleccionar",...TEAM]}/></>}<div className="sm:col-span-2"><Inp l="Comentarios" v={ef.comentarios||""} ch={v=>ue("comentarios",v)} ta ph="Notas internas sobre este cliente..."/></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>{sEc(null);sEf(null);}} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Guardar Cambios</button></div></>}</Mod>
    {pendingDel&&<DeleteConfirm label={cls.find(c=>c.id_cliente===pendingDel)?.razon_social_nombre||pendingDel} onConfirm={softDeleteClient} onCancel={()=>sPendingDel(null)}/>}
    {/* INLINE BITÁCORA MODAL */}
    <Mod open={!!sb} close={()=>sSb(null)} title={`Bitácora — ${sbCli?.razon_social_nombre||""}`} w>
      {sbCli&&<div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/20"><div className="flex items-center gap-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${bg(sbCli.estado_relacion)}`}>{sbCli.estado_relacion}</span><span className="text-xs text-slate-500">{sbCli.contacto_principal}</span><span className="text-xs text-slate-400">{sbCli.telefono_whatsapp}</span></div></div>}
      <div className="mb-4 p-4 rounded-xl border border-dashed border-[#c4a265]/30 bg-[#c4a265]/5"><h4 className="text-xs font-semibold text-[#c4a265] mb-3 flex items-center gap-1.5"><Plus size={13}/>Nueva interacción</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Inp l="Tipo" v={bf.tc} ch={v=>sBf(p=>({...p,tc:v}))} opts={["Llamada","Email","Visita a Obra","WhatsApp"]}/><Inp l="Fecha" v={bf.fc} ch={v=>sBf(p=>({...p,fc:v}))} type="date"/><Inp l="Promesa Pago" v={bf.pp} ch={v=>sBf(p=>({...p,pp:v}))} type="date"/><div/><div className="sm:col-span-2"><Inp l="Notas" v={bf.n} ch={v=>sBf(p=>({...p,n:v}))} ta ph="Describe la interacción..." req/></div></div><div className="flex justify-end mt-3"><button onClick={saveBit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={14}/>Registrar</button></div></div>
      <h4 className="text-xs font-semibold text-slate-500 mb-2">Historial ({bitCli.length})</h4>
      {bitCli.length===0?<div className="text-center py-8 text-slate-400 text-sm">Sin interacciones registradas</div>:<div className="space-y-2 max-h-[300px] overflow-y-auto">{[...bitCli].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto)).map(b=>{const I=iM[b.tipo_contacto]||Info;return<div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/15"><div className="w-8 h-8 rounded-lg bg-[#c4a265]/10 flex items-center justify-center shrink-0"><I size={14} className="text-[#c4a265]"/></div><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{b.tipo_contacto}</span><span className="text-[10px] text-slate-500">{fd(b.fecha_contacto)}</span></div><p className="text-xs text-slate-500 mt-0.5">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>{fd(b.promesa_pago)}</div>}</div></div>;})}</div>}
    </Mod></div>;}

function PrV({cls,setCls,setView,setSP,prjs,setPrjs,toast,facs,onRefresh,refreshing}){const[se,sSe]=useState("");const[fe,sFe]=useState("Todos");const[sf,sSf]=useState(false);const[nc,sNc]=useState(false);const[pendingDel,sPendingDel]=useState(null);
  const estados=["Todos","Cotizando","Ejecución","En Planificación","Suspendido","Entregado"];
  const fl=prjs.filter(p=>String(p.status||"").trim().toLowerCase()!=="eliminado"&&p.nombre_proyecto.toLowerCase().includes(se.toLowerCase())&&(fe==="Todos"||p.estado_obra===fe));
  const emP={clientMode:"existing",id_cliente:"",nombre_proyecto:"",tipos_proyecto:"Construcción",presupuesto_aprobado:"",fecha_inicio:new Date().toISOString().slice(0,10),project_manager:""};
  const emC={tipo_cliente:"B2B",razon_social_nombre:"",ruc_cedula:"",contacto_principal:"",telefono_whatsapp:"+507 ",email_facturacion:"",prospectado_por:"",seguimiento_por:"",comentarios:""};
  const[pf,sPf]=useState(emP);const[cf,sCf]=useState(emC);const up=(k,v)=>sPf(p=>({...p,[k]:v}));const uc=(k,v)=>sCf(p=>({...p,[k]:v}));
  const softDeleteProject=async()=>{if(!pendingDel)return;try{const now=new Date().toISOString().slice(0,10);const p=prjs.find(x=>x.id_proyecto===pendingDel);if(!p){sPendingDel(null);return;}await googleSheetsService.updateRegistro("Proyectos",pendingDel,{...p,status:"eliminado",deleted_at:now,updated_at:now});setPrjs(prev=>prev.filter(x=>x.id_proyecto!==pendingDel));toast("Proyecto eliminado");}catch(error){console.error("Error eliminando proyecto:",error);toast("No se pudo eliminar el proyecto","error");}finally{sPendingDel(null);}};
  const savePrj=async()=>{if(!pf.nombre_proyecto){toast("Nombre del proyecto requerido","error");return;}try{let cid=pf.id_cliente;let nuevoCliente=null;if(pf.clientMode==="new"){if(!cf.comentarios?.trim()){toast("Los comentarios son obligatorios para el nuevo cliente","error");return;}cid=`CLI-${String(cls.length+1).padStart(3,"0")}`;nuevoCliente={id_cliente:cid,...cf,razon_social_nombre:cf.razon_social_nombre.trim()||"Prospecto "+cid,estado_relacion:"Cotizando"};await googleSheetsService.createRegistro("Clientes",nuevoCliente);}if(!cid){toast("Selecciona o crea un cliente","error");return;}const nuevoProyecto={id_proyecto:`PRJ-${String(prjs.length+1).padStart(3,"0")}`,id_cliente:cid,nombre_proyecto:pf.nombre_proyecto,tipos_proyecto:pf.tipos_proyecto,presupuesto_aprobado:parseMoney(pf.presupuesto_aprobado),fecha_inicio:pf.fecha_inicio,estado_obra:"Cotizando",project_manager:pf.project_manager};await googleSheetsService.createRegistro("Proyectos",nuevoProyecto);if(nuevoCliente){setCls(p=>[...p,nuevoCliente]);}setPrjs(p=>[...p,nuevoProyecto]);toast("Proyecto creado en Cotizando");sPf(emP);sCf(emC);sSf(false);sNc(false);}catch(error){console.error("Error creando proyecto:",error);toast("No se pudo guardar el proyecto","error");}};
  return<div className="space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Proyectos</h1><p className="text-sm text-slate-500">{prjs.length} en gestión</p></div><div className="flex items-center gap-2"><RefBtn onClick={onRefresh} loading={refreshing}/><button onClick={()=>sSf(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-sm font-semibold"><Plus size={16}/>Nuevo Proyecto</button></div></div>
    <div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700/30"><Search size={15} className="text-slate-400"/><input value={se} onChange={e=>sSe(e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none w-full" placeholder="Buscar proyecto..."/></div><div className="flex gap-1.5 flex-wrap">{estados.map(e=><button key={e} onClick={()=>sFe(e)} className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap ${fe===e?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20":"bg-white dark:bg-slate-800/40 text-slate-500 border border-slate-200 dark:border-slate-700/30"}`}>{e}</button>)}</div></div>
    {fl.length===0?<div className="text-center py-16 text-slate-400"><FolderKanban size={40} className="mx-auto mb-3 opacity-30"/><p className="text-sm">No se encontraron proyectos.</p></div>:<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{fl.map(p=>{const cl=cls.find(c=>c.id_cliente===p.id_cliente);const fs=facs.filter(f=>String(f.id_proyecto||"").trim()===String(p.id_proyecto||"").trim());const ft=fs.reduce((s,f)=>s+parseMoney(f.monto_facturado),0);const presupuesto=parseMoney(p.presupuesto_aprobado);const pc=presupuesto>0?Math.round(ft/presupuesto*100):0;return<div key={p.id_proyecto} onClick={()=>{setSP(p.id_proyecto);setView("p360");}} className="cd p-5 hover:border-[#c4a265]/30 cursor-pointer group"><div className="flex items-start justify-between mb-2"><div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#c4a265] truncate">{p.nombre_proyecto}</div><div className="text-[11px] text-slate-500 mt-0.5">{cl?.razon_social_nombre||p.id_cliente}</div></div><div className="flex items-center gap-1.5 shrink-0 ml-2"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${bg(p.estado_obra)}`}>{p.estado_obra}</span><button onClick={(e)=>{e.stopPropagation();sPendingDel(p.id_proyecto);}} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Eliminar"><Trash2 size={11}/></button></div></div><div className="flex items-center gap-2 flex-wrap mb-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/30">{p.tipos_proyecto||"Sin tipo"}</span><div className="text-[11px] text-slate-500">PM: {p.project_manager}</div></div><div className="mb-3"><div className="flex justify-between text-[11px] mb-1"><span className="text-slate-500">Facturado</span><span className="font-semibold text-slate-800 dark:text-white">{pc}%</span></div><div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden"><div className={`h-full rounded-full ${pc>=70?"bg-emerald-500":pc>=40?"bg-[#c4a265]":"bg-amber-500"}`} style={{width:`${Math.min(pc,100)}%`}}/></div></div><div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/20"><div><div className="text-[10px] text-slate-400">Presupuesto</div><div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{$(p.presupuesto_aprobado)}</div></div><div><div className="text-[10px] text-slate-400">Facturado</div><div className="text-xs font-semibold text-[#c4a265]">{$(ft)}</div></div></div></div>;})}</div>}
    {pendingDel&&<DeleteConfirm label={prjs.find(p=>p.id_proyecto===pendingDel)?.nombre_proyecto||pendingDel} onConfirm={softDeleteProject} onCancel={()=>sPendingDel(null)}/>}
    <Mod open={sf} close={()=>{sSf(false);sNc(false);}} title="Nuevo Proyecto" w>
      <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 mb-2">Cliente</label><div className="flex gap-2"><button onClick={()=>{up("clientMode","existing");sNc(false);}} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${pf.clientMode==="existing"?"bg-[#c4a265]/10 text-[#c4a265] border-[#c4a265]/30":"bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"}`}><Users size={15}/>Existente</button><button onClick={()=>{up("clientMode","new");sNc(true);}} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${pf.clientMode==="new"?"bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30":"bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"}`}><UserPlus size={15}/>Crear Nuevo</button></div></div>
      {pf.clientMode==="existing"&&<div className="mb-4"><Inp l="Seleccionar Cliente" v={pf.id_cliente} ch={v=>up("id_cliente",v)} opts={[{v:"",l:"— Seleccionar —"},...cls.map(c=>({v:c.id_cliente,l:`${c.razon_social_nombre} (${c.estado_relacion})`}))]}/></div>}
      {nc&&<div className="mb-4 p-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5"><h4 className="text-xs font-semibold text-violet-500 mb-3 flex items-center gap-1.5"><UserPlus size={13}/>Nuevo cliente (se creará en Cotizando)</h4><div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">Nombre y RUC son opcionales para prospectos. Solo los comentarios son requeridos para registrar el contacto.</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Inp l="Razón Social / Nombre" v={cf.razon_social_nombre} ch={v=>uc("razon_social_nombre",v)} ph="Nombre o empresa (opcional)"/><Inp l="RUC / Cédula" v={cf.ruc_cedula} ch={v=>uc("ruc_cedula",v)} ph="RUC / Cédula (opcional)"/><Inp l="Tipo" v={cf.tipo_cliente} ch={v=>uc("tipo_cliente",v)} opts={["B2B","B2C"]}/><Inp l="Contacto" v={cf.contacto_principal} ch={v=>uc("contacto_principal",v)} ph="Nombre"/><Inp l="Teléfono" v={cf.telefono_whatsapp} ch={v=>uc("telefono_whatsapp",v)} ph="+507 6XXX-XXXX"/><Inp l="Email" v={cf.email_facturacion} ch={v=>uc("email_facturacion",v)} type="email" ph="correo@empresa.com"/><Inp l="Prospectado por" v={cf.prospectado_por} ch={v=>uc("prospectado_por",v)} opts={["","...seleccionar",...TEAM]}/><Inp l="Seguimiento por" v={cf.seguimiento_por} ch={v=>uc("seguimiento_por",v)} opts={["","...seleccionar",...TEAM]}/><div className="sm:col-span-2"><Inp l="Comentarios" v={cf.comentarios} ch={v=>uc("comentarios",v)} ta ph="Contexto del prospecto: referido por, interés, próximos pasos..." req/></div></div></div>}
      <div className="border-t border-slate-200 dark:border-slate-700/30 pt-4 mt-2"><h4 className="text-xs font-semibold text-slate-500 mb-3">Datos del Proyecto</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><Inp l="Nombre del Proyecto" v={pf.nombre_proyecto} ch={v=>up("nombre_proyecto",v)} ph="Ej: Construcción Torre Norte" req/></div><Inp l="Tipo de Proyecto" v={pf.tipos_proyecto} ch={v=>up("tipos_proyecto",v)} opts={PROJECT_TYPES}/><Inp l="Project Manager" v={pf.project_manager} ch={v=>up("project_manager",v)} ph="Nombre del PM"/><Inp l="Presupuesto Aprobado" v={pf.presupuesto_aprobado} ch={v=>up("presupuesto_aprobado",v)} type="number" ph="0.00"/><Inp l="Fecha Inicio" v={pf.fecha_inicio} ch={v=>up("fecha_inicio",v)} type="date"/><div className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-800/40 p-3"><div className="text-[10px] text-slate-400 uppercase mb-1">Resumen</div><div className="flex items-center gap-2 flex-wrap"><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/30">{pf.tipos_proyecto}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15">Cotizando</span></div></div></div></div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>{sSf(false);sNc(false);}} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={savePrj} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Crear Proyecto</button></div>
    </Mod></div>;}

function P3V({pid,setView,cls,crm,setCrm,toast,prjs,setPrjs,facs}){const[t,sT]=useState("f");const p=prjs.find(x=>x.id_proyecto===pid);const cl=p?cls.find(c=>c.id_cliente===p.id_cliente):null;const fs=facs.filter(f=>f.id_proyecto===pid);const bs=crm.filter(b=>b.id_proyecto===pid);const ft=fs.reduce((s,f)=>s+f.monto_facturado,0);
  const[ep,sEp]=useState(null);const openEditP=()=>sEp({...p});const uep=(k,v)=>sEp(q=>({...q,[k]:v}));
  const saveEditP=async()=>{if(!ep||!ep.nombre_proyecto){toast("Nombre requerido","error");return;}try{await googleSheetsService.updateRegistro("Proyectos",ep.id_proyecto,ep);setPrjs(ps=>ps.map(x=>x.id_proyecto===ep.id_proyecto?{...ep}:x));toast("Proyecto actualizado");sEp(null);}catch(error){console.error("Error actualizando proyecto:",error);toast("No se pudo actualizar el proyecto","error");}};
  const[nb,sNb]=useState({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});
  const addBit=async()=>{if(!nb.n){toast("Agrega una nota","error");return;}const nueva={id_interaccion:`INT-${String(crm.length+1).padStart(3,"0")}`,id_proyecto:pid,id_cliente:"",fecha_contacto:nb.fc,tipo_contacto:nb.tc,notas_acuerdos:nb.n,promesa_pago:nb.pp};try{await googleSheetsService.createRegistro("CRM",nueva);setCrm(pr=>[nueva,...pr]);toast("Interacción registrada");sNb({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});}catch(error){console.error("Error registrando interacción:",error);toast("No se pudo guardar la interacción","error");}};
  if(!p)return null;
  return<div className="space-y-5"><button onClick={()=>setView("proyectos")} className="flex items-center gap-1 text-xs text-[#c4a265]"><ChevronLeft size={14}/>Volver</button><div className="cd p-5"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5"><div><h1 className="text-xl font-bold text-slate-900 dark:text-white">{p.nombre_proyecto}</h1><div className="text-sm text-slate-500 mt-0.5">{cl?.razon_social_nombre}</div><div className="flex gap-3 mt-2 flex-wrap"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${bg(p.estado_obra)}`}>{p.estado_obra}</span><span className="text-xs text-slate-500">PM: {p.project_manager}</span></div></div><div className="flex items-start gap-3"><div className="text-right"><div className="text-2xl font-bold text-slate-900 dark:text-white">{$(p.presupuesto_aprobado)}</div><div className="text-xs text-slate-500">Presupuesto</div></div><button onClick={openEditP} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-xs font-semibold shrink-0"><Pencil size={13}/>Editar</button></div></div><div className="grid grid-cols-3 gap-3">{[{l:"Facturado",v:$(ft),c:"text-[#c4a265]"},{l:"Pagado",v:$(fs.filter(f=>f.estado_cobro==="Pagado").reduce((s,f)=>s+f.monto_facturado,0)),c:"text-emerald-500"},{l:"Por cobrar",v:$(fs.filter(f=>f.estado_cobro!=="Pagado").reduce((s,f)=>s+f.monto_facturado,0)),c:"text-amber-500"}].map(m=><div key={m.l} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/15"><div className="text-[10px] text-slate-400 uppercase">{m.l}</div><div className={`text-lg font-bold ${m.c}`}>{m.v}</div></div>)}</div></div>
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/40 rounded-xl p-1 border border-slate-200 dark:border-slate-700/30 w-fit">{[{i:"f",l:"Facturas",n:fs.length},{i:"b",l:"Bitácora",n:bs.length}].map(x=><button key={x.i} onClick={()=>sT(x.i)} className={`px-4 py-2 rounded-lg text-xs font-semibold ${t===x.i?"bg-white dark:bg-slate-700 shadow-sm text-[#c4a265]":"text-slate-500"}`}>{x.l} ({x.n})</button>)}</div>
    {t==="f"&&<div className="cd overflow-hidden">{fs.length===0?<div className="p-12 text-center text-slate-400">Sin facturas</div>:<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700/30">{["Factura","Concepto","Monto","Venc.","Estado","Mora"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-slate-400">{h}</th>)}</tr></thead><tbody>{fs.map(f=><tr key={f.id_factura} className="border-b border-slate-100 dark:border-slate-700/15"><td className="px-4 py-3 text-xs font-mono text-[#c4a265]">{f.id_factura}</td><td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate">{f.hitos_concepto}</td><td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{$(f.monto_facturado)}</td><td className="px-4 py-3 text-xs text-slate-500">{fd(f.fecha_vencimiento)}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bg(f.estado_cobro)}`}>{f.estado_cobro}</span></td><td className="px-4 py-3 text-xs font-bold">{f.dias_mora>0?<span className="text-red-500">{f.dias_mora}d</span>:"—"}</td></tr>)}</tbody></table></div>}</div>}
    {t==="b"&&<div className="space-y-4">
      <div className="cd p-4 border-dashed border-[#c4a265]/30 bg-[#c4a265]/5 dark:bg-[#c4a265]/5"><h4 className="text-xs font-semibold text-[#c4a265] mb-3 flex items-center gap-1.5"><Plus size={13}/>Nueva entrada de bitácora</h4><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Inp l="Tipo" v={nb.tc} ch={v=>sNb(q=>({...q,tc:v}))} opts={["Llamada","Email","Visita a Obra","WhatsApp"]}/><Inp l="Fecha" v={nb.fc} ch={v=>sNb(q=>({...q,fc:v}))} type="date"/><Inp l="Promesa Pago" v={nb.pp} ch={v=>sNb(q=>({...q,pp:v}))} type="date"/></div><div className="mt-3"><Inp l="Notas / Acuerdos" v={nb.n} ch={v=>sNb(q=>({...q,n:v}))} ta ph="Describe la interacción, acuerdos o hallazgos..." req/></div><div className="flex justify-end mt-3"><button onClick={addBit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={14}/>Registrar</button></div></div>
      <div className="cd p-5">{bs.length===0?<div className="text-center py-12 text-slate-400">Sin bitácora</div>:<div className="space-y-2">{[...bs].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto)).map(b=>{const I=iM[b.tipo_contacto]||Info;return<div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/15"><div className="w-9 h-9 rounded-lg bg-[#c4a265]/10 flex items-center justify-center shrink-0"><I size={15} className="text-[#c4a265]"/></div><div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{b.tipo_contacto}</span><span className="text-[11px] text-slate-500">{fd(b.fecha_contacto)}</span></div><p className="text-xs text-slate-500 mt-0.5">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>{fd(b.promesa_pago)}</div>}</div></div>;})}</div>}</div>
    </div>}
    <Mod open={!!ep} close={()=>sEp(null)} title="Editar Proyecto" w>{ep&&<><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><Inp l="Nombre del Proyecto" v={ep.nombre_proyecto} ch={v=>uep("nombre_proyecto",v)} req/></div><Inp l="Tipo de Proyecto" v={ep.tipos_proyecto||""} ch={v=>uep("tipos_proyecto",v)} opts={PROJECT_TYPES}/><Inp l="Estado" v={ep.estado_obra||""} ch={v=>uep("estado_obra",v)} opts={["Cotizando","Ejecución","En Planificación","Suspendido","Entregado"]}/><Inp l="Project Manager" v={ep.project_manager||""} ch={v=>uep("project_manager",v)} opts={["","...seleccionar",...TEAM]}/><Inp l="Presupuesto Aprobado" v={ep.presupuesto_aprobado||""} ch={v=>uep("presupuesto_aprobado",v)} type="number"/><Inp l="Fecha Inicio" v={ep.fecha_inicio||""} ch={v=>uep("fecha_inicio",v)} type="date"/></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sEp(null)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={saveEditP} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Guardar Cambios</button></div></>}</Mod>
  </div>;}

function CoV({cls,prjs,facs,setFacs,toast,onRefresh,refreshing}){const[fl,sFl]=useState("Todas");const[ef,sEf]=useState(null);const[nf,sNf]=useState(false);const[imp,sImp]=useState(false);const[impData,sImpData]=useState(null);const[impErr,sImpErr]=useState([]);const[impOk,sImpOk]=useState(false);const fileRef=useRef(null);
  const emF={id_proyecto:"",hitos_concepto:"",monto_facturado:"",fecha_vencimiento:new Date().toISOString().slice(0,10),estado_cobro:"Pendiente"};const[nfm,sNfm]=useState(emF);const un=(k,v)=>sNfm(p=>({...p,[k]:v}));
  const saveNF=async()=>{if(!nfm.id_proyecto||!nfm.hitos_concepto||!nfm.monto_facturado){toast("Proyecto, concepto y monto son requeridos","error");return;}try{const newId=`FAC-${String(facs.length+1).padStart(3,"0")}`;const mora=Math.max(0,Math.floor((new Date()-new Date(nfm.fecha_vencimiento+"T12:00:00"))/86400000));const nueva={id_factura:newId,...nfm,monto_facturado:parseMoney(nfm.monto_facturado),dias_mora:nfm.estado_cobro==="Pagado"?0:mora};await googleSheetsService.createRegistro("Cuentas_por_cobrar",nueva);setFacs(p=>[...p,nueva]);toast("Factura creada");sNfm(emF);sNf(false);}catch(error){console.error("Error creando factura:",error);toast("No se pudo crear la factura","error");}};
  const d=fl==="Todas"?facs:fl==="Disputa"?facs.filter(f=>f.estado_cobro==="En Disputa Técnica"):facs.filter(f=>f.estado_cobro===fl);
  // Edit factura
  const ue=(k,v)=>sEf(p=>({...p,[k]:v}));
  const saveF=async()=>{if(!ef)return;const updated={...ef,monto_facturado:parseMoney(ef.monto_facturado),dias_mora:Number(ef.dias_mora||0)};try{await googleSheetsService.updateRegistro("Cuentas_por_cobrar",ef.id_factura,updated);setFacs(p=>p.map(f=>f.id_factura===ef.id_factura?updated:f));toast("Factura actualizada");sEf(null);}catch(error){console.error("Error actualizando factura:",error);toast("No se pudo actualizar la factura","error");}};
  // CSV/Excel import
  const COLS=["id_factura","id_proyecto","hitos_concepto","monto_facturado","fecha_vencimiento","dias_mora","estado_cobro"];
  const ESTADOS_V=["Pagado","Pendiente","En Disputa Técnica","Pago Parcial"];
  const parseCSV=(text)=>{const lines=text.trim().split("\n").map(l=>l.split(",").map(c=>c.trim().replace(/^"|"$/g,"")));return{headers:lines[0],rows:lines.slice(1)};};
  const validateData=(headers,rows)=>{
    const errs=[];const missing=COLS.filter(c=>!headers.includes(c));
    if(missing.length>0){errs.push(`Columnas faltantes: ${missing.join(", ")}`);return{errs,valid:[]};}
    const ci=COLS.map(c=>headers.indexOf(c));const valid=[];
    rows.forEach((r,i)=>{
      if(r.length<headers.length){errs.push(`Fila ${i+2}: número de columnas incorrecto`);return;}
      const o={};COLS.forEach((c,j)=>o[c]=r[ci[j]]);
      if(!o.id_factura)errs.push(`Fila ${i+2}: id_factura vacío`);
      if(!o.id_proyecto)errs.push(`Fila ${i+2}: id_proyecto vacío`);
      if(isNaN(Number(o.monto_facturado))||Number(o.monto_facturado)<0)errs.push(`Fila ${i+2}: monto_facturado inválido "${o.monto_facturado}"`);
      if(isNaN(Number(o.dias_mora)))errs.push(`Fila ${i+2}: dias_mora inválido`);
      if(!ESTADOS_V.includes(o.estado_cobro))errs.push(`Fila ${i+2}: estado_cobro inválido "${o.estado_cobro}" (usar: ${ESTADOS_V.join(", ")})`);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(o.fecha_vencimiento))errs.push(`Fila ${i+2}: fecha_vencimiento formato inválido "${o.fecha_vencimiento}" (usar YYYY-MM-DD)`);
      if(errs.length<=8)valid.push({...o,monto_facturado:Number(o.monto_facturado),dias_mora:Number(o.dias_mora)});
    });
    return{errs,valid};
  };
  const onFile=(e)=>{
    const file=e.target.files?.[0];if(!file)return;sImpErr([]);sImpData(null);sImpOk(false);
    const ext=file.name.split(".").pop().toLowerCase();
    if(ext!=="csv"){sImpErr(["Formato no soportado. Solo se acepta .csv"]);return;}
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        let headers,rows;
        {const r=parseCSV(ev.target.result);headers=r.headers;rows=r.rows;}
        const{errs,valid}=validateData(headers,rows);
        sImpErr(errs);if(errs.length===0&&valid.length>0){sImpData(valid);sImpOk(true);}
      }catch(err){sImpErr([`Error al procesar: ${err.message}`]);}
    };
    reader.readAsText(file);
    if(fileRef.current)fileRef.current.value="";
  };
  const confirmImport=()=>{if(!impData)return;setFacs(p=>{const ids=new Set(impData.map(f=>f.id_factura));const kept=p.filter(f=>!ids.has(f.id_factura));return[...kept,...impData];});toast(`${impData.length} facturas importadas`);sImpData(null);sImpOk(false);sImpErr([]);sImp(false);};

  return<div className="space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Cartera</h1><p className="text-sm text-slate-500">{facs.length} facturas</p></div><div className="flex gap-2 flex-wrap"><RefBtn onClick={onRefresh} loading={refreshing}/><button onClick={()=>{sNf(true);sNfm(emF);}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-sm font-semibold"><Plus size={16}/>Nueva Factura</button><button onClick={()=>{sImp(true);sImpErr([]);sImpData(null);sImpOk(false);}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 border border-slate-200 dark:border-slate-700/30 text-sm font-semibold"><Upload size={16}/>Importar CSV</button></div></div>
    <div className="flex gap-1.5 flex-wrap">{["Todas","Pendiente","Pagado","Pago Parcial","Disputa"].map(f=><button key={f} onClick={()=>sFl(f)} className={`px-3 py-2 rounded-xl text-xs font-semibold ${fl===f?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20":"bg-white dark:bg-slate-800/40 text-slate-500 border border-slate-200 dark:border-slate-700/30"}`}>{f}</button>)}</div>
    <div className="lg:hidden space-y-2">{d.map(f=>{const pr=prjs.find(p=>p.id_proyecto===f.id_proyecto);const cl=pr?cls.find(c=>c.id_cliente===pr.id_cliente):null;return<div key={f.id_factura} className="cd p-4" onClick={()=>sEf({...f})}><div className="flex items-start justify-between mb-1"><div><span className="text-xs font-mono text-[#c4a265]">{f.id_factura}</span><div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{$(f.monto_facturado)}</div></div><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${bg(f.estado_cobro)}`}>{f.estado_cobro}</span></div><div className="text-xs text-slate-500 truncate">{f.hitos_concepto}</div>{cl&&<div className="text-[11px] text-slate-400">{cl.razon_social_nombre}</div>}{f.dias_mora>0&&<div className="text-[11px] text-red-500 font-semibold mt-1">{f.dias_mora}d mora</div>}</div>;})}</div>
    <div className="hidden lg:block cd overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700/30">{["Factura","Proyecto","Cliente","Concepto","Monto","Venc.","Estado","Mora",""].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-slate-400">{h}</th>)}</tr></thead><tbody>{d.map(f=>{const pr=prjs.find(p=>p.id_proyecto===f.id_proyecto);const cl=pr?cls.find(c=>c.id_cliente===pr.id_cliente):null;return<tr key={f.id_factura} className="border-b border-slate-100 dark:border-slate-700/15 hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="px-4 py-3 text-xs font-mono text-[#c4a265]">{f.id_factura}</td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{pr?.nombre_proyecto||"—"}</td><td className="px-4 py-3 text-xs text-slate-500">{cl?.razon_social_nombre||"—"}</td><td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate">{f.hitos_concepto}</td><td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{$(f.monto_facturado)}</td><td className="px-4 py-3 text-xs text-slate-500">{fd(f.fecha_vencimiento)}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bg(f.estado_cobro)}`}>{f.estado_cobro}</span></td><td className="px-4 py-3 text-xs font-bold">{f.dias_mora>0?<span className="text-red-500">{f.dias_mora}d</span>:"—"}</td><td className="px-4 py-2"><button onClick={()=>sEf({...f})} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-[#c4a265]"><Pencil size={13}/></button></td></tr>;})}</tbody></table></div></div>
    {/* NUEVA FACTURA MODAL */}
    <Mod open={nf} close={()=>sNf(false)} title="Nueva Factura" w><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><Inp l="Proyecto" v={nfm.id_proyecto} ch={v=>un("id_proyecto",v)} opts={[{v:"",l:"— Seleccionar proyecto —"},...prjs.map(p=>({v:p.id_proyecto,l:`${p.id_proyecto} — ${p.nombre_proyecto}`}))]} req/></div><div className="sm:col-span-2"><Inp l="Concepto / Hito" v={nfm.hitos_concepto} ch={v=>un("hitos_concepto",v)} ph="Ej: Avance 50% — Fundaciones" req/></div><Inp l="Monto Facturado" v={nfm.monto_facturado} ch={v=>un("monto_facturado",v)} type="number" ph="0.00" req/><Inp l="Fecha Vencimiento" v={nfm.fecha_vencimiento} ch={v=>un("fecha_vencimiento",v)} type="date"/><div className="sm:col-span-2"><Inp l="Estado de Cobro" v={nfm.estado_cobro} ch={v=>un("estado_cobro",v)} opts={["Pagado","Pendiente","En Disputa Técnica","Pago Parcial"]}/></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sNf(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={saveNF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Crear Factura</button></div></Mod>
    {/* EDIT FACTURA MODAL */}
    <Mod open={!!ef} close={()=>sEf(null)} title={`Editar ${ef?.id_factura||""}`} w>{ef&&<><div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/20"><div className="text-[10px] text-slate-400 uppercase">Factura</div><div className="text-sm font-bold text-[#c4a265]">{ef.id_factura}</div><div className="text-xs text-slate-500">{prjs.find(p=>p.id_proyecto===ef.id_proyecto)?.nombre_proyecto}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Inp l="Proyecto" v={ef.id_proyecto} ch={v=>ue("id_proyecto",v)} opts={prjs.map(p=>({v:p.id_proyecto,l:`${p.id_proyecto} — ${p.nombre_proyecto}`}))}/><Inp l="Concepto / Hito" v={ef.hitos_concepto} ch={v=>ue("hitos_concepto",v)} ph="Descripción"/><Inp l="Monto Facturado" v={ef.monto_facturado} ch={v=>ue("monto_facturado",v)} type="number"/><Inp l="Fecha Vencimiento" v={ef.fecha_vencimiento} ch={v=>{const d=v?Math.max(0,Math.floor((new Date()-new Date(v+"T12:00:00"))/86400000)):0;sEf(p=>({...p,fecha_vencimiento:v,dias_mora:ef.estado_cobro==="Pagado"?0:d}));}} type="date"/><div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Días Mora <span className="text-[10px] font-normal text-slate-400">(auto)</span></label><div className={`w-full rounded-xl px-3 py-2.5 text-sm border ${Number(ef.dias_mora||0)>0?"bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold":"bg-slate-100 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700/30 text-slate-500"}`}>{Number(ef.dias_mora||0)} días</div></div><Inp l="Estado de Cobro" v={ef.estado_cobro} ch={v=>{const d=v==="Pagado"?0:Number(ef.dias_mora||0);sEf(p=>({...p,estado_cobro:v,dias_mora:d}));}} opts={["Pagado","Pendiente","En Disputa Técnica","Pago Parcial"]}/></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sEf(null)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={saveF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Guardar</button></div></>}</Mod>
    {/* IMPORT MODAL */}
    <Mod open={imp} close={()=>sImp(false)} title="Importar Facturas">
      <div className="space-y-4">
        <div className="text-center p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[#c4a265]/40 transition-colors cursor-pointer" onClick={()=>fileRef.current?.click()}>
          <FileSpreadsheet size={36} className="mx-auto mb-3 text-[#c4a265] opacity-70"/>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Arrastra o haz clic para seleccionar</div>
          <div className="text-xs text-slate-400 mt-1">Solo archivos CSV (.csv)</div>
          <div className="flex flex-wrap gap-1 justify-center mt-2">{COLS.map(c=><span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-500 font-mono">{c}</span>)}</div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFile}/>
        </div>
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/20"><div className="flex items-start gap-2"><Info size={14} className="text-sky-500 shrink-0 mt-0.5"/><div className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Formato requerido:</span> El archivo debe tener estas columnas exactas: <span className="font-mono">id_factura, id_proyecto, hitos_concepto, monto_facturado, fecha_vencimiento, dias_mora, estado_cobro</span>. Fechas en formato YYYY-MM-DD. Estados válidos: Pagado, Pendiente, En Disputa Técnica, Pago Parcial.</div></div></div>
        {impErr.length>0&&<div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20"><div className="flex items-start gap-2"><ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5"/><div><div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Errores de validación ({impErr.length})</div><div className="space-y-0.5 max-h-[120px] overflow-y-auto">{impErr.map((e,i)=><div key={i} className="text-[11px] text-red-600 dark:text-red-400">{e}</div>)}</div></div></div></div>}
        {impOk&&impData&&<div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20"><div className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/><div className="text-xs text-emerald-700 dark:text-emerald-300"><span className="font-semibold">{impData.length} facturas válidas</span> listas para importar. Las facturas con ID existente serán actualizadas.</div></div></div>}
        <div className="flex justify-end gap-3 pt-2">{impOk&&impData&&<button onClick={confirmImport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold"><Upload size={15}/>Importar {impData.length} facturas</button>}</div>
      </div>
    </Mod></div>;}

function BiV({crm,setCrm,cls,toast,prjs,onRefresh,refreshing}){const[sf,sSf]=useState(false);const[ft,sFt]=useState("Todos");const[se,sSe]=useState("");const[pendingDel,sPendingDel]=useState(null);const em={lt:"proyecto",pi:prjs[0]?.id_proyecto||"",ci:"",fc:new Date().toISOString().slice(0,10),tc:"Llamada",n:"",pp:""};const[fm,sFm]=useState(em);const u=(k,v)=>sFm(p=>({...p,[k]:v}));
  const sv=async()=>{if(!fm.n){toast("Agrega una nota","error");return;}const nueva={id_interaccion:`INT-${String(crm.length+1).padStart(3,"0")}`,id_proyecto:fm.lt==="proyecto"?fm.pi:"",id_cliente:fm.lt==="cliente"?fm.ci:"",fecha_contacto:fm.fc,tipo_contacto:fm.tc,notas_acuerdos:fm.n,promesa_pago:fm.pp};try{await googleSheetsService.createRegistro("CRM",nueva);setCrm(p=>[nueva,...p]);toast("Interacción registrada");sFm(em);sSf(false);}catch(error){console.error("Error registrando interacción:",error);toast("No se pudo guardar la interacción","error");}};
  const softDeleteCRM=async()=>{if(!pendingDel)return;try{const now=new Date().toISOString().slice(0,10);const b=crm.find(x=>x.id_interaccion===pendingDel);if(!b){sPendingDel(null);return;}await googleSheetsService.updateRegistro("CRM",pendingDel,{...b,status:"eliminado",deleted_at:now,updated_at:now});setCrm(p=>p.filter(x=>x.id_interaccion!==pendingDel));toast("Interacción eliminada");}catch(error){console.error("Error eliminando interacción:",error);toast("No se pudo eliminar la interacción","error");}finally{sPendingDel(null);}};
  const so=[...crm].filter(b=>String(b.status||"").trim().toLowerCase()!=="eliminado").sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto));const fiBase=ft==="Todos"?so:ft==="Proyectos"?so.filter(b=>b.id_proyecto):so.filter(b=>b.id_cliente&&!b.id_proyecto);const fi=se.trim()?fiBase.filter(b=>String(b.notas_acuerdos||"").toLowerCase().includes(se.toLowerCase())||String(b.tipo_contacto||"").toLowerCase().includes(se.toLowerCase())):fiBase;
  const ppj=fm.lt==="proyecto"?prjs.find(p=>p.id_proyecto===fm.pi):null;const ppc=fm.lt==="cliente"?cls.find(c=>c.id_cliente===fm.ci):null;
  return<div className="space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Bitácora CRM</h1><p className="text-sm text-slate-500">{crm.length} interacciones</p></div><div className="flex items-center gap-2"><RefBtn onClick={onRefresh} loading={refreshing}/><button onClick={()=>sSf(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm font-semibold"><Plus size={16}/>Nueva</button></div></div>
    <div className="flex flex-col sm:flex-row gap-3"><div className="flex gap-1.5">{["Todos","Proyectos","Clientes"].map(f=><button key={f} onClick={()=>sFt(f)} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${ft===f?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20":"bg-white dark:bg-slate-800/40 text-slate-500 border border-slate-200 dark:border-slate-700/30"}`}>{f==="Proyectos"&&<FolderKanban size={12}/>}{f==="Clientes"&&<User size={12}/>}{f}</button>)}</div><div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700/30"><Search size={14} className="text-slate-400 shrink-0"/><input value={se} onChange={e=>sSe(e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none w-full" placeholder="Buscar en notas o tipo..."/>{se&&<button onClick={()=>sSe("")} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>}</div></div>
    <div className="space-y-3">{fi.map(b=>{const I=iM[b.tipo_contacto]||Info;const pr=gP(b,prjs);const cl=gC(b,cls,prjs);const co=!b.id_proyecto&&b.id_cliente;return<div key={b.id_interaccion} className="flex gap-3 p-4 cd"><div className="hidden sm:flex flex-col items-center gap-1 pt-1"><div className="w-10 h-10 rounded-xl bg-[#c4a265]/10 flex items-center justify-center"><I size={17} className="text-[#c4a265]"/></div><div className="w-px flex-1 bg-slate-200 dark:bg-slate-700/30"/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap mb-1"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${b.tipo_contacto==="Llamada"?"bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/15":b.tipo_contacto==="Email"?"bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/15":b.tipo_contacto==="Visita a Obra"?"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15":"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15"}`}>{b.tipo_contacto}</span><span className="text-[11px] text-slate-500">{fd(b.fecha_contacto)}</span>{co?<span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 inline-flex items-center gap-1"><User size={9}/>Cliente</span>:<span className="text-[10px] px-2 py-0.5 rounded-md bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/15 inline-flex items-center gap-1"><FolderKanban size={9}/>Proyecto</span>}</div>{pr&&<div className="text-[11px] text-[#c4a265]/70 mb-0.5">{pr.nombre_proyecto}</div>}{cl&&<div className="text-[11px] text-slate-500 mb-1">{cl.razon_social_nombre}</div>}<p className="text-sm text-slate-700 dark:text-slate-300">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-2 text-[11px] px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/15 inline-flex items-center gap-1.5"><Calendar size={11}/>Promesa: {fd(b.promesa_pago)}</div>}</div><button onClick={()=>sPendingDel(b.id_interaccion)} className="shrink-0 self-start p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={13}/></button></div>;})}</div>
    {pendingDel&&<DeleteConfirm label={crm.find(b=>b.id_interaccion===pendingDel)?.notas_acuerdos?.slice(0,80)||pendingDel} onConfirm={softDeleteCRM} onCancel={()=>sPendingDel(null)}/>}
    <Mod open={sf} close={()=>sSf(false)} title="Nueva Interacción CRM" w>
      <div className="mb-5"><label className="block text-xs font-semibold text-slate-500 mb-2">Vincular a:</label><div className="flex gap-2"><button onClick={()=>u("lt","proyecto")} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${fm.lt==="proyecto"?"bg-[#c4a265]/10 text-[#c4a265] border-[#c4a265]/30":"bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"}`}><FolderKanban size={16}/>Proyecto</button><button onClick={()=>u("lt","cliente")} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${fm.lt==="cliente"?"bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30":"bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"}`}><User size={16}/>Cliente</button></div><p className="text-[11px] text-slate-400 mt-1.5">{fm.lt==="cliente"?"Para prospectos o cotizaciones sin proyecto.":"Vincula a proyecto existente."}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{fm.lt==="proyecto"?<Inp l="Proyecto" v={fm.pi} ch={v=>u("pi",v)} opts={prjs.map(p=>({v:p.id_proyecto,l:`${p.id_proyecto} — ${p.nombre_proyecto}`}))}/>:<Inp l="Cliente" v={fm.ci} ch={v=>u("ci",v)} opts={cls.map(c=>({v:c.id_cliente,l:`${c.id_cliente} — ${c.razon_social_nombre}`}))}/>}<Inp l="Tipo" v={fm.tc} ch={v=>u("tc",v)} opts={["Llamada","Email","Visita a Obra","WhatsApp"]}/><Inp l="Fecha" v={fm.fc} ch={v=>u("fc",v)} type="date"/><Inp l="Promesa Pago" v={fm.pp} ch={v=>u("pp",v)} type="date"/><div className="sm:col-span-2"><Inp l="Notas / Acuerdos" v={fm.n} ch={v=>u("n",v)} ta ph="Describe acuerdos..." req/></div></div>
      {(ppj||ppc)&&<div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/20"><div className="text-[10px] text-slate-400 uppercase mb-1">{fm.lt==="proyecto"?"Proyecto":"Cliente"}</div>{ppj&&<><div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ppj.nombre_proyecto}</div><div className="text-xs text-slate-500">{cls.find(c=>c.id_cliente===ppj.id_cliente)?.razon_social_nombre}</div></>}{ppc&&<><div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ppc.razon_social_nombre}</div><div className="text-xs text-slate-500">{ppc.contacto_principal} • {ppc.estado_relacion}</div></>}</div>}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sSf(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={sv} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Registrar</button></div>
    </Mod></div>;}

function C3V({cid,setView,cls,setCls,crm,setCrm,prjs,toast,facs}){
  const c=cls.find(x=>x.id_cliente===cid);const[tab,sTab]=useState("info");const[ec,sEc]=useState(null);
  if(!c)return<div className="text-center py-20 text-slate-400">Cliente no encontrado</div>;
  const cp=prjs.filter(p=>p.id_cliente===cid);const st=compSt(c,prjs);
  const allFacs=facs.filter(f=>cp.some(p=>p.id_proyecto===f.id_proyecto));
  const bitCli=crm.filter(b=>b.id_cliente===cid||cp.some(p=>p.id_proyecto===b.id_proyecto));
  const totalFac=allFacs.reduce((s,f)=>s+f.monto_facturado,0);const totalPag=allFacs.filter(f=>f.estado_cobro==="Pagado").reduce((s,f)=>s+f.monto_facturado,0);
  const isPorC=s=>s==="Prospecto"||s==="Cotizando";
  // Edit
  const[ef,sEf]=useState(null);const openEdit=()=>sEf({...c});const ue=(k,v)=>sEf(p=>({...p,[k]:v}));
  const saveEdit=async()=>{if(!ef)return;try{await googleSheetsService.updateRegistro("Clientes",cid,ef);setCls(p=>p.map(x=>x.id_cliente===cid?{...ef}:x));toast("Cliente actualizado");sEf(null);}catch(error){console.error("Error actualizando cliente:",error);toast("No se pudo actualizar el cliente","error");}};
  // Bitácora form
  const[bf,sBf]=useState({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});
  const saveBit=async()=>{if(!bf.n){toast("Agrega una nota","error");return;}const nueva={id_interaccion:`INT-${String(crm.length+1).padStart(3,"0")}`,id_proyecto:"",id_cliente:cid,fecha_contacto:bf.fc,tipo_contacto:bf.tc,notas_acuerdos:bf.n,promesa_pago:bf.pp};try{await googleSheetsService.createRegistro("CRM",nueva);setCrm(p=>[nueva,...p]);toast("Interacción registrada");sBf({tc:"Llamada",fc:new Date().toISOString().slice(0,10),n:"",pp:""});}catch(error){console.error("Error registrando interacción:",error);toast("No se pudo guardar la interacción","error");}};
  return<div className="space-y-5">
    <button onClick={()=>setView("clientes")} className="flex items-center gap-1 text-xs text-[#c4a265]"><ChevronLeft size={14}/>Volver a Clientes</button>
    <div className="cd p-5"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><h1 className="text-xl font-bold text-slate-900 dark:text-white">{c.razon_social_nombre}</h1><div className="flex items-center gap-3 mt-2 flex-wrap"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${bg(st)}`}>{st}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.tipo_cliente==="B2B"?"bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/15":"bg-violet-500/10 text-violet-500 border border-violet-500/15"}`}>{c.tipo_cliente}</span></div><div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500"><span className="flex items-center gap-1"><User size={12}/>{c.contacto_principal}</span><span className="flex items-center gap-1"><Phone size={12}/>{c.telefono_whatsapp}</span><span className="flex items-center gap-1"><Mail size={12}/>{c.email_facturacion}</span><span className="flex items-center gap-1"><Hash size={12}/>{c.ruc_cedula}</span></div>{c.prospectado_por&&<div className="text-[11px] text-sky-500 mt-2">Prospectado: {c.prospectado_por}{c.seguimiento_por?` • Seguimiento: ${c.seguimiento_por}`:""}</div>}{c.comentarios&&<div className="text-xs text-slate-400 mt-1 italic">"{c.comentarios}"</div>}</div><div className="flex gap-2 shrink-0"><button onClick={openEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-xs font-semibold"><Pencil size={13}/>Editar</button></div></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5"><div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/15"><div className="text-[10px] text-slate-400 uppercase">Proyectos</div><div className="text-lg font-bold text-[#c4a265]">{cp.length}</div></div><div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/15"><div className="text-[10px] text-slate-400 uppercase">Facturado</div><div className="text-lg font-bold text-[#c4a265]">{$(totalFac)}</div></div><div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/15"><div className="text-[10px] text-slate-400 uppercase">Cobrado</div><div className="text-lg font-bold text-emerald-500">{$(totalPag)}</div></div><div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/15"><div className="text-[10px] text-slate-400 uppercase">Por Cobrar</div><div className="text-lg font-bold text-amber-500">{$(totalFac-totalPag)}</div></div></div></div>
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/40 rounded-xl p-1 border border-slate-200 dark:border-slate-700/30 w-fit flex-wrap">{[{i:"pry",l:"Proyectos",n:cp.length},{i:"fac",l:"Facturas",n:allFacs.length},{i:"bit",l:"Bitácora",n:bitCli.length}].map(x=><button key={x.i} onClick={()=>sTab(x.i)} className={`px-4 py-2 rounded-lg text-xs font-semibold ${tab===x.i?"bg-white dark:bg-slate-700 shadow-sm text-[#c4a265]":"text-slate-500"}`}>{x.l} ({x.n})</button>)}</div>
    {tab==="pry"&&<div className="space-y-3">{cp.length===0?<div className="cd p-12 text-center text-slate-400">Sin proyectos asociados</div>:cp.map(p=>{const fs=facs.filter(f=>String(f.id_proyecto||"").trim()===String(p.id_proyecto||"").trim());const ft=fs.reduce((s,f)=>s+parseMoney(f.monto_facturado),0);const presupuesto=parseMoney(p.presupuesto_aprobado);const pc=presupuesto>0?Math.round(ft/presupuesto*100):0;return<div key={p.id_proyecto} className="cd p-4"><div className="flex items-start justify-between mb-2"><div><div className="text-sm font-bold text-slate-800 dark:text-white">{p.nombre_proyecto}</div><div className="text-[11px] text-slate-500">PM: {p.project_manager} • {fd(p.fecha_inicio)}</div></div><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${bg(p.estado_obra)}`}>{p.estado_obra}</span></div><div className="flex justify-between text-[11px] mb-1"><span className="text-slate-500">Facturado</span><span className="font-semibold text-slate-800 dark:text-white">{pc}%</span></div><div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden"><div className={`h-full rounded-full ${pc>=70?"bg-emerald-500":pc>=40?"bg-[#c4a265]":"bg-amber-500"}`} style={{width:`${Math.min(pc,100)}%`}}/></div><div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/15"><div><div className="text-[10px] text-slate-400">Presupuesto</div><div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{$(p.presupuesto_aprobado)}</div></div><div><div className="text-[10px] text-slate-400">Facturado</div><div className="text-xs font-semibold text-[#c4a265]">{$(ft)}</div></div><div><div className="text-[10px] text-slate-400">Facturas</div><div className="text-xs font-semibold text-slate-500">{fs.length}</div></div></div></div>})}</div>}
    {tab==="fac"&&<div className="cd overflow-hidden">{allFacs.length===0?<div className="p-12 text-center text-slate-400">Sin facturas</div>:<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700/30">{["Factura","Proyecto","Concepto","Monto","Venc.","Estado","Mora"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-slate-400">{h}</th>)}</tr></thead><tbody>{allFacs.map(f=>{const pr=prjs.find(p=>p.id_proyecto===f.id_proyecto);return<tr key={f.id_factura} className="border-b border-slate-100 dark:border-slate-700/15"><td className="px-4 py-3 text-xs font-mono text-[#c4a265]">{f.id_factura}</td><td className="px-4 py-3 text-xs text-slate-500">{pr?.nombre_proyecto||"—"}</td><td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{f.hitos_concepto}</td><td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{$(f.monto_facturado)}</td><td className="px-4 py-3 text-xs text-slate-500">{fd(f.fecha_vencimiento)}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bg(f.estado_cobro)}`}>{f.estado_cobro}</span></td><td className="px-4 py-3 text-xs font-bold">{f.dias_mora>0?<span className="text-red-500">{f.dias_mora}d</span>:"—"}</td></tr>})}</tbody></table></div>}</div>}
    {tab==="bit"&&<div className="space-y-4">
      <div className="cd p-4" style={{borderStyle:"dashed",borderColor:"rgba(196,162,101,.3)",background:"rgba(196,162,101,.05)"}}><h4 className="text-xs font-semibold text-[#c4a265] mb-3 flex items-center gap-1.5"><Plus size={13}/>Nueva interacción</h4><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Inp l="Tipo" v={bf.tc} ch={v=>sBf(p=>({...p,tc:v}))} opts={["Llamada","Email","Visita a Obra","WhatsApp"]}/><Inp l="Fecha" v={bf.fc} ch={v=>sBf(p=>({...p,fc:v}))} type="date"/><Inp l="Promesa Pago" v={bf.pp} ch={v=>sBf(p=>({...p,pp:v}))} type="date"/></div><div className="mt-3"><Inp l="Notas" v={bf.n} ch={v=>sBf(p=>({...p,n:v}))} ta ph="Describe la interacción..." req/></div><div className="flex justify-end mt-3"><button onClick={saveBit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={14}/>Registrar</button></div></div>
      <div className="cd p-5">{bitCli.length===0?<div className="text-center py-8 text-slate-400 text-sm">Sin interacciones</div>:<div className="space-y-2">{[...bitCli].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto)).map(b=>{const I=iM[b.tipo_contacto]||Info;const pr=gP(b,prjs);return<div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/15"><div className="w-8 h-8 rounded-lg bg-[#c4a265]/10 flex items-center justify-center shrink-0"><I size={14} className="text-[#c4a265]"/></div><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{b.tipo_contacto}</span><span className="text-[10px] text-slate-500">{fd(b.fecha_contacto)}</span>{pr&&<span className="text-[10px] text-[#c4a265]/70">{pr.nombre_proyecto}</span>}{!b.id_proyecto&&b.id_cliente&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 border border-violet-500/15">Cliente</span>}</div><p className="text-xs text-slate-500 mt-0.5">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>{fd(b.promesa_pago)}</div>}</div></div>;})}</div>}</div>
    </div>}
    <Mod open={!!ef} close={()=>sEf(null)} title="Modificar Cliente" w>{ef&&<><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Inp l="Razón Social" v={ef.razon_social_nombre} ch={v=>ue("razon_social_nombre",v)} req/><Inp l="RUC / Cédula" v={ef.ruc_cedula} ch={v=>ue("ruc_cedula",v)} req/><Inp l="Tipo" v={ef.tipo_cliente} ch={v=>ue("tipo_cliente",v)} opts={["B2B","B2C"]}/><Inp l="Contacto" v={ef.contacto_principal} ch={v=>ue("contacto_principal",v)}/><Inp l="Teléfono" v={ef.telefono_whatsapp} ch={v=>ue("telefono_whatsapp",v)}/><Inp l="Email" v={ef.email_facturacion} ch={v=>ue("email_facturacion",v)} type="email"/><div className="sm:col-span-2"><Inp l="Estado" v={ef.estado_relacion} ch={v=>ue("estado_relacion",v)} opts={["Prospecto","Cotizando","Cliente Activo","En Litigio/Moroso"]}/></div>{isPorC(ef.estado_relacion)&&<><Inp l="Prospectado por" v={ef.prospectado_por||""} ch={v=>ue("prospectado_por",v)} opts={["","...seleccionar",...TEAM]}/><Inp l="Seguimiento por" v={ef.seguimiento_por||""} ch={v=>ue("seguimiento_por",v)} opts={["","...seleccionar",...TEAM]}/></>}<div className="sm:col-span-2"><Inp l="Comentarios" v={ef.comentarios||""} ch={v=>ue("comentarios",v)} ta ph="Notas internas..."/></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30"><button onClick={()=>sEf(null)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button><button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"><Save size={15}/>Guardar</button></div></>}</Mod>
  </div>;}

/* ═══ KANBAN TAREAS ═══ */

const fireTaskWebhook = async (task, prjs = []) => {
  const resp = RESPONSABLES.find(r => r.nombre === task.responsable);
  if (!resp) return;
  const proyecto = prjs.find(p => String(p.id_proyecto) === String(task.obra));
  const payload = {
    email_destinatario: resp.email,
    nombre_responsable: resp.nombre,
    id_tarea: task.id_tarea,
    descripcion_tarea: task.descripcion_tarea || "",
    tipo_tarea: task.tipo_tarea || "",
    prioridad: task.prioridad || "Media",
    estado: task.estado || "Pendiente",
    fecha_compromiso: task.fecha_compromiso || "",
    fecha_creacion: task.fecha_creacion || "",
    creado_por: task.creado_por || "",
    comentarios: task.comentarios || "",
    proyecto: proyecto?.nombre_proyecto || "",
  };
  try {
    await fetch(WEBHOOK_TAREAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Webhook tareas:", e);
  }
};

function TarV({ tasks = [], setTasks, prjs = [], toast, onRefresh, refreshing }) {
  const TASK_LABELS = [
    {
      value: "Crítico / dinero en riesgo",
      short: "Crítico",
      hint: "Riesgo financiero o atención urgente.",
      dot: "bg-red-500",
      active: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 ring-1 ring-red-500/10",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
    },
    {
      value: "En espera de terceros",
      short: "En espera",
      hint: "Depende de cliente, proveedor u otra persona.",
      dot: "bg-amber-400",
      active: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 ring-1 ring-amber-500/10",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    },
    {
      value: "Delegado a",
      short: "Delegado",
      hint: "Asignada para seguimiento por un responsable.",
      dot: "bg-blue-500",
      active: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 ring-1 ring-blue-500/10",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    },
    {
      value: "Finalizado",
      short: "Finalizado",
      hint: "Marcada como cerrada o completada.",
      dot: "bg-emerald-500",
      active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/10",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    },
  ];

  const LEGACY_TASK_TYPES = [
    "Cotizaciones",
    "Gestión Administrativa",
    "Gestión de Obras y Compra",
    "Gestión de Recursos Humanos",
    "Gestión en Campo",
  ];

  const DEFAULT_TASK_LABEL = "En espera de terceros";

  const [ef, sEf] = useState(null);
  const [sf, sSf] = useState(false);
  const [drag, sDrag] = useState(null);
  const [touchDrag, sTd] = useState(null);
  const [typeFilter, sTypeFilter] = useState("Todos");
  const [sortOrder, sSortOrder] = useState("newest");
  const [showDone, setShowDone] = useState(false);
  const [pendingDel, sPendingDel] = useState(null);

  const normalizeEstado = (estado) => {
    const e = String(estado || "").trim().toLowerCase();
    if (e === "pendiente") return "Pendiente";
    if (e === "en proceso") return "En Proceso";
    if (e === "terminado" || e === "completada") return "Terminado";
    if (e === "atrasado") return "Atrasado";
    return "Pendiente";
  };

  const normalizeStatus = (status) => {
    const s = String(status || "").trim().toLowerCase();
    return s === "activo" || s === "active" ? "activo" : s || "activo";
  };

  const getTaskType = (task = {}) =>
    task.tipo_tarea || task.tipos_tarea || DEFAULT_TASK_LABEL;

  const getTaskLabel = (tipo) =>
    TASK_LABELS.find((label) => label.value === tipo) || null;

  const requiresProject = (tipo) => tipo === "Gestión de Obras y Compra";

  const typeBadge = (tipo) => {
    const label = getTaskLabel(tipo);
    if (label) return label.badge;

    return ({
      "Cotizaciones": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      "Gestión Administrativa": "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
      "Gestión de Obras y Compra": "bg-[#c4a265]/10 text-[#c4a265] border-[#c4a265]/20",
      "Gestión de Recursos Humanos": "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      "Gestión en Campo": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    }[tipo] || "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20");
  };

  const projectLabel = (obra) => {
    if (!obra) return "—";
    const match = prjs.find((p) => String(p.id_proyecto) === String(obra));
    return match?.nombre_proyecto || obra;
  };

  const parseTaskDate = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
      const v = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T12:00:00`);
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [mm, dd, yyyy] = v.split("/");
        return new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const daysSinceCreation = (task) => {
    const created = parseTaskDate(task.fecha_creacion);
    if (!created) return 0;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - created.getTime()) / 86400000));
  };

  const isOlderThanFiveDays = (task) =>
    normalizeStatus(task.status) === "activo" &&
    normalizeEstado(task.estado) !== "Terminado" &&
    daysSinceCreation(task) > 5;

  const safeTasks = Array.isArray(tasks)
    ? tasks
        .filter((t) => String(t.status || "").trim().toLowerCase() !== "eliminado")
        .map((t) => {
          const tipo = getTaskType(t);
          return {
            ...t,
            tipo_tarea: tipo,
            tipos_tarea: t.tipos_tarea || tipo,
            estado: normalizeEstado(t.estado),
            status: normalizeStatus(t.status),
          };
        })
    : [];

  const filterOptions = [
    "Todos",
    ...TASK_LABELS.map((label) => label.value),
    ...LEGACY_TASK_TYPES.filter((legacy) => safeTasks.some((task) => getTaskType(task) === legacy)),
  ];

  const sortOptions = [
    { value: "oldest", label: "Más antiguas primero" },
    { value: "newest", label: "Más actuales primero" },
  ];

  const sortTasksByCreation = (items = []) =>
    [...items].sort((a, b) => {
      const aTime = parseTaskDate(a.fecha_creacion)?.getTime() ?? null;
      const bTime = parseTaskDate(b.fecha_creacion)?.getTime() ?? null;

      if (aTime === null && bTime === null) {
        return String(a.id_tarea || "").localeCompare(String(b.id_tarea || ""));
      }
      if (aTime === null) return 1;
      if (bTime === null) return -1;

      return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
    });

  const filteredTasks =
    typeFilter === "Todos"
      ? safeTasks
      : safeTasks.filter((t) => getTaskType(t) === typeFilter);

  const visibleTasks = sortTasksByCreation(filteredTasks);

  const em = {
    tipo_tarea: DEFAULT_TASK_LABEL,
    tipos_tarea: DEFAULT_TASK_LABEL,
    obra: "",
    responsable: "",
    cargo_rol: "",
    descripcion_tarea: "",
    prioridad: "Media",
    fecha_compromiso: new Date().toISOString().slice(0, 10),
    comentarios: "",
    creado_por: TEAM[0],
  };

  const [fm, sFm] = useState(em);

  const u = (k, v) =>
    sFm((p) => {
      const next = { ...p, [k]: v };
      if (k === "tipo_tarea" || k === "tipos_tarea") {
        next.tipo_tarea = v;
        next.tipos_tarea = v;
        if (!requiresProject(v)) next.obra = "";
      }
      return next;
    });

  const ue = (k, v) =>
    sEf((p) => {
      const next = { ...p, [k]: v };
      if (k === "tipo_tarea" || k === "tipos_tarea") {
        next.tipo_tarea = v;
        next.tipos_tarea = v;
        if (!requiresProject(v)) next.obra = "";
      }
      return next;
    });

  const openNew = () => {
    sFm(em);
    sSf(true);
  };

  const openEdit = (task) => {
    const tipo = getTaskType(task);
    sEf({
      ...task,
      tipo_tarea: tipo,
      tipos_tarea: task.tipos_tarea || tipo,
      status: normalizeStatus(task.status || "activo"),
      estado: normalizeEstado(task.estado || "Pendiente"),
    });
  };

  const saveNew = async () => {
    if (!fm.descripcion_tarea?.trim()) {
      toast("Descripción requerida", "error");
      return;
    }

    if (requiresProject(fm.tipo_tarea) && !fm.obra) {
      toast("Selecciona un proyecto para este tipo de tarea", "error");
      return;
    }

    try {
      const now = new Date().toISOString().slice(0, 10);
      const selectedType = fm.tipo_tarea || DEFAULT_TASK_LABEL;

      const nueva = {
        id_tarea: `TSK-${String(safeTasks.length + 1).padStart(3, "0")}`,
        fecha_creacion: now,
        tipo_tarea: selectedType,
        tipos_tarea: selectedType,
        obra: requiresProject(selectedType) ? fm.obra : "",
        responsable: fm.responsable,
        cargo_rol: fm.cargo_rol,
        descripcion_tarea: fm.descripcion_tarea,
        prioridad: fm.prioridad,
        estado: "Pendiente",
        fecha_compromiso: fm.fecha_compromiso,
        fecha_cierre: "",
        comentarios: fm.comentarios,
        creado_por: fm.creado_por,
        updated_at: now,
        status: "activo",
      };

      await googleSheetsService.createRegistro("Tareas", nueva);
      setTasks((p) => [nueva, ...(Array.isArray(p) ? p : [])]);
      toast("Tarea creada");
      if (nueva.responsable) fireTaskWebhook(nueva, prjs);
      sFm(em);
      sSf(false);
    } catch (error) {
      console.error("Error creando tarea:", error);
      toast("No se pudo guardar la tarea", "error");
    }
  };

  const saveEdit = async () => {
    if (!ef) return;

    if (!ef.descripcion_tarea?.trim()) {
      toast("Descripción requerida", "error");
      return;
    }

    const selectedType = ef.tipo_tarea || ef.tipos_tarea || DEFAULT_TASK_LABEL;

    if (requiresProject(selectedType) && !ef.obra) {
      toast("Selecciona un proyecto para este tipo de tarea", "error");
      return;
    }

    try {
      const now = new Date().toISOString().slice(0, 10);
      const originalTask = safeTasks.find(t => t.id_tarea === ef.id_tarea);
      const responsableCambio = ef.responsable && ef.responsable !== (originalTask?.responsable || "");

      const updatedTask = {
        ...ef,
        tipo_tarea: selectedType,
        tipos_tarea: ef.tipos_tarea || selectedType,
        obra: requiresProject(selectedType) ? ef.obra : "",
        estado: normalizeEstado(ef.estado),
        status: normalizeStatus(ef.status || "activo"),
        updated_at: now,
      };

      await googleSheetsService.updateRegistro("Tareas", updatedTask.id_tarea, updatedTask);

      setTasks((p) =>
        (Array.isArray(p) ? p : []).map((t) =>
          t.id_tarea === updatedTask.id_tarea ? updatedTask : t
        )
      );

      toast("Tarea actualizada");
      if (responsableCambio) fireTaskWebhook(updatedTask, prjs);
      sEf(null);
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      toast("No se pudo actualizar la tarea", "error");
    }
  };

  const onDragStart = (e, id) => {
    sDrag(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = async (e, col) => {
    e.preventDefault();
    if (!drag) return;

    try {
      const now = new Date().toISOString().slice(0, 10);
      const currentTask = safeTasks.find((t) => t.id_tarea === drag);
      if (!currentTask) {
        sDrag(null);
        return;
      }

      const updatedTask = {
        ...currentTask,
        estado: col,
        updated_at: now,
        fecha_cierre: col === "Terminado" ? now : currentTask.fecha_cierre || "",
      };

      await googleSheetsService.updateRegistro("Tareas", updatedTask.id_tarea, updatedTask);

      setTasks((p) =>
        (Array.isArray(p) ? p : []).map((t) =>
          t.id_tarea === drag ? updatedTask : t
        )
      );
    } catch (error) {
      console.error("Error moviendo tarea:", error);
      toast("No se pudo mover la tarea", "error");
    } finally {
      sDrag(null);
    }
  };

  const onTouchStart = (id) => sTd(id);

  const moveTo = async (col) => {
    if (!touchDrag) return;

    try {
      const now = new Date().toISOString().slice(0, 10);
      const currentTask = safeTasks.find((t) => t.id_tarea === touchDrag);
      if (!currentTask) {
        sTd(null);
        return;
      }

      const updatedTask = {
        ...currentTask,
        estado: col,
        updated_at: now,
        fecha_cierre: col === "Terminado" ? now : currentTask.fecha_cierre || "",
      };

      await googleSheetsService.updateRegistro("Tareas", updatedTask.id_tarea, updatedTask);

      setTasks((p) =>
        (Array.isArray(p) ? p : []).map((t) =>
          t.id_tarea === touchDrag ? updatedTask : t
        )
      );
    } catch (error) {
      console.error("Error moviendo tarea:", error);
      toast("No se pudo mover la tarea", "error");
    } finally {
      sTd(null);
    }
  };

  const markDone = async (taskId) => {
    try {
      const now = new Date().toISOString().slice(0, 10);
      const currentTask = safeTasks.find((t) => t.id_tarea === taskId);
      if (!currentTask) return;
      const updatedTask = { ...currentTask, estado: "Terminado", updated_at: now, fecha_cierre: now };
      await googleSheetsService.updateRegistro("Tareas", updatedTask.id_tarea, updatedTask);
      setTasks((p) => (Array.isArray(p) ? p : []).map((t) => t.id_tarea === taskId ? updatedTask : t));
      toast("Tarea marcada como terminada");
    } catch (error) {
      console.error("Error completando tarea:", error);
      toast("No se pudo completar la tarea", "error");
    }
  };

  const reopenTask = async (taskId) => {
    try {
      const now = new Date().toISOString().slice(0, 10);
      const currentTask = safeTasks.find((t) => t.id_tarea === taskId);
      if (!currentTask) return;
      const updatedTask = { ...currentTask, estado: "Pendiente", updated_at: now, fecha_cierre: "" };
      await googleSheetsService.updateRegistro("Tareas", updatedTask.id_tarea, updatedTask);
      setTasks((p) => (Array.isArray(p) ? p : []).map((t) => t.id_tarea === taskId ? updatedTask : t));
      toast("Tarea reabierta");
    } catch (error) {
      console.error("Error reabriendo tarea:", error);
      toast("No se pudo reabrir la tarea", "error");
    }
  };

  const softDeleteTask = async () => {
    if (!pendingDel) return;
    try {
      const now = new Date().toISOString().slice(0, 10);
      const currentTask = safeTasks.find((t) => t.id_tarea === pendingDel);
      if (!currentTask) { sPendingDel(null); return; }
      const updated = { ...currentTask, status: "eliminado", deleted_at: now, updated_at: now };
      await googleSheetsService.updateRegistro("Tareas", pendingDel, updated);
      setTasks((p) => (Array.isArray(p) ? p : []).filter((t) => t.id_tarea !== pendingDel));
      toast("Tarea eliminada");
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      toast("No se pudo eliminar la tarea", "error");
    } finally {
      sPendingDel(null);
    }
  };

  const touchDragTask = touchDrag ? safeTasks.find((t) => t.id_tarea === touchDrag) : null;
  const activeCount = visibleTasks.filter((t) => t.status === "activo" && t.estado !== "Terminado").length;
  const alertCount = visibleTasks.filter(isOlderThanFiveDays).length;

  const TaskLabelSelector = ({ value, onChange }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-2">Etiqueta de tarea<span className="text-red-400 ml-0.5">*</span></label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TASK_LABELS.map((label) => (
          <button
            key={label.value}
            type="button"
            onClick={() => onChange(label.value)}
            className={`text-left px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
              value === label.value
                ? label.active
                : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/30 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <span className="flex items-start gap-2">
              <span className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${label.dot}`} />
              <span>
                <span className="block">{label.value}</span>
                <span className="block text-[11px] font-normal opacity-70 mt-0.5">{label.hint}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        La etiqueta seleccionada se guarda en la columna <span className="font-semibold">tipo_tarea</span>. También se mantiene compatibilidad con <span className="font-semibold">tipos_tarea</span> si la hoja aún usa ese encabezado.
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Tareas</h1>
          <p className="text-sm text-slate-500">{activeCount} activas • {alertCount} con alerta por más de 5 días</p>
        </div>

        <div className="flex items-center gap-2">
          <RefBtn onClick={onRefresh} loading={refreshing}/>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4a265]/10 text-[#c4a265] border border-[#c4a265]/20 text-sm font-semibold"
          >
            <Plus size={16} />
            Nueva Tarea
          </button>
        </div>
      </div>

      <div className="cd p-4">
        <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Etiqueta</div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((tipo) => {
                const label = getTaskLabel(tipo);
                const isActive = typeFilter === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => sTypeFilter(tipo)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                      isActive
                        ? label?.active || "bg-[#c4a265]/10 text-[#c4a265] border-[#c4a265]/20"
                        : "bg-white dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"
                    }`}
                  >
                    {label && <span className={`h-2.5 w-2.5 rounded-full ${label.dot}`} />}
                    {tipo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:w-[270px] shrink-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Orden de creación</div>
            <div className="grid grid-cols-1 gap-2">
              {sortOptions.map((opt) => {
                const isActive = sortOrder === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => sSortOrder(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left inline-flex items-center gap-2 ${
                      isActive
                        ? "bg-[#c4a265]/10 text-[#c4a265] border-[#c4a265]/30 ring-1 ring-[#c4a265]/10"
                        : "bg-white dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700/30"
                    }`}
                  >
                    <Calendar size={13} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {KCOLS.filter((col) => col.id !== "Terminado").map((col) => {
          const items = visibleTasks.filter(
            (t) => t.estado === col.id && t.status === "activo"
          );

          return (
            <div
              key={col.id}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-3 min-h-[260px]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: col.color }} />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{col.id}</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>

              <div className="space-y-3">
                {items.map((t) => {
                  const taskType = getTaskType(t);
                  const isAlert = isOlderThanFiveDays(t);
                  const ageDays = daysSinceCreation(t);
                  const label = getTaskLabel(taskType);
                  const fcDate = parseTaskDate(t.fecha_compromiso);
                  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
                  const isOverdue = fcDate && fcDate < todayMidnight;
                  const showBanner = isAlert || isOverdue;

                  return (
                    <div
                      key={t.id_tarea}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id_tarea)}
                      onTouchStart={() => onTouchStart(t.id_tarea)}
                      className={`rounded-xl border bg-slate-50 dark:bg-slate-800/40 p-3 cursor-move transition-all ${
                        showBanner
                          ? "border-red-400/60 dark:border-red-500/50 shadow-sm shadow-red-500/10"
                          : "border-slate-200 dark:border-slate-700/30 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {showBanner && (
                        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
                          <AlertTriangle size={11} />
                          {isOverdue ? "Fecha compromiso vencida" : `Sin avance · ${ageDays}d`}
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">
                            {t.descripcion_tarea || "Sin descripción"}
                          </div>
                          <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border font-semibold ${typeBadge(taskType)}`}>
                            {label && <span className={`h-2 w-2 rounded-full ${label.dot}`} />}
                            {taskType}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            title="Marcar como terminada"
                            onClick={() => markDone(t.id_tarea)}
                            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-300 hover:text-emerald-500 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-[#c4a265] transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => sPendingDel(t.id_tarea)}
                            title="Eliminar tarea"
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        {requiresProject(taskType) && (
                          <div className="truncate">Proyecto: {projectLabel(t.obra)}</div>
                        )}
                        <div>Responsable: {t.responsable || "Sin asignar"}</div>
                        <div className={isOverdue ? "text-red-500 font-semibold" : ""}>
                          Compromiso: {fd(t.fecha_compromiso)}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${prioClr(t.prioridad)}`}>
                          {t.prioridad || "Media"}
                        </span>
                        {ageDays > 0 && <span className="text-[10px] text-slate-400">{ageDays}d</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {items.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700/20 py-8 text-center text-slate-300 dark:text-slate-600 text-xs">
                  Sin tareas
                </div>
              )}

              {touchDrag && touchDragTask?.estado !== col.id && (
                <div className="mt-3 lg:hidden">
                  <button
                    onClick={() => moveTo(col.id)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-600"
                  >
                    Mover aquí →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ TERMINADO — sección colapsable ═══ */}
      {(() => {
        const doneItems = visibleTasks.filter((t) => t.estado === "Terminado" && t.status === "activo");
        return (
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-700/20 overflow-hidden">
            <button
              onClick={() => setShowDone((p) => !p)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-50/60 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Terminado</span>
                {doneItems.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {doneItems.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[11px]">{showDone ? "Ocultar" : "Ver terminadas"}</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${showDone ? "rotate-180" : ""}`} />
              </div>
            </button>

            {showDone && (
              <div className="bg-white dark:bg-slate-900/20">
                {doneItems.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400 opacity-40" />
                    <p className="text-sm text-slate-400">Sin tareas terminadas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/20">
                    {doneItems.map((t) => {
                      const taskType = getTaskType(t);
                      return (
                        <div
                          key={t.id_tarea}
                          className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <CheckCircle size={15} className="mt-0.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-through line-clamp-1">
                              {t.descripcion_tarea || "Sin descripción"}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400">{t.responsable || "—"}</span>
                              {t.fecha_cierre && (
                                <span className="text-[10px] text-emerald-500">Cerrado: {fd(t.fecha_cierre)}</span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${typeBadge(taskType)}`}>
                                {taskType}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => reopenTask(t.id_tarea)}
                              title="Reabrir tarea"
                              className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#c4a265] hover:border-[#c4a265]/40 transition-colors whitespace-nowrap"
                            >
                              Reabrir
                            </button>
                            <button
                              onClick={() => sPendingDel(t.id_tarea)}
                              title="Eliminar tarea"
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <Mod open={sf} close={() => sSf(false)} title="Nueva Tarea" w>
        <div className="space-y-5">
          <TaskLabelSelector value={fm.tipo_tarea} onChange={(v) => u("tipo_tarea", v)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requiresProject(fm.tipo_tarea) && (
              <Inp
                l="Proyecto"
                v={fm.obra}
                ch={(v) => u("obra", v)}
                opts={[
                  { v: "", l: "— Seleccionar proyecto —" },
                  ...prjs.map((p) => ({ v: p.id_proyecto, l: `${p.nombre_proyecto}` })),
                ]}
                req
              />
            )}
            <Inp l="Responsable" v={fm.responsable} ch={(v) => u("responsable", v)} opts={[{v:"",l:"— Sin asignar —"},...RESPONSABLES.map(r=>({v:r.nombre,l:r.nombre}))]} req/>
            <Inp l="Cargo / Rol" v={fm.cargo_rol} ch={(v) => u("cargo_rol", v)} />
            <Inp l="Prioridad" v={fm.prioridad} ch={(v) => u("prioridad", v)} opts={PRIOS} />
            <Inp l="Fecha compromiso" v={fm.fecha_compromiso} ch={(v) => u("fecha_compromiso", v)} type="date" />
            <Inp l="Creado por" v={fm.creado_por} ch={(v) => u("creado_por", v)} opts={[{v:"",l:"— Seleccionar —"},...TEAM.map(n=>({v:n,l:n}))]} />
            <div className="sm:col-span-2">
              <Inp l="Descripción" v={fm.descripcion_tarea} ch={(v) => u("descripcion_tarea", v)} ta req />
            </div>
            <div className="sm:col-span-2">
              <Inp l="Comentarios" v={fm.comentarios} ch={(v) => u("comentarios", v)} ta />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30">
          <button onClick={() => sSf(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={saveNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"
          >
            <Save size={15} />
            Guardar
          </button>
        </div>
      </Mod>

      {pendingDel && <DeleteConfirm label={safeTasks.find(t=>t.id_tarea===pendingDel)?.descripcion_tarea||pendingDel} onConfirm={softDeleteTask} onCancel={()=>sPendingDel(null)}/>}

      <Mod open={!!ef} close={() => sEf(null)} title="Editar Tarea" w>
        {ef && (
          <>
            <div className="space-y-5">
              <TaskLabelSelector value={ef.tipo_tarea || ef.tipos_tarea || DEFAULT_TASK_LABEL} onChange={(v) => ue("tipo_tarea", v)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requiresProject(ef.tipo_tarea || ef.tipos_tarea) && (
                  <Inp
                    l="Proyecto"
                    v={ef.obra || ""}
                    ch={(v) => ue("obra", v)}
                    opts={[
                      { v: "", l: "— Seleccionar proyecto —" },
                      ...prjs.map((p) => ({ v: p.id_proyecto, l: `${p.nombre_proyecto}` })),
                    ]}
                    req
                  />
                )}
                <Inp l="Responsable" v={ef.responsable || ""} ch={(v) => ue("responsable", v)} opts={[{v:"",l:"— Sin asignar —"},...RESPONSABLES.map(r=>({v:r.nombre,l:r.nombre}))]} req/>
                <Inp l="Cargo / Rol" v={ef.cargo_rol || ""} ch={(v) => ue("cargo_rol", v)} />
                <Inp l="Prioridad" v={ef.prioridad || "Media"} ch={(v) => ue("prioridad", v)} opts={PRIOS} />
                <Inp l="Estado" v={ef.estado || "Pendiente"} ch={(v) => ue("estado", v)} opts={KCOLS.map((c) => c.id)} />
                <Inp l="Fecha compromiso" v={ef.fecha_compromiso || ""} ch={(v) => ue("fecha_compromiso", v)} type="date" />
                <div className="sm:col-span-2">
                  <Inp l="Descripción" v={ef.descripcion_tarea || ""} ch={(v) => ue("descripcion_tarea", v)} ta req />
                </div>
                <div className="sm:col-span-2">
                  <Inp l="Comentarios" v={ef.comentarios || ""} ch={(v) => ue("comentarios", v)} ta />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30">
              <button onClick={() => sEf(null)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c4a265] hover:bg-[#b8956a] text-white text-sm font-semibold"
              >
                <Save size={15} />
                Guardar
              </button>
            </div>
          </>
        )}
      </Mod>
    </div>
  );
}

function App(){
  const[role,sR]=useState(null);const[col,sCol]=useState(false);const[mob,sMob]=useState(false);const[view,sV]=useState(null);const[sp,sSP]=useState(null);const[selC,sSelC]=useState(null);const[vm,sVm]=useState("desktop");const[ts,sTs]=useState([]);
  
  // 1. Estados inicializados vacíos y agregamos el estado de carga
  const[cls,sCls]=useState([]);
  const[crm,sCrm]=useState([]);
  const[prjs,sPrjs]=useState([]);
  const[facs,sFacs]=useState([]);
  const[tasks,sTasks]=useState([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);

  useEffect(()=>{const w=window.innerWidth;if(w<640)sVm("mobile");else if(w<1024)sVm("tablet");},[]);
  useEffect(()=>{if(!role)return;sV(role==="cobros"?"dash-cobros":"dash-crm");},[role]);

  // 2. Disparamos la carga desde Google Sheets solo después del login
  useEffect(() => {
    if(!role)return;
    setLoading(true);
    const fetchDatos = async () => {
      try {
        const data = await googleSheetsService.loadAll();
        if (data) {
          const notDel=x=>String(x.status||"").trim().toLowerCase()!=="eliminado";
          sCls((data.clientes || []).filter(notDel));
          sPrjs((data.proyectos || []).filter(notDel));
          sFacs(data.cuentas || []);
          sCrm((data.crm || []).filter(notDel));
          sTasks((data.tareas || []).filter(notDel));
        }
      } catch (error) {
        console.error("Fallo la carga inicial", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [role]);

  const toast=(m,y="success")=>{const id=Date.now();sTs(p=>[...p,{id,m,y}]);setTimeout(()=>sTs(p=>p.filter(t=>t.id!==id)),y==="error"?7000:4000);};
  const refreshData=async()=>{if(refreshing)return;setRefreshing(true);try{const data=await googleSheetsService.loadAll();if(data){const notDel=x=>String(x.status||"").trim().toLowerCase()!=="eliminado";sCls((data.clientes||[]).filter(notDel));sPrjs((data.proyectos||[]).filter(notDel));sFacs(data.cuentas||[]);sCrm((data.crm||[]).filter(notDel));sTasks((data.tareas||[]).filter(notDel));}toast("Datos actualizados");}catch(error){console.error("Error al refrescar:",error);toast("No se pudieron actualizar los datos","error");}finally{setRefreshing(false);}};
  const vw={mobile:"max-w-[430px]",tablet:"max-w-[820px]",desktop:"max-w-none"}[vm];
  const notifs=useMemo(()=>{
    const today=new Date();today.setHours(0,0,0,0);
    const normEst=e=>{const s=String(e||"").trim().toLowerCase();if(s==="atrasado")return"Atrasado";if(s==="terminado"||s==="completada")return"Terminado";if(s==="en proceso")return"En Proceso";return"Pendiente";};
    const normSt=s=>String(s||"").trim().toLowerCase()==="activo"?"activo":"otro";
    const parseDt=v=>{if(!v)return null;const s=String(v).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return new Date(`${s}T12:00:00`);if(/^\d{2}\/\d{2}\/\d{4}$/.test(s)){const[mm,dd,yyyy]=s.split("/");return new Date(`${yyyy}-${mm}-${dd}T12:00:00`);}const p=new Date(v);return isNaN(p)?null:p;};
    const list=[];
    (tasks||[]).filter(t=>normSt(t.status)==="activo").forEach(t=>{
      const est=normEst(t.estado);
      if(est==="Terminado")return;
      const desc=String(t.descripcion_tarea||t.id_tarea||"").slice(0,80);
      if(est==="Atrasado"){list.push({id:`t-atr-${t.id_tarea}`,tipo:"critico",cat:"tareas",titulo:"Tarea atrasada",det:desc,nav:"tareas"});return;}
      const fc=parseDt(t.fecha_compromiso);
      if(fc&&fc<today){list.push({id:`t-fc-${t.id_tarea}`,tipo:"critico",cat:"tareas",titulo:"Fecha compromiso vencida",det:desc,nav:"tareas"});return;}
      const cr=parseDt(t.fecha_creacion);
      if(cr){const days=Math.floor((today-cr)/86400000);if(days>5)list.push({id:`t-old-${t.id_tarea}`,tipo:"alerta",cat:"tareas",titulo:`Sin avance · ${days}d en ${est}`,det:desc,nav:"tareas"});}
    });
    (facs||[]).filter(f=>f.estado_cobro!=="Pagado").forEach(f=>{
      const mora=Number(f.dias_mora||0);
      const det=`${String(f.hitos_concepto||f.id_factura||"").slice(0,40)} · ${$(f.monto_facturado)}`;
      if(f.estado_cobro==="En Disputa Técnica")list.push({id:`f-disp-${f.id_factura}`,tipo:"alerta",cat:"cobros",titulo:"Factura en disputa técnica",det,nav:"cobros"});
      else if(mora>30)list.push({id:`f-crit-${f.id_factura}`,tipo:"critico",cat:"cobros",titulo:`Mora crítica: ${mora} días`,det,nav:"cobros"});
      else if(mora>0)list.push({id:`f-mora-${f.id_factura}`,tipo:"alerta",cat:"cobros",titulo:`${mora} días en mora`,det,nav:"cobros"});
    });
    (crm||[]).filter(b=>b.promesa_pago).forEach(b=>{
      const pp=parseDt(b.promesa_pago);
      if(pp&&pp<today){const cli=gC(b,cls,prjs);list.push({id:`crm-pp-${b.id_interaccion}`,tipo:"alerta",cat:"crm",titulo:"Promesa de pago vencida",det:`${cli?.razon_social_nombre||b.id_proyecto||"—"} · ${fd(b.promesa_pago)}`,nav:"bitacora"});}
    });
    (cls||[]).filter(c=>c.estado_relacion==="En Litigio/Moroso").forEach(c=>{
      const last=(crm||[]).filter(b=>b.id_cliente===c.id_cliente).sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto))[0];
      const days=last?Math.floor((today-new Date(last.fecha_contacto))/86400000):9999;
      if(days>30)list.push({id:`crm-liti-${c.id_cliente}`,tipo:"critico",cat:"crm",titulo:"Moroso sin contacto",det:`${c.razon_social_nombre} · ${days>=9999?"sin registro":days+"d sin contacto"}`,nav:"clientes"});
    });
    return list.sort((a,b)=>a.tipo==="critico"&&b.tipo!=="critico"?-1:1);
  },[tasks,facs,crm,cls,prjs]);

  const rv=()=>{const rp={onRefresh:refreshData,refreshing};switch(view){case"dash-crm":return<DashCRM cls={cls} crm={crm} prjs={prjs} {...rp}/>;case"dash-cobros":return<DashCob cls={cls} prjs={prjs} facs={facs} {...rp}/>;case"clientes":return<ClV cls={cls} setCls={sCls} toast={toast} crm={crm} setCrm={sCrm} prjs={prjs} setView={sV} setSelC={sSelC} facs={facs} {...rp}/>;case"c360":return<C3V cid={selC} setView={sV} cls={cls} setCls={sCls} crm={crm} setCrm={sCrm} prjs={prjs} toast={toast} facs={facs}/>;case"proyectos":return<PrV cls={cls} setCls={sCls} setView={sV} setSP={sSP} prjs={prjs} setPrjs={sPrjs} toast={toast} facs={facs} {...rp}/>;case"p360":return<P3V pid={sp} setView={sV} cls={cls} crm={crm} setCrm={sCrm} toast={toast} prjs={prjs} setPrjs={sPrjs} facs={facs}/>;case"cobros":return<CoV cls={cls} prjs={prjs} facs={facs} setFacs={sFacs} toast={toast} {...rp}/>;case"tareas":return<TarV tasks={tasks} setTasks={sTasks} prjs={prjs} toast={toast} {...rp}/>;case"bitacora":return<BiV crm={crm} setCrm={sCrm} cls={cls} toast={toast} prjs={prjs} {...rp}/>;default:return<DashCRM cls={cls} crm={crm} prjs={prjs} {...rp}/>;}};

  if(!role)return<div><style>{CSS}</style><RoleSel setRole={sR}/></div>;

  // 3. Mostramos una pantalla de carga mientras Netlify se comunica con Google Sheets (solo post-login)
  if(loading) return <div><style>{CSS}</style><div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]"><div className="text-[#c4a265] font-bold text-lg flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-[#c4a265] border-t-transparent rounded-full animate-spin"></div><span className="animate-pulse">Cargando datos...</span></div></div></div>;
  return<div><style>{CSS}</style><div className="min-h-screen bg-[#f5f3ee]"><Sidebar col={col} setCol={sCol} view={view} setView={sV} mob={mob} setMob={sMob} role={role}/><Topbar setMob={sMob} role={role} setRole={sR} vm={vm} setVm={sVm} notifs={notifs} setView={sV}/><main className={`pt-14 transition-all duration-300 ${col?"lg:pl-[68px]":"lg:pl-[230px]"}`}><div className={`mx-auto p-4 lg:p-6 transition-all duration-300 ${vw}`}>{rv()}</div></main><Toast ts={ts} rm={id=>sTs(p=>p.filter(t=>t.id!==id))}/></div></div>;
}

const CSS=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');*{font-family:'DM Sans',system-ui,sans-serif;box-sizing:border-box}body{margin:0;-webkit-font-smoothing:antialiased}:root{--tt-bg:#fff;--tt-border:#e2e8f0;--tt-text:#334155;--grid:#e2e8f0;--ax:#64748b}.dark{--tt-bg:#1e293b;--tt-border:#334155;--tt-text:#e2e8f0;--grid:#1e293b;--ax:#64748b}.cd{border-radius:1rem;border:1px solid #e2e8f0;background:#fff}.dark .cd{border-color:rgba(51,65,85,.4);background:rgba(30,41,59,.3)}@keyframes sU{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}.dark ::-webkit-scrollbar-thumb{background:#334155;border-radius:10px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}`;


export default App;
