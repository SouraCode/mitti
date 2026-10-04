import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import cloudinary from '../config/cloudinary.js';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const uploadRoot = resolve(backendRoot, 'uploads');
const localExtensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

function safeFolder(folder) {
  const parts = folder.split('/').filter((part) => /^[a-zA-Z0-9_-]+$/.test(part));
  if (!parts.length) throw new Error('Invalid image storage folder.');
  return parts;
}

function uploadToCloudinary(file, folder) {
  return new Promise((resolveUpload, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error) reject(error);
        else resolveUpload({ url: result.secure_url, providerId: result.public_id });
      })
      .end(file.buffer);
  });
}

async function uploadLocally(file, folderParts, request) {
  const extension = localExtensions[file.mimetype] || extname(file.originalname).toLowerCase();
  if (!Object.values(localExtensions).includes(extension))
    throw new Error('Unsupported image format.');
  const relativePath = [...folderParts, `${randomUUID()}${extension}`].join('/');
  const absolutePath = resolve(uploadRoot, ...relativePath.split('/'));
  if (!absolutePath.startsWith(`${uploadRoot}${sep}`))
    throw new Error('Invalid image storage path.');
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file.buffer, { flag: 'wx' });
  const publicBase = process.env.API_PUBLIC_URL || `${request.protocol}://${request.get('host')}`;
  return {
    url: `${publicBase.replace(/\/$/, '')}/uploads/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
    providerId: `local:${relativePath}`,
  };
}

export async function uploadImage(file, folder, request) {
  const folderParts = safeFolder(folder);
  const hasCloudinaryConfig = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ].every((key) => Boolean(process.env[key]));
  if (hasCloudinaryConfig) return uploadToCloudinary(file, folderParts.join('/'));
  return uploadLocally(file, folderParts, request);
}
