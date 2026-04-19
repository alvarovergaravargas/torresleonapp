// netlify/functions/sheets.js
// ═══════════════════════════════════════════════════════════
// TorresLeón - Google Sheets API Service (Netlify Function)
// ═══════════════════════════════════════════════════════════
// 
// SETUP REQUERIDO:
// 1. npm install googleapis
// 2. Configurar variables de entorno en Netlify:
//    - GOOGLE_SERVICE_EMAIL: email de la cuenta de servicio
//    - GOOGLE_PRIVATE_KEY: clave privada (reemplazar \\n con \n reales)
//    - GOOGLE_SHEET_ID: ID del Google Sheet (de la URL)
//
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Hojas y sus rangos
const SHEETS = {
  clientes: { range: 'Clientes!A:H', cols: ['id_cliente','tipo_cliente','razon_social_nombre','ruc_cedula','contacto_principal','telefono_whatsapp','email_facturacion','estado_relacion'] },
  proyectos: { range: 'Proyectos!A:G', cols: ['id_proyecto','id_cliente','nombre_proyecto','presupuesto_aprobado','fecha_inicio','estado_obra','project_manager'] },
  cuentas: { range: 'Cuentas_por_cobrar!A:H', cols: ['id_factura','id_proyecto','hitos_concepto','monto_facturado','fecha_emision','fecha_vencimiento','dias_mora','estado_cobro'] },
  pagos: { range: 'Pagos!A:F', cols: ['id_pago','id_factura','monto_pagado','fecha_pago','metodo_pago','referencia_bancaria'] },
  crm: { range: 'CRM!A:F', cols: ['id_interaccion','id_proyecto','fecha_contacto','tipo_contacto','notas_acuerdos','promesa_pago'] },
  tareas: { range: 'Tareas!A:N', cols: ['id_tarea','fecha_creacion','obra','responsable','cargo_rol','descripcion_tarea','prioridad','estado','fecha_compromiso','fecha_cierre','comentarios','creado_por','updated_at','status'] },
};

async function getAuth() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    SCOPES
  );
  await auth.authorize();
  return auth;
}

async function getSheetData(sheetKey) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const config = SHEETS[sheetKey];
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: config.range,
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];
  
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

async function appendRow(sheetKey, data) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const config = SHEETS[sheetKey];
  
  const values = [config.cols.map(col => data[col] || '')];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: config.range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  
  return { success: true };
}

async function updateRow(sheetKey, idCol, idVal, data) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const config = SHEETS[sheetKey];
  const sheetName = config.range.split('!')[0];

  // Buscar la fila por ID
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: config.range,
  });

  const rows = res.data.values || [];
  const headers = rows[0];
  const idIndex = headers.indexOf(idCol);
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[idIndex] === idVal);
  
  if (rowIndex === -1) return { success: false, error: 'Row not found' };

  const updatedRow = config.cols.map(col => data[col] !== undefined ? data[col] : '');
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(64 + config.cols.length)}${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updatedRow] },
  });

  return { success: true };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/sheets/', '').replace('/.netlify/functions/sheets', '');
    const segments = path.split('/').filter(Boolean);
    const sheetKey = segments[0]; // clientes, proyectos, etc.

    if (!SHEETS[sheetKey]) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Hoja "${sheetKey}" no existe. Válidas: ${Object.keys(SHEETS).join(', ')}` }) };
    }

    // GET - Leer datos
    if (event.httpMethod === 'GET') {
      const data = await getSheetData(sheetKey);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // POST - Crear nuevo registro
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const result = await appendRow(sheetKey, body);
      return { statusCode: 201, headers, body: JSON.stringify(result) };
    }

    // PUT - Actualizar registro existente
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      const { _idCol, _idVal, ...data } = body;
      const result = await updateRow(sheetKey, _idCol || SHEETS[sheetKey].cols[0], _idVal || data[SHEETS[sheetKey].cols[0]], data);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Sheets API Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
