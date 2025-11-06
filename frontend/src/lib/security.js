// Utilidades de seguridad: verificación de entorno local, TOTP y cifrado básico

export const isLocalDev = () => {
  const host = window.location.hostname;
  const dev = import.meta.env.DEV;
  return dev && (host === 'localhost' || host === '127.0.0.1');
};

// Obtiene el secreto desde variables públicas de Vite (solo dev)
const getSecret = () => {
  const secret = import.meta.env.VITE_ADMIN_2FA_SECRET || '';
  return secret;
};

// Convierte string a ArrayBuffer
const strToBuf = (str) => new TextEncoder().encode(str);

// Genera TOTP de 6 dígitos basado en HMAC-SHA1 y ventana de 30s
export async function generateTOTP(secret) {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30);
  const keyData = strToBuf(secret);
  const msg = new ArrayBuffer(8);
  const view = new DataView(msg);
  view.setUint32(4, timeStep);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await window.crypto.subtle.sign('HMAC', cryptoKey, msg);
  const h = new Uint8Array(sig);
  const offset = h[h.length - 1] & 0x0f;
  const binCode = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
  const otp = (binCode % 1000000).toString().padStart(6, '0');
  return otp;
}

export async function verifyTOTP(code) {
  const secret = getSecret();
  if (!secret || !isLocalDev()) return false;
  const expected = await generateTOTP(secret);
  return String(code) === String(expected);
}

// Cifrado sencillo AES-GCM para logs sensibles en localStorage
export async function encrypt(data, keyString) {
  const keyMaterial = await window.crypto.subtle.importKey('raw', strToBuf(keyString), { name: 'PBKDF2' }, false, ['deriveKey']);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    strToBuf(JSON.stringify(data))
  );
  return { c: Array.from(new Uint8Array(ciphertext)), iv: Array.from(iv), s: Array.from(salt) };
}

export async function decrypt(payload, keyString) {
  const { c, iv, s } = payload || {};
  if (!c || !iv || !s) return null;
  const keyMaterial = await window.crypto.subtle.importKey('raw', strToBuf(keyString), { name: 'PBKDF2' }, false, ['deriveKey']);
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(s), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );
  const plainBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(c)
  );
  return JSON.parse(new TextDecoder().decode(plainBuf));
}

export const AUDIT_KEY = import.meta.env.VITE_ADMIN_AUDIT_KEY || 'dev-admin-audit-key';