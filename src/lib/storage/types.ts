/**
 * Storage provider abstraction.
 *
 * All server-side file operations go through this interface.
 * To migrate away from UploadThing, create a new file in `providers/`
 * that implements `StorageProvider`, then change the re-export in `index.ts`.
 */

export interface StorageFileInfo {
  key: string
  name: string
  size: number
  uploadedAt: number // Unix ms
}

export interface StorageFileUrl {
  key: string
  url: string
}

export interface StorageProvider {
  /** List all files in the storage bucket */
  listFiles(): Promise<StorageFileInfo[]>
  /** Resolve public URLs for a set of file keys */
  getFileUrls(keys: string[]): Promise<StorageFileUrl[]>
  /** Permanently delete files by key */
  deleteFiles(keys: string[]): Promise<void>
}
