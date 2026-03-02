/**
 * UploadThing implementation of StorageProvider.
 *
 * This is the ONLY file that imports from `uploadthing/server`.
 * Swapping to another storage service means replacing this file and
 * updating the re-export in `src/lib/storage/index.ts`.
 */
import { UTApi } from 'uploadthing/server'
import type { StorageProvider, StorageFileInfo, StorageFileUrl } from '../types'

// Single UTApi instance for this process
const utapi = new UTApi()

export const uploadthingProvider: StorageProvider = {
  async listFiles(): Promise<StorageFileInfo[]> {
    const { files } = await utapi.listFiles()
    return files.map((f) => ({
      key: f.key,
      name: f.name,
      size: f.size,
      uploadedAt: f.uploadedAt,
    }))
  },

  async getFileUrls(keys: string[]): Promise<StorageFileUrl[]> {
    if (keys.length === 0) return []
    const { data } = await utapi.getFileUrls(keys)
    return data.map((item) => ({ key: item.key, url: item.url }))
  },

  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return
    await utapi.deleteFiles(keys)
  },
}
