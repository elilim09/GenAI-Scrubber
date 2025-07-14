import { encrypt, decrypt } from './crypto';

const DB_NAME = 'genai-cache';
const STORE = 'items';
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function save(id: string, data: string, key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put({ id, data: await encrypt(data, key), ts: Date.now() });
  await txDone(tx);
}

export async function load(id: string, key: string): Promise<string | undefined> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const req = tx.objectStore(STORE).get(id);
  const record = await new Promise<{ id: string; data: string; ts: number } | undefined>((resolve) => {
    req.onsuccess = () => resolve(req.result as { id: string; data: string; ts: number });
    req.onerror = () => resolve(undefined);
  });
  if (record && Date.now() - record.ts < 86400000) {
    return decrypt(record.data, key);
  }
  return undefined;
}
