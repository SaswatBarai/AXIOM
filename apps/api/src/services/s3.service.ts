import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET   = process.env.AWS_S3_BUCKET ?? "axiom-resumes";

// Credentials are resolved automatically:
// - In dev: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars (or MinIO via S3_ENDPOINT)
// - In prod: EC2 instance IAM role via IMDS (no explicit keys needed)
const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
  ...(ENDPOINT && {
    endpoint:       ENDPOINT,
    forcePathStyle: true,
  }),
});

export async function uploadToS3(
  key: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
    }),
  );

  // In dev (MinIO) return a path-style URL; in prod return S3 virtual-hosted URL
  if (ENDPOINT) {
    return `${ENDPOINT}/${BUCKET}/${key}`;
  }
  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}

/** Extract the S3 key from a stored file URL */
export function keyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const prefix = `/${BUCKET}/`;
    if (parsed.pathname.startsWith(prefix)) {
      return parsed.pathname.slice(prefix.length);
    }
  } catch {
    // fall through to fallback
  }
  // Legacy fallback for non-URL-parseable paths
  const idx = url.indexOf(`/${BUCKET}/`);
  if (idx !== -1) return url.slice(idx + BUCKET.length + 2);
  const amazonIdx = url.indexOf(".amazonaws.com/");
  if (amazonIdx !== -1) return url.slice(amazonIdx + ".amazonaws.com/".length);
  return url;
}
