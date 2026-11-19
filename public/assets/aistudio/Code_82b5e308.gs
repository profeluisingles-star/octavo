const RECIPIENT = 'profeluisingles@gmail.com';
const TOPICS = [
  'School Subjects',
  'Present Simple',
  'IN, ON and AT',
  'CAN and CANNOT',
  'Past Simple, Sports and Holidays',
  // Retain compatibility with events queued by the earlier version.
  'Materias del colegio',
  'Presente simple',
  'IN, ON y AT',
  'CAN y CANNOT',
  'Pasado simple, deportes y días festivos'
];
const READING_POINTS = new Map([
  ['School Life: A Day in Our School', 2],
  ['Different Types of Sports', 12],
  ['A Rainy Sports Festival', 2],
  ['Holidays Around the World', 11],
  ['Two Celebrations in Costa Rica', 2],
  ['The Library Project', 4],
  ['Two Sports, Two Plans', 4],
  ['Christmas in Cartago', 4]
]);
function assertOwner_() {
  const account = Session.getActiveUser().getEmail();
  if (!account || account !== Session.getEffectiveUser().getEmail()) throw new Error('Esta operación requiere la cuenta propietaria.');
}

function initialize() {
  assertOwner_();
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) return;
  const book = SpreadsheetApp.create('Learning with Mr. Picado - Registro docente');
  book.getSheets()[0].appendRow(['Fecha', 'Evento', 'Actividad', 'Puntaje', 'Puntaje máximo', 'Estado del correo', 'ID', 'Estudiante']);
  book.setSpreadsheetTimeZone('America/Costa_Rica');
  props.setProperty('SHEET_ID', book.getId());
}

function generateReserveCodes() {
  assertOwner_();
  const codes = Array.from({ length: 5 }, () => {
    const first = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    const second = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    return 'MP-' + (first + second).toUpperCase().match(/.{5}/g).join('-');
  });
  console.log(codes.join('\n'));
}

function activateReplacementCode() {
  assertOwner_();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const next = normalizeAccessCode_(props.getProperty('NEXT_STUDENT_CODE'));
    if (!/^MP[A-F0-9]{20}$/.test(next) || next === normalizeAccessCode_(props.getProperty('STUDENT_CODE')) ||
        props.getProperty('USED_CODE_' + fingerprint_(next))) throw new Error('Guarda un código de reserva nuevo como NEXT_STUDENT_CODE.');
    props.setProperty('STUDENT_CODE', next);
    props.deleteProperty('STUDENT_SESSION_HASH');
    props.deleteProperty('NEXT_STUDENT_CODE');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Access').setTitle('Learning with Mr. Picado')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function isSessionToken_(token) {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
}

function fingerprint_(token) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token, Utilities.Charset.UTF_8)
    .map(byte => (byte & 255).toString(16).padStart(2, '0')).join('');
}

function validSession_(props, token) {
  return isSessionToken_(token) && props.getProperty('STUDENT_SESSION_HASH') === fingerprint_(token);
}

function normalizeAccessCode_(code) {
  return typeof code === 'string' && code.length <= 48 ? code.toUpperCase().replace(/[\s-]/g, '') : '';
}

function openStudy(token, code) {
  if (!isSessionToken_(token)) return { status: 'required' };
  const props = PropertiesService.getScriptProperties();
  if (validSession_(props, token)) return unlockedStudy_();
  if (!code) return { status: 'required' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (validSession_(props, token)) return unlockedStudy_();
    const accessCode = normalizeAccessCode_(props.getProperty('STUDENT_CODE'));
    if (!accessCode) return { status: 'unconfigured' };
    if (normalizeAccessCode_(code) !== accessCode) return { status: 'invalid' };
    const usedKey = 'USED_CODE_' + fingerprint_(accessCode);
    if (props.getProperty('STUDENT_SESSION_HASH') || props.getProperty(usedKey)) return { status: 'used' };
    const study = unlockedStudy_();
    props.setProperties({ STUDENT_SESSION_HASH: fingerprint_(token), [usedKey]: 'yes' });
    return study;
  } finally {
    lock.releaseLock();
  }
}

function unlockedStudy_() {
  return { status: 'ok', html: HtmlService.createHtmlOutputFromFile('Index').getContent() };
}

function recordEvent(token, id, type, activity, score, maximum, student) {
  const props = PropertiesService.getScriptProperties();
  if (!validSession_(props, token)) throw new Error('Acceso inválido.');
  const name = typeof student === 'string' ? student.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
  if (name.length < 2 || name.length > 80 || !/^\p{L}[\p{L}\p{M} .’'-]*$/u.test(name)) throw new Error('Nombre inválido.');
  const validTopic = TOPICS.includes(activity);
  const expected = type === 'Visita' && activity === 'Entrada a la plataforma' ? 0 :
    type === 'Práctica' && validTopic ? 30 :
    (type === 'Quiz' || type === 'Quiz reiniciado') && validTopic ? 50 :
    type === 'Lectura' ? READING_POINTS.get(activity) :
    type === 'Vocabulario' && READING_POINTS.has(activity) ? 4 : undefined;
  const limit = type === 'Quiz reiniciado' ? 15 : maximum;
  if (expected === undefined || maximum !== expected || !Number.isInteger(score) ||
      score < 0 || score > limit || (type === 'Quiz' && (score < 46 || score % 2)) ||
      typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) throw new Error('Registro inválido.');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    const sheet = book.getSheets()[0];
    if (sheet.getRange(1, 8).getValue() !== 'Estudiante') {
      sheet.getRange(1, 8).setValue('Estudiante');
      sheet.getRange(1, 4).setValue('Puntaje');
      sheet.getRange(1, 5).setValue('Puntaje máximo');
    }
    const last = sheet.getLastRow();
    if (last > 1) {
      const row = sheet.getRange(2, 7, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (row) return sheet.getRange(row.getRow(), 6).getValue() === 'Enviado' ? 'sent' : 'saved';
    }
    const date = new Date();
    sheet.appendRow([date, type, activity, score, maximum, 'Pendiente', id, name]);
    const row = sheet.getLastRow();
    const stamp = Utilities.formatDate(date, 'America/Costa_Rica', 'dd/MM/yyyy HH:mm');
    const body = 'Estudiante: ' + name + '\nFecha: ' + stamp + '\nActividad: ' + activity +
      (maximum ? '\nPuntaje: ' + score + ' de ' + maximum : '') +
      '\n\nRegistro docente: ' + book.getUrl();
    try {
      MailApp.sendEmail(RECIPIENT, 'Learning with Mr. Picado | ' + type, body);
    } catch (error) {
      sheet.getRange(row, 6).setValue('Error de envío');
      return 'saved';
    }
    sheet.getRange(row, 6).setValue('Enviado');
    return 'sent';
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

