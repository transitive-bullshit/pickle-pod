import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fileTypeFromBuffer } from 'file-type'

export async function uploadToS3({
  bucket = process.env.AWS_S3_BUCKET,
  region = process.env.AWS_REGION,
  key,
  body,
  metadata
}: {
  bucket?: string
  region?: string
  key: string
  body: string | Uint8Array | Buffer
  metadata?: Record<string, string>
}) {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    },
    region
  })

  const metadataKeys = new Set(
    Object.keys(metadata || {}).map((key) => key.toLowerCase())
  )

  if (!metadataKeys.has('content-type')) {
    const fileType = await fileTypeFromBuffer(
      Buffer.isBuffer(body) ? body : Buffer.from(body)
    )

    if (fileType) {
      metadata = {
        ...metadata,
        'Content-Type': fileType.mime
      }
    }
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: metadata?.['Content-Type'],
    Metadata: metadata
  })

  await s3.send(command)
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}
