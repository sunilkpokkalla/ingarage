const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-super-secret-key-change-me-in-production';

// Derive a 256-bit key using PBKDF2
async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_KEY),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('ingarage-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function encrypt(text: string): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );

  return bufferToHex(iv) + ':' + bufferToHex(encrypted);
}

export async function decrypt(encryptedText: string): Promise<string> {
  const [ivHex, dataHex] = encryptedText.split(':');
  if (!ivHex || !dataHex) {
    throw new Error('Invalid encrypted text format');
  }

  const key = await deriveKey();
  const iv = hexToBuffer(ivHex);
  const data = hexToBuffer(dataHex);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    data as any
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
