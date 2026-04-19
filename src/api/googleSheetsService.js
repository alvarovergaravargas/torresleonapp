// src/api/googleSheetsService.js
// ═══════════════════════════════════════════════════════════
// TorresLeón - Capa de Servicio Frontend → Google Sheets
// ═══════════════════════════════════════════════════════════
//
// Uso:
//   import api from './api/googleSheetsService';
//   const clientes = await api.clientes.getAll();
//   await api.clientes.create({ razon_social_nombre: "...", ... });
//   await api.clientes.update("CLI-001", { estado_relacion: "Activo" });
//

const BASE = '/.netlify/functions/sheets';

async function request(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}/${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error de red');
  }
  return res.json();
}

// ─── Helpers genéricos por hoja ───
function createSheetAPI(sheetKey, idCol) {
  return {
    getAll: () => request(sheetKey),
    create: (data) => request(sheetKey, 'POST', data),
    update: (id, data) => request(sheetKey, 'PUT', { _idCol: idCol, _idVal: id, ...data }),
  };
}

// ─── APIs por módulo ───
const api = {
  clientes: createSheetAPI('clientes', 'id_cliente'),
  proyectos: createSheetAPI('proyectos', 'id_proyecto'),
  cuentas: createSheetAPI('cuentas', 'id_factura'),
  pagos: createSheetAPI('pagos', 'id_pago'),
  crm: createSheetAPI('crm', 'id_interaccion'),
  tareas: createSheetAPI('tareas', 'id_tarea'),

  // Cargar todo en paralelo (para inicialización)
  async loadAll() {
    const [clientes, proyectos, cuentas, pagos, crm, tareas] = await Promise.all([
      this.clientes.getAll(),
      this.proyectos.getAll(),
      this.cuentas.getAll(),
      this.pagos.getAll(),
      this.crm.getAll(),
      this.tareas.getAll(),
    ]);
    return { clientes, proyectos, cuentas, pagos, crm, tareas };
  },
};

export default api;


// ═══════════════════════════════════════════════════════════
// EJEMPLO DE USO EN REACT (cómo integrar en tu App):
// ═══════════════════════════════════════════════════════════
//
// import api from './api/googleSheetsService';
//
// // En tu App component:
// const [loading, setLoading] = useState(true);
//
// useEffect(() => {
//   api.loadAll().then(data => {
//     setCls(data.clientes);
//     sPrjs(data.proyectos);
//     sFacs(data.cuentas);
//     sCrm(data.crm);
//     sTasks(data.tareas);
//     setLoading(false);
//   }).catch(err => {
//     console.error('Error cargando datos:', err);
//     toast('Error al conectar con Google Sheets', 'error');
//     setLoading(false);
//   });
// }, []);
//
// // Al crear un cliente:
// const saveCliente = async (clienteData) => {
//   try {
//     await api.clientes.create(clienteData);
//     setCls(prev => [...prev, clienteData]);
//     toast('Cliente guardado en Google Sheets');
//   } catch (err) {
//     toast('Error al guardar', 'error');
//   }
// };
//
// // Al actualizar una factura:
// const updateFactura = async (id, data) => {
//   try {
//     await api.cuentas.update(id, data);
//     setFacs(prev => prev.map(f => f.id_factura === id ? {...f, ...data} : f));
//     toast('Factura actualizada');
//   } catch (err) {
//     toast('Error al actualizar', 'error');
//   }
// };
