import crypto from 'node:crypto';

let transientEvents = [];

function normalizeCode(code) {
  if (typeof code !== 'string') return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function getConfiguredTeacherCode() {
  return (process.env.TEACHER_ACCESS_CODE || 'MP-DOCENTE').trim();
}

function getEnvStudentCodes() {
  const raw = (process.env.STUDENT_ACCESS_CODES || 'MP-EBA64').trim();
  return raw
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

function getNotificationConfig() {
  return {
    teacherEmail: (process.env.TEACHER_EMAIL || 'profeluisingles@gmail.com').trim(),
    whatsappPhone: (process.env.WHATSAPP_PHONE || '50686179072').replace(/\D/g, ''),
    resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
    resendFrom: (process.env.RESEND_FROM || 'Learning with Mr. Picado <onboarding@resend.dev>').trim(),
    appsScriptUrl: (process.env.APPS_SCRIPT_WEBHOOK_URL || '').trim(),
    callmebotApiKey: (process.env.CALLMEBOT_APIKEY || '').trim(),
    notifyWebhookUrl: (process.env.NOTIFY_WEBHOOK_URL || '').trim(),
  };
}

function formatCostaRicaStamp(iso) {
  try {
    return new Date(iso).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  } catch {
    return iso;
  }
}

async function dispatchNotifications(ev) {
  const cfg = getNotificationConfig();
  const delivered = [];
  const stamp = formatCostaRicaStamp(ev.timestamp || new Date().toISOString());
  const scoreLine = ev.max > 0 ? `${ev.score}/${ev.max} (${ev.percentage}%)` : 'Registro de acceso';
  const subject = `Learning with Mr. Picado · ${ev.student} · ${ev.type}`;
  const plainBody = [
    'Learning with Mr. Picado — Reporte Automático',
    `Estudiante: ${ev.student}`,
    `Fecha (CR): ${stamp}`,
    `Evento: ${ev.type}`,
    `Actividad: ${ev.activity}`,
    `Resultado: ${scoreLine}`,
    ev.details ? `Detalles: ${ev.details}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (cfg.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: cfg.resendFrom,
          to: [cfg.teacherEmail],
          subject,
          text: plainBody,
        }),
      });
      if (res.ok) delivered.push('email:resend');
    } catch {
      // ignore provider failure
    }
  }

  if (cfg.appsScriptUrl) {
    try {
      const res = await fetch(cfg.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: cfg.teacherEmail,
          subject,
          body: plainBody,
          event: ev,
        }),
      });
      if (res.ok) delivered.push('email:apps-script');
    } catch {
      // ignore provider failure
    }
  }

  if (cfg.callmebotApiKey && cfg.whatsappPhone) {
    try {
      const waText = `📚 Mr. Picado | ${ev.student}\n• ${ev.type}: ${ev.activity}\n• Resultado: ${scoreLine}\n• ${stamp}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cfg.whatsappPhone)}&text=${encodeURIComponent(waText)}&apikey=${encodeURIComponent(cfg.callmebotApiKey)}`;
      const res = await fetch(url);
      if (res.ok) delivered.push('whatsapp:callmebot');
    } catch {
      // ignore provider failure
    }
  }

  if (cfg.notifyWebhookUrl) {
    try {
      const res = await fetch(cfg.notifyWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail: cfg.teacherEmail,
          whatsappPhone: cfg.whatsappPhone,
          subject,
          text: plainBody,
          event: ev,
        }),
      });
      if (res.ok) delivered.push('webhook');
    } catch {
      // ignore provider failure
    }
  }

  return { delivered };
}

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

  if (path.endsWith('/access/verify') && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const input = normalizeCode(body.code);
      if (!input) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Escribe un código válido.' }) };
      }
      const teacherNorm = normalizeCode(getConfiguredTeacherCode());
      if (teacherNorm && input === teacherNorm) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: true,
            role: 'teacher',
            token: crypto.randomBytes(24).toString('hex'),
            codeHint: getConfiguredTeacherCode().toUpperCase(),
          }),
        };
      }
      const studentCodes = getEnvStudentCodes();
      const matched = studentCodes.find((c) => normalizeCode(c) === input);
      if (matched) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: true,
            role: 'student',
            token: crypto.randomBytes(24).toString('hex'),
            codeHint: matched,
          }),
        };
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, error: 'El código no coincide. Verifica los caracteres con Mr. Picado.' }),
      };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido.' }) };
    }
  }

  if (path.endsWith('/notifications/status') && event.httpMethod === 'GET') {
    const cfg = getNotificationConfig();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        teacherEmail: cfg.teacherEmail,
        whatsappPhone: cfg.whatsappPhone,
        emailAutomatic: Boolean(cfg.resendApiKey || cfg.appsScriptUrl),
        emailProviders: {
          resend: Boolean(cfg.resendApiKey),
          appsScript: Boolean(cfg.appsScriptUrl),
        },
        whatsappAutomatic: Boolean(cfg.callmebotApiKey),
        whatsappProviders: {
          callmebot: Boolean(cfg.callmebotApiKey),
        },
        webhookAutomatic: Boolean(cfg.notifyWebhookUrl),
        activeStudentCodesCount: getEnvStudentCodes().length,
      }),
    };
  }

  if (path.endsWith('/notifications/test') && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const teacherNorm = normalizeCode(getConfiguredTeacherCode());
      if (!body.teacherCode || normalizeCode(body.teacherCode) !== teacherNorm) {
        return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'Código docente incorrecto.' }) };
      }
      const sample = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        student: 'Prueba del Sistema (Mr. Picado)',
        type: 'Quiz',
        activity: 'Present Simple (Prueba Netlify)',
        score: 48,
        max: 50,
        percentage: 96,
        details: 'Verificación de envío automático desde Netlify',
      };
      const result = await dispatchNotifications(sample);
      if (result.delivered.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: false,
            channels: [],
            message: 'Falta configurar RESEND_API_KEY, APPS_SCRIPT_WEBHOOK_URL o CALLMEBOT_APIKEY en las variables de entorno de Netlify.',
          }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          channels: result.delivered,
          message: `Prueba enviada correctamente por: ${result.delivered.join(', ')}`,
        }),
      };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido.' }) };
    }
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
      const notifications = await dispatchNotifications(payload);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ok: true,
          event: payload,
          totalEvents: transientEvents.length,
          notifications,
        }),
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
