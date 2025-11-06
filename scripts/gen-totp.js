// Simple TOTP generator (SHA1, 6 digits, 30s) using Node's crypto
// Usage: `node scripts/gen-totp.js [secretBase32]` or set env VITE_ADMIN_2FA_SECRET

const crypto = require('crypto');

function base32ToBuffer(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.replace(/=+$/,'').toUpperCase().replace(/\s+/g, '');
  let bits = '';
  for (const c of cleaned) {
    const val = alphabet.indexOf(c);
    if (val === -1) throw new Error(`Invalid base32 character: ${c}`);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTOTP(secretBase32, timeStep = 30, digits = 6) {
  const key = base32ToBuffer(secretBase32);
  let counter = Math.floor(Date.now() / 1000 / timeStep);
  const buf = Buffer.alloc(8);
  // big-endian 64-bit counter
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter >>>= 8;
  }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  const otp = code % (10 ** digits);
  return otp.toString().padStart(digits, '0');
}

const secret = (process.env.VITE_ADMIN_2FA_SECRET || process.argv[2] || 'JBSWY3DPEHPK3PXP').trim();
try {
  const code = generateTOTP(secret);
  console.log(code);
} catch (e) {
  console.error('Failed to generate TOTP:', e.message);
  process.exit(1);
}