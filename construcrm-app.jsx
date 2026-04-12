import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import {
  LayoutDashboard, Users, FolderKanban, Receipt, ChevronLeft, ChevronRight, Bell, Search,
  TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, XCircle, ArrowRight, Calendar,
  DollarSign, Building2, FileWarning, Handshake, ChevronDown, Filter, Eye, Phone, Mail, MapPin,
  Briefcase, BarChart3, CircleDollarSign, Menu, X, Loader2, Info, Plus, Save, UserCircle, Shield,
  ShieldCheck, ShieldAlert, LogOut, Settings, ExternalLink, MessageSquare, Pencil, Hash, Activity,
  Banknote, CreditCard, FileText, Target, PieChart as PieIcon, UserPlus, NotebookPen
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Area, AreaChart } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — Mirrors Google Sheets structure exactly
   ═══════════════════════════════════════════════════════════════ */
const INITIAL_CLIENTES = [
  { id_cliente:"CLI-001",tipo_cliente:"B2B",razon_social_nombre:"Inversiones y Promociones del Pacífico S.A.",ruc_cedula:"1556987-1-12345 DV 12",contacto_principal:"Carlos Mendoza",telefono_whatsapp:"+507 6678-1234",email_facturacion:"contabilidad@inverpacifico.com.pa",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-002",tipo_cliente:"B2B",razon_social_nombre:"Constructora Cimientos S.A.",ruc_cedula:"144589-1-9876 DV 45",contacto_principal:"Ana González",telefono_whatsapp:"+507 223-4567",email_facturacion:"pagos@cimientos.com.pa",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-003",tipo_cliente:"B2C",razon_social_nombre:"Roberto Sánchez",ruc_cedula:"8-765-4321",contacto_principal:"Roberto Sánchez",telefono_whatsapp:"+507 6987-6543",email_facturacion:"rsanchez_86@gmail.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-004",tipo_cliente:"B2B",razon_social_nombre:"Arquitectura Estructural S.A.",ruc_cedula:"233456-1-5555 DV 89",contacto_principal:"Ing. Luis Martínez",telefono_whatsapp:"+507 6555-4433",email_facturacion:"administracion@arqestructural.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-005",tipo_cliente:"B2B",razon_social_nombre:"Desarrollos Inmobiliarios Norte",ruc_cedula:"156788-1-2222 DV 01",contacto_principal:"Elena Ríos",telefono_whatsapp:"+507 209-8877",email_facturacion:"finanzas@desarrollosnorte.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-006",tipo_cliente:"B2C",razon_social_nombre:"María Fernanda López",ruc_cedula:"8-812-3456",contacto_principal:"María Fernanda López",telefono_whatsapp:"+507 6777-1122",email_facturacion:"mflopez@hotmail.com",estado_relacion:"Cotizando" },
  { id_cliente:"CLI-007",tipo_cliente:"B2B",razon_social_nombre:"Grupo Constructor Alianza",ruc_cedula:"188990-1-3344 DV 34",contacto_principal:"Pedro Ramírez",telefono_whatsapp:"+507 6112-9988",email_facturacion:"pramirez@grupoalianza.com.pa",estado_relacion:"Prospecto" },
  { id_cliente:"CLI-008",tipo_cliente:"B2B",razon_social_nombre:"Subcontratos Eléctricos S.A.",ruc_cedula:"255667-1-7766 DV 56",contacto_principal:"Jorge Castillo",telefono_whatsapp:"+507 6443-2211",email_facturacion:"jcastillo@selectricos.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-009",tipo_cliente:"B2C",razon_social_nombre:"Carmen Victoria Herrera",ruc_cedula:"4-234-5678",contacto_principal:"Carmen Victoria Herrera",telefono_whatsapp:"+507 6332-1100",email_facturacion:"carmen.herrera@yahoo.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-010",tipo_cliente:"B2B",razon_social_nombre:"Materiales y Acabados Premium",ruc_cedula:"199887-1-6655 DV 90",contacto_principal:"Sofía Pineda",telefono_whatsapp:"+507 230-1122",email_facturacion:"spineda@acabadospremium.com",estado_relacion:"Cotizando" },
  { id_cliente:"CLI-011",tipo_cliente:"B2B",razon_social_nombre:"Proyectos Urbanísticos S.A.",ruc_cedula:"122334-1-8899 DV 21",contacto_principal:"Miguel Torres",telefono_whatsapp:"+507 6889-4455",email_facturacion:"facturacion@proyectosurbanos.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-012",tipo_cliente:"B2C",razon_social_nombre:"Juan Pérez",ruc_cedula:"8-901-2345",contacto_principal:"Juan Pérez",telefono_whatsapp:"+507 6223-5566",email_facturacion:"jperez_dev@gmail.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-013",tipo_cliente:"B2B",razon_social_nombre:"Ingeniería Civil Avanzada",ruc_cedula:"177655-1-4433 DV 78",contacto_principal:"Andrea Vargas",telefono_whatsapp:"+507 264-9988",email_facturacion:"avargas@ingcivilavanzada.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-019",tipo_cliente:"B2B",razon_social_nombre:"Remodelaciones Interiores",ruc_cedula:"133221-1-6677 DV 89",contacto_principal:"Fernando Ruiz",telefono_whatsapp:"+507 6776-5544",email_facturacion:"fruiz@remodelaciones.com.pa",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-022",tipo_cliente:"B2C",razon_social_nombre:"Gabriela Méndez",ruc_cedula:"8-876-5432",contacto_principal:"Gabriela Méndez",telefono_whatsapp:"+507 6221-8877",email_facturacion:"gaby.mendez@gmail.com",estado_relacion:"Cliente Activo" },
  { id_cliente:"CLI-027",tipo_cliente:"B2B",razon_social_nombre:"Pisos y Revestimientos S.A.",ruc_cedula:"188991-1-5544 DV 98",contacto_principal:"Gabriel Rojas",telefono_whatsapp:"+507 236-8899",email_facturacion:"grojas@pisosrevestimientos.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-034",tipo_cliente:"B2B",razon_social_nombre:"Impermeabilizaciones S.A.",ruc_cedula:"144778-1-6655 DV 54",contacto_principal:"Tomás Delgado",telefono_whatsapp:"+507 6991-3322",email_facturacion:"tdelgado@impermeabilizaciones.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-041",tipo_cliente:"B2B",razon_social_nombre:"Asesoría Ambiental Obra",ruc_cedula:"122556-1-7733 DV 98",contacto_principal:"Rodrigo Paz",telefono_whatsapp:"+507 232-1144",email_facturacion:"rpaz@asesoriaambiental.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-048",tipo_cliente:"B2C",razon_social_nombre:"Guillermo Acosta",ruc_cedula:"8-867-8901",contacto_principal:"Guillermo Acosta",telefono_whatsapp:"+507 6449-4455",email_facturacion:"gacosta@gmail.com",estado_relacion:"En Litigio/Moroso" },
  { id_cliente:"CLI-049",tipo_cliente:"B2B",razon_social_nombre:"Topografía y Agrimensura",ruc_cedula:"133667-1-8899 DV 87",contacto_principal:"Simón Bravo",telefono_whatsapp:"+507 6780-6677",email_facturacion:"sbravo@topografia.com.pa",estado_relacion:"Cliente Activo" },
];

const PROYECTOS = [
  { id_proyecto:"PRJ-001",id_cliente:"CLI-001",nombre_proyecto:"Construcción Torre Administrativa",presupuesto_aprobado:1250000,fecha_inicio:"2026-01-15",estado_obra:"Ejecución",project_manager:"Carlos Rivera" },
  { id_proyecto:"PRJ-002",id_cliente:"CLI-003",nombre_proyecto:"Techado Residencial Costa del Este",presupuesto_aprobado:18500,fecha_inicio:"2026-03-10",estado_obra:"Ejecución",project_manager:"Sofía Méndez" },
  { id_proyecto:"PRJ-003",id_cliente:"CLI-004",nombre_proyecto:"Refuerzo Estructural Galera",presupuesto_aprobado:45000,fecha_inicio:"2025-11-22",estado_obra:"Suspendido",project_manager:"Luis Gómez" },
  { id_proyecto:"PRJ-004",id_cliente:"CLI-005",nombre_proyecto:"Urbanización Norte - Fase 1",presupuesto_aprobado:850000,fecha_inicio:"2026-02-05",estado_obra:"Ejecución",project_manager:"Carlos Rivera" },
  { id_proyecto:"PRJ-005",id_cliente:"CLI-012",nombre_proyecto:"Remodelación Apto San Francisco",presupuesto_aprobado:25000,fecha_inicio:"2026-04-01",estado_obra:"Suspendido",project_manager:"Elena Castillo" },
  { id_proyecto:"PRJ-006",id_cliente:"CLI-008",nombre_proyecto:"Instalación Eléctrica Planta Baja",presupuesto_aprobado:12000,fecha_inicio:"2026-03-20",estado_obra:"Entregado",project_manager:"Marcos Valdés" },
  { id_proyecto:"PRJ-007",id_cliente:"CLI-013",nombre_proyecto:"Techado Estructura Metálica Almacén",presupuesto_aprobado:65000,fecha_inicio:"2026-02-15",estado_obra:"Ejecución",project_manager:"Luis Gómez" },
  { id_proyecto:"PRJ-008",id_cliente:"CLI-019",nombre_proyecto:"Remodelación Oficina Corporativa",presupuesto_aprobado:110000,fecha_inicio:"2025-12-01",estado_obra:"Suspendido",project_manager:"Sofía Méndez" },
  { id_proyecto:"PRJ-010",id_cliente:"CLI-002",nombre_proyecto:"Cimentación Edificio Residencial",presupuesto_aprobado:420000,fecha_inicio:"2025-10-15",estado_obra:"Entregado",project_manager:"Carlos Rivera" },
  { id_proyecto:"PRJ-011",id_cliente:"CLI-034",nombre_proyecto:"Impermeabilización Azotea",presupuesto_aprobado:8500,fecha_inicio:"2026-03-02",estado_obra:"Ejecución",project_manager:"Marcos Valdés" },
  { id_proyecto:"PRJ-012",id_cliente:"CLI-041",nombre_proyecto:"Evaluación y Mitigación Ambiental",presupuesto_aprobado:15000,fecha_inicio:"2026-01-10",estado_obra:"Suspendido",project_manager:"Sofía Méndez" },
  { id_proyecto:"PRJ-013",id_cliente:"CLI-048",nombre_proyecto:"Demolición y Limpieza Lote",presupuesto_aprobado:22000,fecha_inicio:"2026-04-05",estado_obra:"Ejecución",project_manager:"Luis Gómez" },
  { id_proyecto:"PRJ-015",id_cliente:"CLI-011",nombre_proyecto:"Proyecto Urbanístico Brisas",presupuesto_aprobado:1500000,fecha_inicio:"2025-08-15",estado_obra:"Ejecución",project_manager:"Carlos Rivera" },
  { id_proyecto:"PRJ-016",id_cliente:"CLI-013",nombre_proyecto:"Puente Peatonal Conexión",presupuesto_aprobado:280000,fecha_inicio:"2026-02-10",estado_obra:"Ejecución",project_manager:"Marcos Valdés" },
];

const FACTURAS = [
  { id_factura:"FAC-2026-001",id_proyecto:"PRJ-001",hitos_concepto:"Anticipo 20% - Movilización",monto_facturado:250000,fecha_emision:"2026-01-15",fecha_vencimiento:"2026-01-30",dias_mora:0,estado_cobro:"Pagado" },
  { id_factura:"FAC-2026-002",id_proyecto:"PRJ-001",hitos_concepto:"Avance de Obra #1 (Fundaciones)",monto_facturado:150000,fecha_emision:"2026-02-28",fecha_vencimiento:"2026-03-15",dias_mora:0,estado_cobro:"Pagado" },
  { id_factura:"FAC-2026-003",id_proyecto:"PRJ-001",hitos_concepto:"Avance de Obra #2 (Estructura)",monto_facturado:150000,fecha_emision:"2026-03-30",fecha_vencimiento:"2026-04-14",dias_mora:0,estado_cobro:"Pendiente" },
  { id_factura:"FAC-2026-007",id_proyecto:"PRJ-003",hitos_concepto:"Avance #1 - Revisión APU y Acero",monto_facturado:15000,fecha_emision:"2025-12-20",fecha_vencimiento:"2026-01-05",dias_mora:97,estado_cobro:"En Disputa Técnica" },
  { id_factura:"FAC-2026-009",id_proyecto:"PRJ-004",hitos_concepto:"Avance Obra #1 (Mov. Tierra)",monto_facturado:100000,fecha_emision:"2026-03-05",fecha_vencimiento:"2026-03-20",dias_mora:23,estado_cobro:"Pago Parcial" },
  { id_factura:"FAC-2026-010",id_proyecto:"PRJ-004",hitos_concepto:"Avance de Obra #2 (Calles)",monto_facturado:150000,fecha_emision:"2026-04-02",fecha_vencimiento:"2026-04-17",dias_mora:0,estado_cobro:"Pendiente" },
  { id_factura:"FAC-2026-011",id_proyecto:"PRJ-005",hitos_concepto:"Anticipo 40% - Remodelación",monto_facturado:10000,fecha_emision:"2026-04-01",fecha_vencimiento:"2026-04-05",dias_mora:7,estado_cobro:"Pendiente" },
  { id_factura:"FAC-2026-015",id_proyecto:"PRJ-007",hitos_concepto:"Avance #1 - Montaje de Vigas",monto_facturado:20000,fecha_emision:"2026-03-15",fecha_vencimiento:"2026-03-30",dias_mora:13,estado_cobro:"Pendiente" },
  { id_factura:"FAC-2026-017",id_proyecto:"PRJ-008",hitos_concepto:"Avance #1 - Gypsum y Divisiones",monto_facturado:25000,fecha_emision:"2026-01-10",fecha_vencimiento:"2026-01-25",dias_mora:77,estado_cobro:"En Disputa Técnica" },
  { id_factura:"FAC-2026-021",id_proyecto:"PRJ-010",hitos_concepto:"Liquidación Final y Retenciones",monto_facturado:186000,fecha_emision:"2026-02-15",fecha_vencimiento:"2026-03-02",dias_mora:41,estado_cobro:"Pendiente" },
  { id_factura:"FAC-2026-022",id_proyecto:"PRJ-011",hitos_concepto:"Pago Único - Impermeabilización",monto_facturado:8500,fecha_emision:"2026-03-02",fecha_vencimiento:"2026-03-17",dias_mora:26,estado_cobro:"Pago Parcial" },
  { id_factura:"FAC-2026-023",id_proyecto:"PRJ-012",hitos_concepto:"Estudio de Impacto Ambiental",monto_facturado:15000,fecha_emision:"2026-01-10",fecha_vencimiento:"2026-01-25",dias_mora:77,estado_cobro:"En Disputa Técnica" },
  { id_factura:"FAC-2026-029",id_proyecto:"PRJ-015",hitos_concepto:"Avance #2 - Calles y Drenajes",monto_facturado:350000,fecha_emision:"2026-02-10",fecha_vencimiento:"2026-02-25",dias_mora:46,estado_cobro:"Pendiente" },
];

const INITIAL_CRM = [
  { id_interaccion:"INT-001",id_proyecto:"PRJ-003",fecha_contacto:"2026-01-10",tipo_contacto:"Visita a Obra",notas_acuerdos:"Se discutió el avance #1. Cliente retiene pago solicitando revisión de APU del acero estructural.",promesa_pago:"" },
  { id_interaccion:"INT-005",id_proyecto:"PRJ-004",fecha_contacto:"2026-03-22",tipo_contacto:"Mensaje de WhatsApp",notas_acuerdos:"Recordatorio amigable sobre saldo pendiente del Avance #1 (Mov. de Tierra). Cliente confirma recepción.",promesa_pago:"" },
  { id_interaccion:"INT-006",id_proyecto:"PRJ-004",fecha_contacto:"2026-03-24",tipo_contacto:"Mensaje de WhatsApp",notas_acuerdos:"Cliente informa que liberaron un pago parcial por $30k ayer. Contabilidad debe verificar.",promesa_pago:"2026-03-24" },
  { id_interaccion:"INT-007",id_proyecto:"PRJ-004",fecha_contacto:"2026-04-02",tipo_contacto:"Llamada",notas_acuerdos:"Se contactó a finanzas del cliente por el saldo restante ($70k). Cheque de gerencia sale este viernes.",promesa_pago:"2026-04-10" },
  { id_interaccion:"INT-016",id_proyecto:"PRJ-011",fecha_contacto:"2026-03-10",tipo_contacto:"Visita a Obra",notas_acuerdos:"Entrega del proyecto de impermeabilización. Pago parcial en sitio, retienen porcentaje por garantía de lluvias.",promesa_pago:"" },
  { id_interaccion:"INT-021",id_proyecto:"PRJ-015",fecha_contacto:"2026-03-05",tipo_contacto:"Mensaje de WhatsApp",notas_acuerdos:"Notificación automática del CRM: Factura FAC-2026-029 vencida.",promesa_pago:"" },
  { id_interaccion:"INT-024",id_proyecto:"PRJ-015",fecha_contacto:"2026-04-02",tipo_contacto:"Llamada",notas_acuerdos:"Reunión de urgencia con directiva. Acuerdan transferencias fraccionadas durante abril para no detener obra.",promesa_pago:"2026-04-15" },
  { id_interaccion:"INT-025",id_proyecto:"PRJ-001",fecha_contacto:"2026-04-05",tipo_contacto:"Mensaje de WhatsApp",notas_acuerdos:"Notificación de emisión de factura Avance de Obra #2 y envío de reporte fotográfico.",promesa_pago:"" },
  { id_interaccion:"INT-029",id_proyecto:"PRJ-013",fecha_contacto:"2026-04-07",tipo_contacto:"Mensaje de WhatsApp",notas_acuerdos:"Recordatorio de pago del anticipo de demolición. Cliente solicita reenvío de factura con RUC corregido.",promesa_pago:"" },
  { id_interaccion:"INT-030",id_proyecto:"PRJ-013",fecha_contacto:"2026-04-07",tipo_contacto:"Email",notas_acuerdos:"Envío de factura anulada y reemitida con el RUC correcto. Cliente acusa recibo.",promesa_pago:"2026-04-09" },
];

const ROLES = { ADMIN: "admin", CRM: "crm", COBROS: "cobros" };
const ROLE_META = {
  admin: { label: "Administrador", icon: ShieldCheck, color: "sky", desc: "Acceso completo" },
  crm: { label: "Gestión CRM", icon: Users, color: "emerald", desc: "Solo clientes y bitácora" },
  cobros: { label: "Cartera / Cobros", icon: Receipt, color: "amber", desc: "Solo facturación y cobros" },
};

/* ═══════════════════════════════════════════════════════════════ */
const fmt = (n) => new Intl.NumberFormat("es-PA",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
const fmtDate = (d) => { if(!d) return "—"; try{ const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("es-PA",{day:"2-digit",month:"short",year:"numeric"}); }catch{return d;} };
const badge = (estado) => {
  const m = {
    "Cliente Activo":"bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "Prospecto":"bg-sky-500/15 text-sky-400 border-sky-500/20",
    "Cotizando":"bg-violet-500/15 text-violet-400 border-violet-500/20",
    "En Litigio/Moroso":"bg-red-500/15 text-red-400 border-red-500/20",
    "Ejecución":"bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "Suspendido":"bg-red-500/15 text-red-400 border-red-500/20",
    "Entregado":"bg-sky-500/15 text-sky-400 border-sky-500/20",
    "En Planificación":"bg-violet-500/15 text-violet-400 border-violet-500/20",
    "Pagado":"bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "Pendiente":"bg-amber-500/15 text-amber-400 border-amber-500/20",
    "En Disputa Técnica":"bg-orange-500/15 text-orange-300 border-orange-500/20",
    "Pago Parcial":"bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  };
  return `${m[estado]||"bg-slate-500/15 text-slate-400 border-slate-500/20"} border`;
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const Sk = ({c=""}) => <div className={`animate-pulse rounded-lg bg-slate-700/40 ${c}`}/>;

function Toast({toasts,remove}){
  return <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">{toasts.map(t=>
    <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl animate-sU ${t.type==="success"?"bg-emerald-950/90 border-emerald-500/30 text-emerald-200":"bg-red-950/90 border-red-500/30 text-red-200"}`}>
      {t.type==="success"?<CheckCircle size={16}/>:<XCircle size={16}/>}
      <span className="text-sm">{t.message}</span>
      <button onClick={()=>remove(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={14}/></button>
    </div>
  )}</div>;
}

function KPI({title,value,sub,icon:I,accent="sky",trend}){
  const a={sky:"bg-sky-500/10 text-sky-400",emerald:"bg-emerald-500/10 text-emerald-400",red:"bg-red-500/10 text-red-400",amber:"bg-amber-500/10 text-amber-400",violet:"bg-violet-500/10 text-violet-400",orange:"bg-orange-500/10 text-orange-400"};
  return <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 lg:p-5 hover:border-slate-600/50 transition-all">
    <div className="flex items-start justify-between mb-2">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">{title}</span>
      <div className={`p-2 rounded-xl ${a[accent]?.split(" ")[0]}`}><I size={17} className={a[accent]?.split(" ")[1]}/></div>
    </div>
    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</div>
    {sub&&<div className="text-[11px] text-slate-500 mt-1">{sub}</div>}
    {trend!==undefined&&<div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend>=0?"text-emerald-400":"text-red-400"}`}>{trend>=0?<TrendingUp size={13}/>:<TrendingDown size={13}/>}{Math.abs(trend)}%</div>}
  </div>;
}

function Modal({open,onClose,title,children,wide}){
  if(!open)return null;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
    <div className={`relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40 sticky top-0 bg-slate-900 z-10 rounded-t-2xl">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}

function Input({label,value,onChange,type="text",placeholder,options,textarea,required}){
  const base = "w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all";
  return <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}{required&&<span className="text-red-400 ml-0.5">*</span>}</label>
    {options ? <select value={value} onChange={e=>onChange(e.target.value)} className={base}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
    : textarea ? <textarea value={value} onChange={e=>onChange(e.target.value)} className={`${base} h-24 resize-none`} placeholder={placeholder}/>
    : <input type={type} value={value} onChange={e=>onChange(e.target.value)} className={base} placeholder={placeholder}/>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   ROLE SELECTOR
   ═══════════════════════════════════════════════════════════════ */
function RoleSelector({setRole}){
  return <div className="min-h-screen flex items-center justify-center p-4" style={{background:"radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.05) 0%, transparent 50%), #0b1120"}}>
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 justify-center mb-8">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center"><Building2 size={22} className="text-white"/></div>
        <div><div className="text-lg font-bold text-white tracking-wide">ConstruCRM</div><div className="text-[10px] text-slate-500 tracking-[.25em] uppercase">Cobros & Gestión</div></div>
      </div>
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-1">Selecciona tu perfil</h2>
        <p className="text-xs text-slate-500 mb-5">El acceso a módulos depende de tu rol asignado.</p>
        <div className="space-y-3">
          {Object.entries(ROLE_META).map(([k,v])=>{
            const I=v.icon;
            const colors={sky:"from-sky-500/20 to-sky-600/5 border-sky-500/20 hover:border-sky-400/40",emerald:"from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/40",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20 hover:border-amber-400/40"};
            return <button key={k} onClick={()=>setRole(k)} className={`w-full flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r transition-all ${colors[v.color]}`}>
              <div className={`w-10 h-10 rounded-xl bg-${v.color}-500/15 flex items-center justify-center`}><I size={20} className={`text-${v.color}-400`}/></div>
              <div className="text-left"><div className="text-sm font-semibold text-white">{v.label}</div><div className="text-[11px] text-slate-400">{v.desc}</div></div>
              <ArrowRight size={16} className="text-slate-500 ml-auto"/>
            </button>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */
function Sidebar({collapsed,setCollapsed,view,setView,mobileOpen,setMobileOpen,role}){
  const navItems = useMemo(()=>{
    const all=[
      {id:"dash-crm",label:"Dashboard CRM",icon:Users,roles:[ROLES.ADMIN,ROLES.CRM]},
      {id:"dash-cobros",label:"Dashboard Cobros",icon:Receipt,roles:[ROLES.ADMIN,ROLES.COBROS]},
      {id:"clientes",label:"Clientes",icon:UserCircle,roles:[ROLES.ADMIN,ROLES.CRM]},
      {id:"proyectos",label:"Proyectos",icon:FolderKanban,roles:[ROLES.ADMIN,ROLES.CRM,ROLES.COBROS]},
      {id:"cobros",label:"Cartera",icon:Banknote,roles:[ROLES.ADMIN,ROLES.COBROS]},
      {id:"bitacora",label:"Bitácora CRM",icon:NotebookPen,roles:[ROLES.ADMIN,ROLES.CRM]},
    ];
    return all.filter(n=>n.roles.includes(role));
  },[role]);

  const inner = <div className="flex flex-col h-full">
    <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/40 ${collapsed&&!mobileOpen?"justify-center":""}`}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><Building2 size={17} className="text-white"/></div>
      {(!collapsed||mobileOpen)&&<div className="overflow-hidden"><div className="text-sm font-bold text-white tracking-wide leading-tight">ConstruCRM</div><div className="text-[9px] text-slate-500 tracking-[.2em] uppercase">Cobros & Gestión</div></div>}
    </div>
    <nav className="flex-1 py-3 px-2 space-y-0.5">
      {navItems.map(n=>{const a=view===n.id;return <button key={n.id} onClick={()=>{setView(n.id);setMobileOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a?"bg-sky-500/15 text-sky-400":"text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"} ${collapsed&&!mobileOpen?"justify-center":""}`}>
        <n.icon size={18}/>{(!collapsed||mobileOpen)&&<span>{n.label}</span>}
      </button>;})}
    </nav>
    {(!collapsed||mobileOpen)&&<div className="mx-3 mb-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/20">
      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full bg-${ROLE_META[role].color}-400`}/><span className="text-[11px] font-semibold text-slate-300">{ROLE_META[role].label}</span></div>
      <div className="text-[10px] text-slate-500 mt-0.5">Google Sheets <span className="text-emerald-400">conectado</span></div>
    </div>}
    <button onClick={()=>{setCollapsed(!collapsed);setMobileOpen(false);}} className="hidden lg:flex items-center justify-center py-3 border-t border-slate-700/40 text-slate-500 hover:text-slate-300 transition-colors">{collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button>
  </div>;

  return <>
    <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/40 z-40 transition-all duration-300 ${collapsed?"w-[68px]":"w-[230px]"}`}>{inner}</aside>
    {mobileOpen&&<div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`lg:hidden fixed left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-700/40 z-50 transition-transform duration-300 ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>
      <button onClick={()=>setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
      {inner}
    </aside>
  </>;
}

function Topbar({setMobileOpen,role,setRole}){
  return <header className="fixed top-0 right-0 left-0 lg:left-auto z-30 h-14 flex items-center justify-between px-4 lg:px-6 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30">
    <div className="flex items-center gap-3">
      <button onClick={()=>setMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"><Menu size={20}/></button>
      <div className="hidden md:flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/30 w-[240px]"><Search size={15} className="text-slate-500"/><input className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full" placeholder="Buscar..."/></div>
    </div>
    <div className="flex items-center gap-2">
      <button className="relative p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white"><Bell size={17}/><span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">5</span></button>
      <div className="flex items-center gap-2 pl-2 border-l border-slate-700/40">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">AV</div>
        <div className="hidden md:block"><div className="text-xs font-semibold text-slate-200">Álvaro V.</div><div className="text-[10px] text-slate-500">{ROLE_META[role].label}</div></div>
      </div>
      <button onClick={()=>setRole(null)} className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white" title="Cambiar perfil"><LogOut size={16}/></button>
    </div>
  </header>;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD CRM
   ═══════════════════════════════════════════════════════════════ */
function DashCRM({clientes,crm,toast}){
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),900);return()=>clearTimeout(t);},[]);
  const activos=clientes.filter(c=>c.estado_relacion==="Cliente Activo").length;
  const morosos=clientes.filter(c=>c.estado_relacion==="En Litigio/Moroso").length;
  const prospectos=clientes.filter(c=>c.estado_relacion==="Prospecto").length;
  const cotizando=clientes.filter(c=>c.estado_relacion==="Cotizando").length;
  const b2b=clientes.filter(c=>c.tipo_cliente==="B2B").length;
  const b2c=clientes.filter(c=>c.tipo_cliente==="B2C").length;
  const pie=[{name:"Activos",value:activos,color:"#22c55e"},{name:"Morosos",value:morosos,color:"#ef4444"},{name:"Prospectos",value:prospectos,color:"#38bdf8"},{name:"Cotizando",value:cotizando,color:"#a78bfa"}];
  const recentCRM=[...crm].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto)).slice(0,6);
  const iconMap={Llamada:Phone,Email:Mail,"Visita a Obra":MapPin,"Mensaje de WhatsApp":MessageSquare};

  if(loading) return <div className="space-y-6"><Sk c="h-7 w-48"/><div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><Sk key={i} c="h-28"/>)}</div></div>;

  return <div className="space-y-6 animate-fI">
    <div><h1 className="text-xl lg:text-2xl font-bold text-white">Dashboard CRM</h1><p className="text-sm text-slate-500 mt-0.5">Gestión de relaciones con clientes — {new Date().toLocaleDateString("es-PA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
      <KPI title="Clientes Activos" value={activos} sub={`de ${clientes.length} totales`} icon={Users} accent="emerald"/>
      <KPI title="En Litigio/Moroso" value={morosos} icon={AlertTriangle} accent="red"/>
      <KPI title="Prospectos" value={prospectos} icon={Target} accent="sky"/>
      <KPI title="Cotizando" value={cotizando} icon={FileText} accent="violet"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Distribución de Clientes</h3>
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{pie.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,fontSize:12}}/></PieChart></ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">{pie.map(d=><div key={d.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/><span className="text-[11px] text-slate-400">{d.name} ({d.value})</span></div>)}</div>
      </div>
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Tipo de Cliente</h3>
        <ResponsiveContainer width="100%" height={180}><BarChart data={[{name:"B2B",count:b2b},{name:"B2C",count:b2c}]} barSize={40}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:12}}/><YAxis tick={{fill:"#64748b",fontSize:11}}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,fontSize:12}}/><Bar dataKey="count" fill="#38bdf8" radius={[6,6,0,0]} name="Clientes"/></BarChart></ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Clientes Morosos</h3>
        <div className="space-y-2">{clientes.filter(c=>c.estado_relacion==="En Litigio/Moroso").slice(0,5).map(c=>
          <div key={c.id_cliente} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-[11px] font-bold text-red-400">{c.razon_social_nombre.charAt(0)}</div>
            <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-slate-200 truncate">{c.razon_social_nombre}</div><div className="text-[10px] text-slate-500">{c.contacto_principal}</div></div>
          </div>
        )}</div>
      </div>
    </div>
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Actividad CRM Reciente</h3>
      <div className="space-y-2.5">{recentCRM.map(b=>{
        const I=iconMap[b.tipo_contacto]||Info;
        const pry=PROYECTOS.find(p=>p.id_proyecto===b.id_proyecto);
        return <div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/15">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0"><I size={15} className="text-sky-400"/></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-semibold text-slate-200">{b.tipo_contacto}</span><span className="text-[10px] text-slate-600">•</span><span className="text-[11px] text-slate-500">{fmtDate(b.fecha_contacto)}</span>{pry&&<><span className="text-[10px] text-slate-600">•</span><span className="text-[11px] text-sky-400/70">{pry.nombre_proyecto}</span></>}</div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{b.notas_acuerdos}</p>
            {b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>Promesa: {fmtDate(b.promesa_pago)}</div>}
          </div>
        </div>;
      })}</div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD COBROS
   ═══════════════════════════════════════════════════════════════ */
