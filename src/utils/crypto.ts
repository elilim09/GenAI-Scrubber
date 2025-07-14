import CryptoJS from 'crypto-js';

export async function encrypt(text: string, key: string): Promise<string> {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export async function decrypt(cipher: string, key: string): Promise<string> {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
