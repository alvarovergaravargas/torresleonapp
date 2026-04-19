const { google } = require('googleapis');

const ALLOWED_SHEETS = [
  'Clientes',
  'Proyectos',
  'Cuentas_por_cobrar',
  'Pagos',
  'CRM',
  'Empleados',
  'Estado HR',
  'Agenda_Trabajo',
  'Tareas'
];

const SHEET_CONFIG = {
  Clientes: { idField: 'id_cliente' },
  Proyectos: { idField: 'id_proyecto' },
  CRM: { idField: 'id_interaccion' },
  Tareas: { idField: 'id_tarea' },
  Cuentas_por_cobrar: { idField: 'id_factura' },
};

const toSheetValue = (value) => {
  if (value === undefined || value === null) return '';
  return value;
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const pathParts = event.path.split('/');
    const sheetName = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (!ALLOWED_SHEETS.includes(sheetName)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Hoja '${sheetName}' no permitida.` })
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = meta.data.values || [];
    const headersRow = rows[0] || [];

    if (event.httpMethod === 'GET') {
      if (rows.length === 0) {
        return { statusCode: 200, headers, body: JSON.stringify([]) };
      }

      const data = rows.slice(1).map((row) => {
        const obj = {};
        headersRow.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (headersRow.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `La hoja '${sheetName}' no tiene encabezados.` })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const rowData = headersRow.map((header) => toSheetValue(body[header]));

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowData] },
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: 'Registro creado' })
      };
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const id = event.queryStringParameters?.id;
      const idField = SHEET_CONFIG[sheetName]?.idField;

      if (!idField) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `La hoja '${sheetName}' no soporta actualizaciones por ID.` })
        };
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Falta el parámetro id.' })
        };
      }

      const idIndex = headersRow.indexOf(idField);
      if (idIndex === -1) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `No se encontró la columna ID '${idField}' en '${sheetName}'.` })
        };
      }

      const rowIndex = rows.findIndex(
        (row, index) => index > 0 && String(row[idIndex] || '').trim() === String(id).trim()
      );

      if (rowIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: `No se encontró el registro '${id}' en '${sheetName}'.` })
        };
      }

      const rowNumber = rowIndex + 1;
      const lastColumnLetter = String.fromCharCode(64 + headersRow.length);
      const rowData = headersRow.map((header) => toSheetValue(body[header]));

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}:${lastColumnLetter}${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Registro actualizado' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no soportado' })
    };
  } catch (error) {
    console.error('Error en sheets.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
