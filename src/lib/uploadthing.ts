import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getSessionUser } from './auth'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
    .middleware(async () => {
      const user = await getSessionUser()
      if (!user?.admin) throw new Error('Unauthorized')
      return { userId: user.uid }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key }
    }),

  videoUploader: f({ video: { maxFileSize: '512MB', maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getSessionUser()
      if (!user?.admin) throw new Error('Unauthorized')
      return { userId: user.uid }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
