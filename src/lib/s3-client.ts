import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1';
const endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT || 'http://localhost:9000';
const accessKeyId = process.env.NEXT_PUBLIC_S3_ACCESS_KEY || 'minioadmin';
const secretAccessKey = process.env.NEXT_PUBLIC_S3_SECRET_KEY || 'minioadminpassword';

export const s3Client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Required for MinIO
});

export const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'goodzz';
