const { google } = require('googleapis');

// Lista exacta de tus pestañas (incluyendo "Tareas" del paso anterior)
const ALLOWED_SHEETS = [
  'Clientes', 'Proyectos', 'Cuentas_por_cobrar', 'Pagos', 
  'CRM', 'Empleados', 'Estado HR', 'Agenda_Trabajo', 'Tareas'
];

exports.handler = async (event, context) => {
  // Configuración de CORS para permitir que tu frontend consulte esta API
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    // Extraer el nombre de la hoja desde la URL (ej: /.netlify/functions/sheets/Clientes)
    const pathParts = event.path.split('/');
    const sheetName = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (!ALLOWED_SHEETS.includes(sheetName)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Hoja '${sheetName}' no permitida.` }) };
    }

    // Autenticación con Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Formatea la llave correctamente
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // --- GET: LEER DATOS ---
    if (event.httpMethod === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`, // Lee todas las columnas
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) return { statusCode: 200, headers, body: JSON.stringify([]) };

      // Convierte el array de Google Sheets en un array de objetos JSON usando la fila 1 como llaves
      const headersRow = rows[0];
      const data = rows.slice(1).map(row => {
        let obj = {};
        headersRow.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // --- POST: CREAR FILA ---
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const rowData = Object.values(body); // Asume que el frontend envía los datos en el orden correcto

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Registro creado' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no soportado' }) };

  } catch (error) {
    console.error('Error en sheets.js:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
