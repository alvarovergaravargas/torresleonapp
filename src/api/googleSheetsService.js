const API_URL = '/.netlify/functions/sheets';

const fetchSheet = async (sheetName, method = 'GET', data = null, id = null) => {
  const baseUrl = `${API_URL}/${encodeURIComponent(sheetName)}`;
  const url = id ? `${baseUrl}?id=${encodeURIComponent(id)}` : baseUrl;

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en ${sheetName}: ${response.status} ${response.statusText} ${errorText}`);
  }
  return response.json();
};

const googleSheetsService = {
  loadAll: async () => {
    const results = await Promise.allSettled([
      fetchSheet('Clientes'),
      fetchSheet('Proyectos'),
      fetchSheet('Cuentas_por_cobrar'),
      fetchSheet('Pagos'),
      fetchSheet('CRM'),
      fetchSheet('Empleados'),
      fetchSheet('Estado HR'),
      fetchSheet('Tareas'),
    ]);

    const [clientes, proyectos, cuentas, pagos, crm, empleados, estadoHR, tareas] = results.map((result, index) => {
      if (result.status === 'fulfilled') return result.value;
      console.error(`Error cargando hoja índice ${index}:`, result.reason);
      return [];
    });

    return { clientes, proyectos, cuentas, pagos, crm, empleados, estadoHR, tareas };
  },

  createRegistro: (sheetName, data) => fetchSheet(sheetName, 'POST', data),
  updateRegistro: (sheetName, id, data) => fetchSheet(sheetName, 'PUT', data, id),
};

export default googleSheetsService;
