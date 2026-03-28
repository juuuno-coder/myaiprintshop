import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  uploadBytes 
} from 'firebase/storage';
import { storage as firebaseStorage, isConfigValid as isFirebaseValid } from './firebase';
import { s3Client, S3_BUCKET } from './s3-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * 전용 스토리지 서비스: Firebase와 S3(MinIO)를 상황에 맞춰 지원합니다.
 * 로컬 개발 시에는 MinIO(Docker)를 우선 권장합니다.
 */

export interface UploadOptions {
  path: string;
  contentType?: string;
}

/**
 * 이미지를 업로드하고 영구 URL을 반환합니다.
 */
export async function uploadFile(
  fileData: string | Blob | Buffer,
  options: UploadOptions
): Promise<string | null> {
  const isS3Enabled = process.env.NEXT_PUBLIC_USE_S3 === 'true';

  if (isS3Enabled) {
    return uploadToS3(fileData, options);
  } else if (isFirebaseValid) {
    return uploadToFirebase(fileData, options);
  }

  console.warn('[STORAGE] 설정된 스토리지가 없습니다. 업로드에 실패합니다.');
  return null;
}

/**
 * S3 (MinIO) 업로드
 */
async function uploadToS3(
  fileData: string | Blob | Buffer,
  options: UploadOptions
): Promise<string | null> {
  try {
    let body: any;
    let contentType = options.contentType || 'image/png';

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      // Base64 handling
      const base64Data = fileData.split(',')[1];
      body = Buffer.from(base64Data, 'base64');
    } else {
      body = fileData;
    }

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: options.path,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);
    
    // MinIO URL 생성 (로컬 환경 기준)
    const endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT || 'http://localhost:9000';
    return `${endpoint}/${S3_BUCKET}/${options.path}`;
  } catch (error) {
    console.error('[S3 Upload Error]', error);
    return null;
  }
}

/**
 * Firebase Storage 업로드
 */
async function uploadToFirebase(
  fileData: string | Blob | Buffer,
  options: UploadOptions
): Promise<string | null> {
  try {
    const storageRef = ref(firebaseStorage, options.path);

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      await uploadString(storageRef, fileData, 'data_url');
    } else if (fileData instanceof Blob || Buffer.isBuffer(fileData) || (fileData as any) instanceof Uint8Array || (fileData as any) instanceof ArrayBuffer) {
      await uploadBytes(storageRef, fileData as any);
    } else {
      throw new Error('Unsupported file data type for Firebase');
    }

    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('[Firebase Upload Error]', error);
    return null;
  }
}
