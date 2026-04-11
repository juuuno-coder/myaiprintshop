/**
 * NCP Object Storage S3 호환 클라이언트
 *
 * 버킷: wero-bucket (NCP Object Storage)
 * 환경변수: NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_BUCKET_NAME=wero-bucket
 */
import { S3Client } from '@aws-sdk/client-s3';

const NCP_ENDPOINT = 'https://kr.object.ncloudstorage.com';

export const s3Client = new S3Client({
  region: 'kr-standard',
  endpoint: NCP_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NCP_ACCESS_KEY || '',
    secretAccessKey: process.env.NCP_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

export const S3_BUCKET = process.env.NCP_BUCKET_NAME || 'wero-bucket';
