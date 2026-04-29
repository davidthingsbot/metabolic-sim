import { IndexedDbDocumentStore } from './indexedDbDocumentStore';
import { createRunRepository, type RunRepository } from './runRepository';

export function createBrowserRunRepository(): RunRepository {
  return createRunRepository(new IndexedDbDocumentStore());
}
