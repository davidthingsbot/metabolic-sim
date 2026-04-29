import type { DocumentStore } from './runRepository';

const DATABASE_NAME = 'metabolic-sim';
const DATABASE_VERSION = 1;
const STORE_NAME = 'documents';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB database'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function runTransaction<T>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export class IndexedDbDocumentStore implements DocumentStore {
  async get<T>(key: string): Promise<T | null> {
    const database = await openDatabase();
    const result = await runTransaction(database, 'readonly', (store) => store.get(key));
    return (result as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const database = await openDatabase();
    await runTransaction(database, 'readwrite', (store) => store.put(value, key));
  }

  async delete(key: string): Promise<void> {
    const database = await openDatabase();
    await runTransaction(database, 'readwrite', (store) => store.delete(key));
  }

  async list<T>(prefix: string): Promise<Array<{ key: string; value: T }>> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const entries: Array<{ key: string; value: T }> = [];

      request.onerror = () => {
        reject(request.error ?? new Error('IndexedDB cursor failed'));
      };

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(entries);
          return;
        }

        const key = String(cursor.key);
        if (key.startsWith(prefix)) {
          entries.push({ key, value: cursor.value as T });
        }
        cursor.continue();
      };
    });
  }
}
