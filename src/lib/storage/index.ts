/**
 * Active storage provider.
 *
 * To switch providers:
 *   1. Create `providers/your-provider.ts` implementing `StorageProvider`
 *   2. Change the import below to point to your new provider
 *   3. No other files need to change
 *
 * All server-side storage operations (list, delete, URL resolution) import
 * `storage` from this file — they never import from uploadthing/server directly.
 */
export { uploadthingProvider as storage } from './providers/uploadthing'
export type { StorageProvider, StorageFileInfo, StorageFileUrl } from './types'
