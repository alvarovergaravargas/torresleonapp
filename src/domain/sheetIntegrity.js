// Generic Google Sheets data-integrity helpers, shared by every sheet-backed entity
// (Clientes, Prospectos, Proyectos, CRM, Tareas, Cuentas_por_cobrar, contacto_cliente).

// Formula errors that can leak into a sheet cell when a linked/lookup formula breaks upstream.
const ERROR_VALUE_PATTERN = /^#(ERROR|REF|N\/A|VALUE|DIV\/0|NAME\?|NULL|NUM)!?$/i;

export const isErrorValue = (value) => {
  if (value === null || value === undefined) return false;
  return ERROR_VALUE_PATTERN.test(String(value).trim());
};

// Formula-error garbage should never persist in app state or get written back to a sheet.
export const sanitizeValue = (value) => (isErrorValue(value) ? "" : value);

export const sanitizeRecord = (record) => {
  if (!record || typeof record !== "object") return record;
  const clean = {};
  Object.keys(record).forEach((key) => {
    clean[key] = sanitizeValue(record[key]);
  });
  return clean;
};

// Canonical status vocabulary going forward. Sheets accumulated over time also contain the
// legacy Spanish values ("activo"/"eliminado") — normalizeStatus keeps reading those correctly
// so a mixed-vocabulary column never gets misclassified.
export const STATUS = { ACTIVE: "active", DELETED: "deleted", INACTIVE: "inactive" };

const LEGACY_STATUS_MAP = {
  activo: STATUS.ACTIVE,
  active: STATUS.ACTIVE,
  eliminado: STATUS.DELETED,
  deleted: STATUS.DELETED,
  borrado: STATUS.DELETED,
  inactivo: STATUS.INACTIVE,
  inactive: STATUS.INACTIVE,
  "": STATUS.ACTIVE,
};

export const normalizeStatus = (value) => {
  const key = String(value ?? "").trim().toLowerCase();
  return LEGACY_STATUS_MAP[key] || STATUS.ACTIVE;
};

export const isDeletedStatus = (value) => normalizeStatus(value) === STATUS.DELETED;

// True for any record that should still be visible in the app (active or inactive, not deleted).
export const isActiveRecord = (record) => !isDeletedStatus(record?.status);
