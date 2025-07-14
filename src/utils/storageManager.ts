import { encrypt, decrypt } from './crypto';

const DB_NAME = 'genai-cache';
const STORE = 'items';
const LIFESPAN = 24 * 60 * 60 * 1000;

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

async function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveOriginal(key: string, blob: Blob, secret: string): Promise<void> {
  const buf = await blob.arrayBuffer();
  const data = await encrypt(Buffer.from(buf).toString('base64'), secret);
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put({ id: key, data, ts: Date.now() });
  await txDone(tx);
}

interface RecordEntry { id: string; data: string; ts: number }

export async function loadOriginal(key: string, secret: string): Promise<Blob | undefined> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const req = tx.objectStore(STORE).get(key);
  const record = await new Promise<RecordEntry | undefined>((resolve) => {
    req.onsuccess = () => resolve(req.result as RecordEntry);
    req.onerror = () => resolve(undefined);
  });
  if (!record) return undefined;
  const data = await decrypt(record.data, secret);
  return new Blob([Uint8Array.from(atob(data), (c) => c.charCodeAt(0))]);
}

export async function deleteExpired(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const req = store.getAll();
  req.onsuccess = () => {
    const now = Date.now();
    (req.result as RecordEntry[]).forEach((item) => {
      if (now - item.ts > LIFESPAN) {
        store.delete(item.id);
      }
    });
  };
  await txDone(tx);
}

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'purge-cache') deleteExpired();
});
