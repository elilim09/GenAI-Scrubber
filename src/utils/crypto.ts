const enc = new TextEncoder();
const dec = new TextDecoder();

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

async function importKey(key: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(key), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encrypt(text: string, key: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await importKey(key);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(text),
  );
  const ivHex = toHex(iv);
  const cipherB64 = Buffer.from(cipher).toString('base64');
  return `${ivHex}:${cipherB64}`;
}

export async function decrypt(payload: string, key: string): Promise<string> {
  const [ivHex, cipherB64] = payload.split(':');
  const iv = fromHex(ivHex);
  const cryptoKey = await importKey(key);
  const cipher = Buffer.from(cipherB64, 'base64');
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    cipher,
  );
  return dec.decode(plain);
}
