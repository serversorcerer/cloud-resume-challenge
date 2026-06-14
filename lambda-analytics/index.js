'use strict';

/**
 * site-analytics: privacy-friendly event collector for josephaleto.io.
 *
 * Records page views and conversion events (CV downloads, email clicks,
 * terminal usage) into DynamoDB with UTM attribution and a daily-rotating,
 * salted visitor hash. No cookies, no raw IPs, no PII stored.
 *
 * Runtime: nodejs (uses @aws-sdk/client-dynamodb bundled in the Lambda runtime).
 */

const crypto = require('crypto');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const TABLE = process.env.TABLE || 'site-analytics';
const SALT = process.env.HASH_SALT || 'change-me';
const TTL_DAYS = 90;

const ALLOWED_EVENTS = new Set([
  'page_view',
  'terminal_command',
  'email_copy',
  'email_click',
  'cv_download',
  'out_linkedin',
  'out_github',
  'cta_click',
]);

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|headless|curl|wget|python-requests|axios|monitor|pingdom|lighthouse|gtmetrix|facebookexternalhit|whatsapp|telegrambot/i;

const clamp = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');

function hostOnly(ref) {
  if (!ref || typeof ref !== 'string') return '';
  try {
    return new URL(ref).hostname.replace(/^www\./, '').slice(0, 120);
  } catch (_) {
    return clamp(ref, 120);
  }
}

exports.handler = async (event) => {
  const method = event?.requestContext?.http?.method || 'GET';

  if (method === 'GET') {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
  if (method !== 'POST') {
    return { statusCode: 405, body: 'method not allowed' };
  }

  const headers = event.headers || {};
  const ua = clamp(headers['user-agent'] || '', 400);
  if (BOT_RE.test(ua)) return { statusCode: 204, body: '' };

  let payload = {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '{}';
    payload = JSON.parse(raw) || {};
  } catch (_) {
    return { statusCode: 400, body: 'bad json' };
  }

  const evt = clamp(payload.event, 40);
  if (!ALLOWED_EVENTS.has(evt)) return { statusCode: 204, body: '' };

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const ts = now.toISOString();
  const sourceIp = event?.requestContext?.http?.sourceIp || '';

  // Daily-rotating, salted hash. Lets us count uniques without storing PII.
  const visitor = crypto
    .createHash('sha256')
    .update(`${sourceIp}|${ua}|${day}|${SALT}`)
    .digest('hex')
    .slice(0, 16);

  const ttl = Math.floor(now.getTime() / 1000) + TTL_DAYS * 86400;

  const item = {
    pk: { S: `EV#${day}` },
    sk: { S: `${ts}#${crypto.randomBytes(3).toString('hex')}` },
    event: { S: evt },
    ts: { S: ts },
    visitor: { S: visitor },
    ttl: { N: String(ttl) },
  };

  const optional = {
    path: clamp(payload.path, 200),
    ref: hostOnly(payload.ref),
    utm_source: clamp(payload.utm_source, 60),
    utm_medium: clamp(payload.utm_medium, 60),
    utm_campaign: clamp(payload.utm_campaign, 80),
    cmd: clamp(payload.cmd, 40),
  };
  for (const [k, v] of Object.entries(optional)) {
    if (v) item[k] = { S: v };
  }

  try {
    await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    console.error('put failed', err);
    return { statusCode: 500, body: 'error' };
  }

  return { statusCode: 204, body: '' };
};
