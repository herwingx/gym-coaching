import { S3Client } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

if (!accountId || !accessKeyId || !secretAccessKey) {
  // En desarrollo podríamos no tenerlas, pero avisamos
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing R2 credentials')
  }
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  forcePathStyle: true,
  // Desactivar cálculo de checksum automático que puede dar problemas con R2
  // en ciertas versiones del SDK de AWS
  // @ts-ignore - Dependiendo de la versión exacta del SDK puede llamarse diferente
  requestChecksumCalculation: "WHEN_REQUIRED",
  // @ts-ignore
  responseChecksumValidation: "WHEN_REQUIRED"
})

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gymcoaching-exercises'
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-25b160e13c63420783953a1098e3168c.r2.dev'