function DashCobros(){
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),900);return()=>clearTimeout(t);},[]);
  const pendientes=FACTURAS.filter(f=>f.estado_cobro==="Pendiente");
  const disputas=FACTURAS.filter(f=>f.estado_cobro==="En Disputa Técnica");
  const parciales=FACTURAS.filter(f=>f.estado_cobro==="Pago Parcial");
  const totalPendiente=pendientes.reduce((s,f)=>s+f.monto_facturado,0);
  const totalDisputa=disputas.reduce((s,f)=>s+f.monto_facturado,0);
  const totalMora=FACTURAS.filter(f=>f.dias_mora>0).reduce((s,f)=>s+f.monto_facturado,0);
  const totalCartera=FACTURAS.filter(f=>f.estado_cobro!=="Pagado").reduce((s,f)=>s+f.monto_facturado,0);

  const urgentes=[...FACTURAS].filter(f=>f.estado_cobro!=="Pagado"&&f.dias_mora>0).sort((a,b)=>b.dias_mora-a.dias_mora);
  const pieData=[{name:"Pendiente",value:pendientes.reduce((s,f)=>s+f.monto_facturado,0),color:"#f59e0b"},{name:"Disputa",value:totalDisputa,color:"#f97316"},{name:"Pago Parcial",value:parciales.reduce((s,f)=>s+f.monto_facturado,0),color:"#eab308"}];

  if(loading) return <div className="space-y-6"><Sk c="h-7 w-48"/><div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><Sk key={i} c="h-28"/>)}</div></div>;

  return <div className="space-y-6 animate-fI">
    <div><h1 className="text-xl lg:text-2xl font-bold text-white">Dashboard de Cobros</h1><p className="text-sm text-slate-500 mt-0.5">Control de cartera y facturación — {new Date().toLocaleDateString("es-PA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
      <KPI title="Cartera por Cobrar" value={fmt(totalCartera)} sub={`${FACTURAS.filter(f=>f.estado_cobro!=="Pagado").length} facturas`} icon={CircleDollarSign} accent="sky"/>
      <KPI title="Monto en Mora" value={fmt(totalMora)} sub={`${FACTURAS.filter(f=>f.dias_mora>0).length} facturas vencidas`} icon={AlertTriangle} accent="red"/>
      <KPI title="En Disputa Técnica" value={fmt(totalDisputa)} sub={`${disputas.length} facturas`} icon={FileWarning} accent="orange"/>
      <KPI title="Pendiente de Cobro" value={fmt(totalPendiente)} sub={`${pendientes.length} facturas`} icon={Clock} accent="amber"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Composición Cartera Pendiente</h3>
        <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,fontSize:12}}/></PieChart></ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">{pieData.map(d=><div key={d.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/><span className="text-[11px] text-slate-400">{d.name}</span></div>)}</div>
      </div>
      <div className="lg:col-span-3 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Facturas con Mora</h3>
        <div className="space-y-2">{urgentes.slice(0,6).map(f=>{
          const pry=PROYECTOS.find(p=>p.id_proyecto===f.id_proyecto);const cli=pry?INITIAL_CLIENTES.find(c=>c.id_cliente===pry.id_cliente):null;
          return <div key={f.id_factura} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/20">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.dias_mora>60?"bg-red-500/15":f.dias_mora>20?"bg-amber-500/15":"bg-yellow-500/15"}`}><Clock size={16} className={f.dias_mora>60?"text-red-400":f.dias_mora>20?"text-amber-400":"text-yellow-400"}/></div>
            <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-slate-200 truncate">{f.id_factura} — {cli?.razon_social_nombre||"—"}</div><div className="text-[11px] text-slate-500 truncate">{f.hitos_concepto}</div></div>
            <div className="text-right flex-shrink-0"><div className="text-sm font-bold text-white">{fmt(f.monto_facturado)}</div><div className={`text-[10px] font-semibold ${f.dias_mora>60?"text-red-400":"text-amber-400"}`}>{f.dias_mora}d mora</div></div>
          </div>;
        })}</div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   CLIENTES VIEW + NEW CLIENT FORM
   ═══════════════════════════════════════════════════════════════ */
