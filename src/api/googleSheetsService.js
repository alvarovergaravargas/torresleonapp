const API_URL = '/.netlify/functions/sheets';

// Función base para hacer las peticiones
const fetchSheet = async (sheetName, method = 'GET', data = null) => {
  // Asegurarse de codificar espacios en nombres como "Estado HR"
  const url = `${API_URL}/${encodeURIComponent(sheetName)}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Error en ${sheetName}: ${response.statusText}`);
  return response.json();
};

// Objeto con todos los métodos disponibles para tu aplicación
const googleSheetsService = {
  // Métodos GET (Leer todo)
  loadAll: async () => {
    try {
      const [clientes, proyectos, cuentas, pagos, crm, empleados, estadoHR, agenda, tareas] = await Promise.all([
        fetchSheet('Clientes'),
        fetchSheet('Proyectos'),
        fetchSheet('Cuentas_por_cobrar'),
        fetchSheet('Pagos'),
        fetchSheet('CRM'),
        fetchSheet('Empleados'),
        fetchSheet('Estado HR'),
        fetchSheet('Agenda_Trabajo'),
        fetchSheet('Tareas') // Opcional si agregaste la pestaña
      ]);

      return { clientes, proyectos, cuentas, pagos, crm, empleados, estadoHR, agenda, tareas };
    } catch (error) {
      console.error("Error cargando la base de datos:", error);
      return null;
    }
  },

  // Generadores dinámicos para Crear (POST) en cualquier tabla
  createRegistro: (sheetName, data) => fetchSheet(sheetName, 'POST', data),
};

export default googleSheetsService;
