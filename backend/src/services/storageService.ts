import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { promises as fs } from "fs";
import path from "path";
import { HttpError } from "../utils/errors";

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const endpoint = process.env.S3_ENDPOINT;
const signedUrlTtl = Number(process.env.S3_SIGNED_URL_TTL ?? "3600");
const storageMode = process.env.STORAGE_MODE;
const uploadsRoot = path.resolve(process.cwd(), "uploads");

const isS3Configured = () => Boolean(bucket && region && accessKeyId && secretAccessKey);

const getClient = () => {
  if (!isS3Configured()) {
    throw new HttpError(500, "S3 is not configured");
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!
    }
  });
};

const sanitizeFilename = (name: string) =>
  name.replace(/[\s/\\]+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

const isDataUrl = (value: string) => value.startsWith("data:");
const isLocalKey = (value: string) => value.startsWith("local:");

const resolveStorageMode = () => {
  const normalized = (storageMode ?? "").trim().toLowerCase();
  if (normalized === "local" || normalized === "s3") {
    return normalized;
  }
  return isS3Configured() ? "s3" : "local";
};

const buildLocalKey = (userId: string, fileName: string) =>
  `local:avatars/${userId}/${Date.now()}-${fileName}`;

const localKeyToPath = (key: string) => key.replace(/^local:/, "");

export const uploadProfilePhoto = async (userId: string, file: Express.Multer.File) => {
  const mode = resolveStorageMode();
  const safeName = sanitizeFilename(file.originalname || "avatar");

  console.info("Profile photo upload", {
    mode,
    userId,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  });

  if (mode === "local") {
    const key = buildLocalKey(userId, safeName);
    const relativePath = localKeyToPath(key);
    const absolutePath = path.join(uploadsRoot, relativePath);
    try {
      console.info("Storing profile photo locally", {
        uploadsRoot,
        relativePath,
        absolutePath
      });
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, file.buffer);
      return key;
    } catch (error) {
      console.error("Failed to store profile photo locally", error);
      throw new HttpError(500, "Failed to store profile photo locally");
    }
  }

  if (!isS3Configured()) {
    throw new HttpError(500, "S3 is not configured");
  }

  const client = getClient();
  const key = `avatars/${userId}/${Date.now()}-${safeName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return key;
};

export const getProfilePhotoUrl = async (key: string, baseUrl?: string) => {
  if (isDataUrl(key)) {
    return key;
  }
  if (isLocalKey(key)) {
    const relativePath = localKeyToPath(key);
    const urlPath = `/uploads/${relativePath}`;
    console.info("Resolved local profile photo URL", { key, urlPath });
    return baseUrl ? `${baseUrl}${urlPath}` : urlPath;
  }

  if (!isS3Configured()) {
    throw new HttpError(500, "S3 is not configured");
  }

  const client = getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    }),
    { expiresIn: signedUrlTtl }
  );
};

export const deleteProfilePhoto = async (key: string) => {
  if (isDataUrl(key)) {
    return;
  }

  if (isLocalKey(key)) {
    const relativePath = localKeyToPath(key);
    const absolutePath = path.join(uploadsRoot, relativePath);
    try {
      await fs.unlink(absolutePath);
    } catch {
      return;
    }
    return;
  }

  if (!isS3Configured()) {
    return;
  }

  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );
};