function ClientesView({clientes,setClientes,toast}){
  const [search,setSearch]=useState("");
  const [filterE,setFilterE]=useState("Todos");
  const [showForm,setShowForm]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),700);return()=>clearTimeout(t);},[]);

  const emptyClient={tipo_cliente:"B2B",razon_social_nombre:"",ruc_cedula:"",contacto_principal:"",telefono_whatsapp:"+507 ",email_facturacion:"",estado_relacion:"Prospecto"};
  const [form,setForm]=useState(emptyClient);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

  const save=()=>{
    if(!form.razon_social_nombre||!form.ruc_cedula){toast("Completa los campos obligatorios","error");return;}
    const newC={...form,id_cliente:`CLI-${String(clientes.length+1).padStart(3,"0")}`};
    setClientes(p=>[...p,newC]);
    toast("Cliente creado exitosamente");
    setForm(emptyClient);setShowForm(false);
  };

  const filtered=clientes.filter(c=>{
    const ms=c.razon_social_nombre.toLowerCase().includes(search.toLowerCase())||c.ruc_cedula.toLowerCase().includes(search.toLowerCase())||c.contacto_principal.toLowerCase().includes(search.toLowerCase());
    const me=filterE==="Todos"||c.estado_relacion===filterE;
    return ms&&me;
  });

  if(loading) return <div className="space-y-4"><Sk c="h-7 w-48"/><Sk c="h-10 w-full"/><Sk c="h-64 w-full"/></div>;

  return <div className="space-y-5 animate-fI">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><h1 className="text-xl lg:text-2xl font-bold text-white">Directorio de Clientes</h1><p className="text-sm text-slate-500 mt-0.5">{clientes.length} clientes registrados</p></div>
      <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 hover:bg-sky-500/25 transition-all text-sm font-semibold"><UserPlus size={16}/>Nuevo Cliente</button>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-700/30"><Search size={15} className="text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full" placeholder="Buscar por nombre, RUC o contacto..."/></div>
      <div className="flex gap-1.5 flex-wrap">{["Todos","Cliente Activo","Prospecto","Cotizando","En Litigio/Moroso"].map(e=><button key={e} onClick={()=>setFilterE(e)} className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap ${filterE===e?"bg-sky-500/15 text-sky-400 border border-sky-500/20":"bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:border-slate-600/50"}`}>{e}</button>)}</div>
    </div>

    {/* Mobile cards */}
    <div className="lg:hidden space-y-2.5">{filtered.length===0?<div className="text-center py-12 text-slate-500"><Users size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">No se encontraron clientes.</p></div>:filtered.map(c=>
      <div key={c.id_cliente} className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
        <div className="flex items-start justify-between mb-1.5"><div className="flex-1 min-w-0"><div className="text-sm font-semibold text-white truncate">{c.razon_social_nombre}</div><div className="text-[11px] text-slate-500">{c.contacto_principal}</div></div><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 ${badge(c.estado_relacion)}`}>{c.estado_relacion}</span></div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1"><span className="flex items-center gap-1"><Hash size={10}/>{c.ruc_cedula}</span></div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5"><span className="flex items-center gap-1"><Phone size={10}/>{c.telefono_whatsapp}</span><span className="flex items-center gap-1"><Mail size={10}/>{c.email_facturacion}</span></div>
        <div className="mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400 inline-block">{c.tipo_cliente}</div>
      </div>
    )}</div>

    {/* Desktop table */}
    <div className="hidden lg:block rounded-2xl border border-slate-700/40 bg-slate-800/20 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-700/30">{["Empresa / Nombre","RUC / Cédula","Tipo","Contacto","Teléfono","Email","Estado"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead><tbody>{filtered.map(c=>
      <tr key={c.id_cliente} className="border-b border-slate-700/15 hover:bg-slate-800/40 transition-colors">
        <td className="px-4 py-3"><div className="text-sm font-semibold text-slate-200">{c.razon_social_nombre}</div><div className="text-[10px] text-slate-500">{c.id_cliente}</div></td>
        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{c.ruc_cedula}</td>
        <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.tipo_cliente==="B2B"?"bg-sky-500/10 text-sky-400 border border-sky-500/15":"bg-violet-500/10 text-violet-400 border border-violet-500/15"}`}>{c.tipo_cliente}</span></td>
        <td className="px-4 py-3 text-xs text-slate-300">{c.contacto_principal}</td>
        <td className="px-4 py-3 text-xs text-slate-400">{c.telefono_whatsapp}</td>
        <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate">{c.email_facturacion}</td>
        <td className="px-4 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badge(c.estado_relacion)}`}>{c.estado_relacion}</span></td>
      </tr>
    )}</tbody></table></div>{filtered.length===0&&<div className="text-center py-16 text-slate-500"><Users size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">Sin resultados.</p></div>}</div>

    {/* New Client Modal */}
    <Modal open={showForm} onClose={()=>setShowForm(false)} title="Nuevo Cliente" wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Razón Social / Nombre" value={form.razon_social_nombre} onChange={v=>upd("razon_social_nombre",v)} placeholder="Ej: Constructora ABC, S.A." required/>
        <Input label="RUC / Cédula" value={form.ruc_cedula} onChange={v=>upd("ruc_cedula",v)} placeholder="Ej: 155698-1-12345 DV 12" required/>
        <Input label="Tipo de Cliente" value={form.tipo_cliente} onChange={v=>upd("tipo_cliente",v)} options={["B2B","B2C"]}/>
        <Input label="Contacto Principal" value={form.contacto_principal} onChange={v=>upd("contacto_principal",v)} placeholder="Nombre completo"/>
        <Input label="Teléfono / WhatsApp" value={form.telefono_whatsapp} onChange={v=>upd("telefono_whatsapp",v)} placeholder="+507 6XXX-XXXX"/>
        <Input label="Email Facturación" value={form.email_facturacion} onChange={v=>upd("email_facturacion",v)} type="email" placeholder="correo@empresa.com"/>
        <div className="sm:col-span-2"><Input label="Estado Relación" value={form.estado_relacion} onChange={v=>upd("estado_relacion",v)} options={["Prospecto","Cotizando","Cliente Activo","En Litigio/Moroso"]}/></div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/30">
        <button onClick={()=>setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors"><Save size={15}/>Guardar Cliente</button>
      </div>
    </Modal>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   PROYECTOS VIEW
   ═══════════════════════════════════════════════════════════════ */
function ProyectosView({clientes,setView,setSelProject}){
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),700);return()=>clearTimeout(t);},[]);
  if(loading) return <div className="space-y-4"><Sk c="h-7 w-48"/><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><Sk key={i} c="h-44"/>)}</div></div>;
  return <div className="space-y-5 animate-fI">
    <div><h1 className="text-xl lg:text-2xl font-bold text-white">Proyectos</h1><p className="text-sm text-slate-500 mt-0.5">{PROYECTOS.length} proyectos en gestión</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{PROYECTOS.map(p=>{
      const cli=clientes.find(c=>c.id_cliente===p.id_cliente);
      const facs=FACTURAS.filter(f=>f.id_proyecto===p.id_proyecto);
      const facturado=facs.reduce((s,f)=>s+f.monto_facturado,0);
      const pctFac=p.presupuesto_aprobado>0?Math.round(facturado/p.presupuesto_aprobado*100):0;
      return <div key={p.id_proyecto} onClick={()=>{setSelProject(p.id_proyecto);setView("proyecto-360");}} className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5 hover:border-sky-500/20 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-2"><div className="flex-1 min-w-0"><div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors truncate">{p.nombre_proyecto}</div><div className="text-[11px] text-slate-500 mt-0.5">{cli?.razon_social_nombre||p.id_cliente}</div></div><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 ${badge(p.estado_obra)}`}>{p.estado_obra}</span></div>
        <div className="text-[11px] text-slate-500 mb-3">PM: {p.project_manager} • {fmtDate(p.fecha_inicio)}</div>
        <div className="mb-3"><div className="flex justify-between text-[11px] mb-1"><span className="text-slate-400">Facturado vs Presupuesto</span><span className="font-semibold text-white">{pctFac}%</span></div><div className="h-2 rounded-full bg-slate-700/50 overflow-hidden"><div className={`h-full rounded-full ${pctFac>=70?"bg-emerald-500":pctFac>=40?"bg-sky-500":"bg-amber-500"}`} style={{width:`${Math.min(pctFac,100)}%`}}/></div></div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/20"><div><div className="text-[10px] text-slate-500">Presupuesto</div><div className="text-xs font-semibold text-slate-200">{fmt(p.presupuesto_aprobado)}</div></div><div><div className="text-[10px] text-slate-500">Facturado</div><div className="text-xs font-semibold text-sky-400">{fmt(facturado)}</div></div></div>
      </div>;
    })}</div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   PROYECTO 360 VIEW
   ═══════════════════════════════════════════════════════════════ */
function Proyecto360({projectId,setView,clientes,crm}){
  const [tab,setTab]=useState("facturas");
  const p=PROYECTOS.find(pr=>pr.id_proyecto===projectId);
  const cli=p?clientes.find(c=>c.id_cliente===p.id_cliente):null;
  const facs=FACTURAS.filter(f=>f.id_proyecto===projectId);
  const bits=crm.filter(b=>b.id_proyecto===projectId);
  const facturado=facs.reduce((s,f)=>s+f.monto_facturado,0);
  if(!p) return <div className="text-slate-400 text-center py-20">Proyecto no encontrado</div>;
  return <div className="space-y-5 animate-fI">
    <button onClick={()=>setView("proyectos")} className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"><ChevronLeft size={14}/> Volver</button>
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div><h1 className="text-xl font-bold text-white">{p.nombre_proyecto}</h1><div className="text-sm text-slate-400 mt-0.5">{cli?.razon_social_nombre}</div>
          <div className="flex items-center gap-3 mt-2 flex-wrap"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badge(p.estado_obra)}`}>{p.estado_obra}</span><span className="text-xs text-slate-500">PM: {p.project_manager}</span><span className="text-xs text-slate-500">{fmtDate(p.fecha_inicio)}</span></div>
        </div>
        <div className="text-right"><div className="text-2xl font-bold text-white">{fmt(p.presupuesto_aprobado)}</div><div className="text-xs text-slate-500">Presupuesto aprobado</div></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{[{l:"Facturado",v:fmt(facturado),c:"text-sky-400"},{l:"Pagado",v:fmt(facs.filter(f=>f.estado_cobro==="Pagado").reduce((s,f)=>s+f.monto_facturado,0)),c:"text-emerald-400"},{l:"Por cobrar",v:fmt(facs.filter(f=>f.estado_cobro!=="Pagado").reduce((s,f)=>s+f.monto_facturado,0)),c:"text-amber-400"}].map(m=><div key={m.l} className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/15"><div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.l}</div><div className={`text-lg font-bold ${m.c}`}>{m.v}</div></div>)}</div>
    </div>
    <div className="flex gap-1 bg-slate-800/40 rounded-xl p-1 border border-slate-700/30 w-fit">
      {[{id:"facturas",l:"Cuentas por Cobrar",n:facs.length},{id:"bitacora",l:"Bitácora CRM",n:bits.length}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t.id?"bg-sky-500/15 text-sky-400":"text-slate-400 hover:text-slate-200"}`}>{t.l} ({t.n})</button>)}
    </div>
    {tab==="facturas"&&<div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 overflow-hidden">{facs.length===0?<div className="text-center py-12 text-slate-500"><Receipt size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">No hay facturas.</p></div>:<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-700/30">{["Factura","Concepto","Monto","Emisión","Vencimiento","Estado","Mora"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead><tbody>{facs.map(f=>
      <tr key={f.id_factura} className="border-b border-slate-700/15 hover:bg-slate-800/40"><td className="px-4 py-3 text-xs font-mono text-sky-400">{f.id_factura}</td><td className="px-4 py-3 text-xs text-slate-300 max-w-[200px] truncate">{f.hitos_concepto}</td><td className="px-4 py-3 text-sm font-bold text-white">{fmt(f.monto_facturado)}</td><td className="px-4 py-3 text-xs text-slate-400">{fmtDate(f.fecha_emision)}</td><td className="px-4 py-3 text-xs text-slate-400">{fmtDate(f.fecha_vencimiento)}</td><td className="px-4 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badge(f.estado_cobro)}`}>{f.estado_cobro}</span></td><td className="px-4 py-3 text-xs font-bold">{f.dias_mora>0?<span className="text-red-400">{f.dias_mora}d</span>:<span className="text-slate-500">—</span>}</td></tr>
    )}</tbody></table></div>}</div>}
    {tab==="bitacora"&&<div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-5">{bits.length===0?<div className="text-center py-12 text-slate-500"><Info size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">Sin entradas de bitácora.</p></div>:<div className="space-y-2.5">{bits.map(b=>{const iconMap={Llamada:Phone,Email:Mail,"Visita a Obra":MapPin,"Mensaje de WhatsApp":MessageSquare};const I=iconMap[b.tipo_contacto]||Info;return <div key={b.id_interaccion} className="flex gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/15"><div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0"><I size={15} className="text-sky-400"/></div><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-semibold text-slate-200">{b.tipo_contacto}</span><span className="text-[11px] text-slate-500">{fmtDate(b.fecha_contacto)}</span></div><p className="text-xs text-slate-400 mt-0.5">{b.notas_acuerdos}</p>{b.promesa_pago&&<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15 inline-flex items-center gap-1"><Calendar size={9}/>Promesa: {fmtDate(b.promesa_pago)}</div>}</div></div>;})}</div>}</div>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   COBROS (CARTERA) VIEW
   ═══════════════════════════════════════════════════════════════ */
function CobrosView({clientes}){
  const [filter,setFilter]=useState("Todas");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),700);return()=>clearTimeout(t);},[]);
  const filtered=filter==="Todas"?FACTURAS:filter==="Disputa"?FACTURAS.filter(f=>f.estado_cobro==="En Disputa Técnica"):FACTURAS.filter(f=>f.estado_cobro===filter);
  if(loading) return <div className="space-y-4"><Sk c="h-7 w-48"/><Sk c="h-10 w-full"/><Sk c="h-64 w-full"/></div>;
  return <div className="space-y-5 animate-fI">
    <div><h1 className="text-xl lg:text-2xl font-bold text-white">Gestión de Cartera</h1><p className="text-sm text-slate-500 mt-0.5">{FACTURAS.length} facturas en sistema</p></div>
    <div className="flex gap-1.5 flex-wrap">{["Todas","Pendiente","Pagado","Pago Parcial","Disputa"].map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter===f?"bg-sky-500/15 text-sky-400 border border-sky-500/20":"bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:border-slate-600/50"}`}>{f}</button>)}</div>
    <div className="lg:hidden space-y-2.5">{filtered.map(f=>{const pry=PROYECTOS.find(p=>p.id_proyecto===f.id_proyecto);const cli=pry?clientes.find(c=>c.id_cliente===pry.id_cliente):null;return <div key={f.id_factura} className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4"><div className="flex items-start justify-between mb-1"><div><span className="text-xs font-mono text-sky-400">{f.id_factura}</span><div className="text-sm font-bold text-white mt-0.5">{fmt(f.monto_facturado)}</div></div><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${badge(f.estado_cobro)}`}>{f.estado_cobro}</span></div><div className="text-xs text-slate-400 truncate">{f.hitos_concepto}</div><div className="text-[11px] text-slate-500 mt-0.5">{cli?.razon_social_nombre}</div>{f.dias_mora>0&&<div className="text-[11px] text-red-400 font-semibold mt-1">{f.dias_mora} días en mora</div>}</div>;})}</div>
    <div className="hidden lg:block rounded-2xl border border-slate-700/40 bg-slate-800/20 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-700/30">{["Factura","Proyecto","Cliente","Concepto","Monto","Vencimiento","Estado","Mora"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead><tbody>{filtered.map(f=>{const pry=PROYECTOS.find(p=>p.id_proyecto===f.id_proyecto);const cli=pry?clientes.find(c=>c.id_cliente===pry.id_cliente):null;return <tr key={f.id_factura} className="border-b border-slate-700/15 hover:bg-slate-800/40"><td className="px-4 py-3 text-xs font-mono text-sky-400">{f.id_factura}</td><td className="px-4 py-3 text-xs text-slate-300">{pry?.nombre_proyecto||"—"}</td><td className="px-4 py-3 text-xs text-slate-400">{cli?.razon_social_nombre||"—"}</td><td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate">{f.hitos_concepto}</td><td className="px-4 py-3 text-sm font-bold text-white">{fmt(f.monto_facturado)}</td><td className="px-4 py-3 text-xs text-slate-400">{fmtDate(f.fecha_vencimiento)}</td><td className="px-4 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badge(f.estado_cobro)}`}>{f.estado_cobro}</span></td><td className="px-4 py-3 text-xs font-bold">{f.dias_mora>0?<span className="text-red-400">{f.dias_mora}d</span>:<span className="text-slate-500">—</span>}</td></tr>;})}</tbody></table></div></div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   BITACORA CRM VIEW + NEW ENTRY FORM
   ═══════════════════════════════════════════════════════════════ */
function BitacoraView({crm,setCrm,toast}){
  const [showForm,setShowForm]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),700);return()=>clearTimeout(t);},[]);
  const emptyEntry={id_proyecto:"PRJ-001",fecha_contacto:new Date().toISOString().slice(0,10),tipo_contacto:"Llamada",notas_acuerdos:"",promesa_pago:""};
  const [form,setForm]=useState(emptyEntry);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{
    if(!form.notas_acuerdos){toast("Agrega una nota o acuerdo","error");return;}
    const newE={...form,id_interaccion:`INT-${String(crm.length+1).padStart(3,"0")}`};
    setCrm(p=>[newE,...p]);
    toast("Interacción registrada exitosamente");
    setForm(emptyEntry);setShowForm(false);
  };
  const sorted=[...crm].sort((a,b)=>b.fecha_contacto.localeCompare(a.fecha_contacto));
  const iconMap={Llamada:Phone,Email:Mail,"Visita a Obra":MapPin,"Mensaje de WhatsApp":MessageSquare};

  if(loading) return <div className="space-y-4"><Sk c="h-7 w-48"/><Sk c="h-64 w-full"/></div>;

  return <div className="space-y-5 animate-fI">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><h1 className="text-xl lg:text-2xl font-bold text-white">Bitácora CRM</h1><p className="text-sm text-slate-500 mt-0.5">{crm.length} interacciones registradas</p></div>
      <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all text-sm font-semibold"><Plus size={16}/>Nueva Interacción</button>
    </div>
    <div className="space-y-3">{sorted.map(b=>{
      const I=iconMap[b.tipo_contacto]||Info;const pry=PROYECTOS.find(p=>p.id_proyecto===b.id_proyecto);const cli=pry?INITIAL_CLIENTES.find(c=>c.id_cliente===pry.id_cliente):null;
      return <div key={b.id_interaccion} className="flex gap-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/40 transition-all">
        <div className="hidden sm:flex flex-col items-center gap-1 pt-1"><div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center"><I size={17} className="text-sky-400"/></div><div className="w-px flex-1 bg-slate-700/30"/></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${b.tipo_contacto==="Llamada"?"bg-sky-500/10 text-sky-400 border-sky-500/15":b.tipo_contacto==="Email"?"bg-violet-500/10 text-violet-400 border-violet-500/15":b.tipo_contacto==="Visita a Obra"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/15":"bg-amber-500/10 text-amber-400 border-amber-500/15"}`}>{b.tipo_contacto}</span>
            <span className="text-[11px] text-slate-500">{fmtDate(b.fecha_contacto)}</span>
            {pry&&<span className="text-[11px] text-sky-400/60">{pry.nombre_proyecto}</span>}
            {cli&&<span className="text-[11px] text-slate-500">• {cli.razon_social_nombre}</span>}
          </div>
          <p className="text-sm text-slate-300">{b.notas_acuerdos}</p>
          {b.promesa_pago&&<div className="mt-2 text-[11px] px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/15 inline-flex items-center gap-1.5"><Calendar size={11}/>Promesa de pago: {fmtDate(b.promesa_pago)}</div>}
        </div>
      </div>;
    })}</div>

    {/* New CRM Entry Modal */}
    <Modal open={showForm} onClose={()=>setShowForm(false)} title="Registrar Interacción CRM" wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Proyecto" value={form.id_proyecto} onChange={v=>upd("id_proyecto",v)} options={PROYECTOS.map(p=>`${p.id_proyecto}`)}/>
        <Input label="Tipo de Contacto" value={form.tipo_contacto} onChange={v=>upd("tipo_contacto",v)} options={["Llamada","Email","Visita a Obra","Mensaje de WhatsApp"]}/>
        <Input label="Fecha de Contacto" value={form.fecha_contacto} onChange={v=>upd("fecha_contacto",v)} type="date"/>
        <Input label="Promesa de Pago (opcional)" value={form.promesa_pago} onChange={v=>upd("promesa_pago",v)} type="date"/>
        <div className="sm:col-span-2"><Input label="Notas / Acuerdos" value={form.notas_acuerdos} onChange={v=>upd("notas_acuerdos",v)} textarea placeholder="Describe los acuerdos, compromisos o hallazgos de esta interacción..." required/></div>
      </div>
      {form.id_proyecto&&<div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/20">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Proyecto seleccionado</div>
        <div className="text-sm text-slate-200">{PROYECTOS.find(p=>p.id_proyecto===form.id_proyecto)?.nombre_proyecto}</div>
        <div className="text-xs text-slate-400">{INITIAL_CLIENTES.find(c=>c.id_cliente===PROYECTOS.find(p=>p.id_proyecto===form.id_proyecto)?.id_cliente)?.razon_social_nombre}</div>
      </div>}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/30">
        <button onClick={()=>setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"><Save size={15}/>Registrar</button>
      </div>
    </Modal>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function App(){
  const [role,setRole]=useState(null);
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [view,setView]=useState(null);
  const [selProject,setSelProject]=useState(null);
  const [clientes,setClientes]=useState(INITIAL_CLIENTES);
  const [crm,setCrm]=useState(INITIAL_CRM);
  const [toasts,setToasts]=useState([]);

  useEffect(()=>{
    if(!role)return;
    if(role===ROLES.ADMIN||role===ROLES.CRM) setView("dash-crm");
    else setView("dash-cobros");
  },[role]);

  const toast=(msg,type="success")=>{const id=Date.now();setToasts(p=>[...p,{id,message:msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);};
  const removeToast=(id)=>setToasts(p=>p.filter(t=>t.id!==id));

  if(!role) return <><style>{CSS}</style><RoleSelector setRole={setRole}/></>;

  const renderView=()=>{
    switch(view){
      case "dash-crm": return <DashCRM clientes={clientes} crm={crm} toast={toast}/>;
      case "dash-cobros": return <DashCobros/>;
      case "clientes": return <ClientesView clientes={clientes} setClientes={setClientes} toast={toast}/>;
      case "proyectos": return <ProyectosView clientes={clientes} setView={setView} setSelProject={setSelProject}/>;
      case "proyecto-360": return <Proyecto360 projectId={selProject} setView={setView} clientes={clientes} crm={crm}/>;
      case "cobros": return <CobrosView clientes={clientes}/>;
      case "bitacora": return <BitacoraView crm={crm} setCrm={setCrm} toast={toast}/>;
      default: return <DashCRM clientes={clientes} crm={crm} toast={toast}/>;
    }
  };

  return <>
    <style>{CSS}</style>
    <div className="min-h-screen bg-[#0b1120]">
      <div className="fixed inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(circle at 20% 20%, rgba(56,189,248,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.03) 0%, transparent 50%)"}}/>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} role={role}/>
      <Topbar setMobileOpen={setMobileOpen} role={role} setRole={setRole}/>
      <main className={`pt-14 transition-all duration-300 ${collapsed?"lg:pl-[68px]":"lg:pl-[230px]"}`}>
        <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">{renderView()}</div>
      </main>
      <Toast toasts={toasts} remove={removeToast}/>
    </div>
  </>;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
*{font-family:'DM Sans',system-ui,sans-serif;box-sizing:border-box}
body{margin:0;background:#0b1120;color:#e2e8f0;-webkit-font-smoothing:antialiased}
@keyframes fI{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes sU{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.animate-fI{animation:fI .4s ease-out both}
.animate-sU{animation:sU .3s ease-out both}
.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:10px}::-webkit-scrollbar-thumb:hover{background:#475569}
`;
