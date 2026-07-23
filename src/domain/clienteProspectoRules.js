// Business rules that decide what belongs in `Clientes` vs `Prospectos`, and how a project
// counts (or doesn't) toward that decision.
//
// Standard (see data cleanup, 2026-07): `Clientes` holds only real clients with a real active
// project. Placeholder projects such as "Oportunidad comercial - ..." are funnel/pipeline
// entries, never proof of an active client relationship.

import { STATUS, isDeletedStatus } from "./sheetIntegrity";

// ── Projects ────────────────────────────────────────────────────────────────

const PLACEHOLDER_PROJECT_PREFIX = "oportunidad comercial";

// A project is a placeholder/opportunity stand-in, not a real engagement, when its name follows
// the "Oportunidad comercial - ..." convention or it's explicitly flagged as such.
export const isPlaceholderProject = (project) => {
  if (!project) return false;
  const name = String(project.nombre_proyecto || "").trim().toLowerCase();
  if (name.startsWith(PLACEHOLDER_PROJECT_PREFIX)) return true;
  const tipo = String(project.tipos_proyecto || "").trim().toLowerCase();
  if (tipo === PLACEHOLDER_PROJECT_PREFIX) return true;
  if (String(project.es_placeholder || "").trim().toLowerCase() === "true") return true;
  return false;
};

export const ACTIVE_PROJECT_STATES = ["Ejecución", "Entregado", "En Planificación"];

// Real (non-placeholder, non-deleted) projects belonging to a client — the only projects that
// may count toward classifying the client as real.
export const getRealProjectsForClient = (clientId, projects) =>
  (projects || []).filter(
    (p) => p.id_cliente === clientId && !isPlaceholderProject(p) && !isDeletedStatus(p.status)
  );

export const hasAnyRealProjects = (clientId, projects) =>
  getRealProjectsForClient(clientId, projects).length > 0;

export const hasRealActiveProjects = (clientId, projects) =>
  getRealProjectsForClient(clientId, projects).some((p) => ACTIVE_PROJECT_STATES.includes(p.estado_obra));

// ── Cliente / Prospecto classification ───────────────────────────────────────

// A record earns "Cliente" standing only through a real, non-placeholder project.
export const shouldBeClient = (record, projects) => hasAnyRealProjects(record?.id_cliente, projects);

export const shouldBeProspect = (record, projects) => !shouldBeClient(record, projects);

export const PROSPECTO_ESTADO_RELACION = "Prospecto";

// Values a Prospecto's estado_relacion must never carry — they describe a client, not a lead.
const INVALID_PROSPECTO_ESTADOS = new Set([
  "Cliente Activo",
  "En Prospección",
  "Cotizando",
  "En Litigio/Moroso",
]);

export const isValidProspectoEstado = (value) => String(value || "").trim() === PROSPECTO_ESTADO_RELACION;

// Collapses any legacy/garbage estado_relacion value on a Prospecto row to the single standard
// value. Prospectos only ever have one relationship state today; stage/pipeline detail belongs
// in the CRM bitácora (stage field), not here.
export const sanitizeProspectoEstado = (value) => {
  const v = String(value || "").trim();
  if (!v || INVALID_PROSPECTO_ESTADOS.has(v)) return PROSPECTO_ESTADO_RELACION;
  return PROSPECTO_ESTADO_RELACION;
};

// Values a Cliente's estado_relacion may carry. "Prospecto" is deliberately excluded — a record
// that hasn't earned client standing belongs in the Prospectos sheet, not in Clientes with a
// placeholder state.
export const CLIENTE_ESTADOS_VALIDOS = ["Cliente Activo", "Cotizando", "En Litigio/Moroso"];

export const isValidClienteEstado = (value) => CLIENTE_ESTADOS_VALIDOS.includes(value);

// ── Conversion helpers ────────────────────────────────────────────────────────

// Builds the Clientes-sheet payload for a Prospecto that won a real project.
// Reuses the prospecto's id as the new client's id (existing app convention) and additionally
// stamps id_cliente_origen so lineage survives even if that convention ever changes. If the
// prospecto itself was migrated down from a historical client, that origin id is preserved.
export const buildClienteFromProspecto = (prospecto, extra = {}) => {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id_cliente: prospecto.id_prospecto,
    tipo_cliente: prospecto.tipo_cliente,
    razon_social_nombre: prospecto.razon_social_nombre,
    ruc_cedula: prospecto.ruc_cedula,
    contacto_principal: prospecto.contacto_principal,
    telefono_whatsapp: prospecto.telefono_whatsapp,
    email_facturacion: prospecto.email_facturacion,
    estado_relacion: "Cliente Activo",
    prospectado_por: prospecto.creado_por || "",
    seguimiento_por: "",
    comentarios: prospecto.comentarios || "",
    id_cliente_origen: prospecto.id_cliente_origen || "",
    status: STATUS.ACTIVE,
    status_prospecto: "Convertido",
    fecha_conversion: now,
    ...extra,
  };
};

// Builds the CRM bitácora entry that documents a prospecto -> cliente conversion.
export const buildConversionCrmEntry = (newClientId, crmId, extra = {}) => {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id_interaccion: crmId,
    id_proyecto: "",
    id_cliente: newClientId,
    fecha_contacto: now,
    tipo_contacto: "Conversión",
    notas_acuerdos: "Prospecto convertido a Cliente Activo.",
    stage: "Ganado",
    resultado: "Positivo",
    assigned_to: "",
    next_action: "",
    next_action_date: "",
    promesa_pago: "",
    ...extra,
  };
};

// Builds the Prospectos-sheet payload for a Cliente that no longer has a real active project
// (only placeholders, or none at all). id_cliente_origen keeps the link back to the original
// client record for traceability.
export const buildProspectoFromCliente = (cliente, extra = {}) => {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id_prospecto: cliente.id_cliente,
    tipo_cliente: cliente.tipo_cliente,
    razon_social_nombre: cliente.razon_social_nombre,
    ruc_cedula: cliente.ruc_cedula,
    contacto_principal: cliente.contacto_principal,
    telefono_whatsapp: cliente.telefono_whatsapp,
    email_facturacion: cliente.email_facturacion,
    comentarios: cliente.comentarios || "",
    estado_relacion: PROSPECTO_ESTADO_RELACION,
    creado_por: cliente.seguimiento_por || cliente.prospectado_por || "",
    id_cliente_origen: cliente.id_cliente,
    Fecha_creacion: now,
    status: STATUS.ACTIVE,
    ...extra,
  };
};

// Builds the CRM bitácora entry that documents a cliente -> prospecto reclassification.
export const buildReclassificationCrmEntry = (prospectoId, crmId, extra = {}) => {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id_interaccion: crmId,
    id_proyecto: "",
    id_cliente: prospectoId,
    fecha_contacto: now,
    tipo_contacto: "Reclasificación",
    notas_acuerdos: "Cliente reclasificado a Prospecto: sin proyectos reales activos.",
    stage: "Prospección",
    resultado: "Pendiente",
    assigned_to: "",
    next_action: "",
    next_action_date: "",
    promesa_pago: "",
    ...extra,
  };
};
