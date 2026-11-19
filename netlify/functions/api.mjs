// Lightweight Netlify Function for /api/* health & stateless echo fallback
let transientEvents = [];

export const handler = async (event) => {
  const path = event.path || '';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };

  if (path.endsWith('/health')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        runtime: 'netlify-functions',
        count: transientEvents.length,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (path.endsWith('/events') && event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      if (!payload.student || !payload.type || !payload.activity) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Datos incompletos.' }) };
      }
      if (!transientEvents.some((e) => e.id === payload.id)) {
        transientEvents = [payload, ...transientEvents].slice(0, 300);
      }
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ ok: true, event: payload, totalEvents: transientEvents.length }),
      };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido.' }) };
    }
  }

  if (path.endsWith('/reports') && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        events: transientEvents,
        totalCount: transientEvents.length,
        studentsSummary: [],
        updatedAt: new Date().toISOString(),
      }),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Ruta no encontrada' }),
  };
};
