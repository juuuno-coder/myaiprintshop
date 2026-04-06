/**
 * ⚠️ 이 파일은 @vibers/storage 패키지로 통합되었습니다 (2026-03-31)
 *
 * 직접 수정하지 마세요. packages/storage/src/server.ts 를 수정하세요.
 * 버킷: wero-bucket (NCP Object Storage)
 * 환경변수: NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_BUCKET_NAME=wero-bucket
 *
 * 로컬 MinIO 개발 환경은 docker-compose.yml의 minio 컨테이너만 사용 (이 파일과 무관)
 */

// 하위 호환성 유지 — 기존 코드가 s3Client, S3_BUCKET을 import하면 NCP 클라이언트로 연결
export { ncpClient as s3Client } from '@vibers/storage/server';
export { NCP_BUCKET as S3_BUCKET } from '@vibers/storage/server';
