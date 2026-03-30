'use server'

import { r2AwsClient, r2Endpoint, R2_BUCKET_NAME } from '@/lib/r2'
import { getAuthUser } from '@/lib/auth-utils'

/**
 * Genera una URL firmada para subir un archivo directamente desde el cliente a R2.
 * @param path El path dentro del bucket (ej: progress/clients/...)
 * @param contentType El tipo MIME del archivo (ej: image/jpeg)
 */
export async function getR2PresignedUrl(path: string, contentType: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('No autorizado')

  const url = new URL(`${r2Endpoint}/${R2_BUCKET_NAME}/${path}`)

  const signed = await r2AwsClient.sign(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    aws: { signQuery: true }
  })

  return signed.url
}

/**
 * Elimina un objeto de R2.
 * @param path El path dentro del bucket (ej: progress/clients/...)
 */
export async function deleteR2Object(path: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('No autorizado')

  const url = new URL(`${r2Endpoint}/${R2_BUCKET_NAME}/${path}`)

  const res = await r2AwsClient.fetch(url.toString(), {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error('Failed to delete object from R2')
  }
}
