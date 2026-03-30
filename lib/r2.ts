import { AwsClient } from 'aws4fetch'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

if (!accountId || !accessKeyId || !secretAccessKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing R2 credentials')
  }
}

export const r2AwsClient = new AwsClient({
  accessKeyId: accessKeyId || '',
  secretAccessKey: secretAccessKey || '',
  service: 's3',
  region: 'auto',
})

export const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gymcoaching-exercises'