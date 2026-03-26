'use server'

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2'
import { getAuthUser } from '@/lib/auth-utils'

/**
 * Genera una URL firmada para subir un archivo directamente desde el cliente a R2.
 * @param path El path dentro del bucket (ej: progress/clients/...)
 * @param contentType El tipo MIME del archivo (ej: image/jpeg)
 */
export async function getR2PresignedUrl(path: string, contentType: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('No autorizado')

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    ContentType: contentType,
  })

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
  return signedUrl
}

/**
 * Elimina un objeto de R2.
 * @param path El path dentro del bucket (ej: progress/clients/...)
 */
export async function deleteR2Object(path: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('No autorizado')

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
  })

  await r2Client.send(command)
}